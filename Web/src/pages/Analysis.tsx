import { useEffect, useState } from "react";
import styled from "styled-components";
import BAG from "/SVG/BAG.svg?url";
import URL from "/SVG/URL.svg?url";
import CIRCLE from "/SVG/circle.svg?url";
import SkillRadarChart from "../components/SkillRadarChart";
import SkillBarChart from "../components/SkillBarChart";
import type { SkillData } from "../components/SkillBarChart";
import { useLocation } from "react-router-dom";

// ------------------ 더미 데이터(나머지는 나중에 AI DB로 교체) ------------------
const jobFitData: SkillData[] = [
  { name: "백엔드 개발", value: 87 },
  { name: "데이터 분석", value: 72 },
  { name: "풀스택 개발", value: 65 },
  { name: "DevOps", value: 45 },
  { name: "프론트엔드", value: 30 },
];

const missingSkills = [
  { id: 1, name: "Docker/Kubernetes", level: "높음" },
  { id: 2, name: "SQL 튜닝/최적화", level: "높음" },
  { id: 3, name: "클라우드 아키텍처", level: "중간" },
  { id: 4, name: "테스트 자동화", level: "중간" },
];

const actionPlans = [
  {
    id: 1,
    title: "Docker & Kubernetes 실습 과정 수강",
    description: "컨테이너화 기술 습득을 통해 DevOps 역량 강화 권장",
    duration: "약 4주 소요",
  },
  {
    id: 2,
    title: "SQL 튜닝 마스터 클래스 이수",
    description: "실행 계획 분석, 인덱스 최적화 등 고급 DB 기술 학습",
    duration: "약 3주 소요",
  },
  {
    id: 3,
    title: "AWS Solutions Architect 자격증 준비",
    description: "클라우드 설계 역량 증명 및 시장 경쟁력 향상",
    duration: "약 6주 소요",
  },
];

// ------------------ 타입 ------------------

// ------------------ 스타일(너 기존 코드 그대로) ------------------
let AnalysisBgDiv = styled.div`
  width: 95%;
  min-height: 37.5em;
  margin: auto;
  height: auto;
  margin-top: 1.5em;
`;

let AnalysisText = styled.div`
  color: black;
  font-size: 1.5em;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: "";
    display: block;
    width: 3px;
    height: 1.5em;
    background-color: #46beff;
    border-radius: 10px;
  }
`;

let AnalysisDivList = styled.div`
  display: flex;
  gap: 1em;
  margin-top: 1.5em;
  width: 100%;
  height: 90%;
  margin-bottom: 2em;
`;

let AnalysisDiv = styled.div`
  flex: 1;
  width: 100%;
  min-height: 30em;
  background: #f1f3f5;
  border-radius: 1em;
  padding: 1.5em;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
`;

let AnalysisTitle = styled.p`
  font-size: 1.2em;
  font-weight: 600;
  margin-bottom: 0.5em;
`;

let AnalysisName = styled.p`
  font-size: 1.75em;
  font-weight: 600;
  margin-bottom: 0.25em;
  margin-top: 1em;
`;

let AnalysisCareer = styled.p`
  font-size: 1.1em;
  font-weight: 500;
  margin-bottom: 0.5em;
  margin-top: 3em;
  color: gray;
`;

let AnalysisPortfolioUrl = styled.p`
  font-size: 1.1em;
  font-weight: 500;
  margin-bottom: 0.5em;
  margin-top: 1.5em;
  color: gray;
`;

let AnalysisStacks = styled.p`
  font-size: 1.1em;
  font-weight: 500;
  margin-bottom: 0.5em;
  margin-top: 4em;
  color: gray;
`;

let AnalysisTitleChart = styled.p`
  font-size: 1em;
  font-weight: 500;
  margin-bottom: 0.5em;
  margin-top: 0.4em;
  color: gray;
`;

let Badge = styled.button`
  display: inline-block;
  color: white;
  font-weight: 500;
  font-size: 1.1em;
  background-color: rgb(70, 190, 255);
  border-radius: 19.2px;
  padding: 0.3em 0.75em;
  border: none;
  margin-right: 1em;
  margin-bottom: 0.5em;
`;

let BestJobDiv = styled.div`
  color: #1e96ff;
  font-weight: 500;
  font-size: 1.1em;
  background-color: rgba(70, 190, 255, 0.3);
  border-radius: 0.5em;
  border: 1.5px solid rgba(70, 190, 255, 0.5);
  padding: 0.7em 1em;
  height: 3em;
  margin-top: 2.5em;
`;

let SVG = styled.img`
  width: 1.2em;
  height: 1.2em;
  margin-right: 0.5em;
`;

let Strength = styled.div`
  font-weight: 500;
  font-size: 1.1em;
  padding: 0.7em 1em;
  height: 3em;
`;

// 요약 박스
let SummaryBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5em;
  height: 19em;
  margin-bottom: 1.5em;
  margin-top: 1.5em;
`;

let SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.25em;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.5em;

  &::before {
    content: "✔️";
    font-size: 0.8em;
    color: #46beff;
  }
`;

let SummaryDesc = styled.p`
  font-size: 0.95em;
  color: #868e96;
  margin-left: 1.8em;
`;

let MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8em 0;
  border-bottom: 1px solid #f1f3f5;

  &:last-child {
    border-bottom: none;
  }
`;

let MetricLabel = styled.span`
  font-size: 1em;
  color: #495057;
  font-weight: 500;
`;

let MetricValue = styled.span`
  font-size: 1em;
  font-weight: 600;
  color: #212529;
`;

let StatusBadge = styled.span<{ colorType?: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  font-weight: 600;
  background-color: ${(props) => (props.colorType === "green" ? "#e7faf3" : "#e9ecef")};
  color: ${(props) => (props.colorType === "green" ? "#0ca678" : "#495057")};
`;

let EvaluationFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2em;
  font-size: 0.85em;
  color: #adb5bd;
`;

let MissingSkillList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 1.5em;
`;

let MissingSkillItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em 1.2em;
  background-color: #ffffff;
  border: 1px solid #f1f3f5;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
`;

let SkillName = styled.span`
  font-size: 1em;
  font-weight: 500;
  color: #343a40;
`;

let LevelBadge = styled.span<{ level: string }>`
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.85em;
  font-weight: 600;
  background-color: ${(props) => (props.level === "높음" ? "#fff0f0" : "#f1f3f5")};
  color: ${(props) => (props.level === "높음" ? "#ff6b6b" : "#868e96")};
`;

let FooterText = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
  padding-top: 3.5em;
  font-size: 0.85em;
  color: #adb5bd;
`;

let FooterText2 = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 13em;
  padding-top: 3.5em;
  font-size: 0.85em;
  color: #adb5bd;
`;

let PlanList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 1.5em;
`;

let PlanItem = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1.2em;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

let PlanHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

let StepBadge = styled.div`
  width: 24px;
  height: 24px;
  background-color: #4dabf7;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85em;
  font-weight: 700;
  flex-shrink: 0;
`;

let PlanMainTitle = styled.h4`
  font-size: 1.05em;
  font-weight: 700;
  color: #343a40;
  margin: 0;
`;

let PlanDescription = styled.p`
  font-size: 0.9em;
  color: #868e96;
  margin-left: 36px;
  line-height: 1.4;
`;

let DurationTag = styled.span`
  font-size: 0.9em;
  font-weight: 600;
  color: #51cf66;
  margin-left: 36px;
`;

// ------------------ 컴포넌트 ------------------
function Analysis() {
  const location = useLocation();
  const result = location.state?.result;
  const structure = result?.structure;
  const consulting = result?.consulting;

  const profile = {
    name: structure?.career_summary ? "분석 완료" : "홍길동",
    career: consulting?.overall_level ?? "-",
    portfolioUrl: "-",
    stacks: structure?.skills ?? [],
  };

  const fitData: SkillData[] = (consulting?.market_fit_roles ?? jobFitData).map(
    (r: { role: string; fit_score: number }) => ({ name: r.role, value: r.fit_score })
  );

  const skills = (consulting?.missing_skills ?? missingSkills).map(
    (s: { name: string; priority: string }, i: number) => ({
      id: i + 1,
      name: s.name,
      level: s.priority ?? s.level,
    })
  );

  const plans = (consulting?.improvement_actions ?? actionPlans).map(
    (p: { title: string; description: string; duration: string }, i: number) => ({
      id: i + 1,
      title: p.title,
      description: p.description,
      duration: p.duration,
    })
  );

  return (
    <div>
      <AnalysisBgDiv>
        <AnalysisText>포트폴리오 분석 리포트</AnalysisText>

        <AnalysisDivList>
          {/* AI 분석 결과 기반 프로필 */}
          <AnalysisDiv>
            <AnalysisTitle>사용자 프로필</AnalysisTitle>
            <AnalysisName>{profile.name}</AnalysisName>
            <AnalysisCareer>
              <SVG src={BAG} alt="" /> 레벨: {profile.career}
            </AnalysisCareer>
            <AnalysisPortfolioUrl>
              <SVG src={URL} alt="" /> {profile.portfolioUrl}
            </AnalysisPortfolioUrl>
            <AnalysisStacks>보유 기술 스킬</AnalysisStacks>
            {profile.stacks.length > 0 ? (
              <div className="mt-3">
                {profile.stacks.map((stack) => (
                  <Badge key={stack}>{stack}</Badge>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: "0.75em", color: "#888" }}>스킬 정보 없음</div>
            )}
          </AnalysisDiv>

          {/* 아래 2개는 일단 더미 유지 (나중에 AI DB로 교체) */}
          <AnalysisDiv>
            <AnalysisTitle>기술 역량 분석</AnalysisTitle>
            <AnalysisTitleChart>분석 결과 기반 역량 시각화</AnalysisTitleChart>
            <SkillRadarChart />
            <Strength>
              <SVG src={CIRCLE} alt="circle" />
              강점: 프로그래밍 역량, 문제 해결 능력
            </Strength>
          </AnalysisDiv>

          <AnalysisDiv>
            <AnalysisTitle>직무별 적합도</AnalysisTitle>
            <AnalysisTitleChart>AI 분석 기반 직무 매칭 점수</AnalysisTitleChart>
            <SkillBarChart data={fitData} />
            <BestJobDiv>최적 직무: {fitData[0]?.name ?? "-"}</BestJobDiv>
          </AnalysisDiv>
        </AnalysisDivList>
      </AnalysisBgDiv>

      <AnalysisBgDiv>
        <AnalysisText>AI 커리어 컨설팅 요약</AnalysisText>

        <AnalysisDivList>
          <AnalysisDiv>
            <AnalysisTitle>현재 역량 수준</AnalysisTitle>

            <SummaryBox>
              <SummaryHeader>주니어 백엔드 개발자</SummaryHeader>
              <SummaryDesc>Python, Java 기반 서버 개발 역량 보유</SummaryDesc>
            </SummaryBox>

            <MetricRow>
              <MetricLabel>경력 환산</MetricLabel>
              <MetricValue>2년차 수준</MetricValue>
            </MetricRow>

            <MetricRow>
              <MetricLabel>시장 경쟁력</MetricLabel>
              <StatusBadge>상위 35%</StatusBadge>
            </MetricRow>

            <MetricRow>
              <MetricLabel>성장 잠재력</MetricLabel>
              <StatusBadge colorType="green">높음</StatusBadge>
            </MetricRow>

            <EvaluationFooter>✨ 분석 결과 기반 평가</EvaluationFooter>
          </AnalysisDiv>

          <AnalysisDiv>
            <AnalysisTitle>부족 스킬 분석</AnalysisTitle>

            <MissingSkillList>
              {skills.map((skill) => (
                <MissingSkillItem key={skill.id}>
                  <SkillName>{skill.name}</SkillName>
                  <LevelBadge level={skill.level}>{skill.level}</LevelBadge>
                </MissingSkillItem>
              ))}
            </MissingSkillList>

            <FooterText2>
              <span style={{ color: "#51cf66" }}>✦</span> 포트폴리오 분석 결과 기반
            </FooterText2>
          </AnalysisDiv>

          <AnalysisDiv>
            <AnalysisTitle>개선 액션 플랜</AnalysisTitle>

            <PlanList>
              {plans.map((plan, index) => (
                <PlanItem key={plan.id}>
                  <PlanHeader>
                    <StepBadge>{index + 1}</StepBadge>
                    <PlanMainTitle>{plan.title}</PlanMainTitle>
                  </PlanHeader>
                  <PlanDescription>{plan.description}</PlanDescription>
                  <DurationTag>{plan.duration}</DurationTag>
                </PlanItem>
              ))}
            </PlanList>

            <FooterText style={{ marginTop: "1.5em" }}>
              <span style={{ color: "#51cf66" }}>✦</span> AI 분석 결과 기반 추천
            </FooterText>
          </AnalysisDiv>
        </AnalysisDivList>
      </AnalysisBgDiv>
    </div>
  );
}

export default Analysis;