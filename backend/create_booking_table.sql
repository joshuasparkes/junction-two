-- Create booking table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    junction_booking_id VARCHAR UNIQUE NOT NULL,
    trip_id INTEGER NOT NULL REFERENCES trips(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    
    -- Booking details
    status VARCHAR DEFAULT 'pending-payment',
    total_amount VARCHAR NOT NULL,
    currency VARCHAR DEFAULT 'EUR',
    
    -- Junction API response data (stored as JSON)
    junction_response JSONB,
    passengers_data JSONB,
    trips_data JSONB,
    price_breakdown JSONB,
    fulfillment_info JSONB,
    
    -- Ticket information
    confirmation_number VARCHAR,
    ticket_url VARCHAR,
    collection_reference VARCHAR,
    delivery_option VARCHAR,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    booking_date TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_junction_id ON bookings(junction_booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_organization_id ON bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);