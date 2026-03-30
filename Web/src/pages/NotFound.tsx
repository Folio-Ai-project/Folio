import styled from "styled-components";
import { useNavigate } from "react-router-dom";

// --- 스타일 정의 ---
const PRIMARY_BLUE = "#1E96FF";

const FullPageWrapper = styled.div`
  width: 100%;
  height: 95vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const ErrorCode = styled.h1`
  font-size: 10em;
  font-weight: 900;
  margin: 0;
  color: #e9ecef;
  line-height: 1;
  position: relative;
  
  &::after {
    content: "404";
    position: absolute;
    left: 0;
    top: 0;
    color: ${PRIMARY_BLUE};
    clip-path: inset(0 0 50% 0); /* 글자 절반을 자르는 효과 */
  }
`;

const MessageTitle = styled.h2`
  font-size: 1.8em;
  font-weight: 700;
  color: #343a40;
  margin-top: -20px;
  margin-bottom: 15px;
`;

const MessageDesc = styled.p`
  font-size: 1.1em;
  color: #868e96;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 40px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
`;

const HomeButton = styled.button`
  background-color: ${PRIMARY_BLUE};
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 1em;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(30, 150, 255, 0.3);
  transition: transform 0.2s, background-color 0.2s;

  &:hover {
    background-color: #1a85e5;
    transform: translateY(-2px);
  }
`;

const BackButton = styled.button`
  background-color: white;
  color: #495057;
  border: 1px solid #dee2e6;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 1em;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f1f3f5;
  }
`;

// --- 컴포넌트 구현 ---
function NotFound() {
  const navigate = useNavigate();

  return (
    <FullPageWrapper>
      <ErrorCode>404</ErrorCode>
      
      <MessageTitle>페이지를 찾을 수 없습니다</MessageTitle>
      
      <MessageDesc>
        CareerAI가 이 길은 처음인가 보네요! <br />
        입력하신 주소가 정확한지 확인하시거나 아래 버튼으로 돌아가 보세요.
      </MessageDesc>

      <ButtonGroup>
        <HomeButton onClick={() => navigate("/")}>
          메인으로 돌아가기
        </HomeButton>
        <BackButton onClick={() => navigate(-1)}>
          이전 페이지로
        </BackButton>
      </ButtonGroup>

      <div style={{ marginTop: "60px", color: "#adb5bd", fontSize: "0.9em" }}>
        © 2024 CareerAI. All rights reserved.
      </div>
    </FullPageWrapper>
  );
}

export default NotFound;