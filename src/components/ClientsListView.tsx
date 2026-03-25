import React from 'react';
import { RefreshCw, Zap, FileArchive, Plus, Download } from 'lucide-react';
import { ActiveClient } from '../App';

interface ClientsListViewProps {
    statusFilter: string;
    setStatusFilter: (filter: string) => void;
    isSyncingAPI: boolean;
    syncSystemsFromAPI: () => void;
    handleFetchSystems: () => void;
    isImporting: boolean;
    handleBatchExport: () => void;
    isUploading: boolean;
    setShowNewClientModal: (show: boolean) => void;
    filteredClients: ActiveClient[];
    setSelectedClientId: (id: string | null) => void;
    handleExportPDF: (ac: ActiveClient) => void;
}

const ClientsListView: React.FC<ClientsListViewProps> = ({
    statusFilter,
    setStatusFilter,
    isSyncingAPI,
    syncSystemsFromAPI,
    handleFetchSystems,
    isImporting,
    handleBatchExport,
    isUploading,
    setShowNewClientModal,
    filteredClients,
    setSelectedClientId,
    handleExportPDF
}) => {
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['Todos', 'Completo', 'Divergente', 'Incompleto'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '6px 14px', fontSize: '13px' }}>{s}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline" onClick={syncSystemsFromAPI} disabled={isSyncingAPI}>
                        <RefreshCw size={15} className={isSyncingAPI ? 'spin' : ''} /> {isSyncingAPI ? 'Sincronizando...' : 'Sincronizar Todos'}
                    </button>
                    <button className="btn btn-outline" onClick={handleFetchSystems} disabled={isImporting}>
                        <Zap size={15} color="#F59E0B" /> Importar da API
                    </button>
                    <button className="btn btn-outline" onClick={handleBatchExport} disabled={isUploading}>
                        <FileArchive size={15} /> {isUploading ? 'ZIP...' : 'Exportar ZIP'}
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowNewClientModal(true)}>
                        <Plus size={15} /> Novo Sistema
                    </button>
                </div>
            </div>
            <div className="table-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: 36 }}><input type="checkbox" /></th>
                                <th>Cliente</th><th>Cidade / Local</th><th>Geração Total</th><th>Hoje</th><th>Data Inst.</th><th>Status ECU</th><th>Competência</th><th style={{ width: 48 }}>PDF</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>Nenhum sistema encontrado.</td></tr>
                            ) : filteredClients.map(ac => (
                                <tr key={ac.id} onClick={() => setSelectedClientId(ac.id)} style={{ cursor: 'pointer' }}>
                                    <td><input type="checkbox" onClick={e => e.stopPropagation()} /></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#6366F1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                                                {ac.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{ac.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>{ac.system_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500, fontSize: '13px' }}>{(ac as any).city || '—'}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>UC {ac.uc}</div>
                                    </td>
                                    <td>{ac.generation > 0 ? `${ac.generation.toFixed(1)} kWh` : 'API pendente'}</td>
                                    <td style={{ fontWeight: 700, color: (ac as any).energy_today > 0 ? '#10B981' : 'var(--color-text-muted)' }}>
                                        {(ac as any).energy_today ? `${(ac as any).energy_today.toFixed(1)} kWh` : '—'}
                                    </td>
                                    <td style={{ fontSize: '12px' }}>{ac.activation_date ? new Date(ac.activation_date).toLocaleDateString('pt-BR') : '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: (ac as any).api_status === 'Normal' ? '#10B981' : (ac as any).api_status === 'Atenção' ? '#F59E0B' : '#DC2626' }}></div>
                                            <span style={{ fontSize: '12px', fontWeight: 500 }}>{(ac as any).api_status || 'Offline'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span className={`badge badge-${ac.status === 'Completo' ? 'cold' : ac.status === 'Divergente' ? 'warm' : 'hot'}`} style={{ fontSize: '11px' }}>
                                                {ac.latestBill ? ac.latestBill.competency : 'Vazio'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn btn-outline" title="Exportar PDF" style={{ padding: '4px 8px' }} onClick={e => { e.stopPropagation(); handleExportPDF(ac); }}>
                                            <Download size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ClientsListView;
