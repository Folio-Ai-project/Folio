"""레이아웃 API — OCR 토큰을 블록으로 변환"""
import logging
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..engines.pipeline import extract_blocks

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/layout", tags=["Layout"])


class LayoutRequest(BaseModel):
    pages: List[Dict[str, Any]]


@router.post("")
def layout_endpoint(req: LayoutRequest) -> Dict[str, List[Dict[str, Any]]]:
    """OCR 페이지 데이터를 받아 블록 리스트를 반환합니다."""
    if not req.pages:
        raise HTTPException(status_code=400, detail="pages가 비어있습니다.")
    return {"blocks": extract_blocks(req.pages)}
