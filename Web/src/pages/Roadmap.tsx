import styled from "styled-components";
import { ANALYSIS_STORAGE_KEY, PROFILE_STORAGE_KEY } from "../api";

const PRIMARY_BLUE = "#1E96FF";
const BORDER_COLOR = "#E9ECEF";

// 자료명 + 플랫폼으로 검색 URL 자동 생성
function getResourceUrl(platform: string, title: string) {
  const q = encodeURIComponent(title);
  const p = platform.toLowerCase();
  if (p.includes("유튜브") || p.includes("youtube")) return `https://www.youtube.com/results?search_query=${q}`;
  if (p.includes("인프런") || p.includes("inflearn")) return `https://www.inflearn.com/search?s=${q}`;
  if (p.includes("유데미") || p.includes("udemy")) return `https://www.udemy.com/courses/search/?q=${q}`;
  if (p.includes("책") || p.includes("book")) return `https://search.kyobobook.co.kr/search?keyword=${q}`;
  return `https://www.google.com/search?q=${q}`;
}

function getPlatformColor(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("유튜브") || p.includes("youtube")) return { bg: "#fff0f0", color: "#ff4d4d" };
  if (p.includes("인프런")) return { bg: "#f0fff4", color: "#00c471" };
  if (p.includes("유데미") || p.includes("udemy")) return { bg: "#f0f4ff", color: "#5624d0" };
  if (p.includes("책")) return { bg: "#fff8e1", color: "#f59f00" };
  return { bg: "#f1f3f5", color: "#495057" };
}

// --- Styled Components ---
const Wrapper = styled.div`
  width: 95%;
  margin: 2em auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const SectionHeader = styled.div`
  margin-bottom: 2em;
  padding-left: 15px;
  border-left: 4px solid ${PRIMARY_BLUE};
`;

const MainTitle = styled.h2`
  font-size: 1.8em;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #212529;
`;

const SubTitle = styled.p`
  font-size: 1em;
  color: #868e96;
  margin: 0;
`;

// 현재/목표 요약 배너
const LevelBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 2.5em;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${BORDER_COLOR};
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`;

const LevelBox = styled.div<{ $type: "current" | "target" }>`
  flex: 1;
  padding: 1.5em 2em;
  background: ${(p) => (p.$type === "current" ? "#f1f9ff" : "white")};
  border-right: ${(p) => (p.$type === "current" ? `1px solid ${BORDER_COLOR}` : "none")};
`;

const LevelLabel = styled.p`
  font-size: 0.78em;
  font-weight: 700;
  color: #adb5bd;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 6px;
`;

const LevelTitle = styled.h3`
  font-size: 1.15em;
  font-weight: 700;
  color: #212529;
  margin: 0;
`;

const ArrowBox = styled.div`
  padding: 0 1.5em;
  font-size: 1.6em;
  color: ${PRIMARY_BLUE};
  background: white;
  display: flex;
  align-items: center;
  border-left: 1px solid ${BORDER_COLOR};
  border-right: 1px solid ${BORDER_COLOR};
`;

// 페이즈 컨테이너
const PhaseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2em;
`;

const PhaseCard = styled.div`
  background: white;
  border: 1px solid ${BORDER_COLOR};
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0,0,0,0.04);
`;

const PhaseHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 1.4em 2em;
  background: linear-gradient(135deg, #f1f9ff 0%, #e8f4ff 100%);
  border-bottom: 1px solid ${BORDER_COLOR};
`;

const PhaseNumber = styled.div`
  width: 40px;
  height: 40px;
  background: ${PRIMARY_BLUE};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1em;
  flex-shrink: 0;
`;

const PhaseBody = styled.div`
  padding: 2em;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2em;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PhaseSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.p`
  font-size: 0.85em;
  font-weight: 700;
  color: #adb5bd;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`;

const SkillTagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SkillTag = styled.span`
  background: #e7f5ff;
  color: #1c7ed6;
  border: 1px solid #a5d8ff;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
`;

const ResourceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ResourceItem = styled.a<{ $bg: string; $color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: ${(p) => p.$bg};
  border-radius: 10px;
  text-decoration: none;
  transition: opacity 0.15s;
  gap: 10px;

  &:hover { opacity: 0.8; }
`;

const ResourceTitle = styled.span`
  font-size: 0.88em;
  font-weight: 600;
  color: #343a40;
  flex: 1;
`;

const PlatformBadge = styled.span<{ $color: string }>`
  font-size: 0.75em;
  font-weight: 700;
  color: ${(p) => p.$color};
  flex-shrink: 0;
`;

const ProjectBox = styled.div`
  grid-column: 1 / -1;
  background: linear-gradient(135deg, rgba(30,150,255,0.05) 0%, rgba(30,150,255,0.02) 100%);
  border: 1px solid rgba(30,150,255,0.15);
  border-radius: 12px;
  padding: 1.4em 1.6em;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ProjectLabel = styled.span`
  font-size: 0.78em;
  font-weight: 700;
  color: ${PRIMARY_BLUE};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ProjectTitle = styled.p`
  font-size: 1em;
  font-weight: 700;
  color: #212529;
  margin: 0;
`;

const ProjectDesc = styled.p`
  font-size: 0.88em;
  color: #495057;
  margin: 0;
  line-height: 1.6;
`;

const Footer = styled.div`
  margin-top: 2em;
  font-size: 0.85em;
  color: #adb5bd;
  display: flex;
  align-items: center;
  gap: 6px;
`;

// 더미 fallback
const FALLBACK_ROADMAP = {
  current_title: "기초 웹 개발 경험 보유",
  target_title: "독립적으로 서비스를 배포·운영 가능한 주니어",
  phases: [
    {
      phase: 1,
      label: "1~2개월",
      goal: "핵심 기술 스택 심화 학습 및 코드 품질 향상",
      skills: ["TypeScript", "React 심화", "Git Flow"],
      resources: [
        { type: "강의", title: "한 입 크기로 잘라먹는 타입스크립트", platform: "인프런" },
        { type: "유튜브", title: "React hooks 완벽 정리", platform: "유튜브" },
      ],
      project: { title: "개인 포트폴리오 사이트 리팩토링", description: "TypeScript로 기존 프로젝트를 마이그레이션하며 타입 안정성을 체득합니다." },
    },
    {
      phase: 2,
      label: "3~4개월",
      goal: "백엔드 역량 강화 및 배포 환경 경험",
      skills: ["Docker", "REST API 설계", "MySQL 최적화"],
      resources: [
        { type: "강의", title: "스프링 입문 - 코드로 배우는 스프링 부트", platform: "인프런" },
        { type: "강의", title: "따라하며 배우는 도커와 CI 환경 구축", platform: "유데미" },
      ],
      project: { title: "REST API 서버 + Docker 배포", description: "간단한 CRUD API를 Docker로 컨테이너화하고 클라우드에 배포해봅니다." },
    },
    {
      phase: 3,
      label: "5~6개월",
      goal: "실전 프로젝트 완성 및 취업 준비",
      skills: ["포트폴리오 고도화", "기술 면접 준비", "CS 기초"],
      resources: [
        { type: "책", title: "면접을 위한 CS 전공지식 노트", platform: "책" },
        { type: "유튜브", title: "개발자 기술면접 완벽 가이드", platform: "유튜브" },
      ],
      project: { title: "팀 협업 프로젝트 완성", description: "GitHub Projects로 이슈 관리하며 실제 팀 개발 프로세스를 경험합니다." },
    },
  ],
};

type Resource = { type: string; title: string; platform: string };
type Phase = { phase: number; label: string; goal: string; skills: string[]; resources: Resource[]; project: { title: string; description: string } };
type RoadmapData = { current_title: string; target_title: string; phases: Phase[] };

function Roadmap() {
  const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
  const savedAnalysis = localStorage.getItem(ANALYSIS_STORAGE_KEY);
  const parsedProfile = savedProfile ? JSON.parse(savedProfile) : { name: "사용자" };
  const parsedAnalysis = savedAnalysis ? JSON.parse(savedAnalysis) : null;

  const roadmap: RoadmapData =
    parsedAnalysis?.result?.consulting?.roadmap ?? FALLBACK_ROADMAP;

  return (
    <Wrapper>
      <SectionHeader>
        <MainTitle>커리어 로드맵</MainTitle>
        <SubTitle>
          {parsedProfile?.name ? `${parsedProfile.name}님의 ` : ""}
          포트폴리오 분석 결과를 기반으로 AI가 설계한 맞춤 성장 경로입니다.
        </SubTitle>
      </SectionHeader>

      {/* 현재 → 목표 배너 */}
      <LevelBanner>
        <LevelBox $type="current">
          <LevelLabel>현재 역량</LevelLabel>
          <LevelTitle>{roadmap.current_title}</LevelTitle>
        </LevelBox>
        <ArrowBox>→</ArrowBox>
        <LevelBox $type="target">
          <LevelLabel>6개월 후 목표</LevelLabel>
          <LevelTitle>{roadmap.target_title}</LevelTitle>
        </LevelBox>
      </LevelBanner>

      {/* 페이즈별 로드맵 */}
      <PhaseList>
        {roadmap.phases.map((phase) => (
          <PhaseCard key={phase.phase}>
            <PhaseHeader>
              <PhaseNumber>{phase.phase}</PhaseNumber>
              <div>
                <p style={{ margin: 0, fontSize: "0.82em", color: "#868e96", fontWeight: 600 }}>
                  {phase.label}
                </p>
                <p style={{ margin: 0, fontSize: "1.1em", fontWeight: 700, color: "#212529" }}>
                  {phase.goal}
                </p>
              </div>
            </PhaseHeader>

            <PhaseBody>
              {/* 학습 기술 */}
              <PhaseSection>
                <SectionTitle>이 단계에서 익힐 기술</SectionTitle>
                <SkillTagList>
                  {phase.skills.map((s) => (
                    <SkillTag key={s}>{s}</SkillTag>
                  ))}
                </SkillTagList>
              </PhaseSection>

              {/* 추천 학습 자료 */}
              <PhaseSection>
                <SectionTitle>추천 학습 자료</SectionTitle>
                <ResourceList>
                  {phase.resources.map((r, i) => {
                    const { bg, color } = getPlatformColor(r.platform);
                    const url = getResourceUrl(r.platform, r.title);
                    return (
                      <ResourceItem
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        $bg={bg}
                        $color={color}
                      >
                        <ResourceTitle>{r.title}</ResourceTitle>
                        <PlatformBadge $color={color}>{r.platform} ↗</PlatformBadge>
                      </ResourceItem>
                    );
                  })}
                </ResourceList>
              </PhaseSection>

              {/* 추천 프로젝트 */}
              <ProjectBox>
                <ProjectLabel>추천 프로젝트</ProjectLabel>
                <ProjectTitle>{phase.project.title}</ProjectTitle>
                <ProjectDesc>{phase.project.description}</ProjectDesc>
              </ProjectBox>
            </PhaseBody>
          </PhaseCard>
        ))}
      </PhaseList>

      <Footer>
        <span style={{ color: "#20c997" }}>✦</span>
        이 로드맵은 포트폴리오 분석 결과를 기반으로 AI가 생성했습니다.
      </Footer>
    </Wrapper>
  );
}

export default Roadmap;
