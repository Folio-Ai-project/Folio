import { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { MainDiv } from "./MainPage";
import { appApiUrl } from "../api";

// ---- styles (기존 그대로) ----
let SingupDiv = styled.div`
  width: 30em;
  height: 40em;
  background: #fefefe;
  margin: auto;
  margin-top: 5em;
  border-radius: 1em;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

let SingupForm = styled.form`
  display: flex;
  flex-direction: column;
  padding: 3em 3em 2em 3em;
`;

let SingupTitle = styled.h2`
  text-align: center;
  margin-bottom: 1em;
  font-size: 2em;
  font-weight: 500;
`;

let InputName = styled.input`
  height: 3.5em;
  margin-bottom: 1em;
  border: 1px solid #cccccc;
  border-radius: 1em;
  padding: 0em 0em 0em 2em;
  font-size: 1em;
`;

let InputEmail = styled.input`
  height: 3.5em;
  margin-bottom: 1em;
  border: 1px solid #cccccc;
  border-radius: 1em;
  padding: 0em 0em 0em 2em;
  font-size: 1em;
`;

let InputPassword = styled.input`
  height: 3.5em;
  margin-bottom: 1em;
  border: 1px solid #cccccc;
  border-radius: 1em;
  padding: 0em 0em 0em 2em;
  font-size: 1em;
`;

let SingupButton = styled.button`
  height: 3.5em;
  border: none;
  border-radius: 1em;
  background: #46beff;
  color: white;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #32a8ff;
  }
`;

let CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 3em;
  font-size: 0.9em;
  cursor: pointer;
  padding-left: 0.5em;
`;
let CheckboxInput = styled.input`
  margin-right: 0.5em;
  cursor: pointer;
`;

let AntherDiv = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 0.5em;
  font-size: 0.9em;
  color: #666666;
`;

// ---- component ----
export function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    if (!name.trim()) return alert("이름을 입력해줘");
    if (!email.trim()) return alert("이메일을 입력해줘");
    if (!pw) return alert("비밀번호를 입력해줘");
    if (pw.length < 4) return alert("비밀번호는 4자 이상으로 해줘");
    if (pw !== pw2) return alert("비밀번호 확인이 달라");
    if (!agree) return alert("약관 동의가 필요해");

    try {
      setLoading(true);

      const res = await fetch(appApiUrl("/api/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: pw,
          name,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || "회원가입 실패");
        return;
      }

      alert("회원가입 성공! 로그인 해줘");
      navigate("/login");
    } catch (err) {
      alert("서버 연결 실패 (EC2 주소/포트/CORS 확인)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainDiv pt={0}>
      <SingupDiv>
        {/* ✅ method/action 제거하고 onSubmit으로 백엔드 연결 */}
        <SingupForm onSubmit={handleSubmit}>
          <SingupTitle>회원가입</SingupTitle>

          <InputName
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <InputEmail
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputPassword
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />

          <InputPassword
            type="password"
            placeholder="비밀번호 확인"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
          />

          <CheckboxLabel>
            <CheckboxInput
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            이용약관 및 개인정보처리방침에 동의합니다.
          </CheckboxLabel>

          <SingupButton type="submit" disabled={loading}>
            {loading ? "처리중..." : "회원가입"}
          </SingupButton>

          <AntherDiv>
            이미 계정이 있으신가요? &nbsp; <Link to={"/login"}>로그인</Link>
          </AntherDiv>
        </SingupForm>
      </SingupDiv>
    </MainDiv>
  );
}
