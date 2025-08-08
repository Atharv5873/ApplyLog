from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
import os

load_dotenv()
MONGO_URI= os.getenv("MONGO_URI")
print(MONGO_URI)

client = AsyncIOMotorClient(MONGO_URI)
db = client["job_tracker"]
applications_collection = db["applications"]