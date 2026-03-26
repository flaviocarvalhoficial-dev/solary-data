import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

export type Bill = Database['public']['Tables']['bills']['Row'];
export type BillInsert = Database['public']['Tables']['bills']['Insert'];

export function useBills() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(false);

    const fetch = useCallback(async (clientId?: string) => {
        setLoading(true);

        let query = supabase
            .from('bills')
            .select('*')
            .order('created_at', { ascending: false });

        if (clientId) {
            query = query.eq('client_id', clientId);
        }

        const { data, error } = await query;
        if (!error && data) setBills(data);
        setLoading(false);
    }, []);

    // Load initial bills
    useEffect(() => {
        fetch();
    }, [fetch]);

    const create = async (input: BillInsert): Promise<Bill> => {
        const { data, error } = await supabase
            .from('bills')
            .insert(input)
            .select()
            .single();

        if (error) throw new Error(error.message);
        setBills(prev => [data, ...prev]);
        return data;
    };

    const update = async (id: string, input: Partial<BillInsert>): Promise<Bill> => {
        // Strip read-only fields to avoid Supabase errors if any
        const { id: _, created_at: __, ...updatePayload } = input as any;

        const { data, error } = await supabase
            .from('bills')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        setBills(prev => prev.map(b => b.id === id ? data : b));
        return data;
    };

    const remove = async (id: string): Promise<void> => {
        const { error } = await supabase.from('bills').delete().eq('id', id);
        if (error) throw new Error(error.message);
        setBills(prev => prev.filter(b => b.id !== id));
    };

    const resetForClient = async (clientId: string): Promise<void> => {
        const { error } = await supabase.from('bills').delete().eq('client_id', clientId);
        if (error) throw new Error(error.message);
        setBills(prev => prev.filter(b => b.client_id !== clientId));
    };

    return { bills, setBills, loading, fetch, refetch: fetch, create, update, remove, resetForClient };
}
