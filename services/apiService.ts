// services/apiService.ts - RECTIFIED

import { supabase } from '../supabaseClient';
import { Route, LiveVehicle, Report } from '../types';

// ===================================================================
// NEW: Submit a new report to the database
// ===================================================================
export const submitReport = async (reportData: Omit<Report, 'id' | 'upvotes' | 'verified' | 'reporterId' | 'time'>): Promise<Report | null> => {
    const { data, error } = await supabase
        .from('reports')
        .insert([
            { ...reportData } // We can add reporterId here later when we have user login
        ])
        .select()
        .single();
    
    if (error) {
        console.error("Error submitting report:", error);
        return null;
    }
    return data as Report;
};


// ===================================================================
// UPDATED: Get all reports now fetches from Supabase
// ===================================================================
export const getReports = async (): Promise<Report[]> => {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false }); // Show newest first

    if (error) {
        console.error("Error fetching reports:", error);
        return [];
    }
    // We format the timestamp for easy display
    return data.map(r => ({ ...r, time: new Date(r.created_at).toLocaleTimeString() })) as Report[];
};


// ===================================================================
// NEW: Get all reports for a specific vehicle ID
// ===================================================================
export const getReportsForVehicle = async (vehicleId: string): Promise<Report[]> => {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching reports for vehicle ${vehicleId}:`, error);
        return [];
    }
    return data.map(r => ({ ...r, time: new Date(r.created_at).toLocaleTimeString() })) as Report[];
}


// --- Full code for unchanged functions to allow copy-paste ---
export const getRoutes = async (): Promise<Route[]> => {
    const { data, error } = await supabase.from('routes').select('*');
    if (error) { console.error("Error fetching routes:", error); return []; }
    return data as Route[];
};
export const findRoutes = async (from: string, to: string): Promise<Route[]> => {
    const { data, error } = await supabase.rpc('find_routes_with_stops', { from_stop: from, to_stop: to });
    if (error) { console.error("Error finding routes:", error); return []; }
    return data as Route[];
};
export const getVehicles = async (): Promise<LiveVehicle[]> => {
    const { data, error } = await supabase.from('vehicles').select('*');
    if (error) { console.error("Error fetching vehicles:", error); return []; }
    return data.map(v => ({ ...v, routeDetails: { destination: 'N/A', nextStop: 'N/A', time: 'N/A', distance: 'N/A' }, timeline: [] })) as LiveVehicle[];
}
export const subscribeToVehicleUpdates = (callback: (vehicles: LiveVehicle[]) => void): (() => void) => {
    const fetchInitialData = async () => { const initialVehicles = await getVehicles(); callback(initialVehicles); };
    fetchInitialData();
    const subscription = supabase.channel('public:vehicles').on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => { fetchInitialData(); }).subscribe();
    return (): void => { supabase.removeChannel(subscription); };
};