import styled from "styled-components";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

/* --- Styled Components (유지) --- */
let MainDiv = styled.div<{ pt: number }>`
  position: relative;
  width: 100%;
  min-height: 50em;
  overflow: hidden;
  padding: ${(props) => props.pt}em 2em 4em 2em;
  background: radial-gradient(
      ellipse at top center,
      rgba(190, 235, 255, 0.6) 10%,
      rgba(230, 247, 255, 0.45) 75%,
      rgba(248, 252, 255, 0.95) 85%
    ),
    linear-gradient(180deg, #f9fcff 0%, #ffffff 100%);
`;

let MainH4 = styled.h4`
  font-size: 3.5em;
  font-weight: 600;
  margin: 0.2em 0;
  text-align: center;
  span {
    background-image: linear-gradient(to right, #32f1ff, #0a6eff);
    -webkit-background-clip: text;
    color: transparent;
  }
`;

let MainH6 = styled.h6`
  font-size: 1em;
  font-weight: 300;
  text-align: center;
  color: #555555;
`;

let MainPDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 17.5em;
  height: 2em;
  margin: 0 auto 1.3em auto;
  background: rgba(200, 244, 255, 0.4);
  border-radius: 1.5em;
  border: 1.5px solid #00afff;
  color: #0077cc;
  font-weight: 500;
`;

let FileUploadDiv = styled.form<{ isDragging: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 65%;
  margin: 2.5em auto 0 auto;
  border-radius: 1.4em;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5em;
  border: ${({ isDragging }) =>
    isDragging ? "2px dashed #46BEFF" : "2px solid transparent"};
`;

let TextareaStyle = styled.textarea`
  width: 100%;
  border: none;
  resize: none;
  outline: none;
  font-size: 1em;
  min-height: 2.25em;
  max-height: 12em;
`;

let ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1em;
`;

let FileButton = styled.button`
  width: 47.5%;
  height: 3.5em;
  border-radius: 1em;
  border: 1px solid #46beff;
  background: white;
  color: #46beff;
  font-weight: 600;
  cursor: pointer;
`;

let UploadButton = styled.button`
  width: 47.5%;
  height: 3.5em;
  border-radius: 1em;
  border: none;
  background: #46beff;
  color: white;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #32a8ff; }
  &:disabled { opacity: 0.65; cursor: not-allowed; }
`;

let FileList = styled.div`
  margin-top: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
`;

let FileItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f4fbff;
  padding: 0.5em 1em;
  border-radius: 0.75em;
  font-size: 0.9em;
`;

let FileRemoveButton = styled.button`
  background: none;
  border: none;
  color: #ff4d4d;
  cursor: pointer;
`;

let MoreInfoDiv = styled.div`
  margin-top: 2em;
  text-align: center;
  display: flex;
  justify-content: center;
  font-size: 0.9em;
  gap: 2em;
`;

let MoreInfoText = styled.h6`
  font-size: 1em;
  font-weight: 300;
  text-align: center;
  color: #555555;
`;

/* --- Component Logic --- */
  export default function MainPage() {
  const userState = useSelector((state: RootState) => state.user);
  const isLoggedIn = Boolean(userState);

  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleResize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.currentTarget.files;
    if (!selected) return;
    setFiles((prev) => [...prev, ...Array.from(selected)]);
    e.currentTarget.value = ""; // 초기화
  };

  const handleDrop = (e: React.DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }

    if (files.length === 0) {
      setErrorMsg("분석할 파일을 최소 하나 업로드해주세요.");
      return;
    }

    if (isUploading) return;

    const prompt = textareaRef.current?.value?.trim() ?? "";
    
    // ✅ FormData 생성: 파일과 텍스트를 함께 전송
    const formData = new FormData();
    formData.append("prompt", prompt);
    files.forEach((file) => {
      formData.append("files", file); // 서버에서 'files' 키로 받도록 설정
    });

    try {
      setIsUploading(true);

      const res = await fetch("/api/analyze", {
        method: "POST",
        // Content-Type은 FormData 전송 시 브라우저가 자동으로 'multipart/form-data'로 설정합니다.
        body: formData,
      });

      if (!res.ok) {
        let msg = `요청 실패 (status: ${res.status})`;
        try {
          const data = await res.json();
          msg = data?.detail || data?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const result = await res.json();

      // ✅ 분석 페이지로 결과와 함께 이동
      navigate("/Analysis", {
        state: {
          result,
          prompt,
          fileNames: files.map(f => f.name)
        },
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류";
      setErrorMsg(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MainDiv pt={8}>
      <MainPDiv>AI 기반 포트폴리오 분석 서비스</MainPDiv>

      <MainH4>당신의 커리어,</MainH4>
      <MainH4>
        <span>AI 인사이트</span>로 레벨업하세요
      </MainH4>
      <MainH6>
        이력서와 포트폴리오를 업로드하고 AI가 분석한 결과를 확인해보세요.
      </MainH6>

      <FileUploadDiv
        isDragging={isDragging}
        onSubmit={handleSubmit}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <TextareaStyle
          ref={textareaRef}
          rows={1}
          placeholder="AI에게 요청할 내용을 입력하세요 (예: 강점 분석, 보완점 등)"
          onInput={handleResize}
          disabled={isUploading}
        />

        {/* ✅ 파일 목록 표시 부분 복구 */}
        {files.length > 0 && (
          <FileList>
            {files.map((file, idx) => (
              <FileItem key={`${file.name}-${idx}`}>
                📎 {file.name}
                <FileRemoveButton
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                  disabled={isUploading}
                >
                  ❌
                </FileRemoveButton>
              </FileItem>
            ))}
          </FileList>
        )}

        {errorMsg && (
          <MainH6 style={{ color: "#FF4D4D", marginTop: "0.8em" }}>
            {errorMsg}
          </MainH6>
        )}

        <ButtonRow>
          {/* ✅ 파일 선택 버튼 기능 연결 */}
          <FileButton 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            파일 추가
          </FileButton>

          <UploadButton type="submit" disabled={isUploading}>
            {isUploading ? "분석중..." : "분석 시작하기"}
          </UploadButton>
        </ButtonRow>

        {/* 숨겨진 실제 input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={handleFileChange}
        />
      </FileUploadDiv>

      <MoreInfoDiv>
        <MoreInfoText>✓ 포트폴리오 분석</MoreInfoText>
        <MoreInfoText>✓ 나에게 맞는 기업 추천</MoreInfoText>
        <MoreInfoText>✓ 성장 로드맵 제공</MoreInfoText>
      </MoreInfoDiv>
    </MainDiv>
  );
}

export { MainPage, MainDiv} ;