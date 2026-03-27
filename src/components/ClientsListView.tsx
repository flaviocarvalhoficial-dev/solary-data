import React from 'react';
import { RefreshCw, Zap, FileArchive, Plus, Download, PencilLine, FileText, ChevronRight, ExternalLink } from 'lucide-react';
import { ActiveClient, getEmaPortalLink } from '../utils/solarHelpers';
import WattsMascot from './WattsMascot';

interface ClientsListViewProps {
    statusFilter: string;
    setStatusFilter: (filter: string) => void;
    platformFilter: string;
    setPlatformFilter: (filter: string) => void;
    isSyncingAPI: boolean;
    syncSystemsFromAPI: (targetId?: string, targetSid?: string) => void;
    handleFetchSystems: () => void;
    isImporting: boolean;
    handleBatchExport: () => void;
    isUploading: boolean;
    setShowNewClientModal: (show: boolean) => void;
    filteredClients: ActiveClient[];
    selectedIds: string[];
    setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    handleDeleteSelected: () => void;
    handleClearAll: () => void;
    setSelectedClientId: (id: string | null) => void;
    handleExportPDF: (ac: ActiveClient) => void;
    setShowXLSImportModal?: (show: boolean) => void;
    updateClient?: (id: string, data: any) => void;
}

const ClientsListView: React.FC<ClientsListViewProps> = ({
    statusFilter,
    setStatusFilter,
    platformFilter,
    setPlatformFilter,
    isSyncingAPI,
    syncSystemsFromAPI,
    handleFetchSystems,
    isImporting,
    handleBatchExport,
    isUploading,
    setShowNewClientModal,
    filteredClients,
    selectedIds,
    setSelectedIds,
    handleDeleteSelected,
    handleClearAll,
    setSelectedClientId,
    handleExportPDF,
    setShowXLSImportModal,
    updateClient
}) => {
    const allSelected = filteredClients.length > 0 && selectedIds.length === filteredClients.length;

    const handleSelectAll = () => {
        if (allSelected) setSelectedIds([]);
        else setSelectedIds(filteredClients.map(c => c.id));
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <div style={{ padding: '0 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['Todos', 'Completo', 'Divergente', 'Incompleto'].map(s => (
                            <button key={s} onClick={() => setStatusFilter(s)}
                                style={{
                                    padding: '6px 14px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: statusFilter === s ? 'var(--color-primary)' : 'var(--color-bg-base)',
                                    color: statusFilter === s ? '#FFF' : 'var(--color-text-secondary)',
                                    transition: 'all 0.2s'
                                }}>
                                {s}
                            </button>
                        ))}
                    </div>
                    <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['Todas', 'APsystems', 'Sungrow', 'GoodWe'].map(p => (
                            <button key={p} onClick={() => setPlatformFilter(p)}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: platformFilter === p ? 'var(--color-bg-base)' : 'transparent',
                                    color: platformFilter === p ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                    transition: 'all 0.2s'
                                }}>
                                {p === 'Todas' ? 'Todas Marcas' : p}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {platformFilter !== 'Todas' && (
                        <a
                            href={platformFilter === 'APsystems' ? 'https://apsystemsema.com/ema/index.action' : platformFilter === 'Sungrow' ? 'https://www.isolarcloud.com/' : 'https://www.semsportal.com/'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-icon"
                            title={`Acessar Portal ${platformFilter}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: 'var(--color-primary)',
                                padding: '8px 12px',
                                fontSize: '12px',
                                fontWeight: 500,
                                textDecoration: 'none',
                                borderRadius: '8px',
                                background: 'transparent'
                            }}
                        >
                            <ExternalLink size={14} /> <span>Portal {platformFilter}</span>
                        </a>
                    )}
                    <button
                        className="btn"
                        title="Adicionar Novo Sistema"
                        style={{
                            borderRadius: '8px',
                            fontSize: '12px',
                            padding: '8px 12px',
                            whiteSpace: 'nowrap',
                            backgroundColor: '#f3f3f3',
                            border: '1px solid #D44E33',
                            color: '#D44E33'
                        }}
                        onClick={() => setShowNewClientModal(true)}
                    >
                        <Plus size={14} /> Novo Sistema
                    </button>
                    <button
                        className="btn"
                        title="Dados em Massa (XLS)"
                        style={{
                            borderRadius: '8px',
                            fontSize: '12px',
                            padding: '8px 12px',
                            whiteSpace: 'nowrap',
                            backgroundColor: '#f3f3f3',
                            border: '1px solid #D44E33',
                            color: '#D44E33'
                        }}
                        onClick={() => setShowXLSImportModal && setShowXLSImportModal(true)}
                    >
                        <Plus size={14} /> Importar XLS
                    </button>
                </div>
            </div>

            <div className="card" style={{ overflow: 'hidden', padding: '0' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--color-bg-base)' }}>
                            <tr>
                                <th style={{ width: 44, padding: '20px 24px', textAlign: 'left' }}>
                                    <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
                                </th>
                                <th className="sidebar-group-label" style={{ padding: '20px 24px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Cliente</th>
                                <th className="sidebar-group-label" style={{ padding: '20px 24px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Local / Conta Contrato</th>
                                <th className="sidebar-group-label" style={{ padding: '20px 24px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Geração Total</th>
                                <th className="sidebar-group-label" style={{ padding: '20px 24px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Hj (kWh)</th>
                                <th className="sidebar-group-label" style={{ padding: '20px 24px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Status</th>
                                <th className="sidebar-group-label" style={{ padding: '20px 24px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Última Atualização</th>
                                <th className="sidebar-group-label" style={{ padding: '20px 24px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Relatório</th>
                                <th style={{ width: 80, borderBottom: '1px solid var(--color-border)' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ padding: '100px 24px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                            <WattsMascot state="dormindo" size={120} />
                                            <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500 }}>
                                                Nenhum sistema encontrado para os filtros atuais.
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClients.map(ac => (
                                <tr key={ac.id} onClick={() => setSelectedClientId(ac.id)}
                                    style={{ cursor: 'pointer', borderBottom: '1px solid var(--color-border)', backgroundColor: selectedIds.includes(ac.id) ? 'rgba(232, 89, 60, 0.05)' : 'transparent' }}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(ac.id)}
                                            onChange={() => toggleSelect(ac.id)}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '10px' }}>
                                                {ac.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '12px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {ac.name}
                                                    {getEmaPortalLink(ac) && (
                                                        <a
                                                            href={getEmaPortalLink(ac)!}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={e => e.stopPropagation()}
                                                            title="Abrir Portal Externo"
                                                            style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', padding: '1px', borderRadius: '3px', background: 'rgba(99, 102, 241, 0.05)' }}
                                                        >
                                                            <ExternalLink size={10} />
                                                        </a>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{ac.system_id || ac.id.split('-')[0]}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>{ac.city || '—'}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Conta {ac.uc}</div>
                                    </td>
                                    <td style={{ padding: '20px 24px', fontSize: '13px', color: 'var(--color-text-primary)' }}>{ac.generation > 0 ? `${ac.generation.toFixed(1)} kWh` : '—'}</td>
                                    <td style={{ padding: '20px 24px', fontSize: '13px', fontWeight: 600, color: (ac.energy_today || 0) > 0 ? 'var(--color-trend-up)' : 'var(--color-text-muted)' }}>
                                        {ac.energy_today ? `${ac.energy_today.toFixed(1)}` : '—'}
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ac.api_status === 'Normal' ? '#1E7E34' : ac.api_status === 'Atenção' ? '#D97706' : '#C0392B' }}></div>
                                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{ac.api_status || 'Offline'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>
                                            {ac.updated_at ? new Date(ac.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span className={`badge badge-${ac.status === 'Completo' ? 'success' : ac.status === 'Divergente' ? 'warning' : 'danger'}`}>
                                            {ac.latestBill ? ac.latestBill.competency : 'Pendente'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <ChevronRight size={14} color="var(--color-text-muted)" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Mostrando {filteredClients.length} sistemas</p>
                {selectedIds.length > 0 && (
                    <button style={{ border: 'none', background: 'transparent', color: 'var(--color-status-danger-text)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }} onClick={handleDeleteSelected}>
                        Excluir {selectedIds.length} selecionados
                    </button>
                )}
            </div>
        </div>
    );
};

export default ClientsListView;
