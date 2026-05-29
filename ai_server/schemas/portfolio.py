from typing import List, Optional

from pydantic import BaseModel


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


class StructuredProject(BaseModel):
    name: Optional[str]
    description: Optional[str]
    role: Optional[str]
    technologies: List[str]
    period: Optional[str]
    achievements: List[str]


class Education(BaseModel):
    school: Optional[str]
    major: Optional[str]
    period: Optional[str]


class PortfolioStructure(BaseModel):
    projects: List[StructuredProject]
    skills: List[str]
    education: List[Education]
    career_summary: str
