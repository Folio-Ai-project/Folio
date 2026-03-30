from pydantic import BaseModel
from typing import List


class ProjectFeedback(BaseModel):
    project_name: str
    strengths: List[str]
    weaknesses: List[str]
    improvement_suggestions: List[str]


class ConsultingResponse(BaseModel):
    overall_level: str
    strengths: List[str]
    weaknesses: List[str]
    market_fit_roles: List[str]
    improvement_actions: List[str]
    project_specific_feedback: List[ProjectFeedback]