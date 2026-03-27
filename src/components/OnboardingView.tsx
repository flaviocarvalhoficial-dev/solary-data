import React from 'react';
import { Zap, FileText, BarChart3, ChevronRight, Sun } from 'lucide-react';
import WattsMascot from './WattsMascot';

interface OnboardingViewProps {
    onComplete: () => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
    return (
        <div className="onboarding-screen">
            <div className="onboarding-hero">
                <WattsMascot state="saudando" size={320} className="mx-auto mb-6" />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
                    <img src="/logotipooficial.svg" alt="Watts Logo" style={{ height: '64px', width: 'auto' }} />
                </div>
                <p className="onboarding-subtitle">
                    Sua nova plataforma de inteligência operacional para gestão de frotas solares.
                    Vamos configurar seu ambiente em poucos passos.
                </p>
            </div>

            <div className="onboarding-grid">
                <div className="onboarding-card">
                    <div className="onboarding-card-icon">
                        <Zap size={20} />
                    </div>
                    <h3 className="onboarding-card-title">Monitoramento Live</h3>
                    <p className="onboarding-card-text">
                        Conectamos diretamente com APsystems, Sungrow e GoodWe para trazer dados de geração em tempo real.
                    </p>
                </div>

                <div className="onboarding-card">
                    <div className="onboarding-card-icon">
                        <FileText size={20} />
                    </div>
                    <h3 className="onboarding-card-title">Auditoria de Faturas</h3>
                    <p className="onboarding-card-text">
                        Importe suas faturas em PDF e deixe nossa inteligência extrair consumo, tarifa e compensação automaticamente.
                    </p>
                </div>

                <div className="onboarding-card">
                    <div className="onboarding-card-icon">
                        <BarChart3 size={20} />
                    </div>
                    <h3 className="onboarding-card-title">Relatórios Executivos</h3>
                    <p className="onboarding-card-text">
                        Gere relatórios de desempenho auditados e prontos para envio aos seus clientes com um único clique.
                    </p>
                </div>
            </div>

            <button
                className="btn btn-primary"
                style={{ padding: '14px 40px', fontSize: '15px', borderRadius: '12px' }}
                onClick={onComplete}
            >
                Começar Agora <ChevronRight size={18} style={{ marginLeft: '8px' }} />
            </button>

            <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Ao continuar, você concorda com nossos termos de uso e privacidade.
            </p>
        </div>
    );
};

export default OnboardingView;
