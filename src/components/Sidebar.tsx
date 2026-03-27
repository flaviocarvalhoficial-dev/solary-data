import React from 'react';
import {
    Sun, LayoutDashboard, FileText, ChevronLeft,
    Download, Edit3, X, LogOut, Settings as SettingsIcon,
    ChevronDown, ChevronRight
} from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface SidebarProps {
    user: User | null;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    selectedClientId: string | null;
    setSelectedClientId: (id: string | null) => void;
    clientsCount: number;
    incompleteCount: number;
    signOut: () => void;
    handleExportPDF: (ac: any) => void;
    handleStartEdit: () => void;
    removeClient: (id: string) => Promise<void>;
    selectedAC: any;
    platformFilter: string;
    setPlatformFilter: (tab: string) => void;
    isCollapsed: boolean;
    setIsCollapsed: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    user,
    activeTab,
    setActiveTab,
    selectedClientId,
    setSelectedClientId,
    clientsCount,
    incompleteCount,
    signOut,
    handleExportPDF,
    handleStartEdit,
    removeClient,
    selectedAC,
    platformFilter,
    setPlatformFilter,
    isCollapsed,
    setIsCollapsed
}) => {
    const [isFleetExpanded, setIsFleetExpanded] = React.useState(true);
    const userInitial = (user?.email || 'A').charAt(0).toUpperCase();
    const userName = user?.user_metadata?.full_name || user?.email || 'Admin';

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="logo-toggle-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isCollapsed ? '0' : '12px 8px', marginBottom: '24px' }}>
                <div
                    className="logo-container"
                    onClick={() => { setActiveTab('Dashboard'); setSelectedClientId(null); }}
                    style={{ display: 'flex', alignItems: 'center', padding: isCollapsed ? '0' : '4px', cursor: 'pointer' }}
                >
                    <img
                        src={isCollapsed ? "/favicon.svg" : "/logotipooficial.svg"}
                        alt="Watts Logo"
                        style={{
                            height: isCollapsed ? '28px' : '32px',
                            width: 'auto',
                            transition: 'all 0.2s ease'
                        }}
                    />
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '6px' }}
                    className="hover-bg"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
                <nav className="sidebar-group" style={{ marginBottom: '8px' }}>
                    <a href="#" className={`sidebar-item ${activeTab === 'Dashboard' && !selectedClientId ? 'active' : ''}`}
                        onClick={e => { e.preventDefault(); setActiveTab('Dashboard'); setSelectedClientId(null); }}
                        title={isCollapsed ? "Dashboard" : ""}>
                        <LayoutDashboard size={isCollapsed ? 22 : 18} />
                        <span>Dashboard</span>
                    </a>

                    <div
                        onClick={() => setIsFleetExpanded(!isFleetExpanded)}
                        className={`sidebar-item ${activeTab === 'Fleet' && !selectedClientId ? 'active' : ''}`}
                        style={{ cursor: 'pointer', justifyContent: 'space-between', gap: isCollapsed ? '0' : '8px' }}
                        title={isCollapsed ? "Gestão de Projetos" : ""}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? '0' : '8px' }}>
                            <Sun size={isCollapsed ? 22 : 18} />
                            <span>Gestão de Projetos</span>
                        </div>
                        {!isCollapsed && (isFleetExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
                    </div>

                    {isFleetExpanded && (
                        <div style={{ paddingLeft: isCollapsed ? '0' : '16px', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                            {['APsystems', 'Sungrow', 'GoodWe'].map(p => (
                                <a key={p} href="#" className={`sidebar-item ${activeTab === 'Fleet' && platformFilter === p && !selectedClientId ? 'active' : ''}`}
                                    onClick={e => { e.preventDefault(); setActiveTab('Fleet'); setPlatformFilter(p); setSelectedClientId(null); }}
                                    style={{ padding: '6px 12px', fontSize: '12px', gap: isCollapsed ? '0' : '8px' }}
                                    title={isCollapsed ? p : ""}>
                                    <div style={{
                                        width: isCollapsed ? '22px' : '18px',
                                        height: isCollapsed ? '22px' : '18px',
                                        borderRadius: '4px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        color: 'var(--color-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: isCollapsed ? '13px' : '10px',
                                        fontWeight: 700
                                    }}>{p[0]}</div>
                                    <span>{p}</span>
                                </a>
                            ))}
                        </div>
                    )}

                    <a href="#" className={`sidebar-item ${activeTab === 'Bills' && !selectedClientId ? 'active' : ''}`}
                        onClick={e => { e.preventDefault(); setActiveTab('Bills'); setSelectedClientId(null); }}
                        title={isCollapsed ? "Central de Faturas" : ""}>
                        <FileText size={isCollapsed ? 22 : 18} />
                        <span>Faturas</span>
                    </a>
                </nav>

                <div style={{ height: '1px', background: 'var(--color-border)', margin: isCollapsed ? '16px 8px' : '16px 12px', opacity: 0.5 }} />

                <nav className="sidebar-group">
                    <a href="#" className={`sidebar-item ${activeTab === 'Settings' && !selectedClientId ? 'active' : ''}`}
                        onClick={e => { e.preventDefault(); setActiveTab('Settings'); setSelectedClientId(null); }}
                        title={isCollapsed ? "Configurações" : ""}>
                        <SettingsIcon size={isCollapsed ? 22 : 18} />
                        <span>Configurações</span>
                    </a>
                </nav>

                {selectedClientId && (
                    <div style={{ marginTop: '32px', padding: isCollapsed ? '0' : '0 8px' }}>
                        {!isCollapsed && <div className="sidebar-group-label" style={{ marginBottom: '12px', color: 'var(--color-primary)', fontWeight: 700 }}>Sistema Ativo</div>}
                        <nav className="sidebar-group" style={{ background: isCollapsed ? 'transparent' : 'var(--color-primary-muted)', borderRadius: '12px', padding: isCollapsed ? '0' : '4px' }}>
                            <a href="#" className="sidebar-item" onClick={e => { e.preventDefault(); setSelectedClientId(null); }}
                                style={{ color: 'var(--color-primary)' }}
                                title={isCollapsed ? "Voltar" : ""}>
                                <ChevronLeft size={isCollapsed ? 22 : 18} />
                                <span>Voltar</span>
                            </a>
                            <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
                                onClick={() => selectedAC && handleExportPDF(selectedAC)}
                                title={isCollapsed ? "Baixar PDF" : ""}>
                                <Download size={isCollapsed ? 22 : 18} />
                                <span>Exportar PDF</span>
                            </button>
                            <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }} onClick={handleStartEdit}
                                title={isCollapsed ? "Editar Fatura" : ""}>
                                <Edit3 size={isCollapsed ? 22 : 18} />
                                <span>Editar Fatura</span>
                            </button>
                            <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--color-status-danger-text)' }}
                                onClick={async () => { if (confirm('Remover este sistema?')) { await removeClient(selectedClientId); setSelectedClientId(null); } }}
                                title={isCollapsed ? "Excluir Sistema" : ""}>
                                <X size={isCollapsed ? 22 : 18} />
                                <span>Remover</span>
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            <div style={{ padding: isCollapsed ? '16px 0' : '16px 12px', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-sidebar)', display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '0' : '0 4px' }}>
                    <div style={{
                        width: isCollapsed ? '40px' : '32px',
                        height: isCollapsed ? '40px' : '32px',
                        borderRadius: '50%',
                        background: user?.user_metadata?.avatar_url ? 'transparent' : 'var(--color-primary)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: isCollapsed ? '16px' : '13px',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        overflow: 'hidden',
                        border: user?.user_metadata?.avatar_url ? '1px solid var(--color-border)' : 'none'
                    }}>
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            userInitial
                        )}
                    </div>
                    <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Administrador</div>
                    </div>
                    {!isCollapsed && (
                        <button onClick={signOut} title="Sair" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
