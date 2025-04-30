
-- Create RPC function to check if a column exists in a table
CREATE OR REPLACE FUNCTION public.check_column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE sql
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = $1
    AND column_name = $2
  );
$$;

-- Create RPC function to add a column if it doesn't exist
CREATE OR REPLACE FUNCTION public.add_column_if_not_exists(
  table_name text,
  column_name text,
  column_type text,
  column_default text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  column_exists boolean;
  add_column_sql text;
BEGIN
  -- Check if the column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = $1
    AND column_name = $2
  ) INTO column_exists;
  
  -- If column doesn't exist, add it
  IF NOT column_exists THEN
    add_column_sql := 'ALTER TABLE public.' || quote_ident(table_name) 
                    || ' ADD COLUMN ' || quote_ident(column_name) 
                    || ' ' || column_type;
    
    -- Add default if provided
    IF column_default IS NOT NULL THEN
      add_column_sql := add_column_sql || ' DEFAULT ' || column_default;
    END IF;
    
    EXECUTE add_column_sql;
  END IF;
END;
$$;
