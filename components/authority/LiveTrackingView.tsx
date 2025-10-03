// components/authority/LiveTrackingView.tsx - FINAL LAYOUT & FUNCTIONALITY FIX

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { routes } from '../../data';
import { LiveVehicle, Route } from '../../types';
import VehicleListPanel from './VehicleListPanel';
import VehicleDetailsPanel from './VehicleDetailsPanel';
import LiveTrackingMap from './LiveTrackingMap';
import { subscribeToVehicleUpdates } from '../../services/apiService';
import SpinnerIcon from '../icons/SpinnerIcon';

interface LiveTrackingViewProps {
    initialVehicleId: string | null;
}

const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({ initialVehicleId }) => {
    const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([]);
    const [allRoutes, setAllRoutes] = useState<Route[]>(routes); // Use dummy routes for now
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(initialVehicleId);

    useEffect(() => {
        let isMounted = true;
        const handleVehicleUpdate = (updatedVehicles: LiveVehicle[]) => {
            if (isMounted) {
                setLiveVehicles(updatedVehicles);
                if (isLoading) setIsLoading(false);
            }
        };

        const unsubscribe = subscribeToVehicleUpdates(handleVehicleUpdate);

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [isLoading]);

    // THE FIX FOR THE PANEL: By using useCallback, we prevent unnecessary re-renders
    // that were breaking the details panel.
    const handleVehicleSelect = useCallback((vehicleId: string | null) => {
        setSelectedVehicleId(prevId => (prevId === vehicleId ? null : vehicleId));
    }, []);

    const handleCloseDetails = useCallback(() => {
        setSelectedVehicleId(null);
    }, []);

    const selectedVehicle = useMemo(() => {
        return liveVehicles.find(v => v.id === selectedVehicleId) || null;
    }, [liveVehicles, selectedVehicleId]);

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <SpinnerIcon className="w-12 h-12 text-indigo-500"/>
                <p className="mt-4 text-slate-500 dark:text-slate-400">Initializing live tracking system...</p>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 flex flex-col lg:flex-row">
            <VehicleListPanel 
                vehicles={liveVehicles}
                routes={allRoutes}
                selectedVehicle={selectedVehicle}
                onVehicleSelect={handleVehicleSelect}
            />
            <div className="flex-1 relative">
                <LiveTrackingMap 
                    selectedVehicle={selectedVehicle} 
                    vehicles={liveVehicles} 
                    routes={allRoutes}
                    onVehicleSelect={handleVehicleSelect}
                />
            </div>
            <VehicleDetailsPanel 
                vehicle={selectedVehicle}
                onClose={handleCloseDetails}
            />
        </div>
    );
};

export default LiveTrackingView;