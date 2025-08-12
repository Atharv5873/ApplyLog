from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..schemas import ApplicationCreate, ApplicationUpdate
from .. import operations

router= APIRouter(prefix="/applications", tags=["applications"])

@router.post("/", status_code=201)
async def create_application(payload: ApplicationCreate):
    _id = await operations.create_application(payload)
    return {"id":_id}

@router.get("/",response_model=List[dict])
async def  list_applications(category: Optional[str] = Query(None),
                             status: Optional[str] = Query(None),
                             skip:int=0,
                             limit:int=100):
    filters = {}
    if category:
        filters["category"] = category
    if status:
        filters["status"] = status
    apps = await operations.get_all_applications(filters=filters, skip=skip, limit=limit)
    return apps