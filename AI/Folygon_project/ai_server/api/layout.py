from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from ..engines.layout_engine import build_layout

router = APIRouter(prefix="/api/layout", tags=["Layout"])


class LayoutRequest(BaseModel):
    pages: List[Dict[str, Any]]


class LayoutResponse(BaseModel):
    pages: List[Dict[str, Any]]


@router.post("", response_model=LayoutResponse, summary="Build document layout")
def build_document_layout(req: LayoutRequest):
    if not req.pages:
        raise HTTPException(status_code=400, detail="pages is empty")

    try:
        pages_with_layout = build_layout(req.pages)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"layout build failed: {str(e)}"
        )

    return {"pages": pages_with_layout}
