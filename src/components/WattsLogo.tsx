import React from 'react';

interface WattsLogoProps {
    size?: number;
    className?: string;
    style?: React.CSSProperties;
    showMascot?: boolean;
}

const WattsLogo: React.FC<WattsLogoProps> = ({
    size = 32,
    className = '',
    style = {},
    showMascot = false
}) => {
    const primaryColor = 'var(--color-primary)';

    return (
        <div
            className={`watts-logo-container ${className}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                ...style
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    fontFamily: "'Caveat', cursive",
                    fontSize: `${size}px`,
                    fontWeight: 700,
                    color: primaryColor,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    userSelect: 'none'
                }}
            >
                <span>Watt</span>
                <svg
                    width={size * 0.7}
                    height={size * 1.2}
                    viewBox="0 0 24 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        marginLeft: '-2px',
                        marginBottom: `-${size * 0.1}px`,
                        filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.05))'
                    }}
                >
                    <path
                        d="M18 2L6 20H14L8 34L22 14H12L20 2H18Z"
                        fill={primaryColor}
                        stroke={primaryColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </div>
    );
};

export default WattsLogo;
