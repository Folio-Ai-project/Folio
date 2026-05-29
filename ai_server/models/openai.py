"""OpenAI LLM 클라이언트 (싱글톤)"""
import logging
import os
from typing import Type, TypeVar

from openai import OpenAI
from pydantic import BaseModel

logger = logging.getLogger(__name__)

_client: OpenAI | None = None
T = TypeVar("T", bound=BaseModel)


def get_client() -> OpenAI:
    """앱 전체에서 OpenAI 클라이언트를 하나만 생성해 재사용합니다."""
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
        _client = OpenAI(
            api_key=api_key,
            base_url="https://api.openai.com/v1",
        )
    return _client


def chat(messages: list, model: str = "gpt-4o-mini", temperature: float = 0) -> str:
    """LLM에 메시지를 보내고 텍스트 응답을 반환합니다."""
    response = get_client().chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
    )
    text = response.choices[0].message.content.strip()
    logger.debug("LLM 응답: %s", text[:200])
    return text


def parse_chat(
    messages: list,
    response_format: Type[T],
    model: str = "gpt-4o-mini",
    temperature: float = 0,
) -> T:
    """LLM 응답을 Pydantic 모델로 파싱해 반환합니다."""
    response = get_client().beta.chat.completions.parse(
        model=model,
        messages=messages,
        response_format=response_format,
        temperature=temperature,
    )
    parsed = response.choices[0].message.parsed
    if parsed is None:
        raise RuntimeError("LLM 응답을 Pydantic 모델로 파싱하지 못했습니다.")
    logger.debug("LLM parsed 응답: %s", parsed.model_dump())
    return parsed
