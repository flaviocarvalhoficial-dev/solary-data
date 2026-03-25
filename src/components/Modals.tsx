import React from 'react';
import { X, Zap } from 'lucide-react';

interface NewClientModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    form: any;
    setForm: (form: any) => void;
    loading: boolean;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
    show, setShow, onSubmit, form, setForm, loading
}) => {
    if (!show) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={onSubmit} style={{ background: '#fff', borderRadius: '16px', padding: '36px', width: '440px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Novo Sistema</h3>
                    <button type="button" onClick={() => setShow(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                {[
                    { label: 'Nome do Cliente', field: 'name', type: 'text', placeholder: 'Ex: João Silva' },
                    { label: 'Unidade Consumidora (UC)', field: 'uc', type: 'text', placeholder: 'Ex: 15690453' },
                    { label: 'System ID (APsystems)', field: 'system_id', type: 'text', placeholder: 'ID da plataforma' },
                    { label: 'Investimento (R$)', field: 'investment', type: 'number', placeholder: '0' },
                ].map(({ label, field, type, placeholder }) => (
                    <div key={field}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>{label}</label>
                        <input
                            type={type}
                            placeholder={placeholder}
                            required={field !== 'investment'}
                            value={form[field]}
                            onChange={e => setForm((p: any) => ({ ...p, [field]: type === 'number' ? parseFloat(e.target.value || '0') : e.target.value }))}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}
                        />
                    </div>
                ))}
                <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Plataforma</label>
                    <select value={form.platform} onChange={e => setForm((p: any) => ({ ...p, platform: e.target.value }))}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }}>
                        <option>APsystems</option>
                        <option>Sungrow</option>
                        <option>GoodWe</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar Sistema'}
                </button>
            </form>
        </div>
    );
};

interface ImportModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    list: any[];
    onImport: (sys: any) => void;
    onImportAll: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
    show, setShow, list, onImport, onImportAll
}) => {
    if (!show) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', width: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Sistemas Encontrados ({list.length})</h3>
                    <button onClick={() => setShow(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {list.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>Nenhum sistema novo encontrado.</p>
                    ) : list.map((sys, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>
                                    {sys.username || sys.customerAccount || sys.userAccount || sys.customer_account ||
                                        sys.account || sys.accountName || sys.sname || sys.name ||
                                        sys.systemName || sys.customerName || 'Usina sem nome'}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>ID: {sys.sid || sys.id || sys.systemId}</div>
                            </div>
                            <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => onImport(sys)}>Importar</button>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={onImportAll} disabled={list.length === 0}>Importar Todos</button>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShow(false)}>Fechar</button>
                </div>
            </div>
        </div>
    );
};
