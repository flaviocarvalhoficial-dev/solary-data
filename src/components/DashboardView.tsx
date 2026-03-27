import React from 'react';
import { Users, Zap, TrendingUp, AlertCircle, RefreshCw, ChevronRight, FileArchive } from 'lucide-react';
import { ActiveClient } from '../utils/solarHelpers';
import { FleetHistoryEntry } from '../hooks/useFleetHistory';
import WattsMascot from './WattsMascot';

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
    syncSystemsFromAPI: (id?: string, sid?: string) => void;
    isSyncingAPI: boolean;
    syncProgress: number;
    syncTotal: number;
    history?: FleetHistoryEntry[];
    recordSnapshot?: (stats: any) => void;
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
    syncTotal,
    history = [],
    recordSnapshot
}) => {
    // Record current stats to history if they look healthy and it's the first time today
    React.useEffect(() => {
        if (recordSnapshot && clients.length > 0) {
            recordSnapshot({
                total_systems: clients.length,
                total_generation_today: enrichedClients.reduce((acc, curr) => acc + (curr.energy_today || 0), 0),
                total_economy_month: totalEconomy
            });
        }
    }, [clients.length, totalEconomy, enrichedClients.length]);

    // Generate Chart Path for Total Systems Trend
    const generatePath = () => {
        if (!history || history.length < 2) return "M 0 60 Q 30 40, 60 50 T 100 10"; // Fallback static path
        const points = history.slice(-10); // Last 10 days
        const max = Math.max(...points.map(h => h.total_systems));
        const min = Math.min(...points.map(h => h.total_systems));
        const range = max - min || 1;

        return points.map((p, i) => {
            const x = (i / (points.length - 1)) * 100;
            const y = 60 - ((p.total_systems - min) / range) * 50;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    return (
        <div style={{ padding: '0 24px' }}>
            {/* Header com título real do VDS */}

            {/* KPI Grid - 3 Columns with Animated Wide Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <style>{`
                    @keyframes slideUp { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
                    @keyframes drawPath { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }
                    @keyframes pulseGlow { 0% { opacity: 0.4; } 50% { opacity: 0.7; } 100% { opacity: 0.4; } }
                    .kpi-bar { transform-origin: bottom; animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
                    .kpi-line { stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawPath 2s ease-out forwards; }
                `}</style>

                {/* CARD 1: TOTAL SISTEMAS (Wide Area Line) */}
                <div className="card" data-tooltip="Número total de sistemas fotovoltaicos cadastrados e monitorados na sua frota." style={{ padding: '24px', position: 'relative', minHeight: '160px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ flex: 1, position: 'relative', zIndex: 2, maxWidth: '55%' }}>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Total de Sistemas</div>
                        <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{clients.length}</div>
                        <div style={{ marginTop: '12px' }}>
                            <span className="badge badge-success" style={{ fontSize: '11px', padding: '4px 10px' }}>↑ 4% growth</span>
                        </div>
                    </div>
                    {/* Wider Lateral Chart */}
                    <div style={{ position: 'absolute', right: '0', top: '16px', bottom: '56px', width: '45%', pointerEvents: 'none', paddingRight: '16px' }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="none">
                            <path d={generatePath()} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" className="kpi-line" />
                            <path d={`${generatePath()} L 100 60 L 0 60 Z`} fill="var(--color-primary-muted)" style={{ opacity: 0.15 }} />
                        </svg>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center' }}>
                        <a href="#" style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center' }} onClick={e => { e.preventDefault(); setActiveTab('Clients'); }}>
                            See Details <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                        </a>
                    </div>
                </div>

                {/* CARD 2: GERAÇÃO HOJE (Wide Staggered Bars) */}
                <div className="card" data-tooltip="Energia total gerada por todos os seus sistemas nas últimas 24 horas." style={{ padding: '24px', position: 'relative', minHeight: '160px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, position: 'relative', zIndex: 2, maxWidth: '55%' }}>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Geração Hoje</div>
                        <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {enrichedClients.reduce((acc, curr) => acc + (curr.energy_today || 0), 0).toFixed(1)} <span style={{ fontSize: '16px', fontWeight: 400 }}>kWh</span>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <span className="badge" style={{ background: 'var(--color-status-success-bg)', color: 'var(--color-status-success-text)', fontSize: '11px', padding: '4px 10px' }}>↑ High Performance</span>
                        </div>
                    </div>
                    {/* Wider Lateral Responsive Dynamic Bars */}
                    <div style={{ position: 'absolute', right: '16px', top: '24px', bottom: '56px', display: 'flex', alignItems: 'flex-end', gap: '4px', width: '40%', opacity: 0.8 }}>
                        {enrichedClients.slice(0, 8).map((c, i) => {
                            const val = c.energy_today || 0;
                            const h = `${Math.max(15, Math.min(100, (val / 12) * 100))}%`;
                            return (
                                <div key={c.id} className="kpi-bar" style={{ flex: 1, minWidth: '4px', borderRadius: '4px', height: h, transition: 'all 0.3s', animationDelay: `${0.1 * i}s` }}>
                                    <div style={{ height: '100%', background: 'linear-gradient(to top, var(--color-primary), var(--color-primary-muted))', borderRadius: '4px' }} />
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center' }}>
                        <a href="#" style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            Global Data <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                        </a>
                    </div>
                </div>

                {/* CARD 3: STATUS OPERACIONAL (Expansive Pulse) */}
                <div className="card" data-tooltip="Sistemas que possuem pendências de faturas ou erro de sincronização com a API." style={{ padding: '24px', position: 'relative', minHeight: '160px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ flex: 1, position: 'relative', zIndex: 2, maxWidth: '55%' }}>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Sistemas Incompletos</div>
                        <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{incompleteCount}</div>
                        <div style={{ marginTop: '12px' }}>
                            <span className={`badge ${incompleteCount > 0 ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '11px', padding: '4px 10px' }}>
                                {incompleteCount > 0 ? 'Critical Attention' : 'All systems normal'}
                            </span>
                        </div>
                    </div>
                    {/* Wider Lateral Pulsing Alert Heartbeat */}
                    <div style={{ position: 'absolute', right: '0', top: '16px', bottom: '56px', width: '45%', pointerEvents: 'none', paddingRight: '16px' }}>
                        <svg width="100%" height="100%" viewBox="0 0 80 50" preserveAspectRatio="none">
                            <polyline points="0,25 15,25 20,5 35,45 40,25 80,25" fill="none" stroke={incompleteCount > 0 ? "var(--color-danger)" : "var(--color-status-success-text)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'pulseGlow 2s infinite ease-in-out' }} />
                        </svg>
                    </div>
                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center' }}>
                        <a href="#" style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                            View Issues <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Analytics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Status da Frota em Tempo Real</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span className="badge" style={{ background: '#F0F0F0', color: '#6B6B6B', border: 'none' }}>Live Monitor</span>
                        </div>
                    </div>

                    {isSyncingAPI && syncTotal > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 500, color: 'var(--color-primary)', marginBottom: '6px' }}>
                                <span>Syncing local systems with platform...</span>
                                <span>{syncProgress} / {syncTotal} ({Math.round((syncProgress / syncTotal) * 100)}%)</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#F5F5F0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${(syncProgress / syncTotal) * 100}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s ease' }} />
                                {/* Emulating Coral Gradient mentioned in VDS with single color primary or gradient if possible */}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {[
                            { label: 'Operação Normal', count: clients.filter(c => c.api_status === 'Normal').length, css: 'success' },
                            { label: 'Sistema em Alerta', count: clients.filter(c => c.api_status === 'Atenção').length, css: 'warning' },
                            { label: 'Falha de Sistema', count: clients.filter(c => c.api_status === 'Erro').length, css: 'danger' },
                        ].map((s, idx) => (
                            <div key={idx} style={{ padding: '16px', background: 'var(--color-bg-base)', borderRadius: '10px' }}>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
                                <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.count}</div>
                                <div style={{ marginTop: '8px' }}><span className={`badge badge-${s.css}`}>Real-time</span></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Status de Relatórios</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { label: 'Completo', count: enrichedClients.filter(c => c.status === 'Completo').length, badge: 'success' },
                            { label: 'Divergente', count: enrichedClients.filter(c => c.status === 'Divergente').length, badge: 'warning' },
                            { label: 'Incompleto', count: enrichedClients.filter(c => c.status === 'Incompleto').length, badge: 'danger' },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--color-bg-base)', borderRadius: '10px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 500 }}>{s.label}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '18px', fontWeight: 600 }}>{s.count}</span>
                                    <span className={`badge badge-${s.badge}`}>•</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Status mensal referente a MAR/2026</p>
                    </div>
                </div>
            </div>

            {/* Recent Items - Spreadsheet Style */}
            <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Sistemas Recentes</h3>
                    <button onClick={() => setActiveTab('Clients')} style={{ fontSize: '12px', color: 'var(--color-primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                        Ver Todos →
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sistema</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cidade</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conta Contrato</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plataforma</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status do Relatório</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Última Atu.</th>
                                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrichedClients.length === 0 ? (
                                <tr key="empty-dash">
                                    <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <WattsMascot state="dormindo" size={80} />
                                            <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                                                Nenhum sistema cadastrado no momento.
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : enrichedClients.slice(0, 8).map(ac => (
                                <tr key={ac.id}
                                    onClick={() => { setActiveTab('Clients'); setSelectedClientId(ac.id); }}
                                    style={{ borderBottom: '1px solid var(--color-bg-base)', cursor: 'pointer', transition: 'background 0.2s' }}
                                    className="table-row-hover"
                                >
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '11px' }}>
                                                {ac.name.charAt(0)}
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{ac.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                                        {ac.city || '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                        {ac.uc}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-primary)' }}>{ac.platform}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span className={`badge badge-${ac.status === 'Completo' ? 'success' : ac.status === 'Divergente' ? 'warning' : 'danger'}`} style={{ fontSize: '10px' }}>
                                            {ac.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                        {ac.updated_at ? new Date(ac.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <ChevronRight size={16} color="var(--color-text-muted)" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
