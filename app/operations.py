from typing import List, Optional, Dict, Any
from datetime import datetime
from .db import applications_collection as COL
from .schemas import ApplicationCreate, ApplicationUpdate
from bson import ObjectId

def _to_obj_id(id: str) -> ObjectId:
    return ObjectId(id)

async def create_application(data: ApplicationCreate) -> str:
    doc = data.model_dump()
    doc["last_updated"] = datetime.now()
    res= await COL.insert_one(doc)
    return str(res.inserted_id)

async def get_all_applications(filters:Optional[Dict[str, Any]] = None, skip:int=0,limit:int=100):
    q=filter or {}
    cursor=COL.find(q).sort("last_updated",-1).skip(skip).limit(limit)
    docs=[]
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        docs.append(doc)
        return docs
    
async def get_application_by_id(id: str) -> Optional[Dict[str, Any]]:
    doc=await COL.find_one({"_id": _to_obj_id(id)})
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

async def update_application(id: str, data:ApplicationUpdate) -> bool:
    update_doc={k:v for k, v in data.model_dump().items() if v is not None}
    if not update_doc:
        return False
    update_doc["last_updated"] = datetime.now()
    res=await COL.update_one({"_id": _to_obj_id(id)},{"$set":update_doc})
    return res.modified_count > 0

async def delete_application(id: str) -> bool:
    res = await COL.delete_one({"_id": _to_obj_id(id)})
    return res.deleted_count > 0

async def count_by_status_and_category():
    pipeline = [
        {"$group": {"_id": {"category": "$category", "status": "$status"}, "count": {"$sum": 1}}}
    ]
    cursor = COL.aggregate(pipeline)
    result = []
    async for r in cursor:
        result.append(r)
    return result