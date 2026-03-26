import React, { useState, useMemo } from 'react';
import { Search, Bell, RefreshCw, FileText, Plus, FileArchive, Zap } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useClients } from './hooks/useClients';
import { useSystems } from './hooks/useSystems';
import { useBills, Bill } from './hooks/useBills';
import { logAuditEvent } from './hooks/useAuditLog';

// Custom Hooks
import { useBranding } from './hooks/useBranding';
import { useBillUpload } from './hooks/useBillUpload';
import { useSolarSync } from './hooks/useSolarSync';
import { useEnrichedClients } from './hooks/useEnrichedClients';
import { useExport } from './hooks/useExport';

// Components
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ClientsListView from './components/ClientsListView';
import ClientDetailView from './components/ClientDetailView';
import SettingsView from './components/SettingsView';
import ExecutiveReport from './components/ExecutiveReport';
import { NewClientModal, ImportModal, XLSImportModal, ManualLinkModal, BillReviewModal } from './components/Modals';
import OnboardingView from './components/OnboardingView';
import WattsMascot from './components/WattsMascot';

// Utilities
import { calculateFinalReport } from './utils/solarHelpers';

function App() {
    const { user, signOut } = useAuth();
    const { clients, refetch: refetchClients, create: createClient, update: updateClient, remove: removeClient } = useClients();
    const { systems, refetch: refetchSystems, upsert: upsertSystem, update: updateSystem } = useSystems();
    const { bills, refetch: refetchBills, create: createBill, update: updateBill, remove: deleteBill, resetForClient } = useBills();

    // State
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [platformFilter, setPlatformFilter] = useState('Todas');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Bill>>({});
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showXLSImportModal, setShowXLSImportModal] = useState(false);
    const [isSavingClient, setIsSavingClient] = useState(false);
    const [newClientForm, setNewClientForm] = useState({ name: '', uc: '', platform: 'APsystems', system_id: '', investment: 0, current_kwh_value: 0.95 });
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);

    React.useEffect(() => {
        const isDone = localStorage.getItem('solary_onboarding_done');
        if (!isDone) {
            setShowOnboarding(true);
        }
    }, []);

    const handleOnboardingComplete = () => {
        localStorage.setItem('solary_onboarding_done', 'true');
        setShowOnboarding(false);
    };

    // Hooks Refatorados
    const { branding, setBranding } = useBranding();

    const { syncSystemsFromAPI, handleXLSImportComplete, handleFetchSystems, handleImportSystem, handleImportAll,
        isSyncingAPI, isImporting, importList, syncProgress, syncTotal, setImportList
    } = useSolarSync({
        activeTab, clients, systems, createClient, updateClient, upsertSystem, refetchClients, refetchSystems
    });

    const { uploadFiles, handleFileUpload, isUploading, unlinkedBill, setUnlinkedBill, pendingReview, setPendingReview, processSingleBill } = useBillUpload({
        clients, systems, createClient, updateClient, createBill, refetchClients
    });

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent, targetClientId?: string) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const ids = await uploadFiles(files, targetClientId);
            await refetchBills();
            if (ids && ids.length > 0) navigateByProcessedClients(ids);
        }
    };

    const handleReviewConfirm = async () => {
        if (!pendingReview) return;
        try {
            await processSingleBill(pendingReview.file, pendingReview.parsed, pendingReview.clientId);
            const cid = pendingReview.clientId;
            setPendingReview(null);
            alert("Fatura revisada e importada com sucesso!");
            await refetchClients();
            await refetchBills();
            navigateByProcessedClients([cid]);
        } catch (err: any) {
            alert(`Erro ao salvar revisão: ${err.message}`);
        }
    };

    const handleManualLinkConfirm = async (clientId: string) => {
        if (!unlinkedBill) return;
        try {
            let finalId = clientId;

            // Se for um sistema ainda não importado para a tabela de clients, importamos agora
            const isRegistered = clients.some(c => c.id === clientId);
            if (!isRegistered) {
                const system = systems.find(s => s.id === clientId);
                if (system) {
                    const newClient = await createClient({
                        name: system.cliente || 'Sistema Importado',
                        uc: unlinkedBill.parsed.uc,
                        platform: 'APsystems',
                        system_id: system.sid,
                        city: system.cidade || '—',
                        investment: 0
                    });
                    finalId = newClient.id;
                }
            } else {
                // Se já estiver registrado, apenas atualiza a UC/Conta Contrato
                await updateClient(clientId, { uc: unlinkedBill.parsed.uc });
            }

            // Processar a fatura
            await processSingleBill(unlinkedBill.file, unlinkedBill.parsed, finalId);

            setUnlinkedBill(null);
            alert("Fatura vinculada e Conta Contrato salva no cadastro do cliente!");
            await refetchClients();
            await refetchBills();

            // Navegar para o cliente recém-vinculado
            navigateByProcessedClients([finalId]);
        } catch (err: any) {
            console.error('[MANUAL LINK ERROR]', err);
            alert(`Erro ao vincular: ${err.message}`);
        }
    };

    const availableCompetencies = useMemo(() => {
        const set = new Set<string>();
        bills.forEach(b => { if (b.competency) set.add(b.competency); });
        return Array.from(set).sort().reverse();
    }, [bills]);

    const [selectedCompetency, setSelectedCompetency] = useState<string>('');

    React.useEffect(() => {
        if (!selectedCompetency && availableCompetencies.length > 0) {
            setSelectedCompetency(availableCompetencies[0]);
        }
    }, [availableCompetencies, selectedCompetency]);

    const billMap = useMemo(() => {
        const map = new Map<string, Bill>();
        const filteredBills = bills.filter(b => b.competency === selectedCompetency);
        filteredBills.forEach(b => {
            const existing = map.get(b.client_id);
            if (!existing || (b.created_at ?? '') > (existing.created_at ?? '')) map.set(b.client_id, b);
        });
        return map;
    }, [bills, selectedCompetency]);

    const enrichedClients = useEnrichedClients({ clients, systems, billMap });

    const navigateByProcessedClients = (ids: string[]) => {
        if (!ids || ids.length === 0) return;

        if (ids.length === 1) {
            setSelectedClientId(ids[0]);
            return;
        }

        const processed = enrichedClients.filter(c => ids.includes(c.id));
        const platforms = Array.from(new Set(processed.map(c => c.platform)));

        if (platforms.length === 1) {
            const platform = platforms[0];
            setActiveTab('Fleet');
            setPlatformFilter(platform || 'Todas');
            setSelectedClientId(null);
            return;
        }

        // Multi-fabricante
        setActiveTab('Dashboard');
        setSelectedClientId(null);
    };

    const filteredClients = useMemo(() =>
        enrichedClients.filter(c => {
            const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.uc.includes(searchTerm);
            const matchStatus = statusFilter === 'Todos' || c.status === statusFilter;
            const matchPlatform = platformFilter === 'Todas' || c.platform === platformFilter;

            // Se estiver na aba Fleet, filtra por busca, status e plataforma
            if (activeTab === 'Fleet') return matchSearch && matchStatus && matchPlatform;

            // Fallback para outras abas (Bills, etc)
            return matchSearch && matchStatus;
        }), [enrichedClients, searchTerm, statusFilter, platformFilter, activeTab]);

    const { handleExportPDF, handleBatchExport, isExporting } = useExport({ branding, enrichedClients });

    // Handlers
    const handleUpdateClientOrSystem = async (id: string, data: any) => {
        try {
            if (clients.some(c => c.id === id)) await updateClient(id, data);
            else {
                const mappedData = { ...data };
                if (mappedData.uc) { mappedData.account = mappedData.uc; delete mappedData.uc; }
                await updateSystem(id, mappedData);
            }
        } catch (err: any) { alert(`Erro ao salvar: ${err.message}`); }
    };

    const handleSaveEdit = async () => {
        if (!selectedClientId) return;
        const ac = enrichedClients.find(c => c.id === selectedClientId)!;
        const existingBill = ac.latestBill;
        const { generation, ...billData } = editData as any;

        try {
            if (existingBill?.id) await updateBill(existingBill.id, billData);
            else await createBill({ ...billData, client_id: selectedClientId });

            // Sempre atualizamos o cliente para registrar a "Última atualização" de dados
            await updateClient(selectedClientId, {
                updated_at: new Date().toISOString(),
                ...(generation !== undefined ? { last_generation: generation } : {})
            });

            if (generation !== undefined && generation !== ac.generation) {
                await logAuditEvent('MANUAL_EDIT', selectedClientId, { oldGen: ac.generation }, { newGen: generation });
            }
            setIsEditing(false);
            refetchClients();
            refetchBills();
            alert("Dados salvos com sucesso!");
        } catch (err: any) { alert(`Erro: ${err.message}`); }
    };

    const handleDeleteBill = async (id: string, competency: string) => {
        if (confirm(`Excluir permanentemente o relatório de ${competency}?`)) {
            try {
                await deleteBill(id);
                // No need for alert here, just sync state
                await refetchBills();
            } catch (err: any) {
                alert(`Erro ao excluir: ${err.message}`);
            }
        }
    };

    const triggerStartEdit = () => {
        if (!selectedClientId) return;
        const ac = enrichedClients.find(c => c.id === selectedClientId);
        const bill = ac?.latestBill;
        setEditData(bill ? { ...bill } : {
            client_id: selectedClientId, competency: 'MAR/2026', total_value: 0, consumption: 0,
            compensated_energy: 0, credit_balance: 0, injected_energy: 0, tariff_kwh: 0.95, confidence: 0.5
        } as any);
        setIsEditing(true);
    };

    const selectedAC = enrichedClients.find(c => c.id === selectedClientId) ?? null;
    const selectedReport = selectedAC && selectedAC.latestBill ? calculateFinalReport(selectedAC, selectedAC.latestBill, selectedAC.generation) : null;

    if (showOnboarding) {
        return <OnboardingView onComplete={handleOnboardingComplete} />;
    }

    return (
        <div className="app-shell">
            <NewClientModal
                show={showNewClientModal} setShow={setShowNewClientModal} loading={isSavingClient} form={newClientForm} setForm={setNewClientForm}
                onSubmit={async (e) => {
                    e.preventDefault(); setIsSavingClient(true);
                    try { await createClient(newClientForm as any); setShowNewClientModal(false); } catch (err: any) { alert(err.message); }
                    setIsSavingClient(false);
                }}
            />

            <ImportModal show={showImportModal} setShow={setShowImportModal} list={importList} onImport={handleImportSystem} onImportAll={handleImportAll} />

            <XLSImportModal
                show={showXLSImportModal} setShow={setShowXLSImportModal} existingSids={systems.map(s => s.sid)}
                onImportComplete={handleXLSImportComplete}
            />

            <ManualLinkModal
                show={!!unlinkedBill}
                setShow={(val) => !val && setUnlinkedBill(null)}
                unlinkedBill={unlinkedBill}
                clients={enrichedClients}
                onConfirm={handleManualLinkConfirm}
            />

            <BillReviewModal
                show={!!pendingReview}
                setShow={(val) => !val && setPendingReview(null)}
                data={pendingReview?.parsed}
                client={enrichedClients.find(c => c.id === pendingReview?.clientId)}
                onConfirm={handleReviewConfirm}
            />

            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', pointerEvents: 'none' }}>
                {selectedReport && <ExecutiveReport data={selectedReport} branding={branding} />}
            </div>

            <Sidebar
                user={user as any} activeTab={activeTab} setActiveTab={setActiveTab}
                platformFilter={platformFilter} setPlatformFilter={setPlatformFilter}
                selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId}
                clientsCount={clients.length} incompleteCount={enrichedClients.filter(c => c.status === 'Incompleto').length}
                signOut={signOut} handleExportPDF={handleExportPDF} handleStartEdit={triggerStartEdit}
                removeClient={removeClient} selectedAC={selectedAC}
                isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}
            />

            <main className="main-content">
                {!selectedClientId && (
                    <header className="topbar" style={activeTab === 'Settings' ? { justifyContent: 'center', height: '80px' } : {}}>
                        {activeTab === 'Settings' ? (
                            <div className="search-container">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text" placeholder="Buscar configurações..."
                                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-page-title">
                                    {activeTab === 'Dashboard' ? 'Dashboard' : activeTab === 'Bills' ? 'Central de Faturas' : activeTab === 'Fleet' ? 'Gestão de Frota' : activeTab}
                                </h2>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="search-container" style={{ maxWidth: '240px' }}>
                                        <Search size={16} className="search-icon" />
                                        <input
                                            type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                            className="search-input"
                                            style={{ padding: '8px 12px 8px 40px' }}
                                        />
                                    </div>

                                    {availableCompetencies.length > 0 && (
                                        <div className="period-filter" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg-base)', padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Período</span>
                                            <select
                                                value={selectedCompetency} onChange={(e) => setSelectedCompetency(e.target.value)}
                                                style={{ border: 'none', background: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer', outline: 'none' }}
                                            >
                                                {availableCompetencies.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ height: '36px', padding: '0 16px', fontSize: '13px', borderRadius: '8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
                                            onClick={() => handleBatchExport(setSelectedClientId)}
                                            title="Exportar Tudo"
                                        >
                                            <FileArchive size={16} />
                                            <span className="hide-mobile" style={{ marginLeft: '6px' }}>Exportar ZIP</span>
                                        </button>

                                        <button
                                            className="btn btn-primary"
                                            style={{ height: '36px', padding: '0 16px', fontSize: '13px', borderRadius: '8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
                                            onClick={() => syncSystemsFromAPI()}
                                            disabled={isSyncingAPI}
                                            title="Sincronizar APIs"
                                        >
                                            <RefreshCw size={16} className={isSyncingAPI ? 'spin' : ''} />
                                            <span className="hide-mobile" style={{ marginLeft: '6px' }}>{isSyncingAPI ? 'Sincronizando...' : 'Atualizar Dados'}</span>
                                        </button>

                                        <div style={{ width: '1px', height: '20px', background: 'var(--color-border)', margin: '0 4px' }} />
                                        <button onClick={refetchClients} className="btn-icon" title="Recarregar do Banco"><RefreshCw size={18} /></button>
                                        <button className="btn-icon" style={{ position: 'relative' }}>
                                            <Bell size={20} />
                                            {enrichedClients.filter(c => c.status === 'Incompleto').length > 0 && <div className="badge-dot" />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </header>
                )}

                <div className="content-area">
                    {selectedAC ? (
                        <ClientDetailView
                            selectedAC={selectedAC} selectedBill={selectedAC.latestBill} selectedStats={selectedReport}
                            isEditing={isEditing} editData={editData} setEditData={setEditData}
                            handleSaveEdit={handleSaveEdit} setIsEditing={setIsEditing} handleStartEdit={triggerStartEdit}
                            setSelectedClientId={setSelectedClientId} handleExportPDF={handleExportPDF}
                            syncSystemsFromAPI={() => syncSystemsFromAPI(selectedAC.id, selectedAC.system_id)}
                            isSyncingAPI={isSyncingAPI} updateClientName={(newName) => updateClient(selectedAC.id, { name: newName })}
                            handleFileUpload={async (e) => {
                                const ids = await handleFileUpload(e, selectedAC.id);
                                if (ids && ids.length > 0) navigateByProcessedClients(ids);
                            }} isUploading={isUploading}
                            handleDrop={(e) => handleDrop(e, selectedAC.id)}
                            handleDragOver={handleDragOver}
                            handleDragLeave={handleDragLeave}
                            isDragging={isDragging}
                            branding={branding} handleResetData={resetForClient} selectedCompetency={selectedCompetency}
                            setSelectedCompetency={setSelectedCompetency} availableCompetencies={availableCompetencies}
                            clientBills={bills.filter(b => b.client_id === selectedAC.id)}
                            handleDeleteBill={handleDeleteBill}
                        />
                    ) : activeTab === 'Settings' ? (
                        <SettingsView user={user} branding={branding} setBranding={setBranding} />
                    ) : activeTab === 'Dashboard' ? (
                        <DashboardView
                            clients={clients} enrichedClients={enrichedClients}
                            totalGeneration={enrichedClients.reduce((a, c) => a + (c.generation || 0), 0)}
                            totalEconomy={enrichedClients.reduce((a, c) => {
                                const bill = c.latestBill;
                                if (!bill) return a;
                                return a + calculateFinalReport(c, bill, c.generation).resultado.economia_mensal;
                            }, 0)}
                            incompleteCount={enrichedClients.filter(c => c.status === 'Incompleto').length}
                            handleBatchExport={() => handleBatchExport(setSelectedClientId)} isUploading={isUploading || isExporting}
                            setSelectedClientId={setSelectedClientId} setActiveTab={setActiveTab}
                            syncSystemsFromAPI={() => syncSystemsFromAPI()} isSyncingAPI={isSyncingAPI}
                            syncProgress={syncProgress} syncTotal={syncTotal}
                        />
                    ) : activeTab === 'Bills' ? (
                        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
                            <div
                                className="card"
                                style={{
                                    padding: '80px 40px',
                                    textAlign: 'center',
                                    background: isDragging ? 'rgba(232, 89, 60, 0.03)' : 'var(--color-bg-surface)',
                                    border: isDragging ? '2px dashed var(--color-primary)' : '2px dashed var(--color-primary-light)',
                                    borderRadius: '24px',
                                    boxShadow: isDragging ? '0 20px 40px rgba(0,0,0,0.05)' : 'none',
                                    transition: 'all 0.2s ease'
                                }}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e)}
                            >
                                <div style={{ marginBottom: '32px', position: 'relative', display: 'inline-block' }}>
                                    <WattsMascot state={isDragging ? 'celebrando' : 'saudando'} size={160} />
                                    <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--color-primary)', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(232, 89, 60, 0.3)' }}>
                                        <Plus size={24} />
                                    </div>
                                </div>
                                <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                                    {isDragging ? 'Solte para Iniciar!' : 'Central de Processamento de Faturas'}
                                </h1>
                                <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                                    Nossa IA identifica a Unidade Consumidora (UC) automaticamente nos PDFs e vincula os dados aos sistemas correspondentes da sua frota.
                                </p>

                                <label className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '16px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(232, 89, 60, 0.15)', cursor: 'pointer' }}>
                                    {isUploading ? (
                                        <>
                                            <RefreshCw size={20} className="spin" /> Processando Arquivos...
                                        </>
                                    ) : (
                                        <>
                                            <FileArchive size={20} /> Selecionar PDFs para Upload
                                        </>
                                    )}
                                    <input type="file" multiple accept=".pdf" style={{ display: 'none' }} onChange={async (e) => {
                                        const ids = await handleFileUpload(e);
                                        if (ids && ids.length > 0) navigateByProcessedClients(ids);
                                    }} disabled={isUploading} />
                                </label>

                                <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                                    {isDragging ? 'Solte para importar agora mesma' : 'Arraste seus arquivos PDF aqui para iniciar o processamento em lote.'}
                                </p>
                            </div>

                            <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                                {[
                                    { icon: <FileText size={24} />, title: "Leitura Automatizada", text: "Extraímos consumo, injeção, tarifa e tributos diretamente do PDF original." },
                                    { icon: <RefreshCw size={24} />, title: "Vínculo Inteligente", text: "O sistema detecta a UC e associa a fatura ao cliente correto sem cliques extras." },
                                    { icon: <Zap size={24} />, title: "Cálculo de Economia", text: "Geramos o relatório executivo cruzando os dados da plataforma solar com a fatura." }
                                ].map((step, i) => (
                                    <div key={i} style={{ textAlign: 'left' }}>
                                        <div style={{ color: 'var(--color-primary)', marginBottom: '16px', background: 'var(--color-primary-muted)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {step.icon}
                                        </div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>{step.title}</h3>
                                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : activeTab === 'Fleet' ? (
                        <ClientsListView
                            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                            platformFilter={platformFilter} setPlatformFilter={setPlatformFilter}
                            isSyncingAPI={isSyncingAPI} syncSystemsFromAPI={(id, sid) => syncSystemsFromAPI(id, sid)}
                            handleFetchSystems={async () => {
                                const systems = await handleFetchSystems();
                                if (systems) { setImportList(systems); setShowImportModal(true); }
                            }}
                            isImporting={isImporting} handleBatchExport={() => handleBatchExport(setSelectedClientId)} isUploading={isUploading || isExporting}
                            setShowNewClientModal={setShowNewClientModal} filteredClients={filteredClients}
                            handleDeleteSelected={async () => {
                                if (!confirm(`Excluir ${selectedIds.length} sistemas?`)) return;
                                for (const id of selectedIds) await removeClient(id);
                                setSelectedIds([]);
                                refetchClients();
                            }}
                            handleClearAll={async () => {
                                if (!confirm("⚠️ ATENÇÃO: Limpar base?")) return;
                                for (const c of clients) await removeClient(c.id);
                                refetchClients();
                            }}
                            setSelectedClientId={setSelectedClientId} handleExportPDF={handleExportPDF}
                            setShowXLSImportModal={setShowXLSImportModal} updateClient={handleUpdateClientOrSystem}
                            selectedIds={selectedIds} setSelectedIds={setSelectedIds}
                        />
                    ) : (
                        <div className="empty-state">
                            <WattsMascot state="dormindo" size={120} className="mb-4" />
                            <h3>Página em desenvolvimento</h3>
                            <button className="btn btn-outline mt-4" onClick={() => setActiveTab('Dashboard')}>Voltar ao Dashboard</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;

