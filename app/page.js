'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '../lib/useWallet';
import { useScore } from '../lib/useScore';
import { formatGen, QUERY_FEE, CONTRACT_ADDRESS, networkConfig } from '../lib/genlayer';
import Header from '../components/Header';
import ScoreCard from '../components/ScoreCard';

export default function Home() {
  const wallet = useWallet();
  const score = useScore();
  
  const [targetAddress, setTargetAddress] = useState('');
  const [step, setStep] = useState('idle'); // idle | confirming | processing | done | error

  // 验证地址格式
  const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  // 使用自己的地址
  const useMyAddress = () => {
    if (wallet.address) {
      setTargetAddress(wallet.address);
    }
  };

  // 查询评分
  const handleQuery = async () => {
    // 前置检查
    if (!targetAddress) {
      score.reset();
      return;
    }

    if (!isValidAddress(targetAddress)) {
      score.reset();
      return;
    }

    // 检查钱包连接
    if (!wallet.isConnected) {
      const connected = await wallet.connect();
      if (!connected) return;
    }

    // 检查网络
    if (!wallet.isCorrectNetwork) {
      const switched = await wallet.switchNetwork();
      if (!switched) return;
    }

    // 检查余额
    const balanceWei = BigInt(wallet.balance || '0');
    if (balanceWei < QUERY_FEE) {
      score.reset();
      alert(`GEN 余额不足。需要 ${formatGen(QUERY_FEE)} GEN，当前余额 ${wallet.balanceFormatted} GEN`);
      return;
    }

    // 开始查询
    setStep('confirming');
    
    const result = await score.queryScore(targetAddress, wallet.address);
    
    if (result) {
      setStep('done');
      wallet.refresh();
    } else {
      setStep('error');
    }
  };

  // 重置
  const handleReset = () => {
    setStep('idle');
    score.reset();
    setTargetAddress('');
  };

  // 键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isValidAddress(targetAddress)) {
      handleQuery();
    }
  };

  return (
    <div className="app">
      <Header wallet={wallet} />

      <main className="main">
        {/* Hero */}
        <div className="hero">
          <h1>ChainScore</h1>
          <p className="tagline">链上信誉，一目了然</p>
        </div>

        {/* 搜索区 */}
        <div className="search-box">
          <div className="input-row">
            <input
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入钱包地址 0x..."
              className="address-input"
              spellCheck={false}
              disabled={score.loading}
            />
            <button
              onClick={handleQuery}
              disabled={score.loading || !isValidAddress(targetAddress)}
              className="query-btn"
            >
              {score.loading ? '处理中...' : `查询 (${formatGen(QUERY_FEE)} GEN)`}
            </button>
          </div>

          {/* 使用我的地址 */}
          {wallet.isConnected && wallet.address !== targetAddress && (
            <button className="use-mine-btn" onClick={useMyAddress}>
              使用我的地址
            </button>
          )}

          {/* 地址验证提示 */}
          {targetAddress && !isValidAddress(targetAddress) && (
            <p className="hint error">地址格式不正确</p>
          )}

          {/* 费用提示 */}
          {isValidAddress(targetAddress) && !score.loading && step === 'idle' && (
            <p className="hint">
              查询将从您的钱包扣除 {formatGen(QUERY_FEE)} GEN
            </p>
          )}
        </div>

        {/* 错误提示 */}
        {score.error && (
          <div className="error-box">
            <span className="error-icon">!</span>
            <span>{score.error}</span>
            <button onClick={handleReset} className="retry-btn">重试</button>
          </div>
        )}

        {/* 加载状态 */}
        {score.loading && (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>AI 正在分析链上数据...</p>
            <p className="loading-sub">请在钱包中确认交易，首次分析约需 30 秒</p>
            {score.txHash && (
              <p className="tx-hash">
                交易: {score.txHash.slice(0, 10)}...{score.txHash.slice(-8)}
              </p>
            )}
          </div>
        )}

        {/* 评分结果 */}
        {score.scoreData && !score.loading && (
          <ScoreCard data={score.scoreData} onReset={handleReset} />
        )}

        {/* 说明区 */}
        {!score.scoreData && !score.loading && (
          <div className="intro">
            <h3>工作原理</h3>
            <div className="steps">
              <div className="step">
                <span className="step-num">1</span>
                <div className="step-content">
                  <strong>连接钱包</strong>
                  <p>使用 MetaMask 连接到 GenLayer 网络</p>
                </div>
              </div>
              <div className="step">
                <span className="step-num">2</span>
                <div className="step-content">
                  <strong>支付查询费</strong>
                  <p>每次查询消耗 {formatGen(QUERY_FEE)} GEN</p>
                </div>
              </div>
              <div className="step">
                <span className="step-num">3</span>
                <div className="step-content">
                  <strong>AI 分析</strong>
                  <p>多个 AI 验证器共识生成可信评分</p>
                </div>
              </div>
            </div>

            {/* 网络信息 */}
            <div className="network-info">
              <p>当前网络: {networkConfig.name}</p>
              {CONTRACT_ADDRESS && (
                <p className="contract-addr">
                  合约: {CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-6)}
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          Built on{' '}
          <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer">
            GenLayer
          </a>
        </p>
        <p className="disclaimer">评分仅供参考，不构成投资建议</p>
      </footer>
    </div>
  );
}
