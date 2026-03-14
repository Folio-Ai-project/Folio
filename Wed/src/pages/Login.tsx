import { useState } from "react";
import { MainDiv } from "./MainPage";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login as loginAction } from "../store";
import { AUTH_API_BASE } from "../api";

let LoginDiv = styled.div`
  width: 30em;
  height: 30em;
  background: #fefefe;
  margin: auto;
  margin-top: 5em;
  border-radius: 1em;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

let LoginTitle = styled.h2`
  text-align: center;
  margin-bottom: 1.5em;
  font-size: 2em;
  font-weight: 500;
`;

let Loginfrom = styled.form`
  display: flex;
  flex-direction: column;
  padding: 3em 3em 2em 3em;
`;

let InputEmail = styled.input`
  height: 3.5em;
  margin-bottom: 1.5em;
  border: 1px solid #cccccc;
  border-radius: 1em;
  padding: 0em 0em 0em 2em;
  font-size: 1em;
`;

let InputPassword = styled.input`
  height: 3.5em;
  margin-bottom: 1.5em;
  border: 1px solid #cccccc;
  border-radius: 1em;
  padding: 0em 0em 0em 2em;
  font-size: 1em;
`;

let LoginButton = styled.button`
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

let AntherDiv = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 0.5em;
  font-size: 0.9em;
  color: #666666;
`;

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${AUTH_API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.ok) {
        alert(data.error ?? "로그인 실패");
        return;
      }

      // ✅ 토큰 저장
      localStorage.setItem("token", data.token);

      // ✅ redux 로그인 상태 true
      dispatch(loginAction());

      alert("로그인 성공!");
      navigate("/mypage"); 
    } catch (err) {
      console.error(err);
      alert("서버 연결 실패 (백엔드가 켜져있는지 확인)");
    }
  };

  return (
    <MainDiv pt={4}>
      <LoginDiv>
        <Loginfrom onSubmit={handleLogin}>
          <LoginTitle>로그인</LoginTitle>

          <InputEmail
            placeholder="이메일 주소"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputPassword
            placeholder="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <LoginButton type="submit">로그인</LoginButton>
        </Loginfrom>


        <AntherDiv>
          아직 계정이 없으신가요? &nbsp; <Link to={"/signup"}>회원가입</Link>
        </AntherDiv>
      </LoginDiv>
    </MainDiv>
  );
}