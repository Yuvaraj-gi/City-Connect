// services/apiService.ts - FINAL CORRECTED VERSION

import { supabase } from '../supabaseClient';
import { Route, LiveVehicle, Report, UserProfile, Ticket } from '../types';

// ===================================================================
// getMyTickets - THE FIX IS HERE
// ===================================================================
export const getMyTickets = async (): Promise<Ticket[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        // THE FIX: This now uses 'purchase_date' which matches our new, correct database table.
        .order('purchase_date', { ascending: false }); 
    
    if (error) { 
        console.error("Error fetching tickets:", error); 
        return []; 
    }
    return data as Ticket[];
};


// --- All other functions are unchanged, but included for easy copy-paste ---
export const getRoutes = async (): Promise<Route[]> => { const { data, error } = await supabase.from('routes').select('*'); if (error) { console.error("Error fetching routes:", error); return []; } return data as Route[]; };
export const findRoutes = async (from: string, to: string): Promise<Route[]> => { const { data, error } = await supabase.rpc('find_routes_with_stops', { from_stop: from, to_stop: to }); if (error) { console.error("Error finding routes:", error); return []; } return data as Route[]; };
export const getVehicles = async (): Promise<LiveVehicle[]> => { const { data, error } = await supabase.from('vehicles').select('*'); if (error) { console.error("Error fetching vehicles:", error); return []; } return data.map(v => ({ ...v, routeDetails: { destination: 'N/A', nextStop: 'N/A', time: 'N/A', distance: 'N/A' }, timeline: [] })) as LiveVehicle[]; };
export const subscribeToVehicleUpdates = (callback: (vehicles: LiveVehicle[]) => void): (() => void) => { const fetchInitialData = async () => { const initialVehicles = await getVehicles(); callback(initialVehicles); }; fetchInitialData(); const subscription = supabase.channel('public:vehicles').on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => { fetchInitialData(); }).subscribe(); return (): void => { supabase.removeChannel(subscription); }; };
export const submitReport = async (reportData: Omit<Report, 'id' | 'upvotes' | 'verified' | 'reporterId' | 'time' | 'isSynced' | 'created_at'>): Promise<Report | null> => { const { data, error } = await supabase.from('reports').insert([{ ...reportData }]).select().single(); if (error) { console.error("Error submitting report:", error); return null; } return data as Report; };
export const getReports = async (): Promise<Report[]> => { const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false }); if (error) { console.error("Error fetching reports:", error); return []; } return data.map(r => ({ ...r, time: new Date(r.created_at).toLocaleTimeString() })) as Report[]; };
export const getReportsForVehicle = async (vehicleId: string): Promise<Report[]> => { const { data, error } = await supabase.from('reports').select('*').eq('vehicle_id', vehicleId).order('created_at', { ascending: false }); if (error) { console.error(`Error fetching reports for vehicle ${vehicleId}:`, error); return []; } return data.map(r => ({ ...r, time: new Date(r.created_at).toLocaleTimeString() })) as Report[]; };
export const getProfile = async (): Promise<UserProfile | null> => { const { data: { user } } = await supabase.auth.getUser(); if (!user) { return null; } const { data, error } = await supabase.from('profiles').select(`name, phone, home_address, work_address`).eq('id', user.id).single(); if (error) { console.error("Error fetching profile:", error); return null; } return { email: user.email || '', name: data.name, phone: data.phone, homeAddress: data.home_address, workAddress: data.work_address, }; };
export const updateProfile = async (profile: Partial<UserProfile>): Promise<boolean> => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return false; const { error } = await supabase.from('profiles').update({ name: profile.name, phone: profile.phone, home_address: profile.homeAddress, work_address: profile.workAddress }).eq('id', user.id); if (error) { console.error("Error updating profile:", error); return false; } return true; };
export const buyTicket = async (ticketData: Omit<Ticket, 'id' | 'is_synced' | 'transaction_id' | 'signature' | 'status' | 'purchase_date'>): Promise<Ticket | null> => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return null; const purchaseTime = new Date(); const expiryTime = new Date(purchaseTime.getTime() + 2 * 60 * 60 * 1000); const newTicketData = { id: `T${Date.now()}`, ...ticketData, user_id: user.id, purchase_date: purchaseTime.toISOString(), valid_until: expiryTime.toISOString(), transaction_id: `TXN-${Date.now()}`, signature: `SIG-${btoa(JSON.stringify({ id: `T${Date.now()}` })).substring(10, 50)}`, }; const { data, error } = await supabase.from('tickets').insert(newTicketData).select().single(); if (error) { console.error("Error buying ticket:", error); return null; } return data as Ticket; };
export const validateTicket = async (ticketId: string, busName: string): Promise<boolean> => { const { error } = await supabase.from('tickets').update({ status: 'validated', validated_at: new Date().toISOString(), validated_on_bus: busName }).eq('id', ticketId); if (error) { console.error("Error validating ticket:", error); return false; } return true; };