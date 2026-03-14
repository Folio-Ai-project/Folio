import json
import logging
from typing import List, Dict, Any

from ..models.openai import OpenAIClient

logger = logging.getLogger(__name__)

# schema kept for reference but not enforced by current client
PROJECT_SCHEMA = {
    "name": "portfolio_structure",
    "schema": {"type": "object", "properties": {"projects": {"type": "array"}}}
}


def blocks_to_prompt_text(blocks: List[Dict[str, Any]]) -> str:
    """Convert block dictionaries into a plain text string for LLM input."""
    return "\n\n".join(f"[BLOCK {b['block_id']}]\n{b['text']}" for b in blocks)


def semantic_structure(blocks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Parse OCR blocks into structured portfolio JSON using the LLM.

    Returns either a parsed dict or an error dict containing the raw
    response on failure.
    """
    if not blocks:
        return {"projects": []}

    block_text = blocks_to_prompt_text(blocks)
    messages = [
        {"role": "system", "content": "You are a professional portfolio parser. Extract project data as JSON."},
        {"role": "user", "content": (
            "Identify project boundaries and extract structured data as JSON.\n\n"
            f"Document:\n{block_text}\n\nReturn valid JSON only."
        )}
    ]

    try:
        raw = OpenAIClient().chat(messages)
        parsed = json.loads(raw)
        return parsed
    except json.JSONDecodeError:
        logger.error("semantic_structure JSON decode error: %s", raw)
        return {"error": "Failed to parse response", "raw": raw}
    except Exception as e:
        logger.exception("semantic_structure failed")
        return {"error": str(e)}