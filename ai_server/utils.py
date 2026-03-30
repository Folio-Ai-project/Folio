"""공통 유틸리티"""
import json
import logging
import os
import tempfile
from contextlib import contextmanager
from typing import Any, Dict

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg"}


@contextmanager
def temp_file(suffix: str, content: bytes):
    """업로드 바이트를 임시 파일로 저장하고 경로를 yield한 뒤 자동 삭제."""
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(content)
            tmp_path = tmp.name
        yield tmp_path
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


def parse_llm_json(raw: str) -> Dict[str, Any]:
    """LLM 응답에서 JSON을 파싱합니다. 마크다운 코드블록도 처리합니다."""
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        parts = cleaned.split("```")
        # ```json ... ``` 형태
        cleaned = parts[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    return json.loads(cleaned.strip())
