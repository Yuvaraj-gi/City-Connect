// components/passenger/LiveTracker.tsx - FINAL INTERACTIVE MAP VERSION

import React, { useState, useEffect } from 'react';
import { routes } from '../../data';
import { Route, LiveVehicle, Report } from '../../types';
import BusIcon from '../icons/BusIcon';
import { subscribeToVehicleUpdates, getReportsForVehicle } from '../../services/apiService';
import SpinnerIcon from '../icons/SpinnerIcon';

// NEW: Imports for the interactive map
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';


// This function creates our custom bus icon for the map
const createBusIcon = (status: LiveVehicle['status']) => {
  const pinColor = status === 'Failure' ? '#EF4444' : status === 'Pause' ? '#F59E0B' : '#4F46E5';
  
  const iconHtml = ReactDOMServer.renderToString(
    <div style={{
      backgroundColor: pinColor,
      padding: '5px',
      borderRadius: '50%',
      boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
      border: '2px solid white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <BusIcon className="w-4 h-4 text-white" />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon', // an empty class name is needed
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};


interface LiveTrackerProps {
  isEmergencyMode: boolean;
}

const LiveTracker: React.FC<LiveTrackerProps> = ({ isEmergencyMode }) => {
  const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<LiveVehicle | null>(null);
  const [vehicleReports, setVehicleReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToVehicleUpdates(updatedVehicles => {
        setLiveVehicles(updatedVehicles);
        if (isLoading) setIsLoading(false);
    });
    return () => unsubscribe();
  }, [isLoading]);

  useEffect(() => {
      if (selectedVehicle) {
          const updatedSelected = liveVehicles.find(v => v.id === selectedVehicle.id);
          if (updatedSelected) setSelectedVehicle(updatedSelected);
          
          const fetchReports = async () => {
              setIsLoadingReports(true);
              const reports = await getReportsForVehicle(selectedVehicle.id);
              setVehicleReports(reports);
              setIsLoadingReports(false);
          };
          fetchReports();
      } else {
          setVehicleReports([]);
      }
  }, [liveVehicles, selectedVehicle?.id]);

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Live Vehicle Tracker</h3>
      <div className="h-[60vh] max-h-[700px] bg-slate-200 rounded-xl overflow-hidden relative border-2 border-slate-300 shadow-inner dark:bg-slate-700 dark:border-slate-600">
         {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800">
                <SpinnerIcon className="w-12 h-12 text-indigo-500"/>
                <p className="mt-4 text-slate-500 dark:text-slate-400">Connecting to live vehicle feed...</p>
            </div>
         ) : (
            // THE MAIN CHANGE: We replace the static image with the interactive MapContainer
            <MapContainer center={[13.0827, 80.2707]} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {liveVehicles.map(vehicle => (
                <Marker
                  key={vehicle.id}
                  position={[vehicle.lat, vehicle.lng]}
                  icon={createBusIcon(vehicle.status)}
                  eventHandlers={{
                    click: () => {
                      setSelectedVehicle(vehicle);
                    },
                  }}
                >
                  <Popup>
                    <b>{vehicle.id}</b><br />
                    Status: {vehicle.status}<br />
                    Location: {vehicle.location}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
         )}
        
        {/* The vehicle details panel is unchanged and will work with the new map */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-500 ease-in-out ${selectedVehicle ? 'translate-y-0' : 'translate-y-full'} z-[1000]`}>
            <div className="bg-white/80 backdrop-blur-md dark:bg-slate-800/80 p-4 rounded-xl shadow-2xl border dark:border-slate-700/50 max-w-lg mx-auto">
                {selectedVehicle ? (
                     <div>
                         <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{selectedVehicle.id}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{routes.find(r => r.id === selectedVehicle.routeId)?.name}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getStatusTextColor(selectedVehicle.status)}`}>{selectedVehicle.status}</span>
                         </div>
                         <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-slate-500 dark:text-slate-400">Location</p><p className="font-semibold text-slate-700 dark:text-slate-200">{selectedVehicle.location}</p></div>
                            <div><p className="text-slate-500 dark:text-slate-400">Next Stop</p><p className="font-semibold text-slate-700 dark:text-slate-200">{selectedVehicle.routeDetails.nextStop}</p></div>
                         </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                            <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Live Reports for this Bus</h5>
                            {isLoadingReports ? ( <p className="text-xs text-center text-slate-500">Loading reports...</p> ) : 
                             vehicleReports.length > 0 ? (
                                <div className="space-y-2 max-h-24 overflow-y-auto">
                                    {vehicleReports.map(report => (
                                        <div key={report.id} className="text-xs p-2 bg-slate-100 rounded-md dark:bg-slate-700/50">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{report.type}: <span className="font-normal">{report.description}</span></p>
                                            <p className="text-slate-500 dark:text-slate-400">{report.location} - {report.time}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : ( <p className="text-xs text-center text-slate-500">No reports for this vehicle.</p> )}
                        </div>
                         <button onClick={() => setSelectedVehicle(null)} className="w-full mt-4 text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Deselect</button>
                    </div>
                ) : (
                    <p className="text-center text-sm text-slate-600 dark:text-slate-300 py-4">Select a vehicle on the map to see details.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Full code for unchanged parts ---
const getStatusTextColor = (status: LiveVehicle['status']) => { switch (status) { case 'On road': return 'text-green-600 dark:text-green-400'; case 'Failure': return 'text-red-600 dark:text-red-400'; case 'Pause': return 'text-orange-500 dark:text-orange-400'; default: return 'text-slate-600 dark:text-slate-400'; } };

export default LiveTracker;