// components/passenger/RouteFinder.tsx - FINAL WORKING VERSION

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Route } from '../../types';
import SearchIcon from '../icons/SearchIcon';
import BusIcon from '../icons/BusIcon';
import SpinnerIcon from '../icons/SpinnerIcon';

const RouteFinder: React.FC = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [results, setResults] = useState<Route[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allStops, setAllStops] = useState<string[]>([]);

  useEffect(() => {
    const fetchAllStops = async () => {
      const { data, error } = await supabase.from('routes').select('stops');
      if (error) {
        console.error("Error fetching stops: ", error);
        return;
      }
      if (data) {
        const stopsSet = new Set<string>();
        data.forEach(route => {
          if (route.stops) {
            (route.stops as string[]).forEach(stop => stopsSet.add(stop));
          }
        });
        setAllStops(Array.from(stopsSet));
      }
    };
    fetchAllStops();
  }, []);

  const handleSearch = async () => {
    if (!from || !to) return;
    setIsLoading(true);
    setSearched(true);

    // *** THE FINAL FIX IS HERE ***
    // We are now calling the smart function we created in the database.
    const { data, error } = await supabase
      .rpc('find_routes_with_stops', {
        from_stop: from,
        to_stop: to
      });

    if (error) {
      // This is the error you saw in the console
      console.error("Error finding routes:", error);
      setResults([]);
    } else {
      setResults(data as Route[]);
    }
    
    setIsLoading(false);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Find Your Route</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
        <div>
          <label htmlFor="from" className="block text-sm font-medium text-slate-700 dark:text-slate-300">From</label>
          <input
            type="text"
            id="from"
            list="stops-list"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            placeholder="e.g., T. Nagar"
          />
        </div>
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-slate-700 dark:text-slate-300">To</label>
          <input
            type="text"
            id="to"
            list="stops-list"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            placeholder="e.g., Velachery"
          />
          <datalist id="stops-list">
            {allStops.map(stop => <option key={stop} value={stop} />)}
          </datalist>
        </div>
      </div>
      <button
        onClick={handleSearch}
        className="w-full flex items-center justify-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 shadow-md"
        disabled={!from || !to || isLoading}
      >
        {isLoading ? <><SpinnerIcon className="w-5 h-5" /><span className="ml-2">Searching...</span></> : <><SearchIcon className="w-5 h-5"/><span className="ml-2">Find Route</span></>}
      </button>

      <div className="mt-8">
        {searched && !isLoading && results.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Available Routes</h4>
            {results.map(route => (
              <div key={route.id} className="p-4 border rounded-xl shadow-sm bg-white hover:shadow-lg hover:ring-2 hover:ring-indigo-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                            <BusIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <span className="font-bold text-lg text-slate-800 dark:text-slate-100">{route.name}</span>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">{route.from} → {route.to}</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                        <span className="text-xl font-bold text-green-700 dark:text-green-500">₹{route.fare}</span>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{route.average_eta_minutes} mins</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {searched && !isLoading && results.length === 0 && (
          <div className="text-center text-slate-500 dark:text-slate-400 mt-8 p-6 bg-slate-50 rounded-xl border-dashed border-2 dark:bg-slate-800/50 dark:border-slate-700">
            <h4 className="font-semibold text-lg text-slate-700 dark:text-slate-200">No Direct Routes Found</h4>
            <p className="mt-1">Try different stops or use our AI Assistant for more complex travel planning.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteFinder;