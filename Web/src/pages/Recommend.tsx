import { useState, useMemo } from "react";
import styled from "styled-components";

// --- 1. 타입 정의 (TS 에러 방지) ---
interface CompanyData {
  id: number;
  name: string;
  tags: string[];
  workType: string;
  fitScore: number;
  techScore: number;
  stacks: string[];
  reasons: string[];
  rank: number;
  logoInitial: string;
}

interface FilterOption {
  id: string;
  label: string;
}

// --- 2. Styled Components (디자인) ---
const PRIMARY_BLUE = "#1E96FF";
const MINT_GREEN = "#20c997";

const RecommendWrapper = styled.div`
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 3em 10%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const PageTitle = styled.h2`
  font-size: 1.8em;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5em;
  color: #212529;

  &::before {
    content: "";
    width: 4px;
    height: 1.2em;
    background-color: ${PRIMARY_BLUE};
    border-radius: 2px;
  }
`;

const FilterBar = styled.div`
  background: white;
  padding: 1.2em 1.5em;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  margin-bottom: 2.5em;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

// TS 에러 방지를 위해 $표시 사용 (Transient Props)
const FilterTag = styled.button<{ $isSelected?: boolean }>`
  background: ${(props) => (props.$isSelected ? PRIMARY_BLUE : "#f1f3f5")};
  color: ${(props) => (props.$isSelected ? "white" : "#495057")};
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85em;

  &:hover {
    background: ${(props) => (props.$isSelected ? PRIMARY_BLUE : "#e9ecef")};
  }
`;

const CompanyCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e9ecef;
  padding: 2.5em;
  margin-bottom: 2em;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const CompanyLogo = styled.div<{ $rank: number }>`
  width: 56px;
  height: 56px;
  background: #456173;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4em;
  font-weight: 700;
  position: relative;

  &::after {
    content: "${(props) => props.$rank}";
    position: absolute;
    top: -6px;
    right: -6px;
    background: ${MINT_GREEN};
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 0.6em;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
  }
`;

const GaugeFill = styled.div<{ $percent: number; $color?: string }>`
  height: 100%;
  width: ${(props) => props.$percent}%;
  background: ${(props) => props.$color || PRIMARY_BLUE};
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ReasonBox = styled.div`
  background: rgba(30, 150, 255, 0.04);
  border: 1px solid rgba(30, 150, 255, 0.1);
  border-radius: 12px;
  padding: 1.5em;
  margin: 2em 0;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  background: ${(props) => (props.$primary ? PRIMARY_BLUE : "white")};
  color: ${(props) => (props.$primary ? "white" : "#495057")};
  border: ${(props) => (props.$primary ? "none" : "1px solid #e9ecef")};
  padding: 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.95em;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

// --- 3. Mock Data (DB 연결 전 테스트용) ---
const FILTER_OPTIONS: FilterOption[] = [
  { id: "스타트업", label: "스타트업" },
  { id: "중소기업", label: "중소기업" },
  { id: "핀테크", label: "핀테크" },
  { id: "IT/소프트웨어", label: "IT/소프트웨어" },
  { id: "재택근무", label: "재택근무" },
  { id: "하이브리드", label: "하이브리드" },
];

const MOCK_COMPANIES: CompanyData[] = [
  {
    id: 1,
    name: "테크스타트 주식회사",
    tags: ["핀테크", "스타트업", "서울 강남구"],
    workType: "하이브리드",
    fitScore: 92,
    techScore: 88,
    stacks: ["Python", "Spring Boot", "PostgreSQL", "AWS"],
    reasons: [
      "Python/Spring 기반 개발 환경으로 현재 보유 기술 활용도 높음",
      "빠른 성장 중인 스타트업으로 주도적인 업무 경험 가능",
    ],
    rank: 1,
    logoInitial: "T",
  },
  {
    id: 2,
    name: "데이터브릿지",
    tags: ["IT/소프트웨어", "중소기업", "서울 서초구"],
    workType: "재택근무",
    fitScore: 85,
    techScore: 82,
    stacks: ["Java", "Spring", "MySQL", "Redis"],
    reasons: [
      "데이터 중심 서비스로 SQL 역량 활용 및 심화 가능",
      "유연한 재택근무 정책으로 워라밸 보장",
    ],
    rank: 2,
    logoInitial: "D",
  },
];

// --- 4. 메인 컴포넌트 ---
function Recommend() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // 필터 토글 로직
  const handleFilterClick = (id: string) => {
    setSelectedFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // 실제 필터링 로직 (나중에 DB 연동 시 이 부분을 API 호출로 대체)
  const filteredCompanies = useMemo(() => {
    if (selectedFilters.length === 0) return MOCK_COMPANIES;
    return MOCK_COMPANIES.filter((company) =>
      company.tags.some((tag) => selectedFilters.includes(tag)) ||
      selectedFilters.includes(company.workType)
    );
  }, [selectedFilters]);

  return (
    <RecommendWrapper>
      <PageTitle>기업 추천 결과</PageTitle>

      <FilterBar>
        <span style={{ fontSize: "0.9em", fontWeight: 700, color: "#868e96", marginRight: "10px" }}>
          선호 조건 선택
        </span>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {FILTER_OPTIONS.map((opt) => (
            <FilterTag
              key={opt.id}
              $isSelected={selectedFilters.includes(opt.id)}
              onClick={() => handleFilterClick(opt.id)}
            >
              {opt.label}
            </FilterTag>
          ))}
        </div>
      </FilterBar>

      {filteredCompanies.map((company) => (
        <CompanyCard key={company.id}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2em" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <CompanyLogo $rank={company.rank}>{company.logoInitial}</CompanyLogo>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.3em" }}>{company.name}</h3>
                <p style={{ margin: "4px 0 0", color: "#868e96", fontSize: "0.9em" }}>
                  {company.tags.join(" • ")}
                </p>
              </div>
            </div>
            <div style={{ background: "#f1f3f5", padding: "4px 12px", borderRadius: "6px", fontSize: "0.85em", fontWeight: 600, height: "fit-content" }}>
              {company.workType}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: "#f8f9fa", padding: "1.2em", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontWeight: 700, fontSize: "0.95em" }}>
                <span>직무 적합도</span>
                <span style={{ color: PRIMARY_BLUE }}>{company.fitScore}%</span>
              </div>
              <div style={{ height: "8px", background: "#e9ecef", borderRadius: "4px", overflow: "hidden" }}>
                <GaugeFill $percent={company.fitScore} />
              </div>
            </div>
            <div style={{ background: "#f8f9fa", padding: "1.2em", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontWeight: 700, fontSize: "0.95em" }}>
                <span>기술 스택 일치도</span>
                <span style={{ color: MINT_GREEN }}>{company.techScore}%</span>
              </div>
              <div style={{ height: "8px", background: "#e9ecef", borderRadius: "4px", overflow: "hidden" }}>
                <GaugeFill $percent={company.techScore} $color={MINT_GREEN} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "2em" }}>
            <p style={{ fontSize: "0.9em", fontWeight: 700, color: "#495057", marginBottom: "10px" }}>주요 기술 스택</p>
            <div style={{ display: "flex", gap: "8px" }}>
              {company.stacks.map((s) => (
                <div key={s} style={{ background: "white", border: "1px solid #dee2e6", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8em" }}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          <ReasonBox>
            <div style={{ color: PRIMARY_BLUE, fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🎯</span> 이 기업을 추천하는 이유
            </div>
            <ul style={{ margin: 0, paddingLeft: "1.2em", color: "#495057", fontSize: "0.95em", lineHeight: "1.8" }}>
              {company.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </ReasonBox>

          <div style={{ display: "flex", gap: "12px" }}>
            <ActionButton $primary>채용 공고 보기 ↗</ActionButton>
            <ActionButton>기업 상세 정보</ActionButton>
          </div>
        </CompanyCard>
      ))}
    </RecommendWrapper>
  );
}

export default Recommend;