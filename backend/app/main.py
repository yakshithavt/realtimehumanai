from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.health import router as health_router
from app.routes.heygen import router as heygen_router
from app.routes.realtime import router as realtime_router
from app.routes.screen import router as screen_router
from app.routes.speech import router as speech_router
from app.routes.tts import router as tts_router

app = FastAPI(title="RealtimeHumanAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(heygen_router)
app.include_router(realtime_router)
app.include_router(screen_router)
app.include_router(speech_router)
app.include_router(tts_router)

@app.get("/")
def root():
    return {"message": "RealtimeHumanAI Backend running"}
