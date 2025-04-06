import { createClient } from '@supabase/supabase-js';

// Define types for Indian state data
export interface StateBasic {
  name: string;
}

export interface StateDetailed extends StateBasic {
  id: number;
  code: string;
  type: 'STATE' | 'UNION_TERRITORY';
  region: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CENTRAL' | 'NORTHEAST';
  population: number;
  area_sq_km: number;
  capital: string;
  created_at?: string;
  updated_at?: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Table name for Indian states and UTs
const STATES_TABLE = 'indian_states';

/**
 * Fetch all Indian state and UT names from the database
 * @returns Array of state names
 */
export async function getAllStates(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from(STATES_TABLE)
      .select('name')
      .order('name');

    if (error) {
      console.error('Error fetching states:', error);
      return []; // Return empty array instead of throwing to prevent UI crashes
    }

    if (!data || data.length === 0) {
      console.warn('No states found in the database');
      return [];
    }

    // Extract state names from the data
    const stateNames = data.map(state => state.name);
    return stateNames;
  } catch (error) {
    console.error('Error in getAllStates:', error);
    return []; // Return empty array as fallback
  }
}

/**
 * Fetch states by their type (STATE or UNION_TERRITORY)
 * @param type Type of territory to fetch ('STATE' or 'UNION_TERRITORY')
 * @returns Array of state objects matching the specified type
 */
export async function getStatesByType(type: 'STATE' | 'UNION_TERRITORY'): Promise<StateDetailed[]> {
  try {
    const { data, error } = await supabase
      .from(STATES_TABLE)
      .select('*')
      .eq('type', type)
      .order('name');

    if (error) {
      console.error(`Error fetching ${type}s:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Error in getStatesByType for ${type}:`, error);
    return [];
  }
}

/**
 * Fetch states by their region
 * @param region Region to filter by ('NORTH', 'SOUTH', etc.)
 * @returns Array of state objects in the specified region
 */
export async function getStatesByRegion(region: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CENTRAL' | 'NORTHEAST'): Promise<StateDetailed[]> {
  try {
    const { data, error } = await supabase
      .from(STATES_TABLE)
      .select('*')
      .eq('region', region)
      .order('name');

    if (error) {
      console.error(`Error fetching states in ${region} region:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Error in getStatesByRegion for ${region}:`, error);
    return [];
  }
}

/**
 * Fetch detailed information about all states and UTs
 * @returns Array of state objects with detailed information
 */
export async function getStatesDetailed(): Promise<StateDetailed[]> {
  try {
    const { data, error } = await supabase
      .from(STATES_TABLE)
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching detailed states:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getStatesDetailed:', error);
    return [];
  }
}

/**
 * Fetch detailed information for a specific state by name
 * @param stateName The name of the state to fetch
 * @returns State object with detailed information or null if not found
 */
export async function getStateByName(stateName: string): Promise<StateDetailed | null> {
  try {
    const { data, error } = await supabase
      .from(STATES_TABLE)
      .select('*')
      .eq('name', stateName)
      .single();

    if (error) {
      console.error(`Error fetching state ${stateName}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error in getStateByName for ${stateName}:`, error);
    return null;
  }
}

/**
 * Fetch state information by code (e.g., 'MH' for Maharashtra)
 * @param stateCode The state code to fetch
 * @returns State object with detailed information or null if not found
 */
export async function getStateByCode(stateCode: string): Promise<StateDetailed | null> {
  try {
    const { data, error } = await supabase
      .from(STATES_TABLE)
      .select('*')
      .eq('code', stateCode.toUpperCase())
      .single();

    if (error) {
      console.error(`Error fetching state with code ${stateCode}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error in getStateByCode for ${stateCode}:`, error);
    return null;
  }
}
