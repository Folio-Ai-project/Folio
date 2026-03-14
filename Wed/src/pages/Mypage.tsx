import { useEffect, useState  } from "react";
import styled from "styled-components";
import { Card, Form, Button, Badge } from "react-bootstrap";
import {MainDiv} from "./MainPage";

type UserData = {
  name: string;
  career: string;
  portfolioUrl: string;
  stacks: string[];
};

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
  border: 1.5px solid #46beff;
  background: ${({ selected }) => (selected ? "#46BEFF" : "white")};
  color: ${({ selected }) => (selected ? "white" : "#46BEFF")};
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

const savedData:any = localStorage.getItem("myPageData");
const parsedData:UserData = JSON.parse(savedData);



function MyPage() {
  useEffect(() => {
    if (savedData) {
      setName(parsedData.name || "");
      setCareer(parsedData.career || "");
      setPortfolioUrl(parsedData.portfolioUrl || "");
      setStacks(parsedData.stacks || []);
    }
  }, []);

  // 기본 정보
  const [name, setName] = useState("");
  const [career, setCareer] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // 개발 스택
  const [stacks, setStacks] = useState<string[]>([]);

  const toggleStack = (stack: string) => {
    setStacks(prev =>
      prev.includes(stack)
        ? prev.filter(s => s !== stack)
        : [...prev, stack]
    );
  };

  const handleSave = () => {
    const payload = {
      name,
      career,
      portfolioUrl,
      stacks,
    };

    const payloadJson = JSON.stringify(payload);
    localStorage.setItem("myPageData", payloadJson);

    console.log("저장 데이터", payload);
    alert("내 정보가 저장되었습니다!");

  };

  return (
    <MainDiv pt={0}>
      <PageWrapper>
        <Card className="p-4 shadow-sm">
          <h4 className="mb-4">내 정보</h4>

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
              style={{ backgroundColor: "#46BEFF", border: "none" }}
              onClick={handleSave}
            >
              저장하기
            </Button>
          </div>
        </Card>
      </PageWrapper>`
    </MainDiv>
  );
}

export { MyPage, parsedData};

