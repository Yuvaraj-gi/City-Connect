import React from 'react';
import { Vehicle } from '../../types';
import PhoneIcon from '../icons/PhoneIcon';
import ChatIcon from '../icons/ChatIcon';

interface VehicleDetailsPanelProps {
    vehicle: Vehicle | null;
    onClose: () => void;
}

const DetailRow: React.FC<{label: string; value: React.ReactNode}> = ({label, value}) => (
    <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-semibold text-slate-800 text-base dark:text-slate-100">{value}</p>
    </div>
);

const TimelineItem: React.FC<{item: Vehicle['timeline'][0]; isLast: boolean}> = ({ item, isLast }) => (
    <li className="flex gap-4">
        <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${item.event.toLowerCase().includes('failure') || item.event.toLowerCase().includes('issue') ? 'bg-red-500' : 'bg-indigo-500'} border-2 border-white dark:border-slate-800 ring-2 ring-slate-200 dark:ring-slate-600 shrink-0`}></div>
            {!isLast && <div className="w-px grow bg-slate-200 dark:bg-slate-700"></div>}
        </div>
        <div className="pb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.time}</p>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{item.location}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{item.event} {item.details && <span className="text-indigo-600 dark:text-indigo-400">{item.details}</span>}</p>
        </div>
    </li>
);

const getStatusChipColor = (status: Vehicle['status']) => {
    switch (status) {
        case 'On road': return 'bg-green-100 text-green-800 ring-green-200 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-500/20';
        case 'Failure': return 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20';
        case 'Pause': return 'bg-yellow-100 text-yellow-800 ring-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-300 dark:ring-yellow-500/20';
        default: return 'bg-slate-100 text-slate-800 ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600';
    }
}

const VehicleDetailsPanel: React.FC<VehicleDetailsPanelProps> = ({ vehicle, onClose }) => {
    const isOpen = !!vehicle;

    return (
        <>
            <div 
                aria-hidden="true"
                className={`absolute inset-0 bg-black/30 z-10 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            <aside 
                className={`absolute bottom-0 right-0 h-auto max-h-[85vh] w-full rounded-t-2xl 
                           lg:top-0 lg:max-h-full lg:h-full lg:w-[450px] lg:rounded-none
                           bg-white border-t lg:border-l lg:border-t-0 border-slate-200 
                           dark:bg-slate-800 dark:border-slate-700
                           shadow-2xl flex flex-col 
                           transition-transform duration-300 ease-in-out z-20 transform ${
                    isOpen
                        ? 'translate-y-0 lg:translate-x-0'
                        : 'translate-y-full lg:translate-y-0 lg:translate-x-full'
                }`}
            >
                {vehicle && (
                    <div key={vehicle.id} className="flex flex-col w-full h-full content-animate-in">
                        {/* Header */}
                        <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                             <div className="lg:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" aria-hidden="true"></div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2 lg:mt-0">{vehicle.id}</h2>
                            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="flex-grow p-6 overflow-y-auto">
                            {/* Status & Driver */}
                            <div className="space-y-4">
                                 <div>
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Status</h3>
                                    <span className={`px-3 py-1 text-sm font-bold rounded-full inline-block ring-1 ${getStatusChipColor(vehicle.status)}`}>
                                        {vehicle.status}
                                    </span>
                                </div>
                                 <div>
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Driver</h3>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">{vehicle.driver.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{vehicle.driver.phone}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full border shadow-sm hover:bg-slate-100 transition dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600"><PhoneIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
                                            <button className="w-10 h-10 flex items-center justify-center bg-white rounded-full border shadow-sm hover:bg-slate-100 transition dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600"><ChatIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Route Details */}
                            <div className="mt-6 pt-6 border-t dark:border-slate-700">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Route Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailRow label="Destination" value={vehicle.routeDetails.destination} />
                                    <DetailRow label="Next Stop" value={vehicle.routeDetails.nextStop} />
                                    <DetailRow label="Est. Time" value={vehicle.routeDetails.time} />
                                    <DetailRow label="Est. Distance" value={vehicle.routeDetails.distance} />
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="mt-6 pt-6 border-t dark:border-slate-700">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Timeline</h3>
                                <ul className="-ml-1">
                                    {vehicle.timeline.map((item, index) => (
                                         <TimelineItem 
                                            key={index} 
                                            item={item}
                                            isLast={index === vehicle.timeline.length - 1}
                                         />
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default VehicleDetailsPanel;