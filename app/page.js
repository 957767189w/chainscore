'use client';

import { useState } from 'react';
import { useWallet } from '../lib/useWallet';
import { useScore } from '../lib/useScore';
import { CONTRACT_ADDRESS, networkConfig } from '../lib/genlayer';
import Header from '../components/Header';
import ScoreCard from '../components/ScoreCard';

export default function Home() {
  const wallet = useWallet();
  const score = useScore();
  
  const [targetAddress, setTargetAddress] = useState('');
  const [step, setStep] = useState('idle');

  const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const useMyAddress = () => {
    if (wallet.address) {
      setTargetAddress(wallet.address);
    }
  };

  const handleQuery = async () => {
    if (!targetAddress) {
      score.reset();
      return;
    }

    if (!isValidAddress(targetAddress)) {
      score.reset();
      return;
    }

    if (!wallet.isConnected) {
      const connected = await wallet.connect();
      if (!connected) return;
    }

    if (!wallet.isCorrectNetwork) {
      const switched = await wallet.switchNetwork();
      if (!switched) return;
    }

    setStep('confirming');
    
    const result = await score.queryScore(targetAddress, wallet.address);
    
    if (result) {
      setStep('done');
      wallet.refresh();
    } else {
      setStep('error');
    }
  };

  const handleReset = () => {
    setStep('idle');
    score.reset();
    setTargetAddress('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isValidAddress(targetAddress)) {
      handleQuery();
    }
  };

  const isQueryingSelf = wallet.address && 
    targetAddress.toLowerCase() === wallet.address.toLowerCase();

  return (
    <div className="app">
      <Header wallet={wallet} />

      <main className="main">
        <div className="hero">
          <h1>ChainScore</h1>
          <p className="tagline">On-chain Reputation at a Glance</p>
        </div>

        <div className="search-box">
          <div className="input-row">
            <input
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter any wallet address 0x..."
              className="address-input"
              spellCheck={false}
              disabled={score.loading}
            />
            <button
              onClick={handleQuery}
              disabled={score.loading || !isValidAddress(targetAddress)}
              className="query-btn"
            >
              {score.loading ? 'Processing...' : 'Query Score'}
            </button>
          </div>

          {wallet.isConnected && (
            <div className="address-hints">
              {wallet.address !== targetAddress && (
                <button className="use-mine-btn" onClick={useMyAddress}>
                  Use my address
                </button>
              )}
              {isValidAddress(targetAddress) && !isQueryingSelf && (
                <span className="query-info">
                  Querying other wallet · Gas paid by your wallet
                </span>
              )}
            </div>
          )}

          {targetAddress && !isValidAddress(targetAddress) && (
            <p className="hint error">Invalid address format</p>
          )}

          {!wallet.isConnected && isValidAddress(targetAddress) && (
            <p className="hint">
              Connect wallet to sign transaction (gas fee only)
            </p>
          )}
        </div>

        {score.error && (
          <div className="error-box">
            <span className="error-icon">!</span>
            <span>{score.error}</span>
            <button onClick={handleReset} className="retry-btn">Retry</button>
          </div>
        )}

        {score.loading && (
          <div className="loading-box">
            <div className="spinner"></div>
            <p>AI is analyzing on-chain data...</p>
            <p className="loading-sub">
              {step === 'confirming' 
                ? 'Please confirm in MetaMask' 
                : 'First analysis may take ~30 seconds'}
            </p>
            {score.txHash && (
              <p className="tx-hash">
                Tx: {score.txHash.slice(0, 10)}...{score.txHash.slice(-8)}
              </p>
            )}
          </div>
        )}

        {score.scoreData && !score.loading && (
          <ScoreCard data={score.scoreData} onReset={handleReset} />
        )}

        {!score.scoreData && !score.loading && (
          <div className="intro">
            <h3>How It Works</h3>
            <div className="steps">
              <div className="step">
                <span className="step-num">1</span>
                <div className="step-content">
                  <strong>Connect Wallet</strong>
                  <p>Connect MetaMask to sign transactions</p>
                </div>
              </div>
              <div className="step">
                <span className="step-num">2</span>
                <div className="step-content">
                  <strong>Enter Address</strong>
                  <p>Query your own or any other wallet</p>
                </div>
              </div>
              <div className="step">
                <span className="step-num">3</span>
                <div className="step-content">
                  <strong>AI Analysis</strong>
                  <p>Multiple AI validators reach consensus on the score</p>
                </div>
              </div>
            </div>

            <div className="network-info">
              <p>Network: {networkConfig.name}</p>
              {CONTRACT_ADDRESS && (
                <p className="contract-addr">
                  Contract: {CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-6)}
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
        <p className="disclaimer">Scores are for reference only, not financial advice</p>
      </footer>
    </div>
  );
}
