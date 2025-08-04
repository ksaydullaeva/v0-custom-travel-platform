-- Create package_options table
CREATE TABLE package_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_adjustment DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    inclusions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add comments for columns
COMMENT ON TABLE package_options IS 'Options or variations for a tour package';
COMMENT ON COLUMN package_options.experience_id IS 'The ID of the experience this package option belongs to';
COMMENT ON COLUMN package_options.name IS 'Name of the package option (e.g., Standard, Premium)';
COMMENT ON COLUMN package_options.description IS 'Description of the package option';
COMMENT ON COLUMN package_options.price_adjustment IS 'Adjustment to the base tour price for this package';
COMMENT ON COLUMN package_options.inclusions IS 'JSON array of items included in this package'; 