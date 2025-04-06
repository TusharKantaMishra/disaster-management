# Setting Up Indian States and Union Territories in Supabase

This guide explains how to add all Indian states and union territories to your Supabase database and display them in the dropdown selector in the AI Analysis page.

## Overview of Implementation

I've implemented the following components to set up the Indian states system:

1. `setup-indian-states.sql` - SQL script to create and populate the states table
2. `setup-indian-states.ts` - TypeScript script to programmatically set up the states
3. Updated `states.ts` backend module to work with the new table structure

## 1. Database Table Structure

The table design for Indian states and union territories includes:

```sql
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
```

## 2. Implementation Files

### 2.1 SQL Setup Script

I've created a SQL script at `backend/setup-indian-states.sql` that handles:
- Creating the table with proper structure
- Inserting all Indian states and union territories with detailed data
- Setting up Row Level Security policies

Key sections of this script:

```sql
-- Insert all Indian states and union territories
INSERT INTO indian_states (name, code, type, region, population, area_sq_km, capital) VALUES
-- States
('Andhra Pradesh', 'AP', 'STATE', 'SOUTH', 49577103, 160205, 'Amaravati'),
('Arunachal Pradesh', 'AR', 'STATE', 'NORTHEAST', 1383727, 83743, 'Itanagar'),
-- ... more states ...
('West Bengal', 'WB', 'STATE', 'EAST', 91276115, 88752, 'Kolkata'),

-- Union Territories
('Andaman and Nicobar Islands', 'AN', 'UNION_TERRITORY', 'EAST', 380581, 8249, 'Port Blair'),
-- ... more union territories ...
('Puducherry', 'PY', 'UNION_TERRITORY', 'SOUTH', 1247953, 492, 'Puducherry')
```

### 2.2 TypeScript Setup Script

I've also created a TypeScript script at `backend/setup-indian-states.ts` that can be used to programmatically initialize the database:

```typescript
// From backend/setup-indian-states.ts

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

// Insert the data with upsert (update if exists, insert if not)
const { error } = await supabase
  .from('indian_states')
  .upsert(INDIAN_STATES_DATA, { 
    onConflict: 'name',
    ignoreDuplicates: false
  });
```
```

## 3. Backend Integration

I've updated the `backend/states.ts` file to work with the new Indian states database table:

```typescript
// backend/states.ts (key parts)

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

// Table name for Indian states and UTs
const STATES_TABLE = 'indian_states';

// Example function to fetch states by region
export async function getStatesByRegion(region: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CENTRAL' | 'NORTHEAST'): Promise<StateDetailed[]> {
  try {
    const { data, error } = await supabase
      .from(STATES_TABLE)
      .select('*')
      .eq('region', region)
      .order('name');
      
    // Error handling and return logic
  }
}
```

## 4. Connecting to the Frontend

The updated backend module provides several functions for working with the Indian states data:

- `getAllStates()` - Get a list of all state names
- `getStatesDetailed()` - Get detailed information for all states
- `getStateByName(stateName)` - Get state details by name
- `getStateByCode(stateCode)` - Get state details by code (e.g., 'MH')
- `getStatesByType(type)` - Get states filtered by type (STATE or UNION_TERRITORY)
- `getStatesByRegion(region)` - Get states filtered by region

The AI analysis page can either:

1. Use the backend module directly to fetch state data
2. Use the hardcoded `INDIAN_STATES_AND_UTS` array that's already in place

The current implementation is using the hardcoded array:

```tsx
// From app/ai-analysis/page.tsx
const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  // ... more states and UTs ...
];

// In the component:
<Select value={selectedState} onValueChange={setSelectedState}>
  <SelectTrigger>
    <SelectValue placeholder="Select a state or territory" />
  </SelectTrigger>
  <SelectContent>
    {INDIAN_STATES_AND_UTS.map(state => (
      <SelectItem key={state} value={state}>{state}</SelectItem>
    ))}
  </SelectContent>
</Select>
```
```

## 5. Running the Setup

To complete the implementation, follow these steps:

### Option 1: Using the SQL Script

1. Connect to your Supabase database using the SQL Editor
2. Open and run the `backend/setup-indian-states.sql` script
3. Verify that the `indian_states` table was created with all data

### Option 2: Using the TypeScript Script

1. Install needed dependencies: `npm install dotenv`
2. Ensure your `.env` file contains Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
3. Run the setup script:
```bash
npx ts-node backend/setup-indian-states.ts
```

## 6. Switching to Database-Driven States

Currently, the AI Analysis page uses the hardcoded array of states. To use the database version:

1. Import the states backend module in your page:
```tsx
import { useEffect, useState } from 'react';
import { getAllStates, getStatesDetailed, StateDetailed } from '@/backend/states';
```

2. Add state for storing the states data:
```tsx
const [states, setStates] = useState<string[]>([]);
const [loading, setLoading] = useState(true);
```

3. Fetch the states when the component mounts:
```tsx
useEffect(() => {
  async function fetchStates() {
    setLoading(true);
    const statesList = await getAllStates();
    setStates(statesList);
    setLoading(false);
  }
  fetchStates();
}, []);
```

4. Update the Select component to use the loaded states:
```tsx
<Select value={selectedState} onValueChange={setSelectedState} disabled={loading}>
  <SelectTrigger>
    <SelectValue placeholder={loading ? "Loading states..." : "Select a state or territory"} />
  </SelectTrigger>
  <SelectContent>
    {states.map(state => (
      <SelectItem key={state} value={state}>{state}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

## 7. Advanced Features and Enhancements

With the database approach, you can enhance the state selection with:

1. **Grouping by Region**: Filter or group states by their region
2. **Type Filtering**: Provide options to show only States or only Union Territories
3. **Search with Autocomplete**: Add search functionality to the state selector
4. **Detailed State Information**: Show population, area, and other details when a state is selected
5. **State Maps**: Add mapping capabilities to visualize state data

The backend module includes the necessary functions to support these features.
