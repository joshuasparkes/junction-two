from fastapi import APIRouter, HTTPException, Query
import httpx
from typing import List, Optional
import os

router = APIRouter()

JUNCTION_API_BASE = "https://content-api.sandbox.junction.dev"
API_KEY = "jk_live_01j8r3grxbeve8ta0h1t5qbrvx"

@router.get("/search")
async def search_places(
    query: str = Query(..., min_length=2, description="Search query"),
    place_type: Optional[str] = Query(None, description="Filter by place type (railway-station, airport)"),
    limit: Optional[int] = Query(50, ge=1, le=100, description="Maximum number of results")
):
    """
    Search for places using the Junction API.
    This endpoint acts as a proxy to avoid CORS issues.
    """
    try:
        # Build the URL
        url = f"{JUNCTION_API_BASE}/places"
        params = {
            "filter[name][like]": query.strip()
        }
        
        if place_type:
            params["filter[type][eq]"] = place_type
            
        if limit:
            params["limit"] = limit

        # Make the request to Junction API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                params=params,
                headers={
                    "Accept": "application/json",
                    "x-api-key": API_KEY,
                },
                timeout=10.0
            )

        if not response.is_success:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Junction API error: {response.text}"
            )

        data = response.json()
        return data

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request to Junction API timed out")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to connect to Junction API: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/railway-stations")
async def search_railway_stations(
    query: str = Query(..., min_length=2, description="Search query for railway stations"),
    limit: Optional[int] = Query(50, ge=1, le=100, description="Maximum number of results")
):
    """Search specifically for railway stations."""
    return await search_places(query=query, place_type="railway-station", limit=limit)


@router.get("/airports")
async def search_airports(
    query: str = Query(..., min_length=2, description="Search query for airports"),
    limit: Optional[int] = Query(50, ge=1, le=100, description="Maximum number of results")
):
    """Search specifically for airports."""
    return await search_places(query=query, place_type="airport", limit=limit)


@router.get("/{place_id}")
async def get_place_by_id(place_id: str):
    """Get a specific place by its ID."""
    try:
        url = f"{JUNCTION_API_BASE}/places/{place_id}"

        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers={
                    "Accept": "application/json",
                    "x-api-key": API_KEY,
                },
                timeout=10.0
            )

        if response.status_code == 404:
            raise HTTPException(status_code=404, detail="Place not found")
            
        if not response.is_success:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Junction API error: {response.text}"
            )

        return response.json()

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request to Junction API timed out")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to connect to Junction API: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")