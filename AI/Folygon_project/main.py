from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ai_server.api.portfolio import router as portfolio_router
from ai_server.api.layout import router as layout_router
from ai_server.api.ocr import router as ocr_router
from ai_server.api.auth import router as auth_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # during development allow any origin; adjust for production as needed
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio_router)
app.include_router(layout_router)
app.include_router(ocr_router)
app.include_router(auth_router)
