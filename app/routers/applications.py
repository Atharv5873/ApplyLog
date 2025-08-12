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

@router.get("/stats")
async def stats():
    data = await operations.count_by_status_and_category()
    return {"counts": data}

@router.get("/{id}")
async def get_application(id: str):
    doc=await operations.get_application_by_id(id)
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found")
    return doc

@router.put("/{id}")
async def update_application(id: str, payload: ApplicationUpdate):
    exists= await operations.get_application_by_id(id)
    if not exists:
        raise HTTPException(status_code=404, detail="Application not found")
    updated= await operations.update_application(id, payload)
    if not updated:
        raise HTTPException(status_code=400, detail="Nothing To Update")
    return {"message": "Application updated successfully"}
    
@router.delete("/{id}")
async def delete_application(id: str):
    exists = await operations.get_application_by_id(id)
    if not exists:
        raise HTTPException(status_code=404, detail="Application not found")
    deleted = await operations.delete_application(id)
    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete")
    return {"message": "Application deleted"}