"""포트폴리오 분석 파이프라인: OCR → 레이아웃 → LLM 구조화 → LLM 컨설팅"""
from concurrent.futures import ThreadPoolExecutor
import json
import logging
import time
from typing import Dict, List, Optional

import pdfplumber

from ..models.openai import parse_chat
from ..prompts.portfolio import (
    COMPANIES_PROMPT,
    CONSULTING_CONTEXT_PROMPT,
    CORE_CONSULTING_PROMPT,
    PORTFOLIO_REVIEW_PROMPT,
    ROADMAP_PROMPT,
    STRUCTURE_PROMPT,
)
from ..schemas.consulting import (
    CoreConsultingResult,
    PortfolioReviewResult,
    RecommendedCompaniesResult,
    RoadmapResult,
)
from ..schemas.portfolio import PortfolioStructure

logger = logging.getLogger(__name__)

# ── 상수 ──────────────────────────────────────────────
Y_LINE_THRESHOLD = 8   # 같은 줄로 판단하는 y 오차 (px)
Y_BLOCK_GAP = 18       # 같은 블록으로 판단하는 줄 간격 (px)
MIN_CONF = 0.3         # EasyOCR 최소 신뢰도

# EasyOCR 싱글톤 (이미지 파일 처리 시점에만 로드)
_reader = None


def _get_easyocr_reader():
    global _reader
    if _reader is None:
        try:
            import easyocr
            _reader = easyocr.Reader(["ko", "en"], gpu=False)
            logger.info("EasyOCR 로드 완료")
        except Exception as e:
            raise RuntimeError("EasyOCR를 사용할 수 없습니다.") from e
    return _reader


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
    reader = _get_easyocr_reader()
    tokens = []
    for bbox_pts, text, conf in reader.readtext(path, detail=1):
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
        result = _ocr_pdf(path)
        logger.info("PDF OCR 완료: %d 페이지, 총 %d 토큰", len(result), sum(len(p["tokens"]) for p in result))
        return result
    if ext in {"png", "jpg", "jpeg"}:
        result = _ocr_image(path)
        logger.info("이미지 OCR 완료: %d 토큰", len(result[0]["tokens"]))
        return result
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
    logger.info("레이아웃 완료: %d 블록", len(blocks))
    return blocks


# ── LLM ───────────────────────────────────────────────


def _blocks_to_text(blocks: List[Dict]) -> str:
    return "\n\n".join(f"[{b['block_id']}] {b['text']}" for b in blocks)


def llm_structure(blocks: List[Dict]) -> Dict:
    """블록 텍스트 → 구조화된 포트폴리오 JSON"""
    if not blocks:
        return {"projects": [], "skills": [], "education": [], "career_summary": ""}
    result = parse_chat([
        {"role": "system", "content": STRUCTURE_PROMPT},
        {"role": "user", "content": _blocks_to_text(blocks)},
    ], PortfolioStructure)
    data = result.model_dump()
    logger.info("구조화 완료: 프로젝트 %d개, 스킬 %d개", len(data.get("projects", [])), len(data.get("skills", [])))
    return data


def llm_consult(structured: Dict) -> Optional[Dict]:
    """구조화된 포트폴리오 → 커리어 컨설팅 JSON"""
    core_start = time.time()
    core = parse_chat([
        {"role": "system", "content": CORE_CONSULTING_PROMPT},
        {"role": "user", "content": json.dumps(structured, ensure_ascii=False)},
    ], CoreConsultingResult).model_dump()
    logger.info("핵심 컨설팅 시간: %.2f초", time.time() - core_start)

    context = {
        "portfolio": structured,
        "core_consulting": core,
    }
    context_json = json.dumps(context, ensure_ascii=False)

    def parse_companies() -> Dict:
        start = time.time()
        result = parse_chat([
            {"role": "system", "content": COMPANIES_PROMPT},
            {"role": "user", "content": CONSULTING_CONTEXT_PROMPT},
            {"role": "user", "content": context_json},
        ], RecommendedCompaniesResult).model_dump()
        logger.info("추천 회사 생성 시간: %.2f초", time.time() - start)
        return result

    def parse_review() -> Dict:
        start = time.time()
        result = parse_chat([
            {"role": "system", "content": PORTFOLIO_REVIEW_PROMPT},
            {"role": "user", "content": CONSULTING_CONTEXT_PROMPT},
            {"role": "user", "content": context_json},
        ], PortfolioReviewResult).model_dump()
        logger.info("포트폴리오 리뷰 생성 시간: %.2f초", time.time() - start)
        return result

    def parse_roadmap() -> Dict:
        start = time.time()
        result = parse_chat([
            {"role": "system", "content": ROADMAP_PROMPT},
            {"role": "user", "content": CONSULTING_CONTEXT_PROMPT},
            {"role": "user", "content": context_json},
        ], RoadmapResult).model_dump()
        logger.info("로드맵 생성 시간: %.2f초", time.time() - start)
        return result

    details_start = time.time()
    with ThreadPoolExecutor(max_workers=3) as executor:
        companies_future = executor.submit(parse_companies)
        review_future = executor.submit(parse_review)
        roadmap_future = executor.submit(parse_roadmap)
        companies = companies_future.result()
        review = review_future.result()
        roadmap = roadmap_future.result()
    logger.info("세부 컨설팅 병렬 생성 시간: %.2f초", time.time() - details_start)

    data = {
        **core,
        **companies,
        **review,
        **roadmap,
    }
    logger.info("컨설팅 완료: 레벨=%s, 성장가능성=%s", data.get("overall_level"), data.get("growth_potential"))
    return data


# ── 전체 파이프라인 ────────────────────────────────────

def run_pipeline(pages: List[Dict], mode: str = "full") -> Dict:
    """OCR 페이지 → 블록 → 구조화 → (컨설팅) 결과 반환"""
    start_time = time.time()

    blocks_start = time.time()
    blocks = extract_blocks(pages)
    blocks_end = time.time()
    logger.info("블록 추출 시간: %.2f초", blocks_end - blocks_start)

    structure_start = time.time()
    structured = llm_structure(blocks)
    structure_end = time.time()
    logger.info("구조화 시간: %.2f초", structure_end - structure_start)

    consult_start = time.time()
    consulting = llm_consult(structured) if mode == "full" else None
    consult_end = time.time()
    if consulting:
        logger.info("컨설팅 시간: %.2f초", consult_end - consult_start)

    end_time = time.time()
    logger.info("파이프라인 실행 시간: %.2f초", end_time - start_time)
    return {"structure": structured, "consulting": consulting}
