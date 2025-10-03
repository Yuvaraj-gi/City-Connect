// components/authority/LiveTrackingMap.tsx - FINAL POPUP VERSION

import React from 'react';
import { LiveVehicle, Route } from '../../types';
import BusIcon from '../icons/BusIcon';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import ReactDOMServer from 'react-dom/server';

// This function creates our custom bus icon.
const createBusIcon = (status: LiveVehicle['status'], isSelected: boolean) => {
    const pinColor = status === 'Failure' ? '#EF4444' : status === 'Pause' ? '#F59E0B' : '#4F46E5';
    const size = isSelected ? 38 : 30;
    const iconHtml = ReactDOMServer.renderToString(
        <div style={{ backgroundColor: pinColor, padding: '5px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.5)', border: '3px solid white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <BusIcon className={`w-${isSelected ? 5 : 4} h-${isSelected ? 5 : 4} text-white`} />
        </div>
    );
    return L.divIcon({ html: iconHtml, className: 'custom-leaflet-icon', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
};

interface LiveTrackingMapProps {
    selectedVehicle: LiveVehicle | null;
    vehicles: LiveVehicle[];
    routes: Route[];
    onVehicleSelect: (vehicleId: string | null) => void;
}

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ selectedVehicle, vehicles, routes, onVehicleSelect }) => {
    
    // This helper component automatically pans the map when a vehicle is selected from the list.
    const MapFlyTo: React.FC<{ vehicle: LiveVehicle | null }> = ({ vehicle }) => {
        const map = useMap();
        React.useEffect(() => {
            if (vehicle) {
                map.flyTo([vehicle.lat, vehicle.lng], 14);
            }
        }, [vehicle, map]);
        return null;
    };

    return (
        <MapContainer center={[13.0827, 80.2707]} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapFlyTo vehicle={selectedVehicle} />

            {/* Draw the route line for the selected vehicle */}
            {selectedVehicle && (
                <Polyline 
                    pathOptions={{ color: '#4F46E5', weight: 5, opacity: 0.7 }}
                    positions={routes.find(r => r.id === selectedVehicle.routeId)?.stopsCoords || []}
                />
            )}

            {/* Plot all the vehicle markers on the map */}
            {vehicles.map(vehicle => {
                const isSelected = selectedVehicle?.id === vehicle.id;
                const route = routes.find(r => r.id === vehicle.routeId);
                const driver = vehicle.driver as { name: string, phone: string };

                return (
                    <Marker
                        key={vehicle.id}
                        position={[vehicle.lat, vehicle.lng]}
                        icon={createBusIcon(vehicle.status, isSelected)}
                        zIndexOffset={isSelected ? 1000 : 0}
                        eventHandlers={{ click: () => onVehicleSelect(vehicle.id) }}
                    >
                        {/* 
                            THIS IS THE MAIN FIX.
                            The Popup component is a built-in feature of react-leaflet.
                            It will automatically appear when a marker is clicked.
                        */}
                        <Popup>
                            <div className="font-sans">
                                <h3 className="font-bold text-base mb-1">{vehicle.id}</h3>
                                <p><strong>Status:</strong> {vehicle.status}</p>
                                <p><strong>Location:</strong> {vehicle.location}</p>
                                <p><strong>Route:</strong> {route?.name || 'Unassigned'}</p>
                                <p><strong>Driver:</strong> {driver?.name || 'N/A'}</p>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default LiveTrackingMap;
