// components/passenger/CrowdsourcedReports.tsx - FINAL VERIFIED OFFLINE VERSION

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { users } from '../../data';
import { Report, UserReputation, Vehicle } from '../../types';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import useLocalStorage from '../../hooks/useLocalStorage';
import CloudArrowUpIcon from '../icons/CloudArrowUpIcon';
import { getReports, submitReport, getVehicles } from '../../services/apiService';
import SpinnerIcon from '../icons/SpinnerIcon';
import ShieldCheckIcon from '../icons/ShieldCheckIcon';

// This component now correctly receives and uses the live online status from the main App.
interface CrowdsourcedReportsProps {
    isOnline: boolean;
}

const CrowdsourcedReports: React.FC<CrowdsourcedReportsProps> = ({ isOnline }) => {
    const [syncedReports, setSyncedReports] = useState<Report[]>([]);
    const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('vehicles-cache', []);
    const [isLoading, setIsLoading] = useState(true);
    const { pendingReports, setPendingReports } = useOfflineQueue();

    const [reportType, setReportType] = useState<'Traffic' | 'Breakdown' | 'Overcrowded' | 'Other'>('Traffic');
    const [reportLocation, setReportLocation] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportVehicleId, setReportVehicleId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // This helps us track the previous online state to detect when we come back online.
    const wasOffline = useRef(!isOnline);

    // This single, powerful function fetches all necessary data.
    const fetchData = async () => {
        setIsLoading(true);
        if (isOnline) {
            console.log("Fetching latest data from server...");
            const [fetchedReports, fetchedVehicles] = await Promise.all([getReports(), getVehicles()]);
            setSyncedReports(fetchedReports);
            setVehicles(fetchedVehicles); // Update the cache
        } else {
            console.log("Offline mode: Loading from cache.");
            setSyncedReports([]);
        }
        setIsLoading(false);
    };
    
    // Effect 1: Fetch data on initial component load.
    useEffect(() => {
        fetchData();
    }, []);

    // Effect 2: THE KEY FIX FOR SYNCING.
    // This watches for the app coming back online.
    useEffect(() => {
        // This condition is true ONLY the moment the app transitions from offline to online.
        if (isOnline && wasOffline.current) {
            console.log("Connection restored! Re-fetching all reports to update the UI after sync.");
            fetchData(); 
        }
        // Update the ref for the next render.
        wasOffline.current = !isOnline;
    }, [isOnline]);
    
    useEffect(() => {
        if (vehicles.length > 0 && !reportVehicleId) {
            setReportVehicleId(vehicles[0].id);
        }
    }, [vehicles]);

    // THIS IS THE KEY FUNCTION, NOW USING THE `isOnline` PROP CORRECTLY.
    const handleSubmit = async () => {
        if (!reportLocation || !reportDescription || !reportVehicleId) {
            alert("Please fill out all fields."); return;
        }
        setIsSubmitting(true);
        const newReportData = { type: reportType, location: reportLocation, description: reportDescription, vehicle_id: reportVehicleId, isSynced: isOnline };

        // **THE LOGIC FIX IS HERE:** A clear, simple decision.
        if (isOnline) {
            console.log("ONLINE MODE: Submitting report directly to Supabase...");
            const submittedReport = await submitReport(newReportData);
            if (submittedReport) {
                setSyncedReports(prev => [{ ...submittedReport, time: new Date(submittedReport.created_at!).toLocaleTimeString(), isSynced: true }, ...prev]);
            }
        } else {
            console.log("OFFLINE MODE: Adding report to the pending sync queue...");
            const tempId = `offline_${Date.now()}`;
            setPendingReports(prev => [...prev, { tempId, ...newReportData }]);
        }

        setReportLocation(''); setReportDescription(''); setIsSubmitting(false);
    };

    const allVisibleReports = useMemo(() => {
        const pending = pendingReports.map(p => ({
            id: p.tempId, isSynced: false, time: new Date().toLocaleTimeString(), upvotes: 0, verified: false, reporterId: 'offline', ...p
        } as Report));
        return [...pending, ...syncedReports];
    }, [syncedReports, pendingReports]);

    return (
        <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Crowdsourced Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1 space-y-4">
                     <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Submit a Report</h4>
                    <div className="p-4 bg-slate-50 rounded-lg border space-y-4 dark:bg-slate-800/50 dark:border-slate-700">
                        <div>
                            <label htmlFor="vehicle" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bus Number</label>
                            <select id="vehicle" value={reportVehicleId} onChange={e => setReportVehicleId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                                {vehicles.length === 0 && <option disabled>No buses available offline</option>}
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.id}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Report Type</label>
                            <select id="type" value={reportType} onChange={e => setReportType(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                                <option>Traffic</option><option>Breakdown</option><option>Overcrowded</option><option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
                            <input type="text" id="location" value={reportLocation} onChange={e => setReportLocation(e.target.value)} placeholder="e.g., Near Marina Beach" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                            <textarea id="description" rows={3} value={reportDescription} onChange={e => setReportDescription(e.target.value)} placeholder="Add a short description..." className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"></textarea>
                        </div>
                         <button onClick={handleSubmit} disabled={isSubmitting} className="w-full flex justify-center items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:bg-indigo-400">
                            {isSubmitting ? <SpinnerIcon /> : 'Submit Report'}
                        </button>
                    </div>
                </div>
                <div className="md:col-span-1 space-y-4">
                     <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Live Feed</h4>
                     <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 -mr-2">
                        {isLoading ? ( <><ReportCardSkeleton /><ReportCardSkeleton /></> ) : 
                        allVisibleReports.length === 0 ? (<p className="text-center text-slate-500 mt-8">No reports yet.</p>) :
                        (
                            allVisibleReports.map(report => (
                                <ReportCard 
                                    key={report.id} 
                                    report={report} 
                                    reputation={users.find(u => u.id === report.reporterId)?.reputation || 'Newbie'}
                                />
                            ))
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

// ... Helper components are unchanged and correct ...
const ReportCard: React.FC<{ report: Report; reputation: UserReputation }> = ({ report, reputation }) => {
    const typeColors = { Traffic: 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-300', Breakdown: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300', Overcrowded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300', Other: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' };
    return ( <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border dark:border-slate-700"><div className="flex items-center justify-between mb-2"><div className="flex items-center space-x-2 flex-wrap gap-y-1"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${typeColors[report.type]}`}>{report.type}</span><ReputationBadge reputation={reputation} /></div>{!report.isSynced && (<div className="flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 animate-pulse"><CloudArrowUpIcon className="w-4 h-4 mr-1"/><span>Pending Sync</span></div>)}</div><h4 className="font-bold text-slate-800 dark:text-slate-100">{report.description}</h4><p className="text-sm text-slate-600 dark:text-slate-400">Vehicle: {report.vehicle_id}</p><p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{report.time} - at {report.location}</p></div> );
};
const ReportCardSkeleton: React.FC = () => ( <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border dark:border-slate-700 flex space-x-4 animate-pulse"><div className="flex-1 space-y-3"><div className="flex items-center space-x-2"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div></div><div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-lg"></div><div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-lg"></div></div></div> );
const ReputationBadge: React.FC<{ reputation: UserReputation }> = ({ reputation }) => { if (reputation === 'Newbie') return null; const styles = { Trusted: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300', Regular: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300', }; return ( <span className={`flex items-center space-x-1 px-2 py-0.5 text-xs font-semibold rounded-full ${styles[reputation]}`}> {reputation === 'Trusted' && <ShieldCheckIcon className="w-3 h-3" />} <span>{reputation} Reporter</span> </span> ); };

export default CrowdsourcedReports;