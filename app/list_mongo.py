from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio

async def list_databases_and_collections():
    MONGO_URI = os.getenv("MONGO_URI")
    client = AsyncIOMotorClient(MONGO_URI)
    dbs = await client.list_database_names()
    print("Databases:", dbs)
    for db_name in dbs:
        db = client[db_name]
        collections = await db.list_collection_names()
        print(f"Database: {db_name}, Collections: {collections}")

if __name__ == "__main__":
    asyncio.run(list_databases_and_collections())
