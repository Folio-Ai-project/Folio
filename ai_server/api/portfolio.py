"""포트폴리오 분석 API"""
import asyncio
import logging
from typing import List, Literal, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..engines.pipeline import run_ocr, run_pipeline
from ..utils import ALLOWED_EXTENSIONS, temp_file

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/analyze", tags=["Portfolio"])


async def _file_to_pages(upload: UploadFile) -> list:
    filename = upload.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"지원하지 않는 파일 형식: {ext or '없음'}")
    content = await upload.read()
    with temp_file(f".{ext}", content) as path:
        return await asyncio.to_thread(run_ocr, path, ext)


@router.post("")
async def analyze(
    files: List[UploadFile] = File(...),
    prompt: Optional[str] = Form(None),
    mode: Literal["structure", "full"] = Form("full"),
):
    """파일(PDF/이미지)을 업로드해 포트폴리오를 분석합니다."""
    if not files:
        raise HTTPException(status_code=400, detail="파일을 하나 이상 업로드해주세요.")

    pages = []
    for result in await asyncio.gather(*[_file_to_pages(f) for f in files]):
        pages.extend(result)

    logger.debug("OCR 완료: %d 페이지", len(pages))
    result = await asyncio.to_thread(run_pipeline, pages, mode)
    return {**result, "prompt": prompt}
