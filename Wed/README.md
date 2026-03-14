# Folio

## 실행 방법

```bash
cd Wed
npm install
npm run dev
```

## API/EC2 연결

이 프로젝트는 프론트엔드에서 직접 DB에 붙지 않고, **백엔드 API 서버**로 요청을 보냅니다.
기본 API 주소는 아래와 같습니다.

- `http://15.165.0.170:8000`

필요하면 `Wed/.env` 파일에 `VITE_API_BASE`를 지정해 덮어쓸 수 있습니다.

```env
VITE_API_BASE=http://15.165.0.170:8000
```
