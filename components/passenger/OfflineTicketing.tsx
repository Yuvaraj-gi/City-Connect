import React, { useState, useMemo, useEffect } from 'react';
import { routes } from '../../data';
import { Ticket, Route } from '../../types';
import useLocalStorage from '../../hooks/useLocalStorage';
import CloudArrowUpIcon from '../icons/CloudArrowUpIcon';
import TicketDetailsModal from './TicketDetailsModal';
import SpinnerIcon from '../icons/SpinnerIcon';
import CheckBadgeIcon from '../icons/CheckBadgeIcon';
import TrashIcon from '../icons/TrashIcon';
import TicketIcon from '../icons/TicketIcon';

interface OfflineTicketingProps {
  isOnline: boolean;
}

const OfflineTicketing: React.FC<OfflineTicketingProps> = ({ isOnline }) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [myTickets, setMyTickets] = useLocalStorage<Ticket[]>('my-tickets', []);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const selectedRoute: Route | undefined = routes.find(r => r.id === selectedRouteId);
  const totalFare = selectedRoute ? selectedRoute.fare * passengerCount : 0;
  
  const unsyncedTicketCount = useMemo(() => myTickets.filter(t => !t.isSynced).length, [myTickets]);
  
  const activeTickets = useMemo(() => myTickets.filter(t => t.status === 'active'), [myTickets]);
  const historyTickets = useMemo(() => myTickets.filter(t => t.status === 'validated'), [myTickets]);

  const handleGenerateTicket = () => {
    if (!selectedRoute || !isOnline) return;

    const purchaseTime = new Date();
    const expiryTime = new Date(purchaseTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours validity

    const newTicket: Ticket = {
      id: `T${Date.now()}`,
      routeId: selectedRoute.id,
      routeName: selectedRoute.name,
      passengerCount,
      totalFare,
      purchaseDate: purchaseTime.toLocaleString(),
      validUntil: expiryTime.toISOString(),
      isSynced: isOnline,
      transactionId: `TXN-${Date.now()}`,
      // Mock ECDSA signature
      signature: `SIG-${btoa(JSON.stringify({ id: `T${Date.now()}`, fare: totalFare })).substring(10, 50)}`,
      status: 'active',
    };

    setMyTickets([newTicket, ...myTickets]);
  };
  
  const handleValidateTicket = (ticketId: string) => {
    const now = new Date();
    const validatedTicket = myTickets.find(t => t.id === ticketId);
    if (!validatedTicket) return;

    const validatedBus = routes.find(r => r.id === validatedTicket.routeId)?.name || 'Bus #XX';

    setMyTickets(prevTickets => 
        prevTickets.map(t => 
            t.id === ticketId 
            ? { 
                ...t, 
                status: 'validated',
                validatedAt: now.toLocaleString(),
                validatedOnBus: validatedBus,
              } 
            : t
        )
    );
    // Also update the selectedTicket state if it's the one being validated
    setSelectedTicket(prev => prev && prev.id === ticketId ? {
        ...prev,
        status: 'validated',
        validatedAt: now.toLocaleString(),
        validatedOnBus: validatedBus,
    } : prev);
  };

  const handleSyncTickets = () => {
    const syncedTickets = myTickets.map(ticket => ({ ...ticket, isSynced: true }));
    setMyTickets(syncedTickets);
  };
  
  const handleClearHistory = () => {
    setMyTickets(prevTickets => prevTickets.filter(t => t.status !== 'validated'));
  };

  useEffect(() => {
    if (isOnline && unsyncedTicketCount > 0 && !isSyncing) {
      setIsSyncing(true);
      const timer = setTimeout(() => {
        handleSyncTickets();
        setIsSyncing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, unsyncedTicketCount]);

  const SyncStatus: React.FC = () => {
    if (isSyncing) {
        return (
            <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 animate-pulse">
                <SpinnerIcon />
                <span>Syncing {unsyncedTicketCount} ticket{unsyncedTicketCount > 1 ? 's' : ''}...</span>
            </div>
        )
    }
    if (!isOnline && unsyncedTicketCount > 0) {
         return (
            <div className="flex items-center space-x-2 text-sm text-yellow-600 dark:text-yellow-400">
                <CloudArrowUpIcon className="w-5 h-5"/>
                <span>{unsyncedTicketCount} ticket{unsyncedTicketCount > 1 ? 's' : ''} pending sync</span>
            </div>
        )
    }
    if (isOnline && unsyncedTicketCount === 0 && myTickets.length > 0) {
        return (
             <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                <CheckBadgeIcon className="w-5 h-5" />
                <span>All tickets synced</span>
            </div>
        )
    }
    return null;
  }


  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Your Tickets</h3>
        <SyncStatus />
      </div>

      <div className="space-y-8">
        {/* Ticket Generation Form */}
        <div>
           <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Buy a New Ticket</h4>
           {!isOnline && (
            <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm text-center font-medium dark:bg-yellow-500/10 dark:text-yellow-300 mb-4">
                You must be online to purchase tickets.
            </div>
          )}
          <fieldset disabled={!isOnline} className="p-4 bg-slate-50 rounded-xl border space-y-4 dark:bg-slate-800/50 dark:border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed">
            <div>
              <label htmlFor="route" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Route</label>
              <select
                id="route"
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 bg-white text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              >
                {routes.map(route => <option key={route.id} value={route.id}>{route.name} ({route.from} to {route.to})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="passengers" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Passengers</label>
              <input
                type="number"
                id="passengers"
                min="1"
                max="10"
                value={passengerCount}
                onChange={(e) => setPassengerCount(parseInt(e.target.value))}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
            </div>
            <div className="flex justify-between items-center p-3 bg-indigo-100 rounded-lg dark:bg-indigo-500/10">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Total Fare:</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">₹{totalFare}</span>
            </div>
            <button
              onClick={handleGenerateTicket}
              className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:bg-indigo-600/50"
            >
              Generate Ticket
            </button>
          </fieldset>
        </div>

        {/* My Tickets Display */}
        <div className="space-y-8">
            <div>
                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">Active Tickets</h4>
                 {activeTickets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeTickets.map(ticket => (
                           <button 
                                key={ticket.id} 
                                onClick={() => setSelectedTicket(ticket)}
                                className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-indigo-500 transition-all duration-200"
                            >
                                <div className="p-4 flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{ticket.routeName}</p>
                                            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">₹{ticket.totalFare}</p>
                                        </div>
                                        <div className="text-center bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                                            <TicketIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Tap to View & Validate</p>
                                </div>
                                <div className={`px-4 py-1.5 text-center text-xs font-bold ${ticket.isSynced ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300'}`}>
                                    {ticket.isSynced ? 'SYNCED' : 'PENDING SYNC (OFFLINE)'}
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400 p-6 bg-slate-50 rounded-xl border-dashed border-2 dark:bg-slate-800/50 dark:border-slate-700">
                        <p className="font-medium">You have no active tickets.</p>
                        <p className="text-sm mt-1">Purchase a ticket to get started.</p>
                    </div>
                )}
            </div>
            
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">Ticket History</h4>
                     {historyTickets.length > 0 && (
                        <button 
                        onClick={handleClearHistory}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-slate-100 text-slate-600 font-semibold rounded-md hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                        >
                        <TrashIcon className="w-3 h-3"/>
                        <span>Clear History</span>
                        </button>
                    )}
                </div>
                {historyTickets.length > 0 ? (
                    <div className="space-y-3">
                        {historyTickets.map(ticket => (
                            <button
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className="w-full text-left bg-white dark:bg-slate-800/70 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ticket.routeName}</p>
                                        <p className="text-lg font-bold text-slate-600 dark:text-slate-400">₹{ticket.totalFare}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-300">
                                            Validated
                                        </span>
                                    </div>
                                </div>
                                 <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-600 pt-2">
                                     Validated: {ticket.validatedAt} on {ticket.validatedOnBus}
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
        </div>
      </div>
      <TicketDetailsModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onValidate={handleValidateTicket} />
    </div>
  );
};

export default OfflineTicketing;