/*
  # Discord Bot Linking System

  1. New Tables
    - `linking_codes`
      - `code` (text, primary key) - The linking code
      - `user_data` (jsonb) - Chat data and settings
      - `created_at` (timestamp) - When code was created
      - `expires_at` (timestamp) - When code expires
      - `used` (boolean) - Whether code has been used
      - `used_at` (timestamp) - When code was used

  2. Security
    - Enable RLS on `linking_codes` table
    - Add policies for public access (needed for Discord bots)
    - Add automatic cleanup of expired codes

  3. Functions
    - Auto-cleanup function for expired codes
    - Trigger to clean up old codes periodically
*/

-- Create linking codes table
CREATE TABLE IF NOT EXISTS linking_codes (
  code text PRIMARY KEY,
  user_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  used_at timestamptz
);

-- Enable RLS
ALTER TABLE linking_codes ENABLE ROW LEVEL SECURITY;

-- Allow public access for Discord bots (they don't have auth)
CREATE POLICY "Allow public read access for validation"
  ON linking_codes
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert for code generation"
  ON linking_codes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update for marking as used"
  ON linking_codes
  FOR UPDATE
  TO anon
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_linking_codes_expires_at ON linking_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_linking_codes_used ON linking_codes(used);

-- Function to clean up expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM linking_codes 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create a function to generate linking codes
CREATE OR REPLACE FUNCTION generate_linking_code(
  p_user_data jsonb,
  p_expires_minutes integer DEFAULT 5
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  -- Clean up expired codes first
  PERFORM cleanup_expired_codes();
  
  -- Generate unique code
  LOOP
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    SELECT EXISTS(SELECT 1 FROM linking_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  -- Insert the new code
  INSERT INTO linking_codes (code, user_data, expires_at)
  VALUES (
    new_code,
    p_user_data,
    now() + (p_expires_minutes || ' minutes')::interval
  );
  
  RETURN new_code;
END;
$$;

-- Function to validate and use a linking code
CREATE OR REPLACE FUNCTION validate_linking_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  code_data record;
  result jsonb;
BEGIN
  -- Clean up expired codes first
  PERFORM cleanup_expired_codes();
  
  -- Get the code data
  SELECT * INTO code_data
  FROM linking_codes
  WHERE code = p_code
    AND expires_at > now()
    AND used = false;
  
  -- If code not found or expired
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired code');
  END IF;
  
  -- Mark code as used
  UPDATE linking_codes
  SET used = true, used_at = now()
  WHERE code = p_code;
  
  -- Return the user data
  RETURN jsonb_build_object(
    'valid', true,
    'chats', code_data.user_data->'chats',
    'settings', code_data.user_data->'settings',
    'username', code_data.user_data->'settings'->>'userName'
  );
END;
$$;