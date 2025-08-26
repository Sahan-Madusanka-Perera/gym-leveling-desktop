-- ALTER Equipment table to add comprehensive fields for equipment management
-- This script modifies the existing Equipment table structure

-- First, let's add all the missing columns
ALTER TABLE public."Equipment" 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'available',
ADD COLUMN IF NOT EXISTS last_maintenance_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS next_maintenance_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS price decimal(10,2),
ADD COLUMN IF NOT EXISTS manufacturer text,
ADD COLUMN IF NOT EXISTS model text,
ADD COLUMN IF NOT EXISTS serial_number text,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Update existing columns to ensure they have proper constraints
ALTER TABLE public."Equipment" 
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN quantity SET NOT NULL,
ALTER COLUMN quantity SET DEFAULT 1;

-- Add constraints for data validation (with proper error handling)
DO $$ 
BEGIN
    -- Add status constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'equipment_status_check' 
        AND table_name = 'Equipment'
    ) THEN
        ALTER TABLE public."Equipment" 
        ADD CONSTRAINT equipment_status_check 
        CHECK (status IN ('available', 'in-use', 'maintenance', 'out-of-order'));
    END IF;

    -- Add category constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'equipment_category_check' 
        AND table_name = 'Equipment'
    ) THEN
        ALTER TABLE public."Equipment" 
        ADD CONSTRAINT equipment_category_check 
        CHECK (category IN ('Cardio', 'Strength', 'Free Weights', 'Machine', 'Functional Training', 'Recovery', 'Accessories', 'Other'));
    END IF;

    -- Add quantity positive constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'equipment_quantity_positive' 
        AND table_name = 'Equipment'
    ) THEN
        ALTER TABLE public."Equipment" 
        ADD CONSTRAINT equipment_quantity_positive 
        CHECK (quantity > 0);
    END IF;

    -- Add price positive constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'equipment_price_positive' 
        AND table_name = 'Equipment'
    ) THEN
        ALTER TABLE public."Equipment" 
        ADD CONSTRAINT equipment_price_positive 
        CHECK (price >= 0);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_category ON public."Equipment"(category);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON public."Equipment"(status);
CREATE INDEX IF NOT EXISTS idx_equipment_name ON public."Equipment"(name);
CREATE INDEX IF NOT EXISTS idx_equipment_location ON public."Equipment"(location);

-- Create or replace function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_equipment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS equipment_updated_at_trigger ON public."Equipment";
CREATE TRIGGER equipment_updated_at_trigger
    BEFORE UPDATE ON public."Equipment"
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_updated_at();

-- Update existing records to have proper default values
UPDATE public."Equipment" 
SET 
    category = COALESCE(category, 'Other'),
    status = COALESCE(status, 'available'),
    created_at = COALESCE(created_at, now()),
    updated_at = COALESCE(updated_at, now())
WHERE category IS NULL OR status IS NULL OR created_at IS NULL OR updated_at IS NULL;

-- Add some sample data if the table is empty (optional - remove if you don't want sample data)
INSERT INTO public."Equipment" (
  name, description, category, quantity, status, purchase_date, 
  last_maintenance_date, next_maintenance_date, price, manufacturer, 
  model, serial_number, image_url, location, notes
) 
SELECT 
  'Commercial Treadmill', 
  'High-end commercial treadmill with advanced features and durability for heavy use',
  'Cardio', 
  5, 
  'available', 
  '2023-01-15'::timestamp, 
  '2023-06-20'::timestamp, 
  '2023-12-20'::timestamp, 
  3599.99, 
  'LifeFitness', 
  'Platinum Club Series', 
  'LF-TM-2023-0001', 
  '/images/equipment/treadmill.jpg', 
  'Cardio Area - Main Floor', 
  'Regular maintenance required every 6 months'
WHERE NOT EXISTS (SELECT 1 FROM public."Equipment" WHERE name = 'Commercial Treadmill')

UNION ALL

SELECT 
  'Olympic Barbell', 
  '20kg Olympic barbell with chrome finish for heavy lifting',
  'Free Weights', 
  10, 
  'available', 
  '2023-02-05'::timestamp, 
  NULL, 
  NULL, 
  299.99, 
  'Rogue Fitness', 
  'Ohio Bar', 
  'RF-OB-2023-0025', 
  '/images/equipment/barbell.jpg', 
  'Free Weights Area', 
  'Inspect for bending or damage regularly'
WHERE NOT EXISTS (SELECT 1 FROM public."Equipment" WHERE name = 'Olympic Barbell')

UNION ALL

SELECT 
  'Adjustable Bench', 
  'Professional adjustable workout bench with multiple positions',
  'Strength', 
  8, 
  'available', 
  '2023-01-10'::timestamp, 
  '2023-07-15'::timestamp, 
  '2024-01-15'::timestamp, 
  499.99, 
  'Hammer Strength', 
  'Multi-Adjustable Bench', 
  'HS-AB-2023-0008', 
  '/images/equipment/bench.jpg', 
  'Free Weights Area', 
  'Check cushion and adjustment mechanism monthly'
WHERE NOT EXISTS (SELECT 1 FROM public."Equipment" WHERE name = 'Adjustable Bench')

UNION ALL

SELECT 
  'Exercise Bike', 
  'Upright stationary bike with digital display and heart rate monitoring',
  'Cardio', 
  6, 
  'in-use', 
  '2023-03-20'::timestamp, 
  '2023-08-10'::timestamp, 
  '2024-02-10'::timestamp, 
  1899.99, 
  'Precor', 
  'UBK 885', 
  'PC-EB-2023-0006', 
  '/images/equipment/exercise-bike.jpg', 
  'Cardio Area - Main Floor', 
  'Popular during morning hours'
WHERE NOT EXISTS (SELECT 1 FROM public."Equipment" WHERE name = 'Exercise Bike')

UNION ALL

SELECT 
  'Leg Press Machine', 
  '45-degree leg press machine with high weight capacity',
  'Machine', 
  2, 
  'maintenance', 
  '2022-11-15'::timestamp, 
  '2023-09-01'::timestamp, 
  '2023-11-01'::timestamp, 
  3299.99, 
  'Cybex', 
  'Eagle Leg Press', 
  'CY-LP-2022-0012', 
  '/images/equipment/leg-press.jpg', 
  'Strength Area - Back Section', 
  'Currently undergoing maintenance for hydraulic system repair'
WHERE NOT EXISTS (SELECT 1 FROM public."Equipment" WHERE name = 'Leg Press Machine');

-- Enable Row Level Security (RLS) if needed (uncomment if you want to enable RLS)
-- ALTER TABLE public."Equipment" ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (uncomment if you want to enable RLS)
-- DROP POLICY IF EXISTS "Equipment read access" ON public."Equipment";
-- CREATE POLICY "Equipment read access" ON public."Equipment"
--   FOR SELECT USING (true);

-- DROP POLICY IF EXISTS "Equipment insert access" ON public."Equipment";
-- CREATE POLICY "Equipment insert access" ON public."Equipment"
--   FOR INSERT WITH CHECK (true);

-- DROP POLICY IF EXISTS "Equipment update access" ON public."Equipment";
-- CREATE POLICY "Equipment update access" ON public."Equipment"
--   FOR UPDATE USING (true);

-- DROP POLICY IF EXISTS "Equipment delete access" ON public."Equipment";
-- CREATE POLICY "Equipment delete access" ON public."Equipment"
--   FOR DELETE USING (true);

-- Display the final table structure (using standard SQL instead of psql meta-command)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'Equipment' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Display table constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'Equipment' 
    AND table_schema = 'public';
