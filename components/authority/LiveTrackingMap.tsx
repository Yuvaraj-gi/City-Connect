import React, { useRef, useEffect, useState } from 'react';
import { Vehicle, Route } from '../../types';
import BusIcon from '../icons/BusIcon';

interface LiveTrackingMapProps {
    selectedVehicle: Vehicle | null;
    vehicles: Vehicle[];
    routes: Route[];
    onVehicleSelect: (vehicle: Vehicle | null) => void;
}

const PlusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const MinusIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
);

const HomeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
    </svg>
);

const getPinColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'On road': return 'bg-indigo-600 text-white';
      case 'Failure': return 'bg-red-500 text-white';
      case 'Pause': return 'bg-yellow-500 text-black';
      default: return 'bg-slate-400 text-white';
    }
};

// Map boundary coordinates for Chennai
const latMin = 12.97;
const latMax = 13.09;
const lngMin = 80.17;
const lngMax = 80.29;

const getVehiclePosition = (vehicle: Vehicle) => {
    const top = ((vehicle.lat - latMin) / (latMax - latMin)) * 100;
    const left = ((vehicle.lng - lngMin) / (lngMax - lngMin)) * 100;
    return { top: `${top}%`, left: `${left}%` };
};

const coordsToPoints = (coords: { lat: number, lng: number }[]) => {
    return coords.map(c => {
        const y = ((c.lat - latMin) / (latMax - latMin)) * 100;
        const x = ((c.lng - lngMin) / (lngMax - lngMin)) * 100;
        return `${x},${y}`;
    }).join(' ');
};

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ selectedVehicle, vehicles, routes, onVehicleSelect }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [hoveredVehicleId, setHoveredVehicleId] = useState<string | null>(null);
    
    useEffect(() => {
        if (selectedVehicle) {
            setZoomLevel(1.5);
        } else {
            setZoomLevel(1);
        }
    }, [selectedVehicle?.id]);

    const handleZoomIn = () => setZoomLevel(z => Math.min(z + 0.25, 2.5));
    const handleZoomOut = () => setZoomLevel(z => Math.max(z - 0.25, 1));
    const handleResetView = () => onVehicleSelect(null);

    const mapScale = selectedVehicle ? zoomLevel : 1;
    
    const transformOrigin = selectedVehicle
        ? `${getVehiclePosition(selectedVehicle).left} ${getVehiclePosition(selectedVehicle).top}`
        : '50% 50%';
        
    const coordToPoint = (coord: { lat: number, lng: number }) => {
        const y = ((coord.lat - latMin) / (latMax - latMin)) * 100;
        const x = ((coord.lng - lngMin) / (lngMax - lngMin)) * 100;
        return { x, y };
    };

    return (
        <div className="relative flex-1 bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div 
                ref={mapRef} 
                className="w-full h-full transition-transform duration-700 ease-in-out"
                style={{ 
                    transform: `scale(${mapScale})`,
                    transformOrigin
                }}
            >
                <img 
                    src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/80.23,13.03,11,0/1000x800@2x?access_token=pk.eyJ1IjoiZGVqZXZkZXNpZ24iLCJhIjoiY2s4bWwwN2s2MGR2ZTNscGU2aW9mb3p6MyJ9.psoUBAc_92V2A0_y2fk4dw"
                    alt="Map of Chennai area" 
                    className="w-full h-full object-cover"
                />
                
                <svg className="absolute inset-0 w-full h-full" style={{ transform: 'translate3d(0,0,0)' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                    {routes.map(route => {
                        const isSelectedRoute = selectedVehicle?.routeId === route.id;
                        const isAnyVehicleSelected = !!selectedVehicle;

                        return (
                            <polyline
                                key={route.id}
                                points={coordsToPoints(route.stopsCoords)}
                                fill="none"
                                stroke={isSelectedRoute ? '#4F46E5' : '#94a3b8'}
                                strokeWidth={isSelectedRoute ? 0.8 / mapScale : 0.4 / mapScale}
                                strokeOpacity={isAnyVehicleSelected ? (isSelectedRoute ? 0.9 : 0.3) : 0.6}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-300"
                            />
                        )
                    })}
                     {/* Render stop markers for selected route */}
                    {selectedVehicle && (() => {
                        const route = routes.find(r => r.id === selectedVehicle.routeId);
                        if (!route) return null;
                        
                        return route.stopsCoords.map((coord, index) => {
                            const { x, y } = coordToPoint(coord);
                            const stopName = route.stops[index];

                            return (
                                <g key={`stop-${route.id}-${index}`} className="group" style={{ cursor: 'pointer' }}>
                                    {/* Larger transparent circle for easier hover */}
                                    <circle cx={x} cy={y} r={1.2 / mapScale} fill="transparent" />
                                    
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={0.6 / mapScale}
                                        fill="#fff"
                                        stroke="#4F46E5"
                                        strokeWidth={0.25 / mapScale}
                                        className="transition-all duration-300 group-hover:fill-indigo-200"
                                    />
                                    <text
                                        x={x}
                                        y={y - 1.5 / mapScale}
                                        fontSize={1.5 / mapScale}
                                        fill="#1e293b" // slate-800
                                        textAnchor="middle"
                                        className="font-semibold transition-all duration-300 opacity-0 group-hover:opacity-100 dark:fill-slate-100"
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        {stopName}
                                    </text>
                                </g>
                            );
                        });
                    })()}
                </svg>

                {vehicles.map(vehicle => {
                    const route = routes.find(r => r.id === vehicle.routeId);
                    const isSelected = selectedVehicle?.id === vehicle.id;
                    const isHovered = hoveredVehicleId === vehicle.id;
                    return (
                        <button
                            key={vehicle.id}
                            onClick={() => onVehicleSelect(vehicle)}
                            onMouseEnter={() => setHoveredVehicleId(vehicle.id)}
                            onMouseLeave={() => setHoveredVehicleId(null)}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-[top,left] duration-1000 ease-linear ${isSelected ? 'z-20' : 'z-10'}`}
                            style={getVehiclePosition(vehicle)}
                            aria-label={`Select vehicle ${vehicle.id}`}
                        >
                            <div 
                                className={`relative flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ${getPinColor(vehicle.status)} ${isSelected ? 'w-8 h-8 ring-4 ring-white dark:ring-slate-800 pulse-animate' : 'w-6 h-6 ring-2 ring-white/50 opacity-70 hover:opacity-100 hover:scale-110 hover:shadow-xl'}`}
                                style={{ transform: `scale(${1 / mapScale})` }}
                                title={`${vehicle.id} - ${route?.name}`}
                            >
                                <BusIcon className={isSelected ? 'w-5 h-5' : 'w-4 h-4'} />
                            </div>
                            {(isSelected || isHovered) && (
                                <div 
                                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1.5 rounded-lg shadow-xl text-center z-20 dark:bg-slate-800 dark:border dark:border-slate-700"
                                    style={{ transform: `scale(${1 / mapScale}) translateY(${mapScale * 8}px)`, transformOrigin: 'top center' }}
                                >
                                    <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{vehicle.id}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{route?.name}</p>
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            <div className="absolute bottom-4 right-4 z-30 flex flex-col space-y-2">
                <button onClick={handleZoomIn} disabled={!selectedVehicle} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full shadow-lg border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"><PlusIcon /></button>
                <button onClick={handleZoomOut} disabled={!selectedVehicle} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full shadow-lg border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"><MinusIcon /></button>
                <button onClick={handleResetView} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full shadow-lg border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition mt-2"><HomeIcon /></button>
            </div>
        </div>
    );
};

export default LiveTrackingMap;
