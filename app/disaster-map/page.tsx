'use client';

// Force dynamic rendering to prevent static export issues
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon, Marker, Tooltip } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HomeButton } from "@/components/home-button";
import { Loader2, AlertTriangle, Info, AlertCircle, Home } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Types for EONET API responses
interface EONETEvent {
  id: string;
  title: string;
  description: string | null;
  link: string;
  closed: string | null;
  categories: Array<{
    id: string;
    title: string;
  }>;
  sources: Array<{
    id: string;
    url: string;
  }>;
  geometry: Array<{
    magnitudeValue: number | null;
    magnitudeUnit: string | null;
    date: string;
    type: string;
    coordinates: number[] | number[][];
  }>;
}

interface EONETCategory {
  id: string;
  title: string;
  link: string;
  description: string | null;
  layers: string | null;
}

interface EONETEventsResponse {
  title: string;
  description: string;
  link: string;
  events: EONETEvent[];
}

interface EONETCategoriesResponse {
  title: string;
  description: string;
  link: string;
  categories: EONETCategory[];
}

// India-specific hazard types
interface IndiaHazardZone {
  id: string;
  type: 'earthquake' | 'flood' | 'drought' | 'cyclone' | 'landslide';
  severity: 'high' | 'medium' | 'low';
  name: string;
  description: string;
  // For points: [longitude, latitude]
  // For polygons: [[longitude, latitude], ...]
  geometry: { type: 'Point' | 'Polygon', coordinates: number[] | number[][] };
}

interface IndiaHazardData {
  lastUpdated: string;
  source: string;
  hazardZones: IndiaHazardZone[];
}

// Constants
const EONET_BASE_URL = 'https://eonet.gsfc.nasa.gov/api/v3';
const DEFAULT_DAYS = 60;

// India's geographical bounds
const INDIA_BOUNDS = {
  north: 37.0,  // Northern-most latitude
  south: 6.5,   // Southern-most latitude
  east: 97.5,   // Eastern-most longitude
  west: 68.0    // Western-most longitude
};

// India's major hazard zones based on historical NASA data and Government of India hazard maps
// These represent areas with documented history of specific disaster types
const INDIA_HAZARD_ZONES: IndiaHazardZone[] = [
  // Earthquake zones
  {
    id: 'eq-1',
    type: 'earthquake',
    severity: 'high',
    name: 'Himalayan Seismic Zone',
    description: 'High-risk seismic zone along the Himalayan belt, particularly vulnerable to major earthquakes.',
    geometry: { type: 'Polygon', coordinates: [
      [77.5, 30.2], [79.8, 30.5], [82.3, 29.8], [84.5, 28.2], [86.9, 27.1], [88.2, 27.5], [90.3, 28.2], [92.1, 27.8], [93.8, 28.1], [95.7, 28.0], [95.9, 29.2], [94.5, 29.8], [92.3, 30.1], [89.8, 30.5], [87.3, 31.2], [84.7, 31.0], [82.1, 31.5], [79.2, 31.8], [76.8, 31.5], [76.5, 30.4]
    ]}
  },
  {
    id: 'eq-2',
    type: 'earthquake',
    severity: 'medium',
    name: 'Gujarat Seismic Zone',
    description: 'Medium to high-risk seismic zone including Kutch and parts of Gujarat.',
    geometry: { type: 'Polygon', coordinates: [
      [68.5, 23.0], [70.2, 23.5], [71.8, 24.2], [72.5, 23.8], [72.3, 22.5], [71.2, 21.8], [70.0, 21.5], [69.0, 22.0], [68.7, 22.5]
    ]}
  },

  // Flood zones
  {
    id: 'fl-1',
    type: 'flood',
    severity: 'high',
    name: 'Ganges Basin Flood Plains',
    description: 'High-risk flood zone covering the Ganges river basin across multiple states.',
    geometry: { type: 'Polygon', coordinates: [
      [77.2, 25.5], [79.8, 26.2], [82.5, 26.8], [84.9, 26.5], [87.3, 25.8], [88.9, 25.1], [89.5, 24.2], [88.7, 23.5], [87.2, 23.2], [85.8, 23.8], [83.5, 24.2], [81.2, 24.5], [78.9, 25.0], [77.5, 25.2]
    ]}
  },
  {
    id: 'fl-2',
    type: 'flood',
    severity: 'high',
    name: 'Brahmaputra Basin',
    description: 'Highly flood-prone region covering Assam and neighboring states.',
    geometry: { type: 'Polygon', coordinates: [
      [89.5, 26.8], [91.8, 27.2], [93.5, 27.0], [95.2, 27.5], [96.0, 26.8], [95.5, 25.5], [94.2, 24.8], [92.8, 24.2], [91.5, 24.5], [90.2, 25.2], [89.8, 26.0]
    ]}
  },

  // Cyclone prone areas
  {
    id: 'cy-1',
    type: 'cyclone',
    severity: 'high',
    name: 'Eastern Coastal Zone',
    description: 'Highly cyclone-prone coastal areas of Odisha, Andhra Pradesh, and West Bengal.',
    geometry: { type: 'Polygon', coordinates: [
      [85.8, 21.5], [86.5, 20.2], [84.8, 18.5], [83.2, 17.0], [82.0, 16.2], [80.8, 15.5], [80.2, 13.8], [79.8, 12.2], [80.2, 11.0], [82.5, 11.8], [84.3, 13.5], [85.5, 15.2], [86.8, 17.0], [87.5, 19.2], [86.5, 21.0]
    ]}
  },
  {
    id: 'cy-2',
    type: 'cyclone',
    severity: 'medium',
    name: 'Western Coastal Zone',
    description: 'Medium-risk cyclone zone covering parts of Gujarat, Maharashtra, Goa, and Kerala.',
    geometry: { type: 'Polygon', coordinates: [
      [72.0, 22.5], [72.8, 20.8], [73.2, 18.5], [73.8, 16.2], [74.2, 14.0], [74.8, 12.5], [75.5, 11.0], [77.5, 8.5], [77.0, 8.2], [73.8, 8.8], [72.5, 12.5], [71.8, 15.2], [71.2, 18.0], [70.8, 20.5], [71.5, 22.2]
    ]}
  },

  // Drought-prone areas
  {
    id: 'dr-1',
    type: 'drought',
    severity: 'high',
    name: 'Deccan Plateau Drought Zone',
    description: 'Drought-prone areas covering parts of Maharashtra, Karnataka, and Telangana.',
    geometry: { type: 'Polygon', coordinates: [
      [73.5, 19.2], [74.8, 17.5], [76.2, 16.8], [77.5, 15.5], [78.8, 14.8], [79.5, 16.2], [80.2, 17.5], [79.8, 18.8], [78.5, 19.5], [76.8, 19.8], [75.2, 20.2], [74.0, 19.8]
    ]}
  },
  {
    id: 'dr-2',
    type: 'drought',
    severity: 'medium',
    name: 'Rajasthan Arid Zone',
    description: 'Drought-prone arid region covering western Rajasthan.',
    geometry: { type: 'Polygon', coordinates: [
      [70.5, 26.8], [71.8, 28.5], [73.2, 29.2], [74.5, 28.8], [75.2, 27.5], [74.8, 26.2], [73.5, 25.5], [72.2, 25.0], [71.0, 24.8], [70.2, 25.5], [70.0, 26.2]
    ]}
  },

  // Landslide zones
  {
    id: 'ls-1',
    type: 'landslide',
    severity: 'high',
    name: 'Western Ghats Landslide Zone',
    description: 'High-risk landslide zones covering parts of the Western Ghats in Kerala and Tamil Nadu.',
    geometry: { type: 'Polygon', coordinates: [
      [75.8, 13.2], [76.5, 12.0], [77.2, 10.8], [77.0, 9.5], [76.2, 8.8], [75.5, 9.0], [75.2, 10.2], [74.8, 11.5], [75.0, 12.8]
    ]}
  },
  {
    id: 'ls-2',
    type: 'landslide',
    severity: 'high',
    name: 'Himalayan Landslide Zone',
    description: 'High-risk landslide areas in Himachal Pradesh, Uttarakhand, Sikkim, and Northeast India.',
    geometry: { type: 'Polygon', coordinates: [
      [77.2, 30.8], [78.5, 31.2], [80.2, 30.8], [82.0, 30.2], [83.5, 29.5], [85.2, 28.8], [87.0, 28.2], [88.5, 27.8], [90.2, 27.5], [92.0, 28.0], [93.5, 28.2], [93.2, 27.0], [91.8, 26.5], [90.0, 26.8], [88.5, 27.0], [86.8, 27.2], [85.0, 27.8], [83.2, 28.5], [81.5, 29.2], [79.8, 29.5], [78.2, 30.0], [77.0, 30.2]
    ]}
  }
];

// Function to get color for hazard type
const getHazardColor = (type: IndiaHazardZone['type'], severity: IndiaHazardZone['severity']) => {
  const baseColors = {
    earthquake: '#d94e4e',  // Red
    flood: '#4287f5',       // Blue
    drought: '#e09f3e',     // Yellow/Orange
    cyclone: '#9a73c7',     // Purple
    landslide: '#8a5a44'    // Brown
  };
  
  // Adjust opacity based on severity
  const opacities = {
    high: 0.8,
    medium: 0.6,
    low: 0.4
  };
  
  return {
    color: baseColors[type],
    fillOpacity: opacities[severity]
  };
};

// Color mapping for different event categories
const categoryColors: Record<string, string> = {
  drought: '#E5B726',
  dustHaze: '#E5C726',
  earthquakes: '#D65C4F',
  floods: '#2E94E8',
  landslides: '#9C432D',
  manmade: '#6D49CB',
  seaLakeIce: '#ACDEFF',
  severeStorms: '#51ADFF',
  snow: '#FFFFFF',
  tempExtremes: '#EC5766',
  volcanoes: '#F76A14',
  waterColor: '#46A4FF',
  wildfires: '#FF6128',
  default: '#AAAAAA'
};

export default function DisasterMap() {
  const [events, setEvents] = useState<EONETEvent[]>([]);
  const [categories, setCategories] = useState<EONETCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDays, setSelectedDays] = useState<number>(DEFAULT_DAYS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('map');
  
  // State for hazard layer controls
  const [showHazards, setShowHazards] = useState<boolean>(true);
  const [activeHazardTypes, setActiveHazardTypes] = useState<Record<IndiaHazardZone['type'], boolean>>({ 
    earthquake: true,
    flood: true,
    drought: true,
    cyclone: true,
    landslide: true
  });

  // Helper to get color for category
  const getCategoryColor = (categoryId: string): string => {
    return categoryColors[categoryId] || categoryColors.default;
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${EONET_BASE_URL}/categories`);
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }
        const data: EONETCategoriesResponse = await response.json();
        setCategories(data.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load event categories. Please try again later.');
      }
    };

    fetchCategories();
  }, []);

  // Fetch events based on filters and filter for India
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('days', selectedDays.toString());
        params.append('status', 'open');
        
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        
        const response = await fetch(`${EONET_BASE_URL}/events?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.statusText}`);
        }
        
        const data: EONETEventsResponse = await response.json();
        
        // Filter events that occur within India's boundaries
        const indiaEvents = data.events.filter(event => {
          // Check if at least one geometry point is within India's boundaries
          return event.geometry.some(geo => {
            if (geo.type === 'Point') {
              // For points, coordinates is [longitude, latitude]
              const coordinates = geo.coordinates as number[];
              const lon = coordinates[0];
              const lat = coordinates[1];
              
              return (
                lat >= INDIA_BOUNDS.south && 
                lat <= INDIA_BOUNDS.north && 
                lon >= INDIA_BOUNDS.west && 
                lon <= INDIA_BOUNDS.east
              );
            } else if (geo.type === 'Polygon') {
              try {
                // For polygons, coordinates should be a nested array structure
                // First cast to unknown to avoid direct type errors
                const coordinates = geo.coordinates as unknown;
                
                // Verify we have a properly structured array
                if (Array.isArray(coordinates) && 
                    Array.isArray(coordinates[0]) && 
                    Array.isArray(coordinates[0][0])) {
                  
                  // Now safely cast to the appropriate type
                  const polygonCoordinates = coordinates[0] as number[][];
                  
                  // Check if any vertex of the polygon is within India's boundaries
                  return polygonCoordinates.some(coord => {
                    if (Array.isArray(coord) && coord.length >= 2) {
                      const lon = coord[0] as number;
                      const lat = coord[1] as number;
                      
                      return (
                        lat >= INDIA_BOUNDS.south && 
                        lat <= INDIA_BOUNDS.north && 
                        lon >= INDIA_BOUNDS.west && 
                        lon <= INDIA_BOUNDS.east
                      );
                    }
                    return false;
                  });
                }
              } catch (e) {
                console.error('Error processing polygon coordinates:', e);
              }
              return false;
            }
            return false;
          });
        });
        
        setEvents(indiaEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load disaster events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategory, selectedDays]);

  // Render a point geometry
  const renderPoint = (geometry: any, event: EONETEvent) => {
    const coordinates = geometry.coordinates;
    const [lon, lat] = coordinates;
    const color = getCategoryColor(event.categories[0]?.id);
    
    return (
      <CircleMarker 
        key={`${event.id}-${geometry.date}`}
        center={[lat, lon]} 
        radius={5} 
        pathOptions={{ color, fillOpacity: 0.7 }}
      >
        <Popup>
          <div>
            <h3 className="font-bold">{event.title}</h3>
            <p className="text-sm">Category: {event.categories[0]?.title}</p>
            <p className="text-sm">Date: {new Date(geometry.date).toLocaleDateString()}</p>
            {geometry.magnitudeValue && (
              <p className="text-sm">
                Magnitude: {geometry.magnitudeValue} {geometry.magnitudeUnit}
              </p>
            )}
            <a 
              href={event.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              View Source
            </a>
          </div>
        </Popup>
      </CircleMarker>
    );
  };

  // Render a polygon geometry
  const renderPolygon = (geometry: any, event: EONETEvent) => {
    const coordinates = geometry.coordinates[0];
    const positions = coordinates.map((coord: number[]) => [coord[1], coord[0]]);
    const color = getCategoryColor(event.categories[0]?.id);
    
    return (
      <Polygon 
        key={`${event.id}-${geometry.date}`}
        positions={positions} 
        pathOptions={{ color, fillOpacity: 0.3 }}
      >
        <Popup>
          <div>
            <h3 className="font-bold">{event.title}</h3>
            <p className="text-sm">Category: {event.categories[0]?.title}</p>
            <p className="text-sm">Date: {new Date(geometry.date).toLocaleDateString()}</p>
            <a 
              href={event.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              View Source
            </a>
          </div>
        </Popup>
      </Polygon>
    );
  };
  
  // Render hazard zone
  const renderHazardZone = (hazard: IndiaHazardZone) => {
    if (!activeHazardTypes[hazard.type]) return null;
    
    try {
      // Get styling based on hazard type and severity
      const { color, fillOpacity } = getHazardColor(hazard.type, hazard.severity);
      
      if (hazard.geometry.type === 'Polygon') {
        // For polygons, convert the coordinates array
        const coordinates = hazard.geometry.coordinates as number[][];
        
        // Convert [lon, lat] to [lat, lon] for Leaflet
        // Explicitly type as [number, number][] to satisfy Leaflet's LatLngExpression
        const positions: [number, number][] = coordinates.map(coord => [
          coord[1] as number, 
          coord[0] as number
        ]);
        
        return (
          <Polygon
            key={hazard.id}
            positions={positions}
            pathOptions={{ 
              color, 
              fillColor: color, 
              fillOpacity, 
              weight: 2 
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{hazard.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${color}20`,
                      color: color
                    }}
                  >
                    {hazard.type.charAt(0).toUpperCase() + hazard.type.slice(1)}
                  </span>
                  <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    {hazard.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm mt-2">{hazard.description}</p>
              </div>
            </Popup>
          </Polygon>
        );
      }
    } catch (e) {
      console.error('Error rendering hazard zone:', e);
    }
    
    return null;
  };
  
  // Toggle hazard type visibility
  const toggleHazardType = (type: IndiaHazardZone['type']) => {
    setActiveHazardTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 dark:text-white">India Disaster Map</h1>
        <p className="text-muted-foreground mb-6">
          View real-time natural disaster events in India from NASA's Earth Observatory Natural Event Tracker (EONET)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters and Event List */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Refine the disaster events in India displayed on the map</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Time Period (Days)</label>
                <Select 
                  value={selectedDays.toString()} 
                  onValueChange={(value) => setSelectedDays(parseInt(value))}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="60">Last 60 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Events in India</CardTitle>
              <CardDescription>
                {loading ? 'Loading events...' : `${events.length} events found in India`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              ) : events.length === 0 ? (
                <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <Info className="h-5 w-5 text-blue-500 mr-2" />
                  <p className="text-sm">No events found for the selected filters.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {events.map(event => (
                    <div 
                      key={event.id} 
                      className="p-3 border border-border rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      <div className="flex items-center mt-1">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: getCategoryColor(event.categories[0]?.id) }}
                        ></div>
                        <span className="text-xs text-muted-foreground">
                          {event.categories[0]?.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.geometry[0]?.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Map and Data Tabs */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-xl font-semibold">India Disaster Events Visualization</h2>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="map">Map View</TabsTrigger>
                  <TabsTrigger value="data">Data View</TabsTrigger>
                </TabsList>
                <TabsContent value="map" className="m-0">
                {loading ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                ) : (
                  <div style={{ height: '600px', width: '100%' }} className="rounded-md overflow-hidden relative">
                    {/* Compact hazard zone legend - now on upper right */}
                    <div className="absolute top-3 right-3 z-[1000] bg-white dark:bg-gray-900 p-2 rounded-md shadow-md opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-xs font-semibold">Hazard Zones</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="text-[10px]">Earthquake</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-[10px]">Flood</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            <span className="text-[10px]">Drought</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            <span className="text-[10px]">Cyclone</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                            <span className="text-[10px]">Landslide</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Reset map button - positioned on lower left */}
                    <div className="absolute bottom-6 left-6 z-[1000]">
                      <Button
                        size="icon"
                        className="rounded-full h-10 w-10 shadow-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          // This will reset the URL parameters and trigger a page refresh
                          // which is a reliable way to reset the map state
                          window.history.pushState({}, '', window.location.pathname);
                          window.location.reload();
                        }}
                        title="Reset Map"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                          <path d="M3 3v5h5"></path>
                        </svg>
                        <span className="sr-only">Reset Map</span>
                      </Button>
                    </div>
                    
                    <MapContainer 
                      center={[22, 82]} 
                      zoom={5} 
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                      maxBounds={[
                        [INDIA_BOUNDS.south - 5, INDIA_BOUNDS.west - 5],
                        [INDIA_BOUNDS.north + 5, INDIA_BOUNDS.east + 5]
                      ]}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {/* Add India's boundary rectangle for reference */}
                      <Polygon 
                        positions={[
                          [INDIA_BOUNDS.north, INDIA_BOUNDS.west],
                          [INDIA_BOUNDS.north, INDIA_BOUNDS.east],
                          [INDIA_BOUNDS.south, INDIA_BOUNDS.east],
                          [INDIA_BOUNDS.south, INDIA_BOUNDS.west],
                        ]} 
                        pathOptions={{ color: '#3f6212', weight: 2, fillOpacity: 0, dashArray: '5, 5' }}
                      />
                      
                      {/* Render hazard zones permanently */}
                      {INDIA_HAZARD_ZONES.map(hazard => renderHazardZone(hazard))}
                      
                      {/* Render NASA EONET event data */}
                      {events.map(event => 
                        event.geometry.map(geo => {
                          if (geo.type === 'Point') {
                            return renderPoint(geo, event);
                          } else if (geo.type === 'Polygon') {
                            return renderPolygon(geo, event);
                          }
                          return null;
                        })
                      )}
                    </MapContainer>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="data" className="m-0">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                    <div className="col-span-2">Title</div>
                    <div>Category</div>
                    <div>Date</div>
                    <div>Actions</div>
                  </div>
                  
                  {loading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="p-4">
                      <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    </div>
                  ) : events.length === 0 ? (
                    <div className="p-4">
                      <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <Info className="h-5 w-5 text-blue-500 mr-2" />
                        <p className="text-sm">No events found for the selected filters.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {events.map(event => (
                        <div key={event.id} className="grid grid-cols-5 gap-4 p-4 hover:bg-accent/50 transition-colors">
                          <div className="col-span-2 font-medium">{event.title}</div>
                          <div>
                            <span 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs"
                              style={{ 
                                backgroundColor: `${getCategoryColor(event.categories[0]?.id)}20`,
                                color: getCategoryColor(event.categories[0]?.id) 
                              }}
                            >
                              {event.categories[0]?.title}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(event.geometry[0]?.date).toLocaleDateString()}
                          </div>
                          <div>
                            <a 
                              href={event.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline"
                            >
                              View Source
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Data provided by <a href="https://eonet.gsfc.nasa.gov" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NASA EONET API</a> • Showing only disasters within India's geographical boundaries
      </div>
    </div>
  );
}
