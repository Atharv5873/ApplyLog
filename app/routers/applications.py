from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ..schemas import ApplicationCreate, ApplicationUpdate
from .. import operations

router= APIRouter(prefix="/applications", tags=["applications"])

@router.post("/", status_code=201)
async def create_application(payload: ApplicationCreate):
    _id = await operations.create_application(payload)
    return {"id":_id}