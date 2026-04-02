import { useState, useMemo } from "react";
import styled from "styled-components";
import { ANALYSIS_STORAGE_KEY } from "../api";

// --- 1. 타입 정의 ---
interface CompanyData {
  id: number;
  name: string;
  tags: string[];
  workType: string;
  fitScore: number;
  techScore: number;
  stacks: string[];
  reasons: string[];
  description: string;
  rank: number;
  logoInitial: string;
}

// 회사명으로 채용 포털 검색 URL 생성 (항상 동작)
function getPortalUrls(name: string) {
  const q = encodeURIComponent(name);
  return {
    wanted: `https://www.wanted.co.kr/search?query=${q}&tab=company`,
    saramin: `https://www.saramin.co.kr/zf_user/search?searchType=search&searchword=${q}`,
  };
}

// --- 2. Styled Components ---
const PRIMARY_BLUE = "#46BEFF";
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
  margin-bottom: 1em;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex-wrap: wrap;
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const FilterLabel = styled.span`
  font-size: 0.78em;
  font-weight: 700;
  color: #adb5bd;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FilterTagGroup = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const FilterTag = styled.button<{ $isSelected?: boolean }>`
  background: ${(props) => (props.$isSelected ? PRIMARY_BLUE : "#f1f3f5")};
  color: ${(props) => (props.$isSelected ? "white" : "#495057")};
  padding: 6px 14px;
  border-radius: 20px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.83em;

  &:hover {
    background: ${(props) => (props.$isSelected ? "#74CBFF" : "#e9ecef")};
  }
`;

const ResultMeta = styled.div`
  font-size: 0.88em;
  color: #868e96;
  margin-bottom: 1.5em;

  strong { color: ${PRIMARY_BLUE}; }
`;

const CompanyCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e9ecef;
  padding: 2.5em;
  margin-bottom: 2em;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease;

  &:hover { transform: translateY(-4px); }
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
  flex-shrink: 0;

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
  margin: 1.5em 0;
`;

const DescriptionBox = styled.p`
  font-size: 0.92em;
  color: #495057;
  line-height: 1.7;
  margin: 1em 0 0;
  padding: 1em 1.2em;
  background: #f8f9fa;
  border-radius: 10px;
`;

const ActionButton = styled.a`
  flex: 1;
  display: block;
  padding: 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.95em;
  text-align: center;
  text-decoration: none;
  transition: opacity 0.2s;
  box-sizing: border-box;

  &:hover { opacity: 0.85; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 5em 0;
  color: #adb5bd;
`;

// --- 3. Mock Data ---
const MOCK_COMPANIES: CompanyData[] = [
  {
    id: 1,
    name: "토스페이먼츠",
    tags: ["핀테크", "스타트업", "서울 강남구"],
    workType: "하이브리드",
    fitScore: 78,
    techScore: 82,
    stacks: ["React", "Node.js", "PostgreSQL", "AWS"],
    description: "국내 1위 간편결제 플랫폼 토스의 결제 인프라를 담당하는 자회사. 주니어 개발자도 직접 프로덕트에 기여할 수 있는 환경을 제공합니다.",
    reasons: [
      "React + Node.js 스택이 현재 보유 기술과 일치하여 즉시 투입 가능",
      "주니어 친화적 온보딩 프로그램과 코드 리뷰 문화가 잘 갖춰져 있음",
      "결제/금융 도메인 경험을 통해 시장 희소성 있는 개발자로 성장 가능",
    ],
    rank: 1,
    logoInitial: "T",
  },
  {
    id: 2,
    name: "무신사",
    tags: ["이커머스", "중견기업", "서울 성동구"],
    workType: "하이브리드",
    fitScore: 72,
    techScore: 75,
    stacks: ["Java", "Spring Boot", "MySQL", "Redis"],
    description: "국내 최대 패션 플랫폼. 대규모 트래픽과 커머스 도메인을 경험할 수 있으며 기술 조직 규모가 빠르게 성장 중입니다.",
    reasons: [
      "Spring Boot + MySQL 환경으로 보유 기술 스택과 높은 일치도",
      "일 수백만 사용자 트래픽 처리 경험으로 기술 역량 급성장 가능",
      "커머스 도메인 특화 경험은 이직 시 프리미엄으로 작용",
    ],
    rank: 2,
    logoInitial: "M",
  },
];

// --- 4. 메인 컴포넌트 ---
function Recommend() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const aiCompanies: CompanyData[] = useMemo(() => {
    const raw = localStorage.getItem(ANALYSIS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = parsed?.result?.consulting?.recommended_companies;
    if (!Array.isArray(list) || list.length === 0) return [];
    return list.map(
      (
        c: {
          name: string;
          tags: string[];
          work_type: string;
          fit_score: number;
          tech_score: number;
          stacks: string[];
          reasons: string[];
          description?: string;
        },
        i: number
      ) => ({
        id: i + 1,
        name: c.name,
        tags: c.tags ?? [],
        workType: c.work_type ?? "오피스",
        fitScore: c.fit_score ?? 0,
        techScore: c.tech_score ?? 0,
        stacks: c.stacks ?? [],
        reasons: c.reasons ?? [],
        description: c.description ?? "",
        rank: i + 1,
        logoInitial: c.name?.[0] ?? "?",
      })
    );
  }, []);

  const companies = aiCompanies.length > 0 ? aiCompanies : MOCK_COMPANIES;

  const filterOptions = useMemo(() => {
    const tagSet = new Set<string>();
    companies.forEach((c) => {
      c.tags.forEach((t) => tagSet.add(t));
      tagSet.add(c.workType);
    });
    return Array.from(tagSet);
  }, [companies]);

  const handleFilterClick = (id: string) => {
    setSelectedFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const filteredCompanies = useMemo(() => {
    if (selectedFilters.length === 0) return companies;
    return companies.filter((company) =>
      selectedFilters.every(
        (f) => company.tags.includes(f) || company.workType === f
      )
    );
  }, [selectedFilters, companies]);

  return (
    <RecommendWrapper>
      <PageTitle>기업 추천 결과</PageTitle>

      <FilterBar>
        <FilterSection>
          <FilterLabel>선호 조건 필터 (복수 선택 시 AND 조건)</FilterLabel>
          <FilterTagGroup>
            {filterOptions.map((opt) => (
              <FilterTag
                key={opt}
                $isSelected={selectedFilters.includes(opt)}
                onClick={() => handleFilterClick(opt)}
              >
                {opt}
              </FilterTag>
            ))}
          </FilterTagGroup>
        </FilterSection>
        {selectedFilters.length > 0 && (
          <FilterTag
            style={{ alignSelf: "flex-end", flexShrink: 0 }}
            onClick={() => setSelectedFilters([])}
          >
            초기화
          </FilterTag>
        )}
      </FilterBar>

      <ResultMeta>
        <strong>{filteredCompanies.length}</strong> / {companies.length}개 기업
        {selectedFilters.length > 0 && <span> · 적용 필터: {selectedFilters.join(", ")}</span>}
      </ResultMeta>

      {filteredCompanies.length === 0 ? (
        <EmptyState>선택한 조건에 맞는 기업이 없습니다.</EmptyState>
      ) : (
        filteredCompanies.map((company) => {
          const { wanted, saramin } = getPortalUrls(company.name);
          return (
            <CompanyCard key={company.id}>
              {/* 헤더 */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5em" }}>
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

              {/* 기업 소개 */}
              {company.description && (
                <DescriptionBox>{company.description}</DescriptionBox>
              )}

              {/* 적합도 게이지 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "1.5em" }}>
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

              {/* 기술 스택 */}
              <div style={{ marginTop: "1.5em" }}>
                <p style={{ fontSize: "0.9em", fontWeight: 700, color: "#495057", marginBottom: "10px" }}>주요 기술 스택</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {company.stacks.map((s) => (
                    <div key={s} style={{ background: "white", border: "1px solid #dee2e6", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8em" }}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* 추천 이유 */}
              <ReasonBox>
                <div style={{ color: PRIMARY_BLUE, fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🎯</span> 이 기업을 추천하는 이유
                </div>
                <ul style={{ margin: 0, paddingLeft: "1.2em", color: "#495057", fontSize: "0.95em", lineHeight: "1.9" }}>
                  {company.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </ReasonBox>

              {/* 채용 공고 버튼 */}
              <div style={{ display: "flex", gap: "10px" }}>
                <ActionButton
                  href={wanted}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: PRIMARY_BLUE, color: "white", border: "none" }}
                >
                  원티드에서 공고 보기 ↗
                </ActionButton>
                <ActionButton
                  href={saramin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: "white", color: "#495057", border: "1px solid #e9ecef" }}
                >
                  사람인에서 공고 보기 ↗
                </ActionButton>
              </div>
            </CompanyCard>
          );
        })
      )}
    </RecommendWrapper>
  );
}

export default Recommend;
