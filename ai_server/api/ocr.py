"""OCR API — 파일 업로드 또는 서버 경로로 OCR 실행"""
import logging
import os
from typing import Any, Dict, List

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from ..engines.pipeline import run_ocr
from ..utils import ALLOWED_EXTENSIONS, temp_file

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ocr", tags=["OCR"])


class OCRPathRequest(BaseModel):
    file_path: str
    file_type: str


@router.post("")
async def ocr_upload(file: UploadFile = File(...)) -> List[Dict[str, Any]]:
    """파일을 업로드해 OCR을 실행합니다."""
    ext = (file.filename or "").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"지원하지 않는 파일 형식: {ext or '없음'}")
    content = await file.read()
    with temp_file(f".{ext}", content) as path:
        return run_ocr(path, ext)


@router.post("/path")
def ocr_path(payload: OCRPathRequest) -> List[Dict[str, Any]]:
    """서버 로컬 경로를 지정해 OCR을 실행합니다 (테스트용)."""
    if not os.path.exists(payload.file_path):
        raise HTTPException(status_code=400, detail="파일 경로가 존재하지 않습니다.")
    return run_ocr(payload.file_path, payload.file_type)
