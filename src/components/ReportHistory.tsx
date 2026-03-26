import { History, Trash2 } from 'lucide-react';
import { Bill } from '../hooks/useBills';
import { calculateFinalReport, ActiveClient } from '../utils/solarHelpers';

interface ReportHistoryProps {
    clientBills: Bill[];
    selectedAC: ActiveClient;
    onView: (competency: string) => void;
    currentCompetency: string;
    onDelete: (id: string, competency: string) => void;
}

export const ReportHistory: React.FC<ReportHistoryProps> = ({ clientBills, selectedAC, onView, currentCompetency, onDelete }) => {
    return (
        <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <History size={18} style={{ color: 'var(--color-primary)' }} />
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Histórico de Relatórios</h3>
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Mês</th>
                            <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Economia</th>
                            <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientBills.length > 0 ? clientBills.sort((a, b) => b.competency.localeCompare(a.competency)).map(bill => {
                            const stats = calculateFinalReport(selectedAC, bill, (bill as any).generation || 0);
                            return (
                                <tr key={bill.id} style={{ borderBottom: '1px solid var(--color-bg-base)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '12px 0', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{bill.competency}</td>
                                    <td style={{ padding: '12px 0', fontSize: '13px', color: 'var(--color-status-success-text)', fontWeight: 600 }}>
                                        R$ {stats.resultado.economia_mensal.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '12px 0', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => onView(bill.competency)}
                                            className="btn btn-outline"
                                            style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', opacity: currentCompetency === bill.competency ? 0.5 : 1 }}
                                            disabled={currentCompetency === bill.competency}
                                        >
                                            Ver
                                        </button>
                                        <button
                                            onClick={() => onDelete(bill.id, bill.competency)}
                                            style={{ background: 'none', border: 'none', color: 'var(--color-status-danger-text)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', opacity: 0.7 }}
                                            title="Excluir este registro"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                                    Vazio
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
