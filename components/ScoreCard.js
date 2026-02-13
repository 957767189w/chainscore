'use client';

import { formatGen } from '../lib/genlayer';

/**
 * Score card component
 * Displays wallet reputation score with breakdown
 * Includes "Credit Loan" button at the bottom
 */
export default function ScoreCard({ data, onReset }) {
  if (!data) return null;

  const {
    address,
    total_score,
    grade,
    dimensions,
    sybil_risk,
    summary,
    highlights,
    concerns,
    timestamp,
    fee_paid,
    asset_health,
    tx_activity,
    defi_engagement,
    account_maturity,
    governance,
  } = data;

  // Get color based on score
  const getColor = (score) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#65a30d';
    if (score >= 40) return '#ca8a04';
    if (score >= 20) return '#ea580c';
    return '#dc2626';
  };

  // Grade color mapping
  const gradeColors = {
    A: { bg: '#dcfce7', text: '#166534' },
    B: { bg: '#ecfccb', text: '#3f6212' },
    C: { bg: '#fef9c3', text: '#854d0e' },
    D: { bg: '#fed7aa', text: '#9a3412' },
    F: { bg: '#fecaca', text: '#991b1b' },
  };

  // Risk level labels
  const riskLabels = {
    low: { text: 'Low', class: 'risk-low' },
    medium: { text: 'Medium', class: 'risk-medium' },
    high: { text: 'High', class: 'risk-high' },
  };

  // Dimension display names
  const dimensionNames = {
    asset_health: 'Asset Health',
    tx_activity: 'Tx Activity',
    defi_engagement: 'DeFi Engagement',
    account_maturity: 'Account Maturity',
    governance: 'Governance',
  };

  // Dimension weights
  const dimensionWeights = {
    asset_health: 25,
    tx_activity: 20,
    defi_engagement: 25,
    account_maturity: 15,
    governance: 15,
  };

  // Build dimensions object
  const dims = dimensions || {
    asset_health: asset_health || 50,
    tx_activity: tx_activity || 50,
    defi_engagement: defi_engagement || 50,
    account_maturity: account_maturity || 50,
    governance: governance || 50,
  };

  const gc = gradeColors[grade] || gradeColors.C;
  const risk = riskLabels[sybil_risk] || riskLabels.medium;
  const scoreColor = getColor(total_score || 50);

  // Handle Credit Loan button click
  const handleCreditLoan = () => {
    alert('Credit Loan feature coming soon!');
  };

  return (
    <div className="score-card">
      <div className="card-top">
        <div className="address-row">
          <span className="label">Wallet Address</span>
          <span className="addr">{address}</span>
        </div>
        {timestamp && (
          <span className="time">
            {new Date(timestamp * 1000).toLocaleString('en-US')}
          </span>
        )}
      </div>

      <div className="score-main">
        <div className="score-ring" style={{ borderColor: scoreColor }}>
          <span className="score-num">{total_score || 50}</span>
          <span className="score-max">/100</span>
        </div>
        <div className="badges">
          <span className="grade-tag" style={{ background: gc.bg, color: gc.text }}>
            Grade {grade || 'C'}
          </span>
          <span className={`risk-tag ${risk.class}`}>
            Sybil Risk: {risk.text}
          </span>
        </div>
      </div>

      {summary && (
        <div className="summary-row">
          <p>{summary}</p>
        </div>
      )}

      <div className="dimensions">
        <h4>Score Breakdown</h4>
        {Object.entries(dims).map(([key, value]) => (
          <div key={key} className="dim-item">
            <div className="dim-top">
              <span className="dim-name">
                {dimensionNames[key] || key}
                <span className="dim-weight">({dimensionWeights[key] || 20}%)</span>
              </span>
              <span className="dim-score">{value}</span>
            </div>
            <div className="dim-bar-bg">
              <div
                className="dim-bar"
                style={{ width: `${value}%`, background: getColor(value) }}
              />
            </div>
          </div>
        ))}
      </div>

      {(highlights?.length > 0 || concerns?.length > 0) && (
        <div className="insights">
          {highlights && highlights.length > 0 && (
            <div className="insight-col">
              <h5>Highlights</h5>
              <ul>
                {highlights.map((h, i) => (
                  <li key={i} className="highlight">
                    <span className="icon">+</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {concerns && concerns.length > 0 && (
            <div className="insight-col">
              <h5>Risk Alerts</h5>
              <ul>
                {concerns.map((c, i) => (
                  <li key={i} className="concern">
                    <span className="icon">!</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="card-bottom">
        {fee_paid > 0 && (
          <span className="fee-info">Paid {formatGen(fee_paid)} GEN</span>
        )}
        <div className="actions">
          <button
            className="btn-secondary"
            onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
          >
            Etherscan
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              const url = `${window.location.origin}?address=${address}`;
              navigator.clipboard.writeText(url);
              alert('Link copied');
            }}
          >
            Share
          </button>
          <button className="btn-primary" onClick={onReset}>
            New Query
          </button>
        </div>
      </div>

      {/* Credit Loan Button */}
      <div className="loan-section">
        <button className="btn-loan" onClick={handleCreditLoan}>
          Credit Loan
        </button>
      </div>
    </div>
  );
}
