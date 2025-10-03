// components/authority/VehicleListPanel.tsx - RECTIFIED

import React, { useState, useMemo } from 'react';
import { Vehicle, Route } from '../../types';
import SearchIcon from '../icons/SearchIcon';
import FilterIcon from '../icons/FilterIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';

interface VehicleListPanelProps {
    vehicles: Vehicle[];
    routes: Route[];
    selectedVehicle: Vehicle | null;
    onVehicleSelect: (vehicleId: string | null) => void;
}

const VehicleListPanel: React.FC<VehicleListPanelProps> = ({ vehicles, routes, selectedVehicle, onVehicleSelect }) => {
    const itemRefs = React.useRef<Map<string, HTMLLIElement | null>>(new Map());
    const [searchQuery, setSearchQuery] = useState('');

    React.useEffect(() => {
        if (selectedVehicle) {
            const node = itemRefs.current.get(selectedVehicle.id);
            if (node) {
                node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [selectedVehicle]);

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(v => 
            v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (v.driver as { name: string })?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [vehicles, searchQuery]);

    return (
        <div className="w-full lg:w-96 h-1/3 lg:h-full border-b lg:border-r lg:border-b-0 border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-800 flex-shrink-0">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Live Fleet ({filteredVehicles.length})</h2>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="w-5 h-5 text-slate-400" /></div>
                    <input 
                        type="text" 
                        placeholder="Search for ID or Driver..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                    />
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                <ul>
                    {filteredVehicles.map(vehicle => {
                        const route = routes.find(r => r.id === vehicle.routeId);
                        const isSelected = selectedVehicle?.id === vehicle.id;
                        return (
                             <li 
                                key={vehicle.id}
                                ref={(el) => { itemRefs.current.set(vehicle.id, el); }}
                                onClick={() => onVehicleSelect(vehicle.id)}
                                className={`p-4 border-b border-slate-200 cursor-pointer transition-colors dark:border-slate-700 ${isSelected ? 'bg-indigo-100 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                            >
                                <div className="relative">
                                     {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-900 dark:text-slate-100">{vehicle.id}</h3>
                                        <StatusBadge status={vehicle.status} />
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium dark:text-slate-400 mt-1">{route?.name || 'Unassigned'}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Driver: <span className="font-semibold text-slate-800 dark:text-slate-200">{(vehicle.driver as { name: string })?.name}</span></p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    );
};

// --- Full code for unchanged component ---
const StatusBadge: React.FC<{ status: Vehicle['status'] }> = ({ status }) => { const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider"; const styles = { 'On road': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400', 'Failure': 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400', 'Pause': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400', }; return <span className={`${baseClasses} ${styles[status]}`}> {status} </span>; };
export default VehicleListPanel;