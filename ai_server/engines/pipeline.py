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

_STRUCTURE_PROMPT = """You are a professional portfolio parser specialized in Korean and English resumes.
Extract structured data from the resume document below. Return ONLY valid JSON with no additional text, comments, or markdown.

Guidelines:
- For Korean resumes: normalize dates to "YYYY.MM ~ YYYY.MM" format (e.g., "2022년 3월" → "2022.03"). Translate field values to English where possible, but keep proper nouns (company names, school names, project names) in their original language.
- If a field cannot be found, use null for strings and [] for arrays. Do not omit fields.
- "technologies" should list only concrete tools, languages, or frameworks (e.g., "Python", "FastAPI", "AWS S3"). Do not include vague terms like "협업" or "커뮤니케이션".
- "achievements" should be quantified outcomes where possible (e.g., "Reduced latency by 30%"). Extract verbatim if no metric is available.
- "career_summary" should be 2–3 sentences summarizing the candidate's background, key skills, and career direction.

Return this exact JSON structure:
{
  "projects": [
    {
      "name": "Project name",
      "description": "What the project does and its purpose",
      "role": "Candidate's specific role (e.g., Backend Developer, ML Engineer)",
      "technologies": ["tech1", "tech2"],
      "period": "YYYY.MM ~ YYYY.MM",
      "achievements": ["Quantified or concrete outcome"]
    }
  ],
  "skills": ["Concrete skill or tool only"],
  "education": [
    {
      "school": "Institution name",
      "major": "Field of study",
      "period": "YYYY.MM ~ YYYY.MM"
    }
  ],
  "career_summary": "2–3 sentence summary of the candidate"
}"""

_CONSULTING_PROMPT = """You are a senior technical hiring manager in the Korean IT industry.
Analyze the portfolio and give honest, actionable feedback in Korean. Return ONLY valid JSON with no additional text, comments, or markdown.

Rules:
- All string values must be written in Korean, except for field keys and enum values.
- "overall_level" must be exactly one of: "junior", "mid", "senior".
- "growth_potential" must be exactly one of: "높음", "중간", "낮음".
- "missing_skills[].priority" must be exactly one of: "높음", "중간", "낮음".
- "market_fit_roles[].fit_score" must be an integer between 0 and 100.
- "skill_radar" must contain EXACTLY 6 items. Each item represents a skill category you judge to be most relevant for this candidate based on the portfolio.
  - "subject" must be a short Korean label (2–6 characters), e.g. "백엔드", "ML 모델링", "인프라", "데이터 분석".
  - "value" must be an integer between 0 and 100, scored based on portfolio evidence.
  - Choose categories that best differentiate this candidate. Do not use generic placeholders.
- For "recommended_companies": recommend exactly 6 specific, real Korean IT companies genuinely suitable for this candidate's skill level and stack. Do NOT recommend tier-1 giants (삼성전자, 카카오, 네이버, 라인, 쿠팡, LG CNS) unless the portfolio clearly warrants it. Focus on mid-size product companies, growing B2B SaaS startups, and specialized tech firms. For each company provide detailed reasons (3+ items) covering culture, growth opportunity, and tech stack alignment.
- Do not omit any field. Use "" for missing strings and [] for missing arrays.

Return this exact JSON structure:
{
  "overall_level": "junior|mid|senior",
  "level_reason": "이 레벨로 판단한 근거",
  "market_competitiveness": "현재 시장에서의 경쟁력 평가",
  "growth_potential": "높음|중간|낮음",
  "skill_radar": [
    { "subject": "AI가 선정한 카테고리1", "value": 0 },
    { "subject": "AI가 선정한 카테고리2", "value": 0 },
    { "subject": "AI가 선정한 카테고리3", "value": 0 },
    { "subject": "AI가 선정한 카테고리4", "value": 0 },
    { "subject": "AI가 선정한 카테고리5", "value": 0 },
    { "subject": "AI가 선정한 카테고리6", "value": 0 }
  ],
  "strengths": ["강점 항목"],
  "weaknesses": ["약점 항목"],
  "missing_skills": [{ "name": "기술명", "priority": "높음|중간|낮음" }],
  "market_fit_roles": [{ "role": "직무명", "fit_score": 0 }],
  "improvement_actions": [{ "title": "액션 제목", "description": "구체적인 설명", "duration": "예상 기간" }],
  "project_feedback": [{ "project_name": "프로젝트명", "strength": "잘한 점", "improvement": "개선할 점" }],
  "recommended_companies": [{"name":"","tags":["산업분야","기업규모","지역"],"work_type":"재택근무|하이브리드|오피스","fit_score":0,"tech_score":0,"stacks":[],"reasons":[],"description":""}],
  "portfolio_review": {
    "overall_score": 0,
    "summary": "포트폴리오 전체 인상 한 줄 요약",
    "sections": [
      {"section": "프로젝트 설명 구체성", "score": 0, "issues": [], "suggestions": []},
      {"section": "기술 스택 활용도", "score": 0, "issues": [], "suggestions": []},
      {"section": "성과/결과 수치화", "score": 0, "issues": [], "suggestions": []},
      {"section": "차별화 요소", "score": 0, "issues": [], "suggestions": []}
    ],
    "quick_wins": ["즉시 개선 가능한 항목1", "즉시 개선 가능한 항목2"],
    "project_reviews": [
      {"project_name": "", "strength": "", "issues": [], "suggestions": []}
    ]
  },
  "roadmap": {
    "current_title": "현재 역량 수준 한 줄 요약",
    "target_title": "6개월 후 목표 역량 한 줄 요약",
    "phases": [
      {
        "phase": 1,
        "label": "1~2개월",
        "goal": "이 단계의 핵심 목표",
        "skills": ["학습할 기술1", "학습할 기술2"],
        "resources": [
          {"type": "강의|책|문서|유튜브", "title": "구체적 강의/자료명", "platform": "플랫폼명(유데미|인프런|유튜브|책 등)"}
        ],
        "project": {"title": "추천 프로젝트 제목", "description": "어떤 프로젝트를 만들면 좋은지 구체적 설명"}
      }
    ]
  }
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
    result = parse_llm_json(raw)
    logger.info("구조화 완료: 프로젝트 %d개, 스킬 %d개", len(result.get("projects", [])), len(result.get("skills", [])))
    return result


def llm_consult(structured: Dict) -> Optional[Dict]:
    """구조화된 포트폴리오 → 커리어 컨설팅 JSON"""
    raw = chat([
        {"role": "system", "content": _CONSULTING_PROMPT},
        {"role": "user", "content": json.dumps(structured, ensure_ascii=False)},
    ])
    result = parse_llm_json(raw)
    logger.info("컨설팅 완료: 레벨=%s, 성장가능성=%s", result.get("overall_level"), result.get("growth_potential"))
    return result


# ── 전체 파이프라인 ────────────────────────────────────

def run_pipeline(pages: List[Dict], mode: str = "full") -> Dict:
    """OCR 페이지 → 블록 → 구조화 → (컨설팅) 결과 반환"""
    blocks = extract_blocks(pages)
    structured = llm_structure(blocks)
    consulting = llm_consult(structured) if mode == "full" else None
    return {"structure": structured, "consulting": consulting}
