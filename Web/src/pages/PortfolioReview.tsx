import styled from "styled-components";
import { ANALYSIS_STORAGE_KEY } from "../api";

const PRIMARY_BLUE = "#46BEFF";
const BORDER_COLOR = "#E9ECEF";

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

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5em;
  margin-bottom: 2em;
`;

const Card = styled.div`
  background: white;
  border: 1px solid ${BORDER_COLOR};
  border-radius: 16px;
  padding: 1.8em;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
`;

const CardTitle = styled.p`
  font-size: 1.1em;
  font-weight: 700;
  color: #212529;
  margin: 0 0 1.2em;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "";
    width: 3px;
    height: 1.1em;
    background: ${PRIMARY_BLUE};
    border-radius: 2px;
    display: block;
  }
`;

// 전체 점수 카드
const ScoreCard = styled(Card)`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 2.5em;
`;

const ScoreCircle = styled.div<{ $score: number }>`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: conic-gradient(
    ${PRIMARY_BLUE} ${(p) => p.$score * 3.6}deg,
    #e9ecef ${(p) => p.$score * 3.6}deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    width: 80px;
    height: 80px;
    background: white;
    border-radius: 50%;
  }
`;

const ScoreNumber = styled.span`
  position: absolute;
  font-size: 1.5em;
  font-weight: 800;
  color: ${PRIMARY_BLUE};
  z-index: 1;
`;

const ScoreSummary = styled.p`
  font-size: 1em;
  color: #495057;
  line-height: 1.7;
  margin: 0;
`;

// 섹션별 점수
const SectionRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SectionName = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  font-weight: 600;
  color: #343a40;
`;

const ScoreBar = styled.div`
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
`;

const ScoreBarFill = styled.div<{ $score: number }>`
  height: 100%;
  width: ${(p) => p.$score}%;
  background: ${(p) =>
    p.$score >= 70 ? "#2EA8FF" : p.$score >= 50 ? "#FFD43B" : "#FF6B6B"};
  border-radius: 4px;
  transition: width 0.6s ease;
`;

const IssueList = styled.ul`
  margin: 6px 0 0;
  padding-left: 1.2em;
  color: #868e96;
  font-size: 0.83em;
  line-height: 1.7;
`;

// Quick Wins
const QuickWinList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const QuickWinItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: #f0fff8;
  border: 1px solid #b2f2d7;
  border-radius: 10px;
  font-size: 0.9em;
  color: #212529;
  line-height: 1.5;
`;

// 프로젝트별 리뷰
const ProjectCard = styled.div`
  background: white;
  border: 1px solid ${BORDER_COLOR};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
  margin-bottom: 1.5em;
`;

const ProjectHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 1.2em 1.8em;
  background: linear-gradient(135deg, #f1f9ff 0%, #e8f4ff 100%);
  border-bottom: 1px solid ${BORDER_COLOR};
`;

const ProjectInitial = styled.div`
  width: 42px;
  height: 42px;
  background: ${PRIMARY_BLUE};
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
  font-weight: 800;
  flex-shrink: 0;
`;

const ProjectBody = styled.div`
  padding: 1.6em 1.8em;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5em;
`;

const StrengthBox = styled.div`
  padding: 1em 1.2em;
  background: rgba(30, 150, 255, 0.04);
  border: 1px solid rgba(30, 150, 255, 0.12);
  border-radius: 10px;
`;

const ImprovementBox = styled.div`
  padding: 1em 1.2em;
  background: #fff9f0;
  border: 1px solid #ffe0b2;
  border-radius: 10px;
`;

const BoxLabel = styled.p`
  font-size: 0.78em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 8px;
`;

const SuggestionList = styled.ul`
  margin: 0;
  padding-left: 1.2em;
  font-size: 0.88em;
  color: #495057;
  line-height: 1.75;
`;

const FullWidthCard = styled(Card)`
  grid-column: 1 / -1;
`;

const SectionDetailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2em;
`;

const SectionDetail = styled.div`
  border: 1px solid ${BORDER_COLOR};
  border-radius: 12px;
  overflow: hidden;
`;

const SectionDetailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9em 1.2em;
  background: #f8f9fa;
  border-bottom: 1px solid ${BORDER_COLOR};
`;

const SectionDetailBody = styled.div`
  padding: 1em 1.2em;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1em;
`;

const Footer = styled.div`
  margin-top: 2em;
  font-size: 0.85em;
  color: #adb5bd;
  display: flex;
  align-items: center;
  gap: 6px;
`;

// --- 타입 ---
type SectionData = {
  section: string;
  score: number;
  issues: string[];
  suggestions: string[];
};

type ProjectReview = {
  project_name: string;
  strength: string;
  issues: string[];
  suggestions: string[];
};

type ReviewData = {
  overall_score: number;
  summary: string;
  sections: SectionData[];
  quick_wins: string[];
  project_reviews: ProjectReview[];
};

// --- Fallback 더미 ---
const FALLBACK: ReviewData = {
  overall_score: 62,
  summary: "기초 기술 스택은 갖춰져 있으나 프로젝트 성과의 구체성과 본인의 기여도 서술이 부족합니다. 몇 가지 핵심 항목만 개선해도 완성도가 크게 올라갑니다.",
  sections: [
    {
      section: "프로젝트 설명 구체성",
      score: 55,
      issues: ["프로젝트 목적과 문제 정의가 빠져 있음", "사용한 기술 선택 이유 미기재"],
      suggestions: ["각 프로젝트에 '왜 만들었는가'를 1~2문장으로 추가", "기술 선택 이유를 간단히 명시"],
    },
    {
      section: "기술 스택 활용도",
      score: 70,
      issues: ["AWS 사용 경험이 있으나 구체적인 서비스명 미기재"],
      suggestions: ["EC2, S3, RDS 등 사용한 AWS 서비스를 명시적으로 작성"],
    },
    {
      section: "성과/결과 수치화",
      score: 40,
      issues: ["프로젝트 결과가 '완성'으로만 기재", "사용자 수, 성능 개선 수치 없음"],
      suggestions: ["API 응답 시간 개선율, 팀원 수, 기여한 기능 수 등 수치 추가", "해커톤 수상은 반드시 수상 규모(참가팀 수 등) 함께 기재"],
    },
    {
      section: "차별화 요소",
      score: 65,
      issues: ["해커톤 수상이 있음에도 강조가 부족"],
      suggestions: ["수상 경력을 상단에 배치하고 어떤 문제를 해결했는지 기술"],
    },
  ],
  quick_wins: [
    "각 프로젝트에 '본인이 담당한 기능' 목록을 bullet로 3개 이상 추가",
    "해커톤 수상을 포트폴리오 최상단에 하이라이트로 이동",
    "GitHub 링크와 배포 URL을 각 프로젝트에 명시",
    "사용 기술 뱃지 이미지(shields.io) 추가로 시각적 완성도 향상",
  ],
  project_reviews: [
    {
      project_name: "Folio",
      strength: "React + AWS + Node.js 풀스택 구성으로 기술 폭이 넓음",
      issues: ["역할과 기여도 미기재", "배포 URL 없음"],
      suggestions: ["본인이 설계한 API 엔드포인트나 담당 화면을 명시", "Vercel/Netlify 배포 후 링크 추가"],
    },
    {
      project_name: "gabs-wed",
      strength: "협업 프로젝트로 팀 경험 어필 가능",
      issues: ["프로젝트 기간 대비 성과 서술 부족", "팀 내 본인 역할 불명확"],
      suggestions: ["Git 커밋 수, PR 수 등 기여도를 수치로 표현", "담당 기능을 구체적으로 나열"],
    },
  ],
};

function PortfolioReview() {
  const raw = localStorage.getItem(ANALYSIS_STORAGE_KEY);
  const parsed = raw ? JSON.parse(raw) : null;
  const review: ReviewData =
    parsed?.result?.consulting?.portfolio_review ?? FALLBACK;

  return (
    <Wrapper>
      <SectionHeader>
        <MainTitle>포트폴리오 개선 리포트</MainTitle>
        <SubTitle>AI가 포트폴리오를 분석해 개선 포인트와 실행 방안을 제안합니다.</SubTitle>
      </SectionHeader>

      {/* 전체 점수 + 요약 */}
      <CardGrid>
        <ScoreCard>
          <ScoreCircle $score={review.overall_score}>
            <ScoreNumber>{review.overall_score}</ScoreNumber>
          </ScoreCircle>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: "0.82em", fontWeight: 700, color: "#adb5bd", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              종합 포트폴리오 점수
            </p>
            <ScoreSummary>{review.summary}</ScoreSummary>
          </div>
        </ScoreCard>

        {/* 섹션별 점수 */}
        <Card>
          <CardTitle>항목별 점수</CardTitle>
          <SectionRow>
            {review.sections.map((s) => (
              <SectionItem key={s.section}>
                <SectionName>
                  <span>{s.section}</span>
                  <span style={{ color: s.score >= 70 ? "#2EA8FF" : s.score >= 50 ? "#f59f00" : "#FF6B6B" }}>
                    {s.score}점
                  </span>
                </SectionName>
                <ScoreBar>
                  <ScoreBarFill $score={s.score} />
                </ScoreBar>
              </SectionItem>
            ))}
          </SectionRow>
        </Card>

        {/* Quick Wins */}
        <Card>
          <CardTitle>즉시 개선 가능한 항목</CardTitle>
          <QuickWinList>
            {review.quick_wins.map((q, i) => (
              <QuickWinItem key={i}>
                <span style={{ color: "#20c997", fontWeight: 800, flexShrink: 0 }}>✓</span>
                {q}
              </QuickWinItem>
            ))}
          </QuickWinList>
        </Card>

        {/* 섹션별 상세 */}
        <FullWidthCard>
          <CardTitle>항목별 상세 피드백</CardTitle>
          <SectionDetailList>
            {review.sections.map((s) => (
              <SectionDetail key={s.section}>
                <SectionDetailHeader>
                  <span style={{ fontWeight: 700, fontSize: "0.95em", color: "#343a40" }}>{s.section}</span>
                  <span style={{
                    padding: "3px 12px",
                    borderRadius: "20px",
                    fontSize: "0.8em",
                    fontWeight: 700,
                    background: s.score >= 70 ? "#e7f5ff" : s.score >= 50 ? "#fff9db" : "#fff0f0",
                    color: s.score >= 70 ? "#1c7ed6" : s.score >= 50 ? "#f59f00" : "#e03131",
                  }}>
                    {s.score}점
                  </span>
                </SectionDetailHeader>
                <SectionDetailBody>
                  <div>
                    <BoxLabel style={{ color: "#e03131" }}>현재 문제점</BoxLabel>
                    <IssueList>
                      {s.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                    </IssueList>
                  </div>
                  <div>
                    <BoxLabel style={{ color: PRIMARY_BLUE }}>개선 제안</BoxLabel>
                    <SuggestionList>
                      {s.suggestions.map((sg, i) => <li key={i}>{sg}</li>)}
                    </SuggestionList>
                  </div>
                </SectionDetailBody>
              </SectionDetail>
            ))}
          </SectionDetailList>
        </FullWidthCard>
      </CardGrid>

      {/* 프로젝트별 리뷰 */}
      <SectionHeader style={{ marginTop: "1em" }}>
        <MainTitle style={{ fontSize: "1.4em" }}>프로젝트별 피드백</MainTitle>
        <SubTitle>각 프로젝트의 강점과 구체적인 개선 방향을 제안합니다.</SubTitle>
      </SectionHeader>

      {review.project_reviews.map((p, i) => (
        <ProjectCard key={i}>
          <ProjectHeader>
            <ProjectInitial>{p.project_name?.[0] ?? "P"}</ProjectInitial>
            <div>
              <p style={{ margin: 0, fontSize: "1.1em", fontWeight: 700, color: "#212529" }}>{p.project_name}</p>
              <p style={{ margin: "3px 0 0", fontSize: "0.85em", color: "#868e96" }}>{p.strength}</p>
            </div>
          </ProjectHeader>
          <ProjectBody>
            <ImprovementBox>
              <BoxLabel style={{ color: "#e67700" }}>개선이 필요한 부분</BoxLabel>
              <SuggestionList>
                {p.issues.map((issue, j) => <li key={j}>{issue}</li>)}
              </SuggestionList>
            </ImprovementBox>
            <StrengthBox>
              <BoxLabel style={{ color: PRIMARY_BLUE }}>구체적인 개선 방법</BoxLabel>
              <SuggestionList>
                {p.suggestions.map((sg, j) => <li key={j}>{sg}</li>)}
              </SuggestionList>
            </StrengthBox>
          </ProjectBody>
        </ProjectCard>
      ))}

      <Footer>
        <span style={{ color: "#20c997" }}>✦</span>
        이 리포트는 포트폴리오 분석 결과를 기반으로 AI가 생성했습니다.
      </Footer>
    </Wrapper>
  );
}

export default PortfolioReview;
