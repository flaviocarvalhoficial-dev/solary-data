import React from 'react';
import { ChevronLeft, Download, Sun, Edit3, RefreshCw, FileUp, Clock, ExternalLink, Eye, X, Plus } from 'lucide-react';
import { ActiveClient, FinalReportObject, getEmaPortalLink } from '../utils/solarHelpers';
import ExecutiveReport from './ExecutiveReport';
import { Bill } from '../hooks/useBills';

// Sub-components
import { BillEditModal } from './BillEditModal';
import { KPIGrid } from './KPIGrid';
import { PerformanceAnalysis } from './PerformanceAnalysis';
import { ReportHistory } from './ReportHistory';

interface ClientDetailViewProps {
    selectedAC: ActiveClient;
    selectedBill: Bill | null;
    selectedStats: FinalReportObject | null;
    isEditing: boolean;
    editData: any;
    setEditData: (data: any) => void;
    handleSaveEdit: () => void;
    setIsEditing: (val: boolean) => void;
    handleStartEdit: () => void;
    setSelectedClientId: (id: string | null) => void;
    handleExportPDF: (ac: ActiveClient) => void;
    syncSystemsFromAPI: () => void;
    isSyncingAPI: boolean;
    updateClientName: (name: string) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    branding: any;
    handleResetData: (id: string) => void;
    selectedCompetency: string;
    setSelectedCompetency: (val: string) => void;
    availableCompetencies: string[];
    clientBills: Bill[];
    handleDrop: (e: React.DragEvent) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    isDragging: boolean;
    handleDeleteBill: (id: string, competency: string) => void;
}

const ClientDetailView: React.FC<ClientDetailViewProps> = ({
    selectedAC, selectedBill, selectedStats, isEditing, editData, setEditData,
    handleSaveEdit, setIsEditing, handleStartEdit, handleResetData,
    selectedCompetency, setSelectedCompetency, availableCompetencies, clientBills,
    setSelectedClientId, handleExportPDF, syncSystemsFromAPI, isSyncingAPI,
    handleFileUpload, isUploading, branding,
    handleDrop, handleDragOver, handleDragLeave, isDragging, handleDeleteBill
}) => {
    const [showReviewModal, setShowReviewModal] = React.useState(false);

    return (
        <div style={{ padding: '0 24px' }}>
            <BillEditModal
                isOpen={isEditing} onClose={() => setIsEditing(false)}
                editData={editData} setEditData={setEditData} onSave={handleSaveEdit}
                selectedAC={selectedAC} selectedBill={selectedBill}
            />

            {/* Header / Top Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <button onClick={() => setSelectedClientId(null)} title="Voltar para a lista" style={{ border: 'none', background: 'var(--color-bg-base)', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                            <ChevronLeft size={18} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{selectedAC.name}</h2>
                            {getEmaPortalLink(selectedAC) && (
                                <a
                                    href={getEmaPortalLink(selectedAC)!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Abrir no Portal EMA"
                                    style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.1)' }}
                                >
                                    <ExternalLink size={16} />
                                </a>
                            )}
                        </div>
                        <span className={`badge badge-${selectedAC.status === 'Completo' ? 'success' : selectedAC.status === 'Divergente' ? 'warning' : 'danger'}`}>
                            {selectedAC.status}
                        </span>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginLeft: '38px', marginTop: '4px' }}>
                        Conta {selectedAC.uc} · <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{selectedAC.platform}</span> · ID {selectedAC.system_id}
                        {selectedAC.updated_at && (
                            <> · <span title="Última atualização de dados" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <RefreshCw size={12} style={{ opacity: 0.6 }} /> {new Date(selectedAC.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span></>
                        )}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="btn btn-primary" style={{ borderRadius: '8px', fontSize: '13px' }} onClick={() => setShowReviewModal(true)}>
                        <Eye size={14} /> Revisar Relatório
                    </button>
                    <button className="btn btn-outline" style={{ borderRadius: '8px', fontSize: '13px' }} onClick={syncSystemsFromAPI} disabled={isSyncingAPI}>
                        <RefreshCw size={14} className={isSyncingAPI ? 'spin' : ''} /> {isSyncingAPI ? 'Sync' : 'Atualizar'}
                    </button>
                    <label className="btn btn-outline" style={{ borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <Plus size={14} /> Enviar Fatura
                        <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                    <button className="btn btn-outline" style={{ borderRadius: '8px', fontSize: '13px' }} onClick={handleStartEdit}>
                        <Edit3 size={14} /> Editar Dados
                    </button>
                    <button className="btn btn-outline" style={{ borderRadius: '8px', fontSize: '13px' }} onClick={() => handleExportPDF(selectedAC)}>
                        <Download size={14} /> PDF
                    </button>
                </div>
            </div>

            <KPIGrid selectedAC={selectedAC} selectedBill={selectedBill} selectedStats={selectedStats} />

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <PerformanceAnalysis
                    generation={selectedAC.generation}
                    compensatedEnergy={selectedStats?.dados_entrada.fatura.energia_compensada_kwh || 0}
                    gridConsumption={selectedStats?.dados_entrada.fatura.consumo_kwh || 0}
                />

                {/* Status & Review Card */}
                <div className="card" data-tooltip="Consolidação dos dados de geração (API) e consumo (Fatura) para esta competência." style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Status Operacional</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {selectedBill && (
                                <button
                                    onClick={() => { if (confirm('Limpar dados desta competência?')) handleResetData(selectedAC.id); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-status-danger-text)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}
                                    title="Resetar Dados"
                                >
                                    <RefreshCw size={12} /> Resetar
                                </button>
                            )}
                            <span className={`badge ${selectedStats ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11px', padding: '4px 10px' }}>
                                {selectedStats ? 'Dados Sincronizados' : 'Aguardando Sinc'}
                            </span>
                        </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                            {selectedStats
                                ? 'O relatório executivo para esta competência está pronto. Verifique os cálculos de economia e investimento antes de exportar.'
                                : 'Faltam dados operacionais ou fatura para esta competência. Sincronize via API ou envie o PDF da fatura.'}
                        </p>

                        {selectedBill && (
                            <div style={{ background: 'var(--color-bg-base)', borderRadius: '10px', padding: '16px', marginBottom: '20px', border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {[
                                        { label: 'Consumo', value: `${(selectedBill.consumption || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kWh` },
                                        { label: 'Compensado', value: `${(selectedBill.compensated_energy || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kWh` },
                                        { label: 'Tarifa', value: `R$ ${(selectedBill.tariff_kwh || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
                                        { label: 'Valor Total', value: `R$ ${selectedBill.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, primary: true },
                                    ].map((item, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 0',
                                            borderBottom: idx === 3 ? 'none' : '1px solid var(--color-border-light)'
                                        }}>
                                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.label}</span>
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: item.primary ? 'var(--color-primary)' : 'var(--color-text-primary)'
                                            }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {selectedStats ? (
                                <button className="btn btn-outline" style={{ width: '100%', borderRadius: '8px' }} onClick={() => setShowReviewModal(true)}>
                                    Visualizar PDF Executivo
                                </button>
                            ) : (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        background: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                                        padding: isDragging ? '12px' : '0',
                                        borderRadius: '12px',
                                        border: isDragging ? '2px dashed var(--color-primary)' : 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <label className="btn btn-primary" style={{ width: '100%', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}>
                                        <Plus size={14} /> {isDragging ? 'Solte para Importar' : 'Upload PDF Fatura'}
                                        <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                                    </label>
                                    {!isDragging && (
                                        <button className="btn btn-outline" style={{ width: '100%', borderRadius: '8px' }} onClick={syncSystemsFromAPI} disabled={isSyncingAPI}>
                                            <RefreshCw size={14} className={isSyncingAPI ? 'spin' : ''} /> Sincronizar API
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '24px' }}>
                <ReportHistory
                    clientBills={clientBills} selectedAC={selectedAC}
                    onView={setSelectedCompetency} currentCompetency={selectedCompetency}
                    onDelete={handleDeleteBill}
                />
            </div>

            {/* FULLSCREEN REVIEW MODAL */}
            {showReviewModal && selectedStats && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', padding: '24px', backdropFilter: 'blur(8px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: '#fff' }}>
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Revisão de Relatório: {selectedAC.name}</h2>
                            <p style={{ fontSize: '12px', opacity: 0.7 }}>Competência: {selectedCompetency}</p>
                        </div>
                        <button onClick={() => setShowReviewModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '24px' }}>
                        <div style={{ background: '#fff', borderRadius: '4px', transform: 'scale(0.9)', transformOrigin: 'top center', marginBottom: '100px' }}>
                            <ExecutiveReport data={selectedStats} branding={branding} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '20px' }}>
                        <button className="btn" style={{ padding: '12px 32px', background: '#374151', color: '#fff', borderRadius: '8px' }} onClick={() => setShowReviewModal(false)}>Voltar para Auditoria</button>
                        <button className="btn btn-primary" style={{ padding: '12px 32px', borderRadius: '8px' }} onClick={() => { handleExportPDF(selectedAC); setShowReviewModal(false); }}>Download PDF</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDetailView;
