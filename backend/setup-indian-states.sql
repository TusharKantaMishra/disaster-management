-- Setup Indian States and Union Territories in Supabase

-- Create the indian_states table
CREATE TABLE IF NOT EXISTS indian_states (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'STATE' or 'UNION_TERRITORY'
  region VARCHAR(20), -- 'NORTH', 'SOUTH', 'EAST', 'WEST', 'CENTRAL', 'NORTHEAST'
  population BIGINT,
  area_sq_km NUMERIC(10, 2),
  capital VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on name
ALTER TABLE indian_states ADD CONSTRAINT indian_states_name_unique UNIQUE (name);

-- Add unique constraint on code
ALTER TABLE indian_states ADD CONSTRAINT indian_states_code_unique UNIQUE (code);

-- Insert all Indian states and union territories
INSERT INTO indian_states (name, code, type, region, population, area_sq_km, capital) VALUES
-- States
('Andhra Pradesh', 'AP', 'STATE', 'SOUTH', 49577103, 160205, 'Amaravati'),
('Arunachal Pradesh', 'AR', 'STATE', 'NORTHEAST', 1383727, 83743, 'Itanagar'),
('Assam', 'AS', 'STATE', 'NORTHEAST', 31205576, 78438, 'Dispur'),
('Bihar', 'BR', 'STATE', 'EAST', 104099452, 94163, 'Patna'),
('Chhattisgarh', 'CG', 'STATE', 'CENTRAL', 25545198, 135192, 'Raipur'),
('Goa', 'GA', 'STATE', 'WEST', 1458545, 3702, 'Panaji'),
('Gujarat', 'GJ', 'STATE', 'WEST', 60439692, 196024, 'Gandhinagar'),
('Haryana', 'HR', 'STATE', 'NORTH', 25351462, 44212, 'Chandigarh'),
('Himachal Pradesh', 'HP', 'STATE', 'NORTH', 6864602, 55673, 'Shimla'),
('Jharkhand', 'JH', 'STATE', 'EAST', 32988134, 79714, 'Ranchi'),
('Karnataka', 'KA', 'STATE', 'SOUTH', 61095297, 191791, 'Bengaluru'),
('Kerala', 'KL', 'STATE', 'SOUTH', 33406061, 38863, 'Thiruvananthapuram'),
('Madhya Pradesh', 'MP', 'STATE', 'CENTRAL', 72626809, 308252, 'Bhopal'),
('Maharashtra', 'MH', 'STATE', 'WEST', 112374333, 307713, 'Mumbai'),
('Manipur', 'MN', 'STATE', 'NORTHEAST', 2855794, 22327, 'Imphal'),
('Meghalaya', 'ML', 'STATE', 'NORTHEAST', 2966889, 22429, 'Shillong'),
('Mizoram', 'MZ', 'STATE', 'NORTHEAST', 1097206, 21081, 'Aizawl'),
('Nagaland', 'NL', 'STATE', 'NORTHEAST', 1978502, 16579, 'Kohima'),
('Odisha', 'OD', 'STATE', 'EAST', 41974219, 155707, 'Bhubaneswar'),
('Punjab', 'PB', 'STATE', 'NORTH', 27743338, 50362, 'Chandigarh'),
('Rajasthan', 'RJ', 'STATE', 'WEST', 68548437, 342239, 'Jaipur'),
('Sikkim', 'SK', 'STATE', 'NORTHEAST', 610577, 7096, 'Gangtok'),
('Tamil Nadu', 'TN', 'STATE', 'SOUTH', 72147030, 130058, 'Chennai'),
('Telangana', 'TG', 'STATE', 'SOUTH', 35003674, 112077, 'Hyderabad'),
('Tripura', 'TR', 'STATE', 'NORTHEAST', 3673917, 10486, 'Agartala'),
('Uttar Pradesh', 'UP', 'STATE', 'NORTH', 199812341, 240928, 'Lucknow'),
('Uttarakhand', 'UK', 'STATE', 'NORTH', 10086292, 53483, 'Dehradun'),
('West Bengal', 'WB', 'STATE', 'EAST', 91276115, 88752, 'Kolkata'),

-- Union Territories
('Andaman and Nicobar Islands', 'AN', 'UNION_TERRITORY', 'EAST', 380581, 8249, 'Port Blair'),
('Chandigarh', 'CH', 'UNION_TERRITORY', 'NORTH', 1055450, 114, 'Chandigarh'),
('Dadra and Nagar Haveli and Daman and Diu', 'DN', 'UNION_TERRITORY', 'WEST', 585764, 603, 'Daman'),
('Delhi', 'DL', 'UNION_TERRITORY', 'NORTH', 16787941, 1483, 'New Delhi'),
('Jammu and Kashmir', 'JK', 'UNION_TERRITORY', 'NORTH', 12267032, 42241, 'Srinagar/Jammu'),
('Ladakh', 'LA', 'UNION_TERRITORY', 'NORTH', 274000, 59146, 'Leh'),
('Lakshadweep', 'LD', 'UNION_TERRITORY', 'SOUTH', 64473, 32, 'Kavaratti'),
('Puducherry', 'PY', 'UNION_TERRITORY', 'SOUTH', 1247953, 492, 'Puducherry')
ON CONFLICT (name) DO UPDATE SET 
  code = EXCLUDED.code,
  type = EXCLUDED.type,
  region = EXCLUDED.region,
  population = EXCLUDED.population,
  area_sq_km = EXCLUDED.area_sq_km,
  capital = EXCLUDED.capital,
  updated_at = NOW();

-- Set up Row Level Security
ALTER TABLE indian_states ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read the states
CREATE POLICY indian_states_select_policy
  ON indian_states
  FOR SELECT
  USING (true);

-- If you want to restrict insert/update/delete to authenticated users:
CREATE POLICY indian_states_insert_policy
  ON indian_states
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY indian_states_update_policy
  ON indian_states
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY indian_states_delete_policy
  ON indian_states
  FOR DELETE
  TO authenticated
  USING (true);
