import asyncio
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel
import os
import tempfile

from ..engines.layout_engine import build_layout
from ..engines.semantic_engine import semantic_structure
from ..engines.consulting_engine import consulting_analysis
from ..engines.ocr_engine import run_ocr

router = APIRouter(prefix="/api/analyze", tags=["Portfolio"])


class PortfolioRequest(BaseModel):
    pages: List[Dict[str, Any]]
    mode: Literal["structure", "full"] = "structure"


def collect_blocks(pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    blocks: List[Dict[str, Any]] = []
    for page in pages:
        blocks.extend(page.get("blocks", []))
    return blocks

@router.post("")
async def process_portfolio(
    files: List[UploadFile] = File(...),
    prompt: Optional[str] = Form(None),
    mode: Literal["structure", "full"] = "full"
):
    import logging, traceback
    logger = logging.getLogger(__name__)

    try:
        logger.debug("starting OCR for %d files", len(files))

        async def ocr_from_file(upload: UploadFile) -> List[Dict[str, Any]]:
            """Save upload to temp file and run blocking OCR in thread."""
            suffix = os.path.splitext(upload.filename)[1]
            file_type = suffix.lower().lstrip(".")
            tmp_path = None
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                    content = await upload.read()
                    tmp.write(content)
                    tmp_path = tmp.name
                logger.debug("ocr thread start for %s", upload.filename)
                return await asyncio.to_thread(run_ocr, tmp_path, file_type)
            finally:
                if tmp_path and os.path.exists(tmp_path):
                    os.remove(tmp_path)

        # run all OCR tasks in parallel
        tasks = [ocr_from_file(f) for f in files]
        results_list = await asyncio.gather(*tasks)
        # flatten the list-of-lists
        ocr_results: List[Dict[str, Any]] = []
        for res in results_list:
            ocr_results.extend(res)

        logger.debug("ocr_results total pages %d", len(ocr_results))
        pages = build_layout(ocr_results)
        all_blocks = collect_blocks(pages)
        logger.debug("built %d blocks", len(all_blocks))

        structured = semantic_structure(all_blocks)
        logger.debug("semantic_structure returned: %s", structured if isinstance(structured, dict) else type(structured))

        if mode == "structure" or "error" in structured:
            return structured

        # consulting depends on semantics
        consulting = consulting_analysis(structured)
        logger.debug("consulting result obtained")
        return {"structure": structured, "consulting": consulting, "prompt": prompt}
    except Exception as exc:
        tb = traceback.format_exc()
        logger.error("process_portfolio failed: %s\n%s", exc, tb)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/json")
def process_portfolio_json(request: PortfolioRequest):

    pages = build_layout(request.pages)
    all_blocks = collect_blocks(pages)

    structured = semantic_structure(all_blocks)
    if request.mode == "structure" or "error" in structured:
        return structured

    consulting = consulting_analysis(structured)
    return {"structure": structured, "consulting": consulting}