// hooks/useOfflineQueue.ts - FINAL ROBUST VERSION

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Report } from '../types';
import useLocalStorage from './useLocalStorage';

type PendingReport = Omit<Report, 'id' | 'upvotes' | 'verified' | 'reporterId' | 'time' | 'isSynced' | 'created_at'> & {
  tempId: string;
};

// This is now the single source of truth for offline syncing.
export const useOfflineQueue = () => {
  const [pendingReports, setPendingReports] = useLocalStorage<PendingReport[]>('pending-reports', []);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // This useRef helps prevent the sync function from running multiple times at once.
  const isSyncingRef = useRef(false);

  const syncPendingReports = useCallback(async () => {
    // Prevent sync from running if it's already in progress.
    if (isSyncingRef.current || pendingReports.length === 0) {
      return 0;
    }

    isSyncingRef.current = true;
    setIsSyncing(true);
    
    const reportsToSync = [...pendingReports];
    // IMPORTANT: Clear the queue immediately. This is the core fix for the duplication bug.
    setPendingReports([]);

    console.log(`Syncing ${reportsToSync.length} report(s)...`);

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

    // If any reports failed, add them back to the queue to try again later.
    if (failedReports.length > 0) {
      setPendingReports(prev => [...failedReports, ...prev]);
    }
    
    isSyncingRef.current = false;
    setIsSyncing(false);
    return successfulSyncCount;
  }, [pendingReports, setPendingReports]);

  // This effect now lives inside the hook. It automatically listens for the app to come online.
  useEffect(() => {
    const handleOnline = () => {
      console.log("App came online, triggering sync.");
      syncPendingReports();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncPendingReports]);


  return {
    pendingReports,
    setPendingReports,
    isSyncing,
    // We no longer need to export syncPendingReports, as the hook handles it automatically.
  };
};