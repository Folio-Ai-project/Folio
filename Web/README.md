# Folio

## 실행 방법

```bash
cd Wed
npm install
npm run dev
```

## API/EC2 연결

이 프로젝트는 프론트엔드에서 직접 DB에 붙지 않고, **백엔드 API 서버**로 요청을 보냅니다.

### 사용되는 서버
- **Profile / Auth 서버 (Express, AWS)**: `http://15.165.0.170:5000`
- **AI 분석 서버 (FastAPI, local)**: `http://localhost:8001`

### 환경변수로 API 주소 덮어쓰기
- Auth/Profile 서버: `VITE_AUTH_BASE`
- AI 분석 서버: `VITE_AI_BASE`

```env
VITE_AUTH_BASE=http://15.165.0.170:5000
VITE_AI_BASE=http://15.165.0.170:8000
```
