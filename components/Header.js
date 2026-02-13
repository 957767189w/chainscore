'use client';

import { networkConfig } from '../lib/genlayer';

/**
 * Header component with wallet connection
 */
export default function Header({ wallet }) {
  const formatAddr = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-mark">&#9672;</span>
          <span className="logo-text">ChainScore</span>
        </div>

        <nav className="nav">
          <a href="https://docs.genlayer.com" target="_blank" rel="noopener noreferrer">Docs</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>

        <div className="wallet-area">
          {wallet.isConnected ? (
            <div className="wallet-info">
              {!wallet.isCorrectNetwork && (
                <button className="switch-network-btn" onClick={wallet.switchNetwork}>
                  Switch Network
                </button>
              )}
              
              <div className="balance">
                <span className="balance-value">{wallet.balanceFormatted}</span>
                <span className="balance-unit">GEN</span>
              </div>

              <div className="address-badge">
                <span className="status-dot"></span>
                <span>{formatAddr(wallet.address)}</span>
              </div>
            </div>
          ) : (
            <button
              className="connect-btn"
              onClick={wallet.connect}
              disabled={wallet.isConnecting}
            >
              {wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
