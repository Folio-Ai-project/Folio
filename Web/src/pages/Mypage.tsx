import { useEffect, useState } from "react";
import styled from "styled-components";
import { Card, Form, Button, Badge } from "react-bootstrap";
import { MainDiv } from "./MainPage";
import { PROFILE_STORAGE_KEY, appApiUrl } from "../api";

const STACK_POOL = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Spring",
  "Java",
  "Python",
  "Docker",
  "AWS",
];

const PageWrapper = styled.div`
  max-width: 900px;
  margin: 3em auto;
`;

const StackButton = styled.button<{ selected: boolean }>`
  padding: 0.6em 1em;
  border-radius: 1.2em;
  border: 1.5px solid #74CBFF;
  background: ${({ selected }) => (selected ? "#74CBFF" : "white")};
  color: ${({ selected }) => (selected ? "white" : "#74CBFF")};
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const StackGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75em;
`;

function MyPage() {
  const [name, setName] = useState("");
  const [career, setCareer] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [stacks, setStacks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(appApiUrl("/api/profile/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          setError(data?.error || "프로필을 불러오지 못했습니다.");
          return;
        }

        setName(data.name || "");
        setCareer(data.career || "");
        setPortfolioUrl(data.portfolioUrl || "");
        setStacks(Array.isArray(data.stacks) ? data.stacks : []);
        localStorage.setItem(
          PROFILE_STORAGE_KEY,
          JSON.stringify({
            name: data.name || "",
            career: data.career || "",
            portfolioUrl: data.portfolioUrl || "",
            stacks: Array.isArray(data.stacks) ? data.stacks : [],
          })
        );
      } catch (err) {
        console.error("프로필 로드 실패:", err);
        setError("서버 연결 실패");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const [saving, setSaving] = useState(false);

  const toggleStack = (stack: string) => {
    setStacks(prev =>
      prev.includes(stack)
        ? prev.filter(s => s !== stack)
        : [...prev, stack]
    );
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const payload = {
      name,
      career,
      portfolioUrl,
      stacks,
    };

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(appApiUrl("/api/profile/me"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "저장에 실패했습니다.");
        return;
      }

      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
      alert("내 정보가 저장되었습니다!");
    } catch (err) {
      console.error("프로필 저장 실패:", err);
      alert("서버 연결 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainDiv pt={0}>
      <PageWrapper>
        <Card className="p-4 shadow-sm">
          <h4 className="mb-4">내 정보</h4>

          {error && (
            <div style={{ color: "#d60000", marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          {/* 이름 */}
          <Form.Group className="mb-3">
            <Form.Label>이름</Form.Label>
            <Form.Control
              type="text"
              placeholder="이름을 입력하세요"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </Form.Group>

          {/* 경력 */}
          <Form.Group className="mb-3">
            <Form.Label>경력</Form.Label>
            <Form.Select
              value={career}
              onChange={e => setCareer(e.target.value)}
            >
              <option value="">선택하세요</option>
              <option value="신입">신입</option>
              <option value="1년">1년</option>
              <option value="2년">2년</option>
              <option value="3년 이상">3년 이상</option>
            </Form.Select>
          </Form.Group>

          {/* 포트폴리오 */}
          <Form.Group className="mb-4">
            <Form.Label>포트폴리오 링크</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://github.com/username"
              value={portfolioUrl}
              onChange={e => setPortfolioUrl(e.target.value)}
            />
          </Form.Group>

          <hr />

          {/* 개발 스택 */}
          <h5 className="mb-3">보유 개발 스택</h5>

          <StackGrid>
            {STACK_POOL.map(stack => (
              <StackButton
                key={stack}
                selected={stacks.includes(stack)}
                onClick={() => toggleStack(stack)}
              >
                {stack}
              </StackButton>
            ))}
          </StackGrid>

          {/* 선택된 스택 표시 */}
          {stacks.length > 0 && (
            <div className="mt-3">
              <strong>선택한 스택:</strong>{" "}
              {stacks.map(stack => (
                <Badge bg="info" className="me-1" key={stack}>
                  {stack}
                </Badge>
              ))}
            </div>
          )}

          <div className="d-flex justify-content-end mt-4">
            <Button
              style={{ backgroundColor: "#74CBFF", border: "none" }}
              onClick={handleSave}
              disabled={loading || saving}
            >
              {saving ? "저장중..." : "저장하기"}
            </Button>
          </div>
        </Card>
      </PageWrapper>
    </MainDiv>
  );
}

export { MyPage };
