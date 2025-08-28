-- Migration script for adding payment integration to existing booking system
-- This script safely adds payment functionality to existing tables

-- Step 1: Add payment_id column to session_bookings table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'session_bookings' AND column_name = 'payment_id') THEN
        ALTER TABLE public.session_bookings 
        ADD COLUMN payment_id bigint NULL;
        
        -- Add foreign key constraint
        ALTER TABLE public.session_bookings
        ADD CONSTRAINT fk_booking_payment 
        FOREIGN KEY (payment_id) REFERENCES "Payments"(payment_id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added payment_id column and foreign key constraint to session_bookings table';
    ELSE
        RAISE NOTICE 'payment_id column already exists in session_bookings table';
    END IF;
END $$;

-- Step 2: Update status constraint to include new payment statuses
DO $$
BEGIN
    -- Drop existing constraint
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
              WHERE constraint_name = 'booking_status_check' 
              AND table_name = 'session_bookings'
              AND constraint_type = 'CHECK') THEN
        ALTER TABLE public.session_bookings DROP CONSTRAINT booking_status_check;
    END IF;
    
    -- Add updated constraint with payment statuses
    ALTER TABLE public.session_bookings 
    ADD CONSTRAINT booking_status_check 
    CHECK (status = ANY (ARRAY[
        'pending_payment'::text, 
        'confirmed'::text, 
        'cancelled'::text, 
        'completed'::text, 
        'no_show'::text, 
        'refunded'::text
    ]));
    
    RAISE NOTICE 'Updated booking status constraint to include payment statuses';
END $$;

-- Step 3: Add pricing columns to sessions table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sessions' AND column_name = 'price') THEN
        ALTER TABLE public.sessions 
        ADD COLUMN price decimal(10,2) NOT NULL DEFAULT 1800.00;
        
        RAISE NOTICE 'Added price column to sessions table';
    ELSE
        RAISE NOTICE 'price column already exists in sessions table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'sessions' AND column_name = 'currency') THEN
        ALTER TABLE public.sessions 
        ADD COLUMN currency text NOT NULL DEFAULT 'LKR';
        
        RAISE NOTICE 'Added currency column to sessions table';
    ELSE
        RAISE NOTICE 'currency column already exists in sessions table';
    END IF;
END $$;

-- Step 4: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS session_bookings_session_id_idx 
ON public.session_bookings USING btree (session_id);

CREATE INDEX IF NOT EXISTS session_bookings_member_id_idx 
ON public.session_bookings USING btree (member_id);

CREATE INDEX IF NOT EXISTS session_bookings_status_idx 
ON public.session_bookings USING btree (status);

CREATE INDEX IF NOT EXISTS session_bookings_booking_date_idx 
ON public.session_bookings USING btree (booking_date);

CREATE INDEX IF NOT EXISTS session_bookings_payment_id_idx 
ON public.session_bookings USING btree (payment_id);

-- Step 5: Create or update the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Add trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_session_bookings_updated_at ON session_bookings;
CREATE TRIGGER update_session_bookings_updated_at 
    BEFORE UPDATE ON session_bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Create or replace the session availability view
CREATE OR REPLACE VIEW session_availability AS
SELECT 
  s.id,
  s.title,
  s.capacity,
  s.price,
  s.currency,
  COALESCE(b.booked_count, 0) as booked_count,
  (s.capacity - COALESCE(b.booked_count, 0)) as available_spots,
  (s.capacity - COALESCE(b.booked_count, 0)) > 0 as has_availability
FROM sessions s
LEFT JOIN (
  SELECT 
    session_id, 
    COUNT(*) as booked_count 
  FROM session_bookings 
  WHERE status IN ('confirmed', 'completed') 
  GROUP BY session_id
) b ON s.id = b.session_id;

-- Step 8: Update existing bookings to have confirmed status if they're null
DO $$ 
BEGIN
    UPDATE session_bookings 
    SET status = 'confirmed' 
    WHERE status IS NULL;

    RAISE NOTICE 'Payment integration migration completed successfully!';
END $$;
