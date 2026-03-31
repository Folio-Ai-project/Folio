"""Folygon AI Server 진입점"""
'''실행법: uvicorn main:app --reload'''
import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# .env 로드 (ai_server/models/.env)
load_dotenv(os.path.join(os.path.dirname(__file__), "ai_server", "models", ".env"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

from ai_server.api.layout import router as layout_router
from ai_server.api.ocr import router as ocr_router
from ai_server.api.portfolio import router as portfolio_router

app = FastAPI(title="Folygon AI Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio_router)
app.include_router(layout_router)
app.include_router(ocr_router)
