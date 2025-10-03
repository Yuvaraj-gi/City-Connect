// components/passenger/CrowdsourcedReports.tsx - RECTIFIED FOR NOTIFICATIONS

import React, { useState, useEffect, useMemo } from 'react';
import { users } from '../../data';
import { Report, UserReputation, Vehicle } from '../../types';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import useLocalStorage from '../../hooks/useLocalStorage';
import toast from 'react-hot-toast'; // <- Import the notification library
import { getReports, submitReport, getVehicles } from '../../services/apiService';
// ... other imports ...

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

    useEffect(() => {
        // This effect now correctly refreshes data when coming online.
        if (isOnline) {
            setIsLoading(true);
            Promise.all([getReports(), getVehicles()]).then(([fetchedReports, fetchedVehicles]) => {
                setSyncedReports(fetchedReports);
                setVehicles(fetchedVehicles);
                setIsLoading(false);
            });
        } else {
            // Offline: show nothing from server, rely on cache for vehicles
            setSyncedReports([]);
            setIsLoading(false);
        }
    }, [isOnline]); // It re-runs whenever the online status changes.

    useEffect(() => {
        if (vehicles.length > 0 && !reportVehicleId) { setReportVehicleId(vehicles[0].id); }
    }, [vehicles]);

    const handleSubmit = async () => {
        if (!reportLocation || !reportDescription || !reportVehicleId) {
            return toast.error("Please fill out all fields.");
        }
        setIsSubmitting(true);
        const newReportData = { type: reportType, location: reportLocation, description: reportDescription, vehicle_id: reportVehicleId };

        if (isOnline) {
            const submittedReport = await submitReport(newReportData);
            if (submittedReport) {
                toast.success("Report submitted successfully!");
                setSyncedReports(prev => [{ ...submittedReport, time: new Date(submittedReport.created_at!).toLocaleTimeString(), isSynced: true }, ...prev]);
            } else {
                toast.error("Failed to submit report.");
            }
        } else {
            const tempId = `offline_${Date.now()}`;
            setPendingReports(prev => [...prev, { tempId, ...newReportData }]);
            toast.success("Report saved offline. It will sync automatically when you're back online.");
        }

        setReportLocation(''); setReportDescription(''); setIsSubmitting(false);
    };

    // ... The rest of the component is correct ...
};

// --- Full code for copy-paste (including all helper components) ---
import SpinnerIcon from '../icons/SpinnerIcon';
import CloudArrowUpIcon from '../icons/CloudArrowUpIcon';
import ShieldCheckIcon from '../icons/ShieldCheckIcon';
const CrowdsourcedReportsFull: React.FC<CrowdsourcedReportsProps> = ({ isOnline }) => {
    const [syncedReports, setSyncedReports] = useState<Report[]>([]);
    const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('vehicles-cache', []);
    const [isLoading, setIsLoading] = useState(true);
    const { pendingReports, setPendingReports } = useOfflineQueue();
    const [reportType, setReportType] = useState<'Traffic' | 'Breakdown' | 'Overcrowded' | 'Other'>('Traffic');
    const [reportLocation, setReportLocation] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportVehicleId, setReportVehicleId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => { setIsLoading(true); if (isOnline) { Promise.all([getReports(), getVehicles()]).then(([fetchedReports, fetchedVehicles]) => { setSyncedReports(fetchedReports); setVehicles(fetchedVehicles); setIsLoading(false); }); } else { setSyncedReports([]); setIsLoading(false); } }, [isOnline]);
    useEffect(() => { if (vehicles.length > 0 && !reportVehicleId) { setReportVehicleId(vehicles[0].id); } }, [vehicles]);
    const handleSubmit = async () => { if (!reportLocation || !reportDescription || !reportVehicleId) { return toast.error("Please fill out all fields."); } setIsSubmitting(true); const newReportData = { type: reportType, location: reportLocation, description: reportDescription, vehicle_id: reportVehicleId }; if (isOnline) { const submittedReport = await submitReport(newReportData); if (submittedReport) { toast.success("Report submitted successfully!"); setSyncedReports(prev => [{ ...submittedReport, time: new Date(submittedReport.created_at!).toLocaleTimeString(), isSynced: true }, ...prev]); } else { toast.error("Failed to submit report."); } } else { const tempId = `offline_${Date.now()}`; setPendingReports(prev => [...prev, { tempId, ...newReportData }]); toast.success("Report saved offline. It will sync automatically."); } setReportLocation(''); setReportDescription(''); setIsSubmitting(false); };
    const allVisibleReports = useMemo(() => { const pending = pendingReports.map(p => ({ id: p.tempId, isSynced: false, time: new Date().toLocaleTimeString(), upvotes: 0, verified: false, reporterId: 'offline', ...p } as Report)); return [...pending, ...syncedReports]; }, [syncedReports, pendingReports]);
    return ( <div> <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Crowdsourced Reports</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> <div className="md:col-span-1 space-y-4"> <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Submit a Report</h4> <div className="p-4 bg-slate-50 rounded-lg border space-y-4 dark:bg-slate-800/50 dark:border-slate-700"> <div> <label htmlFor="vehicle">Bus Number</label> <select id="vehicle" value={reportVehicleId} onChange={e => setReportVehicleId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"> {vehicles.map(v => <option key={v.id} value={v.id}>{v.id}</option>)} </select> </div> <div> <label htmlFor="type">Report Type</label> <select id="type" value={reportType} onChange={e => setReportType(e.target.value as any)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"> <option>Traffic</option><option>Breakdown</option><option>Overcrowded</option><option>Other</option> </select> </div> <div> <label htmlFor="location">Location</label> <input type="text" id="location" value={reportLocation} onChange={e => setReportLocation(e.target.value)} placeholder="e.g., Near Marina Beach" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" /> </div> <div> <label htmlFor="description">Description</label> <textarea id="description" rows={3} value={reportDescription} onChange={e => setReportDescription(e.target.value)} placeholder="Add a short description..." className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"></textarea> </div> <button onClick={handleSubmit} disabled={isSubmitting} className="w-full flex justify-center items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:bg-indigo-400"> {isSubmitting ? <SpinnerIcon /> : 'Submit Report'} </button> </div> </div> <div className="md:col-span-1 space-y-4"> <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Live Feed</h4> <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 -mr-2"> {isLoading ? <><ReportCardSkeleton /><ReportCardSkeleton /></> : allVisibleReports.length === 0 ? <p>No reports yet.</p> : ( allVisibleReports.map(report => ( <ReportCard key={report.id} report={report} reputation={users.find(u => u.id === report.reporterId)?.reputation || 'Newbie'} /> )) )} </div> </div> </div> </div> );
};
const ReportCard: React.FC<{ report: Report; reputation: UserReputation }> = ({ report, reputation }) => { const typeColors = { Traffic: 'bg-orange-100', Breakdown: 'bg-red-100', Overcrowded: 'bg-yellow-100', Other: 'bg-slate-100' }; return ( <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border dark:border-slate-700"> <div className="flex items-center justify-between mb-2"> <div className="flex items-center space-x-2"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${typeColors[report.type]}`}>{report.type}</span><ReputationBadge reputation={reputation} /></div> {!report.isSynced && <div className="flex items-center text-xs font-semibold text-amber-600 dark:text-amber-400 animate-pulse"><CloudArrowUpIcon className="w-4 h-4 mr-1"/><span>Pending Sync</span></div>} </div> <h4 className="font-bold text-slate-800 dark:text-slate-100">{report.description}</h4> <p className="text-sm">{report.vehicle_id}</p> <p className="text-xs mt-1">{report.time} - at {report.location}</p> </div> ); };
const ReportCardSkeleton: React.FC = () => ( <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border dark:border-slate-700 animate-pulse"><div className="space-y-3"><div className="h-4 bg-slate-200 rounded w-1/4"></div><div className="h-5 bg-slate-200 rounded w-3/4"></div><div className="h-4 bg-slate-200 rounded w-full"></div></div></div> );
const ReputationBadge: React.FC<{ reputation: UserReputation }> = ({ reputation }) => { if (reputation === 'Newbie') return null; return ( <span>{reputation}</span> ); };
export default CrowdsourcedReportsFull;