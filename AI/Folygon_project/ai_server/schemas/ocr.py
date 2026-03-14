from pydantic import BaseModel
from typing import List

class OCRToken(BaseModel):
    text: str # 인식된 텍스트
    bbox: List[int] # 바운딩 박스 좌표

class OCRPage(BaseModel):
    page: int # 페이지 번호
    width: int # 너비
    height: int # 높이
    tokens: List[OCRToken]
