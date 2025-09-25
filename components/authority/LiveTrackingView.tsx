import React, { useState, useEffect, useMemo } from 'react';
import { vehicles, routes } from '../../data';
import { Vehicle, Route, LiveVehicle } from '../../types';
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
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

    useEffect(() => {
        // Set initial vehicle ID only once
        if (initialVehicleId) {
            setSelectedVehicleId(initialVehicleId);
        } else if (vehicles.length > 0) {
            setSelectedVehicleId(vehicles[0].id);
        }
    }, [initialVehicleId]);

    useEffect(() => {
        const unsubscribe = subscribeToVehicleUpdates(updatedVehicles => {
            setLiveVehicles(updatedVehicles);
            if (isLoading) {
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, [isLoading]);

    const handleVehicleSelect = (vehicle: Vehicle | null) => {
        setSelectedVehicleId(prevId => 
            prevId === vehicle?.id ? null : vehicle?.id || null
        );
    };

    const handleCloseDetails = () => {
        setSelectedVehicleId(null);
    }

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
        <div className="relative flex flex-col lg:flex-row flex-1 overflow-hidden h-full">
            <VehicleListPanel 
                vehicles={liveVehicles}
                routes={routes}
                selectedVehicle={selectedVehicle}
                onVehicleSelect={handleVehicleSelect}
            />
            <div className="h-2/3 lg:h-full flex-1 flex relative overflow-hidden">
                <LiveTrackingMap 
                    selectedVehicle={selectedVehicle} 
                    vehicles={liveVehicles} 
                    routes={routes}
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