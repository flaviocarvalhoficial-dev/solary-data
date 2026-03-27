import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'signup';

const AuthPage: React.FC = () => {
    const { signInWithEmail, signUpWithEmail } = useAuth();
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error: authError } = mode === 'login'
            ? await signInWithEmail(email, password)
            : await signUpWithEmail(email, password, fullName);

        if (authError) setError(authError.message);
        setIsLoading(false);
    };

    return (
        <div style={{
            display: 'flex', height: '100vh',
            background: 'var(--color-bg-base)',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
        }}>
            <div style={{
                background: 'var(--color-bg-surface)',
                borderRadius: '10px',
                padding: '48px 40px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid var(--color-border)',
                // No shadow as per flat-first rule
            }}>
                {/* Logo Section */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', justifyContent: 'center' }}>
                    <img src="/logotipooficial.svg" alt="Watts Logo" style={{ height: '40px', width: 'auto' }} />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                        {mode === 'login' ? 'Welcome back' : 'Create Account'}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        {mode === 'login'
                            ? 'Solar fleet monitoring platform'
                            : 'Setup your operator account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {mode === 'signup' && (
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                required
                                style={{
                                    width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px',
                                    border: '1px solid var(--color-border)', fontSize: '14px',
                                    boxSizing: 'border-box', background: 'var(--color-bg-base)'
                                }}
                            />
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px',
                                border: '1px solid var(--color-border)', fontSize: '14px',
                                boxSizing: 'border-box', background: 'var(--color-bg-base)'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="password"
                            placeholder="Account Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                            style={{
                                width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px',
                                border: '1px solid var(--color-border)', fontSize: '14px',
                                boxSizing: 'border-box', background: 'var(--color-bg-base)'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '10px 14px', background: 'var(--color-status-danger-bg)',
                            borderRadius: '8px', color: 'var(--color-status-danger-text)', fontSize: '12px',
                            border: '1px solid rgba(239, 68, 68, 0.1)'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px',
                            padding: '14px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                            marginTop: '8px', transition: 'all 0.2s ease',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? 'Verifying...' : mode === 'login' ? 'Entrar' : 'Get Started'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        {mode === 'login' ? "Don't have an account?" : "Already a member?"}{' '}
                        <button
                            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                        >
                            {mode === 'login' ? 'Sign up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '32px', textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <img src="/favicon.svg" alt="Watts Mark" style={{ height: '20px', width: 'auto' }} />
                <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Powered by Veselty Engine
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
