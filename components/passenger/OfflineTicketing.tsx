// components/passenger/OfflineTicketing.tsx - FINAL CORRECTED VERSION

import React, { useState, useMemo, useEffect } from 'react';
import { getRoutes } from '../../services/apiService';
import { Ticket, Route } from '../../types';
import { buyTicket, getMyTickets, validateTicket } from '../../services/apiService';
import TicketDetailsModal from './TicketDetailsModal';
import SpinnerIcon from '../icons/SpinnerIcon';
import TrashIcon from '../icons/TrashIcon';
import TicketIcon from '../icons/TicketIcon';

interface OfflineTicketingProps { isOnline: boolean; }

const OfflineTicketing: React.FC<OfflineTicketingProps> = ({ isOnline }) => {
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [fromStop, setFromStop] = useState<string>('');
  const [toStop, setToStop] = useState<string>('');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const [ticketsFromDb, routesFromDb] = await Promise.all([getMyTickets(), getRoutes()]);
      setMyTickets(ticketsFromDb);
      setAllRoutes(routesFromDb);
      if (routesFromDb.length > 0) {
        setSelectedRouteId(routesFromDb[0].id);
      }
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  const selectedRoute = useMemo(() => allRoutes.find(r => r.id === selectedRouteId), [allRoutes, selectedRouteId]);
  const fromStops = useMemo(() => selectedRoute?.stops || [], [selectedRoute]);
  const toStops = useMemo(() => {
    if (!selectedRoute || !fromStop) return [];
    const fromIndex = selectedRoute.stops.indexOf(fromStop);
    return fromIndex === -1 ? [] : selectedRoute.stops.slice(fromIndex + 1);
  }, [selectedRoute, fromStop]);

  useEffect(() => {
    if (selectedRoute && fromStops.length > 0) {
      setFromStop(fromStops[0]);
    }
  }, [selectedRouteId]);

  useEffect(() => {
    if (toStops.length > 0) {
      setToStop(toStops[0]);
    } else {
      setToStop(''); // Clear 'to' stop if it's no longer valid
    }
  }, [fromStop, selectedRouteId]);

  const totalFare = useMemo(() => {
    if (!selectedRoute || !fromStop || !toStop) return 0;
    const fromIndex = selectedRoute.stops.indexOf(fromStop);
    const toIndex = selectedRoute.stops.indexOf(toStop);
    if (fromIndex === -1 || toIndex === -1) return 0;
    const stopsTravelled = Math.abs(toIndex - fromIndex);
    const baseFare = 10;
    const farePerStop = 2;
    return (baseFare + (stopsTravelled * farePerStop)) * passengerCount;
  }, [selectedRoute, fromStop, toStop, passengerCount]);

  const activeTickets = useMemo(() => myTickets.filter(t => t.status === 'active'), [myTickets]);
  const historyTickets = useMemo(() => myTickets.filter(t => t.status === 'validated'), [myTickets]);

  const handleGenerateTicket = async () => {
    if (!selectedRoute || !isOnline || !fromStop || !toStop) {
      alert("Please select a valid route and stops.");
      return;
    }
    setIsBuying(true);
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 3); // Ticket valid for 3 hours
    const newTicketData = {
        route_id: selectedRoute.id,
        route_name: selectedRoute.name,
        from_stop: fromStop,
        to_stop: toStop,
        passenger_count: passengerCount,
        total_fare: totalFare,
        valid_until: validUntil.toISOString()
    };
    const boughtTicket = await buyTicket(newTicketData);
    if (boughtTicket) {
        setMyTickets([boughtTicket, ...myTickets]);
    } else {
        alert("Failed to buy ticket. Please check the console for errors.");
    }
    setIsBuying(false);
  };

  const handleValidateTicket = async (ticketId: string) => {
    const ticketToValidate = myTickets.find(t => t.id === ticketId);
    if (!ticketToValidate) return;
    const busName = allRoutes.find(r => r.id === ticketToValidate.route_id)?.name || 'Unknown Bus';
    const success = await validateTicket(ticketId, busName);
    if (success) {
        setMyTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'validated', validated_on_bus: busName, validated_at: new Date().toISOString() } : t));
    }
    setSelectedTicket(null);
  };

  const handleClearHistory = () => {
    setMyTickets(prev => prev.filter(t => t.status !== 'validated'));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><SpinnerIcon className="w-8 h-8 text-indigo-500" /></div>;
  }
  
  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Your Tickets</h3>
      <div className="space-y-8">
        <div>
           <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Buy a New Ticket</h4>
           {!isOnline && (<div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm text-center font-medium dark:bg-yellow-500/10 dark:text-yellow-300 mb-4">You must be online to purchase new tickets.</div>)}
          <fieldset disabled={!isOnline || isBuying} className="p-4 bg-slate-50 rounded-xl border space-y-4 dark:bg-slate-800/50 dark:border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed">
            <div>
              <label htmlFor="route" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Route</label>
              <select id="route" value={selectedRouteId} onChange={e => setSelectedRouteId(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                {allRoutes.map(route => <option key={route.id} value={route.id}>{route.name} ({route.from} to {route.to})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fromStop" className="block text-sm font-medium text-slate-700 dark:text-slate-300">From</label>
                <select id="fromStop" value={fromStop} onChange={e => setFromStop(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                  {fromStops.map(stop => <option key={stop} value={stop}>{stop}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="toStop" className="block text-sm font-medium text-slate-700 dark:text-slate-300">To</label>
                <select id="toStop" value={toStop} onChange={e => setToStop(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" disabled={toStops.length === 0}>
                  {toStops.map(stop => <option key={stop} value={stop}>{stop}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="passengers" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Passengers</label>
              <input type="number" id="passengers" min="1" max="10" value={passengerCount} onChange={e => setPassengerCount(parseInt(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"/>
            </div>
            <div className="flex justify-between items-center p-3 bg-indigo-100 rounded-lg dark:bg-indigo-500/10">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Total Fare:</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">₹{totalFare}</span>
            </div>
            <button onClick={handleGenerateTicket} className="w-full flex justify-center items-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
              {isBuying ? <SpinnerIcon /> : 'Generate Ticket'}
            </button>
          </fieldset>
        </div>
        <div className="space-y-8">
            <ActiveTicketsSection tickets={activeTickets} onSelect={setSelectedTicket} />
            <HistoryTicketsSection tickets={historyTickets} onSelect={setSelectedTicket} onClear={handleClearHistory} />
        </div>
      </div>
      <TicketDetailsModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onValidate={handleValidateTicket} />
    </div>
  );
};

// --- THIS IS THE HELPER CODE THAT WAS MISSING ---

const ActiveTicketsSection: React.FC<{ tickets: Ticket[], onSelect: (ticket: Ticket) => void }> = ({ tickets, onSelect }) => (
    <div>
        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Active Tickets</h4>
        {tickets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tickets.map(ticket => (
                    <button key={ticket.id} onClick={() => onSelect(ticket)} className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-indigo-500 transition-all duration-200">
                        <div className="p-4 flex-grow">
                            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{ticket.route_name}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{ticket.from_stop} to {ticket.to_stop}</p>
                            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">₹{ticket.total_fare}</p>
                            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Tap to View & Validate</p>
                        </div>
                    </button>
                ))}
            </div>
        ) : (
            <div className="text-center text-slate-500 dark:text-slate-400 p-6 bg-slate-50 rounded-xl border-dashed border-2 dark:bg-slate-800/50 dark:border-slate-700">
                <p className="font-medium">You have no active tickets.</p>
            </div>
        )}
    </div>
);

const HistoryTicketsSection: React.FC<{ tickets: Ticket[], onSelect: (ticket: Ticket) => void, onClear: () => void }> = ({ tickets, onSelect, onClear }) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">Ticket History</h4>
            {tickets.length > 0 && (
                <button onClick={onClear} className="flex items-center space-x-1 px-2 py-1 text-xs bg-slate-100 text-slate-600 font-semibold rounded-md hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
                    <TrashIcon className="w-3 h-3"/>
                    <span>Clear History</span>
                </button>
            )}
        </div>
        {tickets.length > 0 ? (
            <div className="space-y-3">
                {tickets.map(ticket => (
                    <button key={ticket.id} onClick={() => onSelect(ticket)} className="w-full text-left bg-white dark:bg-slate-800/70 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ticket.route_name}</p>
                        <p className="text-lg font-bold text-slate-600 dark:text-slate-400">₹{ticket.total_fare}</p>
                        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-600 pt-2">
                            Validated: {new Date(ticket.validated_at!).toLocaleString()} on {ticket.validated_on_bus}
                        </div>
                    </button>
                ))}
            </div>
        ) : (
            <div className="text-center text-slate-500 dark:text-slate-400 p-6 bg-slate-50 rounded-xl border-dashed border-2 dark:bg-slate-800/50 dark:border-slate-700">
                <p className="font-medium">No validated tickets found.</p>
            </div>
        )}
    </div>
);

export default OfflineTicketing;