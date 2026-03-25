import React from 'react';
import { Users, Zap, TrendingUp, AlertCircle, FileArchive, ExternalLink, RefreshCw } from 'lucide-react';
import { ActiveClient } from '../App';

interface DashboardViewProps {
    clients: any[];
    enrichedClients: ActiveClient[];
    totalGeneration: number;
    totalEconomy: number;
    incompleteCount: number;
    handleBatchExport: () => void;
    isUploading: boolean;
    setSelectedClientId: (id: string | null) => void;
    setActiveTab: (tab: string) => void;
    syncSystemsFromAPI: () => void;
    isSyncingAPI: boolean;
    syncProgress: number;
    syncTotal: number;
}

const DashboardView: React.FC<DashboardViewProps> = ({
    clients,
    enrichedClients,
    totalGeneration,
    totalEconomy,
    incompleteCount,
    handleBatchExport,
    isUploading,
    setSelectedClientId,
    setActiveTab,
    syncSystemsFromAPI,
    isSyncingAPI,
    syncProgress,
    syncTotal
}) => {
    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Total de Sistemas', value: clients.length, icon: <Users size={20} />, color: '#6366F1', bg: '#EEF2FF' },
                    { label: 'Geração do Dia', value: enrichedClients.reduce((acc, curr) => acc + (curr.energy_today || 0), 0).toFixed(1) + ' kWh', icon: <Zap size={20} />, color: '#F59E0B', bg: '#FFFBEB' },
                    { label: 'Geração Total', value: totalGeneration > 0 ? `${totalGeneration.toFixed(0)} kWh` : '—', icon: <TrendingUp size={20} />, color: '#10B981', bg: '#ECFDF5' },
                    { label: 'Pendentes', value: incompleteCount, icon: <AlertCircle size={20} />, color: '#DC2626', bg: '#FEF2F2' },
                ].map((k, i) => (
                    <div key={i} className="table-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px' }}>{k.label}</p>
                                <p style={{ fontSize: '26px', fontWeight: 700, color: k.color }}>{k.value}</p>
                            </div>
                            <div style={{ background: k.bg, color: k.color, padding: '10px', borderRadius: '10px' }}>{k.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Monitoramento de Operação (Real-time)</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Última atualização: Hoje, Agora</span>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '11px', height: 'auto' }} onClick={syncSystemsFromAPI} disabled={isSyncingAPI}>
                            <RefreshCw size={12} className={isSyncingAPI ? 'spin' : ''} style={{ marginRight: '6px' }} /> Atualizar Agora
                        </button>
                    </div>
                </div>

                {isSyncingAPI && syncTotal > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
                            <span>Sincronizando sistemas...</span>
                            <span>{syncProgress} / {syncTotal} ({Math.round((syncProgress / syncTotal) * 100)}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${(syncProgress / syncTotal) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6366F1, #818CF8)', transition: 'width 0.3s ease' }} />
                        </div>
                    </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {[
                        { label: 'Normal', count: clients.filter(c => c.api_status === 'Normal').length, color: '#10B981', bg: '#ECFDF5' },
                        { label: 'Atenção', count: clients.filter(c => c.api_status === 'Atenção').length, color: '#F59E0B', bg: '#FFFBEB' },
                        { label: 'Erro', count: clients.filter(c => c.api_status === 'Erro').length, color: '#DC2626', bg: '#FEF2F2' },
                    ].map(s => (
                        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', border: `1px solid ${s.color}20`, background: s.bg }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }}></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: s.color, textTransform: 'uppercase' }}>{s.label}</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{s.count} Sistemas</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <div className="table-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Status Mensal de Relatórios</h3>
                    {[
                        { label: 'Completo', css: 'badge-cold' },
                        { label: 'Divergente', css: 'badge-warm' },
                        { label: 'Incompleto', css: 'badge-hot' },
                    ].map(s => (
                        <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                            <span className={`badge ${s.css}`}>{s.label}</span>
                            <strong style={{ fontSize: '18px' }}>{enrichedClients.filter(c => c.status === s.label).length}</strong>
                        </div>
                    ))}
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={handleBatchExport} disabled={isUploading}>
                        <FileArchive size={15} /> {isUploading ? 'Gerando...' : 'Exportar Faturas ZIP'}
                    </button>
                </div>
                <div className="table-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Sistemas Recentes</h3>
                    {clients.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                            <Users size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
                            <p style={{ fontSize: '14px' }}>Nenhum sistema cadastrado.</p>
                        </div>
                    ) : enrichedClients.slice(0, 5).map(ac => (
                        <div key={ac.id} onClick={() => { setActiveTab('Clients'); setSelectedClientId(ac.id); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366F1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                                {ac.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{ac.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>UC {ac.uc}</div>
                            </div>
                            <span className={`badge badge-${ac.status === 'Completo' ? 'cold' : ac.status === 'Divergente' ? 'warm' : 'hot'}`}>{ac.status}</span>
                            <ExternalLink size={13} color="var(--color-primary)" />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default DashboardView;
