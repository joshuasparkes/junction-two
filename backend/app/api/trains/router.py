from fastapi import APIRouter, HTTPException
import httpx
import asyncio
from typing import Dict, Any, Optional
import logging

router = APIRouter()

JUNCTION_API_BASE = "https://content-api.sandbox.junction.dev"
API_KEY = "jk_live_01j8r3grxbeve8ta0h1t5qbrvx"

logger = logging.getLogger(__name__)

async def poll_for_train_offers(train_search_id: str, train_offer_id: Optional[str] = None, max_attempts: int = 30, delay: float = 1.0) -> Optional[Dict[str, Any]]:
    """Poll the train offers endpoint until results are available or timeout."""
    logger.info(f"=== STARTING POLL_FOR_TRAIN_OFFERS ===")
    logger.info(f"train_search_id: {train_search_id}")
    logger.info(f"train_offer_id: {train_offer_id}")
    logger.info(f"max_attempts: {max_attempts}")
    logger.info(f"delay: {delay}")
    
    offers_url = f"{JUNCTION_API_BASE}/train-searches/{train_search_id}/offers"
    if train_offer_id:
        offers_url += f"?trainOfferId={train_offer_id}"
        
    logger.info(f"Final URL: {offers_url}")
    
    try:
        logger.info("Creating httpx.AsyncClient...")
        async with httpx.AsyncClient() as client:
            logger.info("httpx.AsyncClient created successfully")
            for attempt in range(max_attempts):
                try:
                    logger.info(f"🚂 === POLLING ATTEMPT {attempt + 1}/{max_attempts} ===")
                    logger.info(f"🚂 URL: {offers_url}")
                    logger.info(f"🚂 Headers: Accept: application/json, x-api-key: {API_KEY[:10]}...")
                    logger.info(f"🚂 Full request details:")
                    logger.info(f"🚂   Method: GET")
                    logger.info(f"🚂   URL: {offers_url}")
                    logger.info(f"🚂   Headers: {{'Accept': 'application/json', 'x-api-key': '{API_KEY[:10]}...'}}")
                    logger.info(f"🚂   Timeout: 30.0s")
                    logger.info("🚂 About to make GET request...")
                    
                    response = await client.get(
                        offers_url,
                        headers={
                            "Accept": "application/json",
                            "x-api-key": API_KEY,
                        },
                        timeout=30.0
                    )
                    
                    logger.info(f"🚂 GET request completed!")
                    logger.info(f"🚂 Response status: {response.status_code}")
                    logger.info(f"🚂 Response headers: {dict(response.headers)}")
                    logger.info(f"🚂 Response content length: {len(response.content) if response.content else 0}")
                    logger.info(f"🚂 Response text length: {len(response.text) if response.text else 0}")
                    
                    if response.is_success:
                        logger.info("🚂 Response is successful, checking content...")
                        response_text = response.text.strip()
                        logger.info(f"🚂 Response text length: {len(response_text)}")
                        logger.info(f"🚂 Response text preview (first 300 chars): {response_text[:300]}")
                        
                        if not response_text:
                            logger.info("🚂 Empty response body - API not ready yet, waiting...")
                            logger.info(f"🚂 About to sleep for {delay}s...")
                            await asyncio.sleep(delay)
                            logger.info("🚂 Sleep completed")
                            continue
                            
                        try:
                            logger.info("🚂 Parsing JSON...")
                            data = response.json()
                            logger.info(f"🚂 JSON parsed successfully!")
                            logger.info(f"🚂 Response data keys: {list(data.keys()) if data else 'None'}")
                            logger.info(f"🚂 Response data preview: {str(data)[:500]}...")
                            if data.get("items"):
                                logger.info(f"🚂 Found {len(data['items'])} train offers - RETURNING SUCCESS")
                                logger.info(f"🚂 SUCCESS! Returning data with {len(data['items'])} items")
                                return data
                            else:
                                logger.info(f"🚂 No offers yet (items: {data.get('items', 'missing')}), waiting {delay}s...")
                                logger.info(f"🚂 About to sleep for {delay}s...")
                                await asyncio.sleep(delay)
                                logger.info("🚂 Sleep completed")
                        except Exception as json_error:
                            logger.error(f"🚂 JSON parsing error: {str(json_error)}")
                            logger.error(f"🚂 Response text that failed to parse: '{response_text}'")
                            logger.info(f"🚂 About to sleep for {delay}s after JSON error...")
                            await asyncio.sleep(delay)
                            logger.info("🚂 Sleep completed after JSON error")
                    else:
                        error_text = response.text[:500] if response.text else "No response text"
                        logger.warning(f"Polling failed with status {response.status_code}: {error_text}")
                        logger.info("About to sleep after error...")
                        await asyncio.sleep(delay)
                        logger.info("Sleep completed after error")
                        
                except Exception as e:
                    logger.error(f"Exception during polling attempt {attempt + 1}: {str(e)}")
                    logger.error(f"Exception type: {type(e)}")
                    import traceback
                    logger.error(f"Traceback: {traceback.format_exc()}")
                    logger.info("About to sleep after exception...")
                    await asyncio.sleep(delay)
                    logger.info("Sleep completed after exception")
    except Exception as e:
        logger.error(f"Error creating httpx client: {str(e)}")
        logger.error(f"Exception type: {type(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return None
    
    logger.warning(f"Polling timed out after {max_attempts} attempts")
    return None


@router.post("/search")
async def search_trains(search_request: Dict[str, Any]):
    """
    Search for train tickets.
    Expected request body format:
    {
        "origin": "place_id",
        "destination": "place_id", 
        "departureDate": "2025-06-24",
        "passengers": [{"type": "adult"}],
        "returnDate": "2025-06-25" (optional for round trip)
    }
    """
    try:
        # Validate required fields
        required_fields = ["origin", "destination", "departureDate", "passengers"]
        for field in required_fields:
            if field not in search_request:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

        # Transform the request to Junction API format
        departure_date = search_request["departureDate"]
        # Convert date string to ISO format with time
        if "T" not in departure_date:
            departure_date = f"{departure_date}T12:00:00.000Z"
        elif not departure_date.endswith("Z"):
            departure_date = f"{departure_date}.000Z"

        # Create passenger ages (assuming adults born in 1990 for simplicity)
        passenger_count = len(search_request["passengers"])
        passenger_ages = [{"dateOfBirth": "1990-01-01"} for _ in range(passenger_count)]

        junction_request = {
            "originId": search_request["origin"],
            "destinationId": search_request["destination"],
            "departureAfter": departure_date,
            "passengerAges": passenger_ages
        }

        # Add return date if provided
        if search_request.get("returnDate"):
            return_date = search_request["returnDate"]
            if "T" not in return_date:
                return_date = f"{return_date}T12:00:00.000Z"
            elif not return_date.endswith("Z"):
                return_date = f"{return_date}.000Z"
            junction_request["returnDepartureAfter"] = return_date
        else:
            junction_request["returnDepartureAfter"] = None

        create_url = f"{JUNCTION_API_BASE}/train-searches"
        headers = {
            "x-api-key": API_KEY,
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        
        logger.info(f"Creating train search with transformed body: {junction_request}")

        async with httpx.AsyncClient() as client:
            # Create the train search
            response = await client.post(
                create_url,
                json=junction_request,
                headers=headers,
                timeout=15.0
            )

            logger.info(f"🚂 Train search creation response status: {response.status_code}")
            logger.info(f"🚂 Train search creation response headers: {dict(response.headers)}")
            
            if not response.is_success:
                error_text = response.text
                logger.error(f"🚂 Train search creation failed: {error_text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Junction API error: {error_text}"
                )

            # Extract train_search_id from Location header
            location = response.headers.get("Location", "")
            logger.info(f"🚂 Location header from train search creation: {location}")
            
            train_search_id = None
            if location:
                parts = location.strip("/").split("/")
                # Handle both formats: .../train-searches/{id}/offers and .../train-searches/{id}
                if len(parts) >= 2 and parts[-1] == "offers" and parts[-3] == "train-searches":
                    potential_match = parts[-2]
                    if potential_match.startswith("train_search_"):
                        train_search_id = potential_match
                elif len(parts) >= 1 and parts[-2] == "train-searches":
                    potential_match = parts[-1]
                    if potential_match.startswith("train_search_"):
                        train_search_id = potential_match

            if not train_search_id:
                logger.error(f"Could not extract train_search_id from Location: {location}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Could not extract train_search_id from Location header: {location}"
                )

            logger.info(f"Extracted train_search_id: {train_search_id}")

            # Poll for offers (outbound only initially)
            offers = await poll_for_train_offers(train_search_id)
            
            if offers is None:
                # Return empty results if polling timed out
                return {"items": [], "message": "Search timed out, please try again"}
            
            # Add the train_search_id to the response for return trip handling
            offers["train_search_id"] = train_search_id
            
            return offers

    except httpx.TimeoutException:
        logger.error("Timeout during train search")
        raise HTTPException(status_code=504, detail="Request timed out")
    except httpx.RequestError as e:
        logger.error(f"Request error during train search: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Failed to connect to Junction API: {str(e)}")
    except HTTPException:
        raise  # Re-raise HTTPExceptions as-is
    except Exception as e:
        logger.error(f"Unexpected error in train search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/return-offers/{train_search_id}")
async def get_return_offers(train_search_id: str, request_body: Dict[str, Any]):
    """
    Get return trip offers for a selected outbound train offer.
    Expected request body: {"trainOfferId": "train_offer_01..."}
    """
    try:
        logger.info(f"=== RETURN OFFERS ENDPOINT CALLED ===")
        logger.info(f"train_search_id: {train_search_id}")
        logger.info(f"request_body: {request_body}")
        
        train_offer_id = request_body.get("trainOfferId")
        if not train_offer_id:
            logger.error("Missing trainOfferId in request body")
            raise HTTPException(status_code=400, detail="trainOfferId is required")

        logger.info(f"Getting return offers for train_search_id: {train_search_id}, train_offer_id: {train_offer_id}")

        # Poll for return offers with the selected outbound offer
        logger.info(f"Starting polling for return offers...")
        offers = await poll_for_train_offers(train_search_id, train_offer_id, max_attempts=25, delay=2.0)
        
        logger.info(f"Polling completed. offers is None: {offers is None}")
        
        if offers is None:
            logger.warning("Return offers polling timed out")
            return {"items": [], "message": "Return search timed out, please try again"}
        
        logger.info(f"Returning {len(offers.get('items', []))} return offers")
        return offers

    except HTTPException as e:
        logger.error(f"HTTPException in return offers: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting return offers: {str(e)}")
        logger.error(f"Exception type: {type(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/debug-return-url/{train_search_id}/{train_offer_id}")
async def debug_return_url(train_search_id: str, train_offer_id: str):
    """Debug endpoint to see the exact URL we're constructing"""
    offers_url = f"{JUNCTION_API_BASE}/train-searches/{train_search_id}/offers?trainOfferId={train_offer_id}"
    
    logger.info(f"=== DEBUG RETURN URL ===")
    logger.info(f"train_search_id: {train_search_id}")
    logger.info(f"train_offer_id: {train_offer_id}")
    logger.info(f"Final URL: {offers_url}")
    
    # Test the URL directly
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                offers_url,
                headers={
                    "Accept": "application/json",
                    "x-api-key": API_KEY,
                },
                timeout=10.0
            )
            
            return {
                "url": offers_url,
                "status_code": response.status_code,
                "response_length": len(response.text),
                "response_preview": response.text[:500] if response.text else "Empty",
                "headers": dict(response.headers)
            }
    except Exception as e:
        return {
            "url": offers_url,
            "error": str(e),
            "error_type": str(type(e))
        }