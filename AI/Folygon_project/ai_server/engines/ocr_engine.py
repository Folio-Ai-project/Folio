import logging
from typing import List, Dict, Any

from .pdf_ocr import pdf2text_layer
from .image_ocr import image2text_layer

logger = logging.getLogger(__name__)


def run_ocr(file_path: str, file_type: str) -> List[Dict[str, Any]]:
    """Dispatch to PDF or image OCR based on the file extension.

    The returned structure is a list of page dictionaries with at least
    ``tokens`` keys expected by downstream layout logic.
    """
    logger.debug("running OCR on %s (%s)", file_path, file_type)
    if file_type == "pdf":
        return pdf2text_layer(file_path)
    elif file_type in ("png", "jpg", "jpeg"):
        return image2text_layer(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")