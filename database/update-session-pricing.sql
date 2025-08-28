-- Add pricing columns and update sample sessions with prices in LKR
-- This script adds sample pricing to demonstrate the payment system

-- First, add the pricing columns if they don't exist
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS price decimal(10,2) NOT NULL DEFAULT 1800.00,
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'LKR';

-- Update some sessions with pricing (using representative prices in Sri Lankan Rupees)
UPDATE sessions 
SET 
  price = CASE 
    WHEN title ILIKE '%yoga%' THEN 1500.00
    WHEN title ILIKE '%crossfit%' OR title ILIKE '%hiit%' THEN 2500.00
    WHEN title ILIKE '%personal%' THEN 5000.00
    WHEN title ILIKE '%pilates%' THEN 2000.00
    WHEN title ILIKE '%spinning%' OR title ILIKE '%cardio%' THEN 1800.00
    WHEN title ILIKE '%strength%' THEN 2200.00
    WHEN title ILIKE '%meditation%' THEN 1000.00
    WHEN title ILIKE '%kickboxing%' OR title ILIKE '%martial%' THEN 2800.00
    WHEN title ILIKE '%aqua%' OR title ILIKE '%swimming%' THEN 2000.00
    WHEN title ILIKE '%zumba%' OR title ILIKE '%dance%' THEN 1600.00
    ELSE 1800.00 -- Default price for other sessions
  END,
  currency = 'LKR';

-- Add some free sessions as well (community classes, etc.)
UPDATE sessions 
SET price = 0.00, currency = 'LKR'
WHERE title ILIKE '%community%' 
   OR title ILIKE '%beginner%orientation%'
   OR title ILIKE '%trial%'
   OR title ILIKE '%intro%';

-- Display updated pricing
SELECT title, price, currency, capacity, day_of_week, start_time
FROM sessions 
ORDER BY price DESC, title;
