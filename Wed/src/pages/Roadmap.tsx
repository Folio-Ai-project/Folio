import styled from "styled-components";

// --- 1. 상수 및 스타일 정의 ---
const PRIMARY_BLUE = "#1E96FF";
const BORDER_COLOR = "#E9ECEF";

// 전체 컨테이너 (화이트 배경)
const RoadmapWrapper = styled.div`
  width: 95%;
  margin: 2em auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const SectionHeader = styled.div`
  margin-bottom: 2.5em;
  padding-left: 15px;
  border-left: 4px solid ${PRIMARY_BLUE};
`;

const MainTitle = styled.h2`
  font-size: 1.8em;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #212529;
`;

const SubTitle = styled.p`
  font-size: 1em;
  color: #868e96;
  margin: 0;
`;

// 로드맵 영역 배경 박스
const RoadmapContentBox = styled.div`
  background-color: white;
  border: 1px solid ${BORDER_COLOR};
  border-radius: 20px;
  padding: 3em 2em;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

// 타임라인 (상단 스텝바)
const TimelineContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  margin: 0 auto 3em;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: #dee2e6;
    z-index: 1;
  }
`;

const StepCircle = styled.div<{ $active?: boolean; $isCurrent?: boolean }>`
  width: 32px;
  height: 32px;
  background: ${props => props.$active ? PRIMARY_BLUE : "white"};
  border: 3px solid ${props => props.$active ? PRIMARY_BLUE : "#dee2e6"};
  border-radius: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::after {
    content: "${props => props.$isCurrent ? '현재' : ''}";
    position: absolute;
    top: -25px;
    font-size: 0.8em;
    font-weight: 700;
    color: ${props => props.$active ? PRIMARY_BLUE : "#adb5bd"};
    white-space: nowrap;
  }
`;

// 로드맵 카드 그리드
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: stretch;
`;

const RoadmapCard = styled.div<{ $isCurrent?: boolean }>`
  background: ${props => props.$isCurrent ? "#f1f9ff" : "white"};
  border: 2px solid ${props => props.$isCurrent ? PRIMARY_BLUE : BORDER_COLOR};
  border-radius: 16px;
  padding: 1.5em;
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CardLabel = styled.span`
  font-size: 0.9em;
  font-weight: 700;
  color: ${PRIMARY_BLUE};
`;

const CardTitle = styled.h3`
  font-size: 1.15em;
  font-weight: 700;
  margin: 0;
  color: #343a40;
`;

const TechStackList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const TechTag = styled.span`
  background: white;
  border: 1px solid #dee2e6;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75em;
  font-weight: 600;
  color: #495057;
`;

const ProjectBox = styled.div`
  margin-top: auto;
  background: rgba(0, 0, 0, 0.03);
  padding: 12px;
  border-radius: 10px;
  font-size: 0.85em;
  
  strong { display: block; margin-bottom: 4px; color: #495057; }
  span { color: #868e96; }
`;

const FooterInfo = styled.div`
  margin-top: 2em;
  font-size: 0.85em;
  color: #adb5bd;
  display: flex;
  align-items: center;
  gap: 6px;
`;

// --- 2. 컴포넌트 구현 ---
function Roadmap() {
  // 로컬 스토리지 데이터 (Analysis에서 쓴 데이터 재사용)
  const savedData = localStorage.getItem("myPageData");
  const parsedData = savedData ? JSON.parse(savedData) : { name: "사용자", stacks: ["Java", "Python"], career: "1년차" };

  return (
    <RoadmapWrapper>
      <SectionHeader>
        <MainTitle>커리어 로드맵</MainTitle>
        <SubTitle>현재 역량 분석을 기반으로 AI가 제안하는 맞춤형 성장 경로입니다.</SubTitle>
      </SectionHeader>

      <RoadmapContentBox>
        <TimelineContainer>
          <StepCircle $active $isCurrent />
          <StepCircle />
          <StepCircle />
        </TimelineContainer>

        <CardGrid>
          {/* STEP 1: 현재 역량 */}
          <RoadmapCard $isCurrent>
            <CardLabel>현재 역량</CardLabel>
            <CardTitle>주니어 백엔드 개발자</CardTitle>
            <div>
              <p style={{fontSize: '0.8em', color: '#868e96', marginBottom: '8px'}}>보유 기술 스택</p>
              <TechStackList>
                {parsedData.stacks.map((s: string) => <TechTag key={s}>{s}</TechTag>)}
              </TechStackList>
            </div>
            <ProjectBox>
              <strong>대표 프로젝트 경험</strong>
              <span>REST API 개발 및 서버 최적화 경험</span>
            </ProjectBox>
          </RoadmapCard>

          {/* STEP 2: 3개월 목표 */}
          <RoadmapCard>
            <CardLabel>3개월 후 목표</CardLabel>
            <CardTitle>주니어+ 백엔드 개발자</CardTitle>
            <div>
              <p style={{fontSize: '0.8em', color: '#868e96', marginBottom: '8px'}}>추천 학습 기술</p>
              <TechStackList>
                <TechTag>Docker</TechTag>
                <TechTag>SQL 튜닝</TechTag>
                <TechTag>테스트 자동화</TechTag>
              </TechStackList>
            </div>
            <ProjectBox>
              <strong>추천 프로젝트 유형</strong>
              <span>컨테이너 기반 서비스 배포 실습</span>
            </ProjectBox>
          </RoadmapCard>

          {/* STEP 3: 6개월 목표 */}
          <RoadmapCard>
            <CardLabel>6개월 후 목표</CardLabel>
            <CardTitle>미드레벨 백엔드 개발자</CardTitle>
            <div>
              <p style={{fontSize: '0.8em', color: '#868e96', marginBottom: '8px'}}>추천 학습 기술</p>
              <TechStackList>
                <TechTag>Kubernetes</TechTag>
                <TechTag>클라우드 아키텍처</TechTag>
                <TechTag>시스템 설계</TechTag>
              </TechStackList>
            </div>
            <ProjectBox>
              <strong>추천 프로젝트 유형</strong>
              <span>마이크로서비스 아키텍처(MSA) 구축</span>
            </ProjectBox>
          </RoadmapCard>
        </CardGrid>

        <FooterInfo>
          <span style={{color: '#20c997'}}>✦</span> 이 로드맵은 포트폴리오 분석 결과를 기반으로 생성되었습니다.
        </FooterInfo>
      </RoadmapContentBox>
    </RoadmapWrapper>
  );
}

export default Roadmap;