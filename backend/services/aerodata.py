import httpx
import os
from dotenv import load_dotenv

load_dotenv()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = "aerodatabox.p.rapidapi.com"
BASE_URL = "https://aerodatabox.p.rapidapi.com"

HEADERS = {
    "x-rapidapi-key": RAPIDAPI_KEY,
    "x-rapidapi-host": RAPIDAPI_HOST,
}


def extract_status(flight: dict) -> str:
    status = flight.get("status", "").lower()
    if "cancel" in status:
        return "Cancelled"
    if "delay" in status or flight.get("departure", {}).get("delay"):
        return "Delayed"
    if "land" in status or "arriv" in status:
        return "Landed"
    if "depart" in status or "airborne" in status:
        return "In Flight"
    return "On Time"


async def search_flight(flight_number: str, date: str) -> dict:
    url = f"{BASE_URL}/flights/number/{flight_number}/{date}"
    params = {
        "withAircraftImage": "false",
        "withLocation": "false",
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=HEADERS, params=params)
        response.raise_for_status()
        data = response.json()

    # AeroDataBox returns a list; take the first result
    if isinstance(data, list) and len(data) > 0:
        flight = data[0]
    elif isinstance(data, dict):
        flight = data
    else:
        raise ValueError("No flight data returned")

    return {
        "flight_number": flight_number.upper(),
        "date": date,
        "origin": flight.get("departure", {}).get("airport", {}).get("iata", ""),
        "destination": flight.get("arrival", {}).get("airport", {}).get("iata", ""),
        "status": extract_status(flight),
        "raw_data": flight,
    }
