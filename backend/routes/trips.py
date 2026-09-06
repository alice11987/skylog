from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import uuid

from database import get_db
from models import Trip
from services.aerodata import search_flight
from pydantic import BaseModel


class SaveTripRequest(BaseModel):
    flight_number: str
    date: str
    origin: str
    destination: str
    status: str
    raw_data: dict


router = APIRouter(prefix="/trips", tags=["trips"])


@router.get("")
async def list_trips(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Trip).order_by(Trip.date.desc()))
    trips = result.scalars().all()
    return [
        {
            "id": t.id,
            "flight_number": t.flight_number,
            "date": str(t.date),
            "origin": t.origin,
            "destination": t.destination,
            "status": t.status,
            "raw_data": t.raw_data,
            "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        }
        for t in trips
    ]


@router.post("")
async def save_trip(body: SaveTripRequest, db: AsyncSession = Depends(get_db)):
    trip = Trip(
        id=str(uuid.uuid4()),
        flight_number=body.flight_number.upper(),
        date=body.date,
        origin=body.origin,
        destination=body.destination,
        status=body.status,
        raw_data=body.raw_data,
        updated_at=datetime.utcnow(),
    )
    db.add(trip)
    await db.commit()
    await db.refresh(trip)
    return {"id": trip.id, "message": "Trip saved"}


@router.delete("/{trip_id}")
async def delete_trip(trip_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    await db.delete(trip)
    await db.commit()
    return {"message": "Trip removed"}


@router.post("/{trip_id}/refresh")
async def refresh_trip(trip_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Trip).where(Trip.id == trip_id))
    trip = result.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    try:
        fresh = await search_flight(trip.flight_number, str(trip.date))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Refresh failed: {str(e)}")

    trip.status = fresh["status"]
    trip.raw_data = fresh["raw_data"]
    trip.updated_at = datetime.utcnow()
    await db.commit()
    return {"message": "Refreshed", "status": trip.status}
