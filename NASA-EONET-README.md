# NASA EONET API Integration for Disaster Management

This guide explains how to integrate NASA's Earth Observatory Natural Event Tracker (EONET) API v3 into our Next.js-based Disaster Management application to track and display natural disasters globally.

## Table of Contents
- [Overview](#overview)
- [Setup and Installation](#setup-and-installation)
- [API Integration](#api-integration)
- [Component Implementation](#component-implementation)
- [Features](#features)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

## Overview

NASA's EONET API provides a curated source of continuously updated natural event data including:
- Wildfires
- Severe storms
- Volcanic activity
- Floods
- Droughts
- Earthquakes
- and more

This integration will enhance our disaster management platform by providing real-time natural disaster information from NASA's satellite and ground observation systems.

## Setup and Installation

### Prerequisites
- Next.js project with TypeScript support
- React 18+
- Node.js 16+

### Required Dependencies
Install the following packages for map visualization:

```bash
npm install leaflet react-leaflet
# or
yarn add leaflet react-leaflet
```

## API Integration

### Core API Utilities

Create a utility file at `app/utils/eonet-api.ts`:

```typescript
// Base URL for the EONET API
const EONET_BASE_URL = 'https://eonet.gsfc.nasa.gov/api/v3';

// Interface for event data
export interface EONETEvent {
  id: string;
  title: string;
  description: string | null;
  link: string;
  closed: string | null;
  categories: {
    id: string;
    title: string;
  }[];
  sources: {
    id: string;
    url: string;
  }[];
  geometry: {
    date: string;
    type: string;
    coordinates: number[] | number[][];
  }[];
  magnitudeValue?: number;
  magnitudeUnit?: string;
}

// Interface for categories
export interface EONETCategory {
  id: string;
  title: string;
  description: string;
  link: string;
  layers: string;
}

// Function to fetch all events with optional parameters
export async function fetchEvents(params: {
  status?: 'open' | 'closed' | 'all';
  category?: string;
  source?: string;
  limit?: number;
  days?: number;
  start?: string;
  end?: string;
  bbox?: string;
} = {}) {
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.category) queryParams.append('category', params.category);
  if (params.source) queryParams.append('source', params.source);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.days) queryParams.append('days', params.days.toString());
  if (params.start) queryParams.append('start', params.start);
  if (params.end) queryParams.append('end', params.end);
  if (params.bbox) queryParams.append('bbox', params.bbox);
  
  const url = `${EONET_BASE_URL}/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }
    const data = await response.json();
    return data.events as EONETEvent[];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Function to fetch event by ID
export async function fetchEventById(id: string) {
  const url = `${EONET_BASE_URL}/events/${id}`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`Failed to fetch event ${id}: ${response.statusText}`);
    }
    return await response.json() as EONETEvent;
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error);
    return null;
  }
}

// Function to fetch categories
export async function fetchCategories() {
  const url = `${EONET_BASE_URL}/categories`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 86400 } }); // Cache for 24 hours
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    const data = await response.json();
    return data.categories as EONETCategory[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Function to fetch events in GeoJSON format
export async function fetchEventsGeoJSON(params: {
  status?: 'open' | 'closed' | 'all';
  category?: string;
  source?: string;
  limit?: number;
  days?: number;
} = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.category) queryParams.append('category', params.category);
  if (params.source) queryParams.append('source', params.source);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.days) queryParams.append('days', params.days.toString());
  
  const url = `${EONET_BASE_URL}/events/geojson${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error(`Failed to fetch GeoJSON events: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching GeoJSON events:', error);
    return null;
  }
}
```

## Component Implementation

### Creating a Disaster Map Component

Create a map component that displays disaster events geographically:

```typescript
// app/components/DisasterMap.tsx
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';
import { EONETEvent } from '../utils/eonet-api';

// Fix Leaflet icon issue in Next.js
useEffect(() => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}, []);

interface DisasterMapProps {
  events: EONETEvent[];
  height?: string;
  center?: [number, number];
  zoom?: number;
}

// Category color mapping
const getCategoryColor = (categoryId: string) => {
  const colors: { [key: string]: string } = {
    drought: '#EDC170',
    dustHaze: '#CEB992',
    earthquakes: '#FF5A5F',
    floods: '#3498DB',
    landslides: '#8B4513',
    manmade: '#34495E',
    seaLakeIce: '#AED6F1',
    severeStorms: '#9B59B6',
    snow: '#FFFFFF',
    tempExtremes: '#E74C3C',
    volcanoes: '#E25822',
    waterColor: '#21618C',
    wildfires: '#E67E22',
  };
  
  return colors[categoryId] || '#3388ff'; // Default blue if category not found
};

export default function DisasterMap({ events, height = '500px', center = [20, 0], zoom = 2 }: DisasterMapProps) {
  const router = useRouter();

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        minZoom={1.5}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {events.map(event => {
          // Get the latest geometry point for the event
          const latestGeo = event.geometry[0];
          const categoryId = event.categories[0]?.id || '';
          const color = getCategoryColor(categoryId);
          
          if (!latestGeo) return null;
          
          if (latestGeo.type === 'Point') {
            const lat = latestGeo.coordinates[1];
            const lon = latestGeo.coordinates[0];
            
            return (
              <CircleMarker 
                key={event.id}
                center={[lat, lon]}
                radius={6}
                pathOptions={{ color, fillOpacity: 0.7 }}
                eventHandlers={{
                  click: () => {
                    router.push(`/disasters/event/${event.id}`);
                  }
                }}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    <p className="text-sm mt-1">
                      Date: {new Date(latestGeo.date).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      {event.categories.map(cat => (
                        <span 
                          key={cat.id}
                          style={{ backgroundColor: `${getCategoryColor(cat.id)}30` }}
                          className="inline-block text-xs px-2 py-1 rounded mr-1 mb-1"
                        >
                          {cat.title}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => router.push(`/disasters/event/${event.id}`)}
                      className="mt-2 text-sm text-blue-500 hover:underline"
                    >
                      View details
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          }
          
          // Handle polygon geometries if needed
          if (latestGeo.type === 'Polygon') {
            const positions = latestGeo.coordinates[0].map(
              coords => [coords[1], coords[0]] as [number, number]
            );
            
            return (
              <Polygon 
                key={event.id}
                positions={positions}
                pathOptions={{ color, fillOpacity: 0.3 }}
                eventHandlers={{
                  click: () => {
                    router.push(`/disasters/event/${event.id}`);
                  }
                }}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    <p className="text-sm mt-1">
                      Date: {new Date(latestGeo.date).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      {event.categories.map(cat => (
                        <span 
                          key={cat.id}
                          style={{ backgroundColor: `${getCategoryColor(cat.id)}30` }}
                          className="inline-block text-xs px-2 py-1 rounded mr-1 mb-1"
                        >
                          {cat.title}
                        </span>
                      ))}
                    </div>
                    <button 
                      onClick={() => router.push(`/disasters/event/${event.id}`)}
                      className="mt-2 text-sm text-blue-500 hover:underline"
                    >
                      View details
                    </button>
                  </div>
                </Popup>
              </Polygon>
            );
          }
          
          return null;
        })}
      </MapContainer>
    </div>
  );
}
```

### Creating a Disaster Events List Page

Create a page to display recent disaster events:

```typescript
// app/disasters/page.tsx
import { fetchEvents, fetchCategories } from '../utils/eonet-api';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import the map component dynamically with no SSR since Leaflet requires browser APIs
const DisasterMap = dynamic(() => import('../components/DisasterMap'), { ssr: false });

export default async function DisastersPage() {
  // Fetch the first 15 open events
  const events = await fetchEvents({ status: 'open', limit: 15 });
  const categories = await fetchCategories();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Natural Disaster Tracker</h1>
      
      {/* Map View */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Global Disaster Map</h2>
        <div className="h-[500px] rounded-lg overflow-hidden border">
          <DisasterMap events={events} />
        </div>
      </div>
      
      {/* Categories Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Link 
              key={category.id} 
              href={`/disasters/category/${category.id}`}
              className="bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-blue-800 transition-colors"
            >
              {category.title}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Event List */}
      <h2 className="text-xl font-semibold mb-4">Recent Natural Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => (
          <Link href={`/disasters/event/${event.id}`} key={event.id}>
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-lg mb-2">{event.title}</h3>
              
              {/* Event categories */}
              <div className="flex flex-wrap gap-2 mb-3">
                {event.categories.map(category => (
                  <span 
                    key={category.id}
                    className="bg-gray-100 text-xs px-2 py-1 rounded"
                  >
                    {category.title}
                  </span>
                ))}
              </div>
              
              {/* Date information */}
              <p className="text-sm text-gray-500">
                Latest update: {new Date(event.geometry[0].date).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

## Features

This EONET API integration provides the following features:

1. **Real-time Disaster Tracking** - Display up-to-date information about natural disasters worldwide
2. **Interactive Map** - View disasters on an interactive map with location markers
3. **Categorical Filtering** - Filter disasters by type (wildfires, earthquakes, floods, etc.)
4. **Detailed Event Information** - Access comprehensive data about each event including:
   - Event timeline
   - Geographic data
   - Severity information
   - Source links
5. **Temporal Querying** - Search for events based on date ranges

## Usage Examples

### Fetching Recent Events by Category

```typescript
import { fetchEvents } from '../utils/eonet-api';

// Get recent wildfires
const wildfires = await fetchEvents({
  status: 'open',
  category: 'wildfires',
  limit: 10
});

// Get events from last 30 days
const recentEvents = await fetchEvents({
  days: 30,
  status: 'all'
});
```

### Displaying a Single Event

```typescript
// app/disasters/event/[id]/page.tsx
import { fetchEventById } from '@/app/utils/eonet-api';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Import the map component dynamically
const EventMap = dynamic(() => import('@/app/components/EventMap'), { ssr: false });

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await fetchEventById(params.id);
  
  if (!event) {
    return <div>Event not found</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <Link href="/disasters" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Back to Disaster Tracker
      </Link>
      
      <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Event Details</h2>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Event ID:</strong> {event.id}</p>
            <p><strong>Status:</strong> {event.closed ? 'Closed' : 'Open'}</p>
            
            <div className="mt-2">
              <strong>Categories:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {event.categories.map(category => (
                  <span 
                    key={category.id}
                    className="bg-blue-100 px-2 py-1 text-sm rounded text-blue-800"
                  >
                    {category.title}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-3">
              <strong>Sources:</strong>
              <ul className="list-disc list-inside mt-1">
                {event.sources.map(source => (
                  <li key={source.id}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {source.id}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Event Map</h2>
          <div className="h-[300px] rounded-lg overflow-hidden">
            <EventMap event={event} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Map not displaying**
   - Ensure Leaflet is properly imported and using client-side rendering
   - Confirm you're using dynamic imports with `{ ssr: false }`
   - Verify that the container element has a defined height

2. **API calls failing**
   - Check network connectivity
   - Verify that the EONET API endpoint is correct
   - Ensure query parameters are properly formatted

3. **TypeScript errors**
   - Make sure the interface definitions match the actual API response format
   - Use optional chaining when accessing nested properties that might be undefined

### Performance Optimization

For better performance:

1. Use appropriate caching strategies (as shown with `revalidate` option)
2. Limit the number of events fetched and displayed at once
3. Use pagination for large datasets
4. Implement proper error boundaries for API failures

## Resources

- [NASA EONET API Documentation](https://eonet.gsfc.nasa.gov/docs/v3)
- [NASA EONET API How-to Guide](https://eonet.gsfc.nasa.gov/how-to-guide)
- [React Leaflet Documentation](https://react-leaflet.js.org/)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
