/**
 * Script to populate Indian states and union territories in Supabase
 * 
 * Usage:
 * 1. Ensure your Supabase credentials are in .env file
 * 2. Run: npx ts-node backend/setup-indian-states.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in environment variables.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env file.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the Indian states and UTs data
interface StateData {
  name: string;
  code: string;
  type: 'STATE' | 'UNION_TERRITORY';
  region: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CENTRAL' | 'NORTHEAST';
  population: number;
  area_sq_km: number;
  capital: string;
}

const INDIAN_STATES_DATA: StateData[] = [
  // States
  { name: 'Andhra Pradesh', code: 'AP', type: 'STATE', region: 'SOUTH', population: 49577103, area_sq_km: 160205, capital: 'Amaravati' },
  { name: 'Arunachal Pradesh', code: 'AR', type: 'STATE', region: 'NORTHEAST', population: 1383727, area_sq_km: 83743, capital: 'Itanagar' },
  { name: 'Assam', code: 'AS', type: 'STATE', region: 'NORTHEAST', population: 31205576, area_sq_km: 78438, capital: 'Dispur' },
  { name: 'Bihar', code: 'BR', type: 'STATE', region: 'EAST', population: 104099452, area_sq_km: 94163, capital: 'Patna' },
  { name: 'Chhattisgarh', code: 'CG', type: 'STATE', region: 'CENTRAL', population: 25545198, area_sq_km: 135192, capital: 'Raipur' },
  { name: 'Goa', code: 'GA', type: 'STATE', region: 'WEST', population: 1458545, area_sq_km: 3702, capital: 'Panaji' },
  { name: 'Gujarat', code: 'GJ', type: 'STATE', region: 'WEST', population: 60439692, area_sq_km: 196024, capital: 'Gandhinagar' },
  { name: 'Haryana', code: 'HR', type: 'STATE', region: 'NORTH', population: 25351462, area_sq_km: 44212, capital: 'Chandigarh' },
  { name: 'Himachal Pradesh', code: 'HP', type: 'STATE', region: 'NORTH', population: 6864602, area_sq_km: 55673, capital: 'Shimla' },
  { name: 'Jharkhand', code: 'JH', type: 'STATE', region: 'EAST', population: 32988134, area_sq_km: 79714, capital: 'Ranchi' },
  { name: 'Karnataka', code: 'KA', type: 'STATE', region: 'SOUTH', population: 61095297, area_sq_km: 191791, capital: 'Bengaluru' },
  { name: 'Kerala', code: 'KL', type: 'STATE', region: 'SOUTH', population: 33406061, area_sq_km: 38863, capital: 'Thiruvananthapuram' },
  { name: 'Madhya Pradesh', code: 'MP', type: 'STATE', region: 'CENTRAL', population: 72626809, area_sq_km: 308252, capital: 'Bhopal' },
  { name: 'Maharashtra', code: 'MH', type: 'STATE', region: 'WEST', population: 112374333, area_sq_km: 307713, capital: 'Mumbai' },
  { name: 'Manipur', code: 'MN', type: 'STATE', region: 'NORTHEAST', population: 2855794, area_sq_km: 22327, capital: 'Imphal' },
  { name: 'Meghalaya', code: 'ML', type: 'STATE', region: 'NORTHEAST', population: 2966889, area_sq_km: 22429, capital: 'Shillong' },
  { name: 'Mizoram', code: 'MZ', type: 'STATE', region: 'NORTHEAST', population: 1097206, area_sq_km: 21081, capital: 'Aizawl' },
  { name: 'Nagaland', code: 'NL', type: 'STATE', region: 'NORTHEAST', population: 1978502, area_sq_km: 16579, capital: 'Kohima' },
  { name: 'Odisha', code: 'OD', type: 'STATE', region: 'EAST', population: 41974219, area_sq_km: 155707, capital: 'Bhubaneswar' },
  { name: 'Punjab', code: 'PB', type: 'STATE', region: 'NORTH', population: 27743338, area_sq_km: 50362, capital: 'Chandigarh' },
  { name: 'Rajasthan', code: 'RJ', type: 'STATE', region: 'WEST', population: 68548437, area_sq_km: 342239, capital: 'Jaipur' },
  { name: 'Sikkim', code: 'SK', type: 'STATE', region: 'NORTHEAST', population: 610577, area_sq_km: 7096, capital: 'Gangtok' },
  { name: 'Tamil Nadu', code: 'TN', type: 'STATE', region: 'SOUTH', population: 72147030, area_sq_km: 130058, capital: 'Chennai' },
  { name: 'Telangana', code: 'TG', type: 'STATE', region: 'SOUTH', population: 35003674, area_sq_km: 112077, capital: 'Hyderabad' },
  { name: 'Tripura', code: 'TR', type: 'STATE', region: 'NORTHEAST', population: 3673917, area_sq_km: 10486, capital: 'Agartala' },
  { name: 'Uttar Pradesh', code: 'UP', type: 'STATE', region: 'NORTH', population: 199812341, area_sq_km: 240928, capital: 'Lucknow' },
  { name: 'Uttarakhand', code: 'UK', type: 'STATE', region: 'NORTH', population: 10086292, area_sq_km: 53483, capital: 'Dehradun' },
  { name: 'West Bengal', code: 'WB', type: 'STATE', region: 'EAST', population: 91276115, area_sq_km: 88752, capital: 'Kolkata' },
  
  // Union Territories
  { name: 'Andaman and Nicobar Islands', code: 'AN', type: 'UNION_TERRITORY', region: 'EAST', population: 380581, area_sq_km: 8249, capital: 'Port Blair' },
  { name: 'Chandigarh', code: 'CH', type: 'UNION_TERRITORY', region: 'NORTH', population: 1055450, area_sq_km: 114, capital: 'Chandigarh' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DN', type: 'UNION_TERRITORY', region: 'WEST', population: 585764, area_sq_km: 603, capital: 'Daman' },
  { name: 'Delhi', code: 'DL', type: 'UNION_TERRITORY', region: 'NORTH', population: 16787941, area_sq_km: 1483, capital: 'New Delhi' },
  { name: 'Jammu and Kashmir', code: 'JK', type: 'UNION_TERRITORY', region: 'NORTH', population: 12267032, area_sq_km: 42241, capital: 'Srinagar/Jammu' },
  { name: 'Ladakh', code: 'LA', type: 'UNION_TERRITORY', region: 'NORTH', population: 274000, area_sq_km: 59146, capital: 'Leh' },
  { name: 'Lakshadweep', code: 'LD', type: 'UNION_TERRITORY', region: 'SOUTH', population: 64473, area_sq_km: 32, capital: 'Kavaratti' },
  { name: 'Puducherry', code: 'PY', type: 'UNION_TERRITORY', region: 'SOUTH', population: 1247953, area_sq_km: 492, capital: 'Puducherry' }
];

/**
 * Function to create the indian_states table if it doesn't exist
 */
async function createIndianStatesTable() {
  console.log('Creating indian_states table if it doesn\'t exist...');
  
  const { error } = await supabase.rpc('create_indian_states_table', {});
  
  if (error) {
    console.error('Error creating table:', error);
    
    // Alternative approach: execute SQL directly
    console.log('Attempting to create table using SQL query...');
    const { error: sqlError } = await supabase.from('indian_states').select('id').limit(1);
    
    if (sqlError && sqlError.code === '42P01') {  // Relation does not exist
      console.log('Table does not exist. Please run the SQL script first.');
      console.log('You can run: psql -U your_username -d your_database -f backend/setup-indian-states.sql');
      process.exit(1);
    }
  } else {
    console.log('Table creation successful or already exists');
  }
}

/**
 * Function to insert states data into the table
 */
async function insertStatesData() {
  console.log('Inserting Indian states and UTs data...');
  
  // Insert data with upsert (update if exists, insert if not)
  const { error } = await supabase
    .from('indian_states')
    .upsert(INDIAN_STATES_DATA, { 
      onConflict: 'name',
      ignoreDuplicates: false
    });
  
  if (error) {
    console.error('Error inserting data:', error);
    process.exit(1);
  } else {
    console.log('Successfully inserted/updated all states and UTs data');
  }
}

/**
 * Function to verify the data was inserted correctly
 */
async function verifyData() {
  console.log('Verifying data...');
  
  const { data, error } = await supabase
    .from('indian_states')
    .select('name, type')
    .order('name');
  
  if (error) {
    console.error('Error verifying data:', error);
    process.exit(1);
  }
  
  console.log(`Successfully verified ${data.length} records:`);
  console.log(`- States: ${data.filter(item => item.type === 'STATE').length}`);
  console.log(`- Union Territories: ${data.filter(item => item.type === 'UNION_TERRITORY').length}`);
}

/**
 * Main function to run the script
 */
async function main() {
  console.log('Starting Indian states setup...');
  
  try {
    await createIndianStatesTable();
    await insertStatesData();
    await verifyData();
    
    console.log('Setup completed successfully!');
  } catch (error) {
    console.error('Unhandled error during setup:', error);
    process.exit(1);
  }
}

// Run the main function
main();
