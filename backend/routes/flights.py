from fastapi import APIRouter, HTTPException, Query
from services.aerodata import search_flight

router = APIRouter(prefix="/flights", tags=["flights"])


@router.get("/search")
async def get_flight(
    flight: str = Query(..., description="Flight number e.g. SQ321"),
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
):
    try:
        result = await search_flight(flight.upper(), date)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Flight data unavailable: {str(e)}")
