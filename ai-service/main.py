from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SmartSchedule AI Service",
    description="AI Service cho Hệ thống SmartSchedule - Phân tích triệu chứng & Tối ưu lịch hẹn",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "AI Service is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
