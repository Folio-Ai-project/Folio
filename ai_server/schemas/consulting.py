from typing import List, Literal

from pydantic import BaseModel


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


Priority = Literal["높음", "중간", "낮음"]
OverallLevel = Literal["junior", "mid", "senior"]
WorkType = Literal["재택근무", "하이브리드", "오피스"]


class SkillRadarItem(BaseModel):
    subject: str
    value: int


class MissingSkill(BaseModel):
    name: str
    priority: Priority


class MarketFitRole(BaseModel):
    role: str
    fit_score: int


class ImprovementAction(BaseModel):
    title: str
    description: str
    duration: str


class PipelineProjectFeedback(BaseModel):
    project_name: str
    strength: str
    improvement: str


class RecommendedCompany(BaseModel):
    name: str
    tags: List[str]
    work_type: WorkType
    fit_score: int
    tech_score: int
    stacks: List[str]
    reasons: List[str]
    description: str


class PortfolioReviewSection(BaseModel):
    section: str
    score: int
    issues: List[str]
    suggestions: List[str]


class PortfolioProjectReview(BaseModel):
    project_name: str
    strength: str
    issues: List[str]
    suggestions: List[str]


class PortfolioReview(BaseModel):
    overall_score: int
    summary: str
    sections: List[PortfolioReviewSection]
    quick_wins: List[str]
    project_reviews: List[PortfolioProjectReview]


class RoadmapResource(BaseModel):
    type: str
    title: str
    platform: str


class RoadmapProject(BaseModel):
    title: str
    description: str


class RoadmapPhase(BaseModel):
    phase: int
    label: str
    goal: str
    skills: List[str]
    resources: List[RoadmapResource]
    project: RoadmapProject


class Roadmap(BaseModel):
    current_title: str
    target_title: str
    phases: List[RoadmapPhase]


class CoreConsultingResult(BaseModel):
    overall_level: OverallLevel
    level_reason: str
    market_competitiveness: str
    growth_potential: Priority
    skill_radar: List[SkillRadarItem]
    strengths: List[str]
    weaknesses: List[str]
    missing_skills: List[MissingSkill]
    market_fit_roles: List[MarketFitRole]
    improvement_actions: List[ImprovementAction]
    project_feedback: List[PipelineProjectFeedback]


class RecommendedCompaniesResult(BaseModel):
    recommended_companies: List[RecommendedCompany]


class PortfolioReviewResult(BaseModel):
    portfolio_review: PortfolioReview


class RoadmapResult(BaseModel):
    roadmap: Roadmap


class ConsultingResult(CoreConsultingResult):
    recommended_companies: List[RecommendedCompany]
    portfolio_review: PortfolioReview
    roadmap: Roadmap
