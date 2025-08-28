-- Migration script for session bookings with payment integration
-- This script safely handles existing tables and matches current schema

-- The session_bookings table already exists with this structure:
-- No need to create it, just add missing columns and constraints

-- Add payment_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'session_bookings' AND column_name = 'payment_id') THEN
        ALTER TABLE public.session_bookings 
        ADD COLUMN payment_id bigint NULL;
        RAISE NOTICE 'Added payment_id column to session_bookings';
    ELSE
        RAISE NOTICE 'payment_id column already exists in session_bookings';
    END IF;
END $$;

-- Add payment_id foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name = 'fk_booking_payment' 
                  AND table_name = 'session_bookings') THEN
        ALTER TABLE public.session_bookings
        ADD CONSTRAINT fk_booking_payment 
        FOREIGN KEY (payment_id) REFERENCES "Payments"(payment_id) ON DELETE SET NULL;
        RAISE NOTICE 'Added payment foreign key constraint to session_bookings';
    ELSE
        RAISE NOTICE 'Payment foreign key constraint already exists';
    END IF;
END $$;

-- Update the existing status constraint to include payment statuses
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
              WHERE constraint_name = 'booking_status_check' 
              AND table_name = 'session_bookings'
              AND constraint_type = 'CHECK') THEN
        ALTER TABLE public.session_bookings DROP CONSTRAINT booking_status_check;
        RAISE NOTICE 'Dropped existing booking_status_check constraint';
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
    RAISE NOTICE 'Added updated booking_status_check constraint with payment statuses';
END $$;

-- Add pricing to sessions table
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS price decimal(10,2) NOT NULL DEFAULT 1800.00,
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'LKR';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS session_bookings_session_id_idx ON public.session_bookings USING btree (session_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS session_bookings_member_id_idx ON public.session_bookings USING btree (member_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS session_bookings_status_idx ON public.session_bookings USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS session_bookings_booking_date_idx ON public.session_bookings USING btree (booking_date) TABLESPACE pg_default;

-- Add trigger for updated_at (the trigger already exists, so we safely recreate it)
DROP TRIGGER IF EXISTS update_session_bookings_updated_at ON session_bookings;
CREATE TRIGGER update_session_bookings_updated_at 
BEFORE UPDATE ON session_bookings 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Create a view for session availability
DROP VIEW IF EXISTS session_availability;
CREATE VIEW session_availability AS
SELECT
  s.id,
  s.title,
  s.capacity,
  s.price,
  s.currency,
  COALESCE(b.booked_count, 0::bigint) as booked_count,
  s.capacity - COALESCE(b.booked_count, 0::bigint) as available_spots,
  CASE
    WHEN COALESCE(b.booked_count, 0::bigint) >= s.capacity THEN false
    ELSE true
  END as has_availability
FROM
  sessions s
  LEFT JOIN (
    SELECT
      session_bookings.session_id,
      COUNT(*) as booked_count
    FROM
      session_bookings
    WHERE
      session_bookings.status IN ('confirmed'::text, 'completed'::text)
    GROUP BY
      session_bookings.session_id
  ) b ON s.id = b.session_id;

-- Sample data (uncomment and replace with actual IDs when needed)
-- INSERT INTO session_bookings (session_id, member_id, booking_date, status, notes) VALUES
-- ('session-uuid-1', 1, '2025-08-27 10:00:00', 'confirmed', 'First booking'),
-- ('session-uuid-2', 2, '2025-08-27 14:00:00', 'confirmed', 'Regular member');
