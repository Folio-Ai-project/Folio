from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
import secrets

router = APIRouter(prefix="/api", tags=["Auth"])

# In-memory stores (for demo/dev only)
_users: Dict[str, Dict] = {}
_tokens: Dict[str, str] = {}

class AuthRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    ok: bool
    token: Optional[str] = None
    error: Optional[str] = None

class ProfileResponse(BaseModel):
    name: str
    career: str
    portfolioUrl: str
    stacks: list[str]


def _create_token(email: str) -> str:
    token = secrets.token_hex(16)
    _tokens[token] = email
    return token


def _get_user_by_token(token: str) -> Optional[Dict]:
    email = _tokens.get(token)
    if not email:
        return None
    return _users.get(email)


@router.post("/auth/signup", response_model=AuthResponse)
def signup(req: AuthRequest):
    if req.email in _users:
        return AuthResponse(ok=False, error="이미 존재하는 이메일입니다.")

    # Store user with minimal profile
    _users[req.email] = {
        "email": req.email,
        "password": req.password,
        "name": req.email.split("@")[0],
        "career": "",
        "portfolioUrl": "",
        "stacks": [],
    }

    token = _create_token(req.email)
    return AuthResponse(ok=True, token=token)


@router.post("/auth/login", response_model=AuthResponse)
def login(req: AuthRequest):
    user = _users.get(req.email)
    if not user or user.get("password") != req.password:
        return AuthResponse(ok=False, error="이메일 또는 비밀번호가 일치하지 않습니다.")

    token = _create_token(req.email)
    return AuthResponse(ok=True, token=token)


def _extract_bearer_token(authorization: Optional[str] = Header(None)) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1]


@router.get("/profile/me", response_model=ProfileResponse)
def profile_me(authorization: Optional[str] = Header(None)):
    token = _extract_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")

    user = _get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return ProfileResponse(
        name=user.get("name", ""),
        career=user.get("career", ""),
        portfolioUrl=user.get("portfolioUrl", ""),
        stacks=user.get("stacks", []),
    )
