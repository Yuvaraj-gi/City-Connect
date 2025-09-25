// types.ts - RECTIFIED

import * as React from 'react';

export enum UserRole {
  Passenger,
  Authority,
}

export type PassengerViewType = 'finder' | 'tracker' | 'ticketing' | 'reports' | 'ai' | 'settings';
export type AuthorityViewType = 'analytics' | 'vehicles' | 'live-tracking' | 'chat' | 'driver-mode' | 'settings';

export interface AuthorityNavItem {
  id: AuthorityViewType;
  icon: React.ReactElement;
  label: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  homeAddress?: string;
  workAddress?: string;
  notifications?: {
    serviceAlerts: boolean;
    proximityAlerts: boolean;
    promotions: boolean;
  }
}

export interface Route {
  id: string;
  name: string;
  from: string;
  to: string;
  fare: number;
  average_eta_minutes: number;
  stops: string[];
  stopsCoords: { lat: number; lng: number }[];
}

export interface Vehicle {
  id: string;
  type: string;
  status: 'On road' | 'Failure' | 'Pause';
  location: string;
  lat: number;
  lng: number;
  driver: {
    name: string;
    phone: string;
  };
  routeId: string;
}

export interface LiveVehicle extends Vehicle {
  routeDetails: {
    destination: string;
    nextStop: string;
    time: string;
    distance: string;
  };
  timeline: {
    time: string;
    location: string;
    event: string;
    details?: string;
  }[];
}

export interface Ticket {
  id: string;
  routeId: string;
  routeName: string;
  passengerCount: number;
  totalFare: number;
  purchaseDate: string;
  validUntil: string;
  isSynced: boolean;
  transactionId: string;
  signature: string;
  status: 'active' | 'validated';
  validatedAt?: string;
  validatedOnBus?: string;
}

export type UserReputation = 'Newbie' | 'Regular' | 'Trusted';

export interface User {
  id: string;
  name: string;
  reputation: UserReputation;
}

export interface Report {
  id: string; // Will be a temporary ID when offline
  type: 'Traffic' | 'Breakdown' | 'Overcrowded' | 'Other';
  location: string;
  description: string;
  upvotes: number;
  verified: boolean;
  reporterId: string;
  time: string;
  vehicle_id?: string;
  created_at?: string; // The real timestamp from Supabase
  isSynced: boolean; // <- THE NEW OFFLINE FIELD
}