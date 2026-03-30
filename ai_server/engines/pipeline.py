"""포트폴리오 분석 파이프라인: OCR → 레이아웃 → LLM 구조화 → LLM 컨설팅"""
import json
import logging
from typing import Any, Dict, List, Optional

import pdfplumber

from ..models.openai import chat
from ..utils import parse_llm_json

logger = logging.getLogger(__name__)

# ── 상수 ──────────────────────────────────────────────
Y_LINE_THRESHOLD = 8   # 같은 줄로 판단하는 y 오차 (px)
Y_BLOCK_GAP = 18       # 같은 블록으로 판단하는 줄 간격 (px)
MIN_CONF = 0.3         # EasyOCR 최소 신뢰도

# EasyOCR 싱글톤 (이미지 파일에만 사용)
try:
    import easyocr
    _reader = easyocr.Reader(["ko", "en"], gpu=False)
    logger.info("EasyOCR 로드 완료")
except Exception as e:
    _reader = None
    logger.warning("EasyOCR 로드 실패: %s", e)


# ── OCR ───────────────────────────────────────────────

def _ocr_pdf(path: str) -> List[Dict]:
    pages = []
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages):
            tokens = [
                {
                    "text": w["text"],
                    "bbox": [int(w["x0"]), int(w["top"]), int(w["x1"]), int(w["bottom"])],
                }
                for w in page.extract_words(use_text_flow=True)
            ]
            pages.append({"page": i + 1, "tokens": tokens})
    return pages


def _ocr_image(path: str) -> List[Dict]:
    if _reader is None:
        raise RuntimeError("EasyOCR를 사용할 수 없습니다.")
    tokens = []
    for bbox_pts, text, conf in _reader.readtext(path, detail=1):
        if conf < MIN_CONF or not text.strip():
            continue
        xs, ys = [p[0] for p in bbox_pts], [p[1] for p in bbox_pts]
        tokens.append({
            "text": text,
            "bbox": [int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys))],
        })
    return [{"page": 1, "tokens": tokens}]


def run_ocr(path: str, ext: str) -> List[Dict]:
    """파일 경로와 확장자를 받아 페이지별 토큰 리스트를 반환합니다."""
    ext = ext.lower().lstrip(".")
    if ext == "pdf":
        return _ocr_pdf(path)
    if ext in {"png", "jpg", "jpeg"}:
        return _ocr_image(path)
    raise ValueError(f"지원하지 않는 파일 형식: {ext}")


# ── 레이아웃 ──────────────────────────────────────────

def _tokens_to_blocks(tokens: List[Dict]) -> List[Dict]:
    """토큰 리스트 → 줄 그룹핑 → 블록 그룹핑 → 블록 텍스트 리스트"""
    if not tokens:
        return []

    # 1) 토큰 → 줄
    sorted_tokens = sorted(tokens, key=lambda t: ((t["bbox"][1] + t["bbox"][3]) / 2, t["bbox"][0]))
    lines: List[Dict] = []
    for token in sorted_tokens:
        yc = (token["bbox"][1] + token["bbox"][3]) / 2
        for line in lines:
            if abs(line["yc"] - yc) <= Y_LINE_THRESHOLD:
                line["tokens"].append(token)
                break
        else:
            lines.append({"yc": yc, "tokens": [token]})
    for line in lines:
        line["tokens"].sort(key=lambda t: t["bbox"][0])

    # 2) 줄 → 블록
    lines.sort(key=lambda l: l["yc"])
    groups: List[List[Dict]] = [[lines[0]]]
    for line in lines[1:]:
        if line["yc"] - groups[-1][-1]["yc"] <= Y_BLOCK_GAP:
            groups[-1].append(line)
        else:
            groups.append([line])

    # 3) 블록 → 텍스트
    blocks = []
    for bid, grp in enumerate(groups):
        text = " ".join(
            t["text"].strip()
            for line in grp
            for t in line["tokens"]
            if t["text"].strip()
        )
        if text:
            blocks.append({"block_id": bid, "text": text})
    return blocks


def extract_blocks(pages: List[Dict]) -> List[Dict]:
    """OCR 페이지 리스트에서 레이아웃 블록을 추출합니다."""
    blocks = []
    for page in pages:
        blocks.extend(_tokens_to_blocks(page.get("tokens", [])))
    return blocks


# ── LLM ───────────────────────────────────────────────

_STRUCTURE_PROMPT = """You are a professional portfolio parser for Korean/English resumes.
Extract structured data from the document. Return ONLY valid JSON.

{
  "projects": [{"name":"","description":"","role":"","technologies":[],"period":"","achievements":[]}],
  "skills": [],
  "education": [{"school":"","major":"","period":""}],
  "career_summary": ""
}"""

_CONSULTING_PROMPT = """You are a senior technical hiring manager in the Korean IT industry.
Analyze the portfolio and give honest, actionable feedback in Korean. Return ONLY valid JSON.

{
  "overall_level": "junior|mid|senior",
  "level_reason": "",
  "market_competitiveness": "",
  "growth_potential": "높음|중간|낮음",
  "strengths": [],
  "weaknesses": [],
  "missing_skills": [{"name":"","priority":"높음|중간|낮음"}],
  "market_fit_roles": [{"role":"","fit_score":0}],
  "improvement_actions": [{"title":"","description":"","duration":""}],
  "project_feedback": [{"project_name":"","strength":"","improvement":""}]
}"""


def _blocks_to_text(blocks: List[Dict]) -> str:
    return "\n\n".join(f"[{b['block_id']}] {b['text']}" for b in blocks)


def llm_structure(blocks: List[Dict]) -> Dict:
    """블록 텍스트 → 구조화된 포트폴리오 JSON"""
    if not blocks:
        return {"projects": [], "skills": [], "education": [], "career_summary": ""}
    raw = chat([
        {"role": "system", "content": _STRUCTURE_PROMPT},
        {"role": "user", "content": _blocks_to_text(blocks)},
    ])
    return parse_llm_json(raw)


def llm_consult(structured: Dict) -> Optional[Dict]:
    """구조화된 포트폴리오 → 커리어 컨설팅 JSON"""
    raw = chat([
        {"role": "system", "content": _CONSULTING_PROMPT},
        {"role": "user", "content": json.dumps(structured, ensure_ascii=False)},
    ])
    return parse_llm_json(raw)


# ── 전체 파이프라인 ────────────────────────────────────

def run_pipeline(pages: List[Dict], mode: str = "full") -> Dict:
    """OCR 페이지 → 블록 → 구조화 → (컨설팅) 결과 반환"""
    blocks = extract_blocks(pages)
    logger.debug("블록 수: %d", len(blocks))

    structured = llm_structure(blocks)
    consulting = llm_consult(structured) if mode == "full" else None

    return {"structure": structured, "consulting": consulting}
