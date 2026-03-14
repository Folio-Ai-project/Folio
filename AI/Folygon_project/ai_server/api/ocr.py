from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union
import tempfile
import os

router = APIRouter(prefix="/api/ocr", tags=["OCR"])


class OCRResponse(BaseModel):
    page: int
    width: int
    height: int
    tokens: List[Dict[str, Any]]


class OCRRequest(BaseModel):
    file_path: Optional[str]
    file_type: Optional[str]


@router.post("", response_model=List[OCRResponse], summary="Process file with OCR")
def ocr_endpoint(
    file: Optional[UploadFile] = File(None),
    file_type: Optional[str] = None,
    payload: Optional[OCRRequest] = None,
):
    from ..engines.ocr_engine import run_ocr

    # 업로드된 파일이 있으면 처리
    if file is not None:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")

        tmp_path = None
        try:
            suffix = os.path.splitext(file.filename)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                content = file.file.read()
                tmp.write(content)
                tmp_path = tmp.name

            if file_type is None:
                file_type = suffix.lower().lstrip(".")

            return run_ocr(tmp_path, file_type)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)

    # JSON 바디로 경로/타입 전달된 경우
    if payload and payload.file_path and payload.file_type:
        return run_ocr(payload.file_path, payload.file_type)

    raise HTTPException(
        status_code=400,
        detail="Either upload a file or provide file_path and file_type in JSON body",
    )