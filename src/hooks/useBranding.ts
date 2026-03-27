import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface Branding {
    company_name: string;
    primary_color: string;
    secondary_color: string;
    logo_url: string;
    report_footer: string;
}

const DEFAULT_BRANDING: Branding = {
    company_name: 'Watts',
    primary_color: '#E8593C',
    secondary_color: '#1A1A1A',
    logo_url: '/logo.svg',
    report_footer: 'Este relatório executivo foi gerado pelo sistema Watts • Veselty Engine.'
};

export function useBranding() {
    const { user } = useAuth();
    const [branding, setBranding] = useState<Branding>(DEFAULT_BRANDING);

    useEffect(() => {
        if (user) {
            const saved = localStorage.getItem(`solary_branding_${user.id}`);
            if (saved) {
                try {
                    setBranding(JSON.parse(saved));
                } catch (e) {
                    console.error('Falha ao carregar branding', e);
                }
            }
        }
    }, [user]);

    const saveBranding = (newBranding: Branding) => {
        setBranding(newBranding);
        if (user) {
            localStorage.setItem(`solary_branding_${user.id}`, JSON.stringify(newBranding));
        }
    };

    return { branding, setBranding: saveBranding };
}
