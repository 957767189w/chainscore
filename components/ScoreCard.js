'use client';

import { formatGen } from '../lib/genlayer';

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
  } = data;

  // 颜色映射
  const getColor = (score) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#65a30d';
    if (score >= 40) return '#ca8a04';
    if (score >= 20) return '#ea580c';
    return '#dc2626';
  };

  const gradeColors = {
    A: { bg: '#dcfce7', text: '#166534' },
    B: { bg: '#ecfccb', text: '#3f6212' },
    C: { bg: '#fef9c3', text: '#854d0e' },
    D: { bg: '#fed7aa', text: '#9a3412' },
    F: { bg: '#fecaca', text: '#991b1b' },
  };

  const riskLabels = {
    low: { text: '低', class: 'risk-low' },
    medium: { text: '中', class: 'risk-medium' },
    high: { text: '高', class: 'risk-high' },
  };

  const dimensionNames = {
    asset_health: '资产健康',
    tx_activity: '交易活跃',
    defi_engagement: 'DeFi 参与',
    account_maturity: '账户成熟',
    governance: '治理参与',
  };

  const dimensionWeights = {
    asset_health: 25,
    tx_activity: 20,
    defi_engagement: 25,
    account_maturity: 15,
    governance: 15,
  };

  const gc = gradeColors[grade] || gradeColors.C;
  const risk = riskLabels[sybil_risk] || riskLabels.medium;
  const scoreColor = getColor(total_score);

  return (
    <div className="score-card">
      {/* 头部 */}
      <div className="card-top">
        <div className="address-row">
          <span className="label">查询地址</span>
          <span className="addr">{address}</span>
        </div>
        {timestamp && (
          <span className="time">
            {new Date(timestamp * 1000).toLocaleString('zh-CN')}
          </span>
        )}
      </div>

      {/* 主评分 */}
      <div className="score-main">
        <div className="score-ring" style={{ borderColor: scoreColor }}>
          <span className="score-num">{total_score}</span>
          <span className="score-max">/100</span>
        </div>
        <div className="badges">
          <span
            className="grade-tag"
            style={{ background: gc.bg, color: gc.text }}
          >
            {grade} 级
          </span>
          <span className={`risk-tag ${risk.class}`}>
            女巫风险: {risk.text}
          </span>
        </div>
      </div>

      {/* 总结 */}
      {summary && (
        <div className="summary-row">
          <p>{summary}</p>
        </div>
      )}

      {/* 维度详情 */}
      <div className="dimensions">
        <h4>评分详情</h4>
        {dimensions &&
          Object.entries(dimensions).map(([key, value]) => (
            <div key={key} className="dim-item">
              <div className="dim-top">
                <span className="dim-name">
                  {dimensionNames[key] || key}
                  <span className="dim-weight">({dimensionWeights[key]}%)</span>
                </span>
                <span className="dim-score">{value}</span>
              </div>
              <div className="dim-bar-bg">
                <div
                  className="dim-bar"
                  style={{
                    width: `${value}%`,
                    background: getColor(value),
                  }}
                />
              </div>
            </div>
          ))}
      </div>

      {/* 亮点和风险 */}
      <div className="insights">
        {highlights && highlights.length > 0 && (
          <div className="insight-col">
            <h5>亮点</h5>
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
            <h5>风险提示</h5>
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

      {/* 底部操作 */}
      <div className="card-bottom">
        {fee_paid && (
          <span className="fee-info">
            已支付 {formatGen(fee_paid)} GEN
          </span>
        )}
        <div className="actions">
          <button
            className="btn-secondary"
            onClick={() => {
              window.open(`https://etherscan.io/address/${address}`, '_blank');
            }}
          >
            Etherscan
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              const url = `${window.location.origin}?address=${address}`;
              navigator.clipboard.writeText(url);
              alert('链接已复制');
            }}
          >
            分享
          </button>
          <button className="btn-primary" onClick={onReset}>
            新查询
          </button>
        </div>
      </div>
    </div>
  );
}
