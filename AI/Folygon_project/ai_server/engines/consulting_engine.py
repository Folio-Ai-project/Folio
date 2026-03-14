import json
import logging
from typing import Any, Dict

from ..models.openai import OpenAIClient

logger = logging.getLogger(__name__)


def consulting_analysis(structured_projects: Dict[str, Any]) -> Dict[str, Any]:
    """Generate consulting feedback based on structured portfolio data."""

    messages = [
        {"role": "system", "content": "You are a senior technical hiring manager and portfolio consultant. Analyze the given portfolio projects. Do NOT invent missing information. Base evaluation strictly on provided data. Return JSON only."},
        {"role": "user", "content": (
            f"Here is the structured portfolio:\n\n{json.dumps(structured_projects, indent=2)}\n\n"
            "Provide:\n- overall_level (junior/mid/senior reasoning)\n- strengths\n- weaknesses\n- market_fit_roles\n- improvement_actions\n- project_specific_feedback (for each project)\n\nReturn JSON only."
        )}
    ]

    try:
        raw = OpenAIClient().chat(messages)
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.error("consulting_analysis invalid JSON: %s", raw)
        return {"error": "Invalid JSON response", "raw": raw}
    except Exception as e:
        logger.exception("consulting_analysis failed")
        return {"error": str(e)}