from pydantic import BaseModel
from typing import List

class Token(BaseModel):
  text: str
  bbox: List[int]

class Line(BaseModel):
    y_center: float
    tokens: List[Token]

class Block(BaseModel):
    block_id: int
    text: str
    bbox: list[int]
    tokens: list[Token]

    # 확장 예정 (지금은 optional)
    block_type: str | None = None   # heading | paragraph | list | etc

class Page(BaseModel):
    page: int
    width: int
    height: int
    tokens: list[Token]
    blocks: list[Block] | None = None
