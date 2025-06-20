from fastapi import APIRouter, HTTPException, Depends
import httpx
from typing import Dict, Any, List
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.crud.booking import booking as booking_crud
from app.models.user import User
from app.api import deps

router = APIRouter()

JUNCTION_API_BASE = "https://content-api.sandbox.junction.dev"
API_KEY = "jk_live_01j8r3grxbeve8ta0h1t5qbrvx"

logger = logging.getLogger(__name__)

@router.post("/create")
async def create_booking(
    booking_request: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Create a booking for train tickets.
    Expected request body format:
    {
        "offerId": "train_offer_id",
        "passengers": [
            {
                "dateOfBirth": "2000-01-01",
                "firstName": "John",
                "lastName": "Smith",
                "gender": "male",
                "email": "johnsmith01@email.com",
                "phoneNumber": "+4407770000001",
                "residentialAddress": {
                    "addressLines": ["Street Name 7"],
                    "countryCode": "GB",
                    "postalCode": "12345",
                    "city": "London"
                }
            }
        ]
    }
    """
    try:
        # Validate required fields
        if "offerId" not in booking_request:
            raise HTTPException(status_code=400, detail="offerId is required")
        if "passengers" not in booking_request or not booking_request["passengers"]:
            raise HTTPException(status_code=400, detail="At least one passenger is required")
        if "tripId" not in booking_request:
            raise HTTPException(status_code=400, detail="tripId is required")

        # Prepare the request for Junction API - add required passportInformation field
        junction_passengers = []
        for passenger in booking_request["passengers"]:
            junction_passenger = {
                "dateOfBirth": passenger["dateOfBirth"],
                "firstName": passenger["firstName"],
                "lastName": passenger["lastName"],
                "gender": passenger["gender"],
                "email": passenger["email"],
                "phoneNumber": passenger["phoneNumber"],
                "passportInformation": None,  # Required by API but we don't collect it
                "residentialAddress": passenger["residentialAddress"]
            }
            junction_passengers.append(junction_passenger)
        
        junction_request = {
            "offerId": booking_request["offerId"],
            "passengers": junction_passengers
        }

        create_url = f"{JUNCTION_API_BASE}/bookings"
        headers = {
            "x-api-key": API_KEY,
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        
        logger.info(f"Creating booking with Junction API: {junction_request}")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                create_url,
                json=junction_request,
                headers=headers,
                timeout=30.0
            )

            logger.info(f"🎫 Booking creation response status: {response.status_code}")
            logger.info(f"🎫 Booking creation response headers: {dict(response.headers)}")
            
            if not response.is_success:
                error_text = response.text
                logger.error(f"🎫 Booking creation failed: {error_text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Junction API error: {error_text}"
                )

            # Parse the response
            booking_data = response.json()
            logger.info(f"🎫 Raw Junction API booking response: {booking_data}")
            logger.info(f"🎫 Response headers: {dict(response.headers)}")
            logger.info(f"🎫 Response status: {response.status_code}")
            
            # Log specific data we're looking for
            logger.info(f"🎫 Booking data type: {type(booking_data)}")
            logger.info(f"🎫 Top-level keys: {list(booking_data.keys()) if isinstance(booking_data, dict) else 'Not a dict'}")
            
            if isinstance(booking_data, dict):
                logger.info(f"🎫 Price data: {booking_data.get('price', 'NO PRICE')}")
                logger.info(f"🎫 Passengers data: {booking_data.get('passengers', 'NO PASSENGERS')}")
                logger.info(f"🎫 Trips data: {booking_data.get('trips', 'NO TRIPS')}")
                logger.info(f"🎫 Price breakdown: {booking_data.get('priceBreakdown', 'NO PRICE BREAKDOWN')}")
                logger.info(f"🎫 Ticket info: {booking_data.get('ticketInformation', 'NO TICKET INFO')}")
                logger.info(f"🎫 Nested booking object: {booking_data.get('booking', 'NO NESTED BOOKING')}")
            
            # Extract booking ID from the correct location in response
            booking_id = booking_data.get("booking", {}).get("id")
            
            # If no ID in nested booking object, try root level
            if not booking_id:
                booking_id = booking_data.get("id")
            
            # If still no ID, try to extract from Location header
            if not booking_id:
                location = response.headers.get("Location", "")
                logger.info(f"🎫 Location header: {location}")
                if location:
                    # Extract ID from URL like /bookings/{booking_id}
                    parts = location.strip("/").split("/")
                    if len(parts) >= 2 and parts[-2] == "bookings":
                        booking_id = parts[-1]
                        logger.info(f"🎫 Extracted booking ID from Location: {booking_id}")
            
            if not booking_id:
                logger.error("🎫 No booking ID found in response body or Location header")
                logger.error(f"🎫 Full response structure: {booking_data}")
                raise HTTPException(
                    status_code=500,
                    detail="Booking created but ID not found in response"
                )
            
            logger.info(f"🎫 Final booking ID: {booking_id}")
            
            # Save booking to database (skip for now since we're saving to Supabase)
            # db_booking = booking_crud.create_booking(
            #     db=db,
            #     junction_booking_id=booking_id,
            #     trip_id=int(booking_request["tripId"]) if booking_request["tripId"].isdigit() else 1,
            #     user_id=1,  # Default user for now
            #     organization_id=1,  # Default org
            #     total_amount=booking_data.get("price", {}).get("amount", "0"),
            #     currency=booking_data.get("price", {}).get("currency", "EUR"),
            #     junction_response=booking_data,
            #     passengers_data=booking_request["passengers"],
            #     trips_data=booking_data.get("trips", []),
            #     price_breakdown=booking_data.get("priceBreakdown", []),
            #     fulfillment_info=[]  # Will be updated during confirmation
            # )
            
            # logger.info(f"🎫 Booking saved to database with ID: {db_booking.id}")
            
            # Return the full Junction API response with additional frontend fields
            return {
                "id": booking_id,
                "status": "pending-payment",
                "createdAt": booking_data.get("booking", {}).get("createdAt", datetime.utcnow().isoformat()),
                "expiresAt": booking_data.get("booking", {}).get("expiresAt"),
                "price": booking_data.get("price", {}),
                "confirmationNumber": booking_data.get("booking", {}).get("confirmationNumber"),
                "fulfillmentInformation": booking_data.get("fulfillmentInformation", []),
                # Include full Junction response data
                "passengers": booking_data.get("passengers", []),
                "priceBreakdown": booking_data.get("priceBreakdown", []),
                "ticketInformation": booking_data.get("ticketInformation", []),
                "fareRules": booking_data.get("fareRules", []),
                "trips": booking_data.get("trips", []),
                "fullJunctionResponse": booking_data  # Store complete response
            }

    except httpx.TimeoutException:
        logger.error("Timeout during booking creation")
        raise HTTPException(status_code=504, detail="Request timed out")
    except httpx.RequestError as e:
        logger.error(f"Request error during booking creation: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Failed to connect to Junction API: {str(e)}")
    except HTTPException:
        raise  # Re-raise HTTPExceptions as-is
    except Exception as e:
        logger.error(f"Unexpected error in booking creation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{booking_id}")
async def get_booking(booking_id: str):
    """Get booking details by ID."""
    try:
        get_url = f"{JUNCTION_API_BASE}/bookings/{booking_id}"
        headers = {
            "x-api-key": API_KEY,
            "Accept": "application/json",
        }
        
        logger.info(f"Getting booking details for ID: {booking_id}")

        async with httpx.AsyncClient() as client:
            response = await client.get(
                get_url,
                headers=headers,
                timeout=15.0
            )

            if not response.is_success:
                error_text = response.text
                logger.error(f"Failed to get booking: {error_text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Junction API error: {error_text}"
                )

            return response.json()

    except httpx.TimeoutException:
        logger.error("Timeout getting booking details")
        raise HTTPException(status_code=504, detail="Request timed out")
    except httpx.RequestError as e:
        logger.error(f"Request error getting booking details: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Failed to connect to Junction API: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error getting booking details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/{booking_id}/confirm")
async def confirm_booking(
    booking_id: str, 
    confirmation_request: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Confirm a booking by ID.
    Expected request body:
    {
        "fulfillmentChoices": [
            {
                "deliveryOption": "electronic-ticket" | "kiosk-collect",
                "segmentSequence": 1
            }
        ]
    }
    """
    try:
        confirm_url = f"{JUNCTION_API_BASE}/bookings/{booking_id}/confirm"
        headers = {
            "x-api-key": API_KEY,
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        
        logger.info(f"Confirming booking {booking_id} with request: {confirmation_request}")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                confirm_url,
                json=confirmation_request,
                headers=headers,
                timeout=30.0
            )

            logger.info(f"🎫 Booking confirmation response status: {response.status_code}")
            
            if not response.is_success:
                error_text = response.text
                logger.error(f"🎫 Booking confirmation failed: {error_text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Junction API error: {error_text}"
                )

            confirmed_booking = response.json()
            logger.info(f"🎫 Raw Junction API confirmation response: {confirmed_booking}")
            logger.info(f"🎫 Confirmation response status: {response.status_code}")
            logger.info(f"🎫 Confirmation response headers: {dict(response.headers)}")
            
            # Log specific confirmation data we're looking for
            logger.info(f"🎫 Confirmation data type: {type(confirmed_booking)}")
            logger.info(f"🎫 Confirmation top-level keys: {list(confirmed_booking.keys()) if isinstance(confirmed_booking, dict) else 'Not a dict'}")
            
            if isinstance(confirmed_booking, dict):
                logger.info(f"🎫 Confirmed status: {confirmed_booking.get('status', 'NO STATUS')}")
                logger.info(f"🎫 Confirmed price: {confirmed_booking.get('price', 'NO PRICE')}")
                logger.info(f"🎫 Confirmed passengers: {confirmed_booking.get('passengers', 'NO PASSENGERS')}")
                logger.info(f"🎫 Confirmed trips: {confirmed_booking.get('trips', 'NO TRIPS')}")
                logger.info(f"🎫 Confirmed price breakdown: {confirmed_booking.get('priceBreakdown', 'NO PRICE BREAKDOWN')}")
                logger.info(f"🎫 Confirmed ticket info: {confirmed_booking.get('ticketInformation', 'NO TICKET INFO')}")
                logger.info(f"🎫 Confirmed booking object: {confirmed_booking.get('booking', 'NO NESTED BOOKING')}")
                logger.info(f"🎫 Confirmed fulfillment info: {confirmed_booking.get('fulfillmentInformation', 'NO FULFILLMENT INFO')}")
            
            logger.info(f"🎫 Booking confirmed successfully")
            
            # Update booking status in database (skipped - using Supabase instead)
            # db_booking = booking_crud.get_by_junction_id(db, junction_booking_id=booking_id)
            # if db_booking:
            #     # Update status to paid
            #     booking_crud.update_status(db, booking_id=db_booking.id, status="paid")
            #     logger.info(f"🎫 Updated database booking {db_booking.id} status to 'paid'")
            # else:
            #     logger.warning(f"🎫 Database booking not found for junction ID: {booking_id}")
            
            logger.info(f"🎫 Booking confirmation successful - Supabase will be updated by frontend")
            
            # Return the full confirmed booking data
            return {
                **confirmed_booking,
                "ticketInformation": confirmed_booking.get("ticketInformation", []),
                "priceBreakdown": confirmed_booking.get("priceBreakdown", []),
                "trips": confirmed_booking.get("trips", []),
                "passengers": confirmed_booking.get("passengers", []),
                "fareRules": confirmed_booking.get("fareRules", [])
            }

    except httpx.TimeoutException:
        logger.error("Timeout during booking confirmation")
        raise HTTPException(status_code=504, detail="Request timed out")
    except httpx.RequestError as e:
        logger.error(f"Request error during booking confirmation: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Failed to connect to Junction API: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error confirming booking: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")