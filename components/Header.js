'use client';

import { networkConfig } from '../lib/genlayer';

export default function Header({ wallet }) {
  const formatAddr = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <div className="logo">
          <span className="logo-mark">◈</span>
          <span className="logo-text">ChainScore</span>
        </div>

        {/* 导航 */}
        <nav className="nav">
          <a
            href="https://docs.genlayer.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            文档
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </nav>

        {/* 钱包 */}
        <div className="wallet-area">
          {wallet.isConnected ? (
            <div className="wallet-info">
              {/* 网络状态 */}
              {!wallet.isCorrectNetwork && (
                <button
                  className="switch-network-btn"
                  onClick={wallet.switchNetwork}
                >
                  切换网络
                </button>
              )}
              
              {/* 余额 */}
              <div className="balance">
                <span className="balance-value">{wallet.balanceFormatted}</span>
                <span className="balance-unit">GEN</span>
              </div>

              {/* 地址 */}
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
              {wallet.isConnecting ? '连接中...' : '连接钱包'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
