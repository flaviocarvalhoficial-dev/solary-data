import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface FleetHistoryEntry {
    date: string;
    total_systems: number;
    total_generation_today: number;
    total_economy_month: number;
}

export const useFleetHistory = (userId: string | undefined) => {
    const [history, setHistory] = useState<FleetHistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchHistory = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('fleet_history')
                .select('date, total_systems, total_generation_today, total_economy_month')
                .eq('user_id', userId)
                .order('date', { ascending: true });

            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error('[HISTORY FETCH ERROR]', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const recordSnapshot = async (stats: Omit<FleetHistoryEntry, 'date'>) => {
        if (!userId) return;
        try {
            const today = new Date().toISOString().split('T')[0];
            const { error } = await supabase
                .from('fleet_history')
                .upsert({
                    user_id: userId,
                    date: today,
                    ...stats
                }, { onConflict: 'user_id, date' });

            if (error) throw error;
            fetchHistory();
        } catch (error) {
            console.error('[HISTORY SNAPSHOT ERROR]', error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { history, loading, recordSnapshot, refetch: fetchHistory };
};
