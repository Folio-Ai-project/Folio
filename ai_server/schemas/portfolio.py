from pydantic import BaseModel
from typing import List, Optional


class Project(BaseModel):
    project_name: Optional[str]
    summary: Optional[str]
    tech_stack: Optional[List[str]]
    role: Optional[str]
    key_features: Optional[List[str]]
    measurable_results: Optional[List[str]]
    related_block_ids: List[int]


class PortfolioResponse(BaseModel):
    projects: List[Project]