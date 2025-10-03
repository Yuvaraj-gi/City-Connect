// hooks/useOfflineQueue.ts - RECTIFIED FOR AUTO-SYNC & NOTIFICATIONS

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Report } from '../types';
import useLocalStorage from './useLocalStorage';
import toast from 'react-hot-toast'; // <- Import the notification library

type PendingReport = Omit<Report, 'id' | 'upvotes' | 'verified' | 'reporterId' | 'time' | 'isSynced' | 'created_at'> & {
  tempId: string;
};

export const useOfflineQueue = () => {
  const [pendingReports, setPendingReports] = useLocalStorage<PendingReport[]>('pending-reports', []);
  const isSyncingRef = useRef(false);

  // This is the core sync function.
  const syncPendingReports = useCallback(async () => {
    if (isSyncingRef.current || pendingReports.length === 0) {
      return 0;
    }

    isSyncingRef.current = true;
    
    const reportsToSync = [...pendingReports];
    setPendingReports([]); // Optimistically clear the queue

    console.log(`Syncing ${reportsToSync.length} report(s)...`);
    toast.loading(`Syncing ${reportsToSync.length} pending report(s)...`, { id: 'syncing' });

    let successfulSyncCount = 0;
    const failedReports: PendingReport[] = [];

    for (const report of reportsToSync) {
      const { tempId, ...reportData } = report;
      const { error } = await supabase.from('reports').insert([reportData]);

      if (error) {
        console.error(`Failed to sync report ${tempId}:`, error);
        failedReports.push(report);
      } else {
        console.log(`Successfully synced report ${tempId}`);
        successfulSyncCount++;
      }
    }

    if (failedReports.length > 0) {
      setPendingReports(prev => [...failedReports, ...prev]);
    }
    
    toast.dismiss('syncing');
    if (successfulSyncCount > 0) {
      toast.success(`${successfulSyncCount} report(s) successfully synced!`);
    }

    isSyncingRef.current = false;
    return successfulSyncCount;
  }, [pendingReports, setPendingReports]);

  // THIS IS THE KEY FIX: The hook now listens for the browser's 'online' event.
  useEffect(() => {
    const handleOnline = () => {
      console.log("App came online, triggering automatic sync.");
      syncPendingReports();
    };

    window.addEventListener('online', handleOnline);
    // Also run a check on initial load, in case we were offline and came back.
    if (navigator.onLine && pendingReports.length > 0) {
        handleOnline();
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncPendingReports, pendingReports.length]);


  return { pendingReports, setPendingReports };
};