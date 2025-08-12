from fastapi import FastAPI
from .routers import applications
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Job Application Tracker API")

# CORS for later frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(applications.router)


@app.get("/")
async def root():
    return {"message": "Job Application Tracker API is running"}