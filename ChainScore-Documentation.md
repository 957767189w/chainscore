# ChainScore

## On-chain Reputation Scoring Protocol

ChainScore is a decentralized credit scoring protocol built on GenLayer, leveraging AI-powered smart contracts to analyze Ethereum wallet addresses and generate comprehensive reputation scores.

---

## Project Overview

### Problem Statement

In the Web3 ecosystem, assessing the credibility and trustworthiness of wallet addresses remains a significant challenge. Traditional credit scoring systems don't apply to pseudonymous blockchain identities, creating friction in:

- DeFi lending and borrowing
- NFT marketplace transactions
- DAO governance participation
- Airdrop eligibility verification
- Sybil attack prevention

### Solution

ChainScore provides an on-chain reputation scoring system that:

1. Analyzes wallet transaction history and behavior patterns
2. Uses multiple AI validators to reach consensus on scores
3. Generates transparent, verifiable reputation metrics
4. Stores results on-chain for composability with other protocols

---

## Technical Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18 |
| Wallet Integration | MetaMask (EIP-1193) |
| Smart Contract | GenLayer Intelligent Contract (Python) |
| AI Consensus | GenLayer Optimistic Democracy |
| Deployment | Vercel (Frontend), GenLayer Network (Contract) |

### Contract Address

```
0xC2Dd389015255B31c58F47bd421b1510bbD15860
```

### Core Components

```
chainscore/
├── app/                    # Next.js App Router
│   ├── page.js            # Main UI
│   ├── layout.js          # Root layout
│   └── globals.css        # Styling
├── components/
│   ├── Header.js          # Navigation & wallet status
│   └── ScoreCard.js       # Score display component
├── lib/
│   ├── genlayer.js        # Network configuration
│   ├── useWallet.js       # MetaMask integration hook
│   └── useScore.js        # Score query logic
└── contracts/
    └── chain_score.py     # GenLayer intelligent contract
```

---

## Features

### Current Features (v1.0)

- **Wallet Connection**: MetaMask integration with network auto-switching
- **Address Query**: Query any Ethereum wallet address
- **MetaMask Signature**: Transaction confirmation via personal_sign
- **Multi-dimensional Scoring**:
  - Asset Health (25%)
  - Transaction Activity (20%)
  - DeFi Engagement (25%)
  - Account Maturity (15%)
  - Governance Participation (15%)
- **Grade System**: A/B/C/D/F rating based on total score
- **Sybil Risk Assessment**: Low/Medium/High risk indicators
- **Responsive Design**: Mobile and desktop support

### User Flow

```
1. Connect Wallet (MetaMask)
        ↓
2. Enter Target Address (self or others)
        ↓
3. Sign Query Request (0 GEN fee)
        ↓
4. AI Validators Analyze On-chain Data
        ↓
5. Consensus Reached → Score Generated
        ↓
6. Display Results with Breakdown
```

---

## Future Development Roadmap

### Phase 1: Core Enhancement (Q1 2026)

#### 1.1 Real On-chain Data Integration
- [ ] Integrate Etherscan API for actual transaction history
- [ ] Connect to DeFi protocol subgraphs (Uniswap, Aave, Compound)
- [ ] Fetch NFT holdings and trading history
- [ ] Query governance participation (Snapshot, Tally)

#### 1.2 Scoring Algorithm Improvement
- [ ] Machine learning model for pattern recognition
- [ ] Historical score tracking and trend analysis
- [ ] Peer comparison within wallet cohorts
- [ ] Risk factor weighting customization

#### 1.3 Multi-chain Support
- [ ] Polygon score integration
- [ ] Arbitrum activity analysis
- [ ] Optimism transaction history
- [ ] Cross-chain score aggregation

---

### Phase 2: Protocol Features (Q2 2026)

#### 2.1 Score NFT (Soulbound Token)
- [ ] Mint reputation score as non-transferable NFT
- [ ] On-chain score verification
- [ ] Score badge display for other dApps
- [ ] Score history preservation

#### 2.2 API Service
- [ ] RESTful API for third-party integration
- [ ] Webhook notifications for score changes
- [ ] Batch query endpoints
- [ ] Rate limiting and API key management

#### 2.3 Score Subscription
- [ ] Real-time score monitoring
- [ ] Alert notifications for score changes
- [ ] Watchlist management
- [ ] Email/Telegram notifications

---

### Phase 3: Ecosystem Integration (Q3 2026)

#### 3.1 DeFi Integration
- [ ] Lending protocol credit assessment
- [ ] Collateral ratio adjustment based on score
- [ ] Under-collateralized lending for high scores
- [ ] Insurance premium calculation

#### 3.2 DAO Tooling
- [ ] Voter credibility scoring
- [ ] Delegate reputation tracking
- [ ] Proposal spam prevention
- [ ] Governance power weighting

#### 3.3 NFT Marketplace
- [ ] Buyer/seller reputation display
- [ ] Fraud risk assessment
- [ ] Trade history credibility
- [ ] Escrow recommendations

---

### Phase 4: Advanced Features (Q4 2026)

#### 4.1 Privacy-Preserving Scores
- [ ] Zero-knowledge proof of score range
- [ ] Selective disclosure (prove score > X without revealing exact value)
- [ ] Private score computation

#### 4.2 Reputation Recovery
- [ ] Score improvement recommendations
- [ ] Activity suggestions for score boost
- [ ] Historical negative event decay
- [ ] Appeal mechanism for disputed scores

#### 4.3 Enterprise Solutions
- [ ] White-label scoring service
- [ ] Custom scoring criteria
- [ ] Compliance reporting
- [ ] Bulk verification tools

---

## Business Model

### Revenue Streams

| Model | Description | Timeline |
|-------|-------------|----------|
| Query Fees | Per-query fee in GEN tokens | Phase 1 |
| API Subscription | Monthly API access tiers | Phase 2 |
| Enterprise Licensing | Custom deployment fees | Phase 4 |
| Score NFT Minting | One-time minting fee | Phase 2 |

### Token Economics (Future)

- Query payments in GEN
- Staking for API access tiers
- Governance voting rights
- Validator incentives

---

## Competitive Advantages

1. **AI-Powered Analysis**: GenLayer's intelligent contracts enable sophisticated on-chain AI analysis
2. **Decentralized Consensus**: Multiple validators ensure score accuracy and prevent manipulation
3. **On-chain Storage**: Scores are verifiable and composable with other protocols
4. **Low Cost**: Minimal gas fees on GenLayer network
5. **Real-time Updates**: Scores reflect latest on-chain activity

---

## Technical Specifications

### Scoring Dimensions

| Dimension | Weight | Factors Analyzed |
|-----------|--------|------------------|
| Asset Health | 25% | Token diversity, balance stability, blue-chip holdings |
| Tx Activity | 20% | Transaction frequency, volume patterns, consistency |
| DeFi Engagement | 25% | Protocol interactions, LP positions, yield farming |
| Account Maturity | 15% | Wallet age, first transaction date, activity span |
| Governance | 15% | Voting history, delegation, proposal participation |

### Grade Thresholds

| Grade | Score Range | Description |
|-------|-------------|-------------|
| A | 80-100 | Excellent reputation |
| B | 65-79 | Good standing |
| C | 50-64 | Average |
| D | 35-49 | Below average |
| F | 0-34 | Poor/New wallet |

### Sybil Risk Levels

| Level | Criteria |
|-------|----------|
| Low | Score ≥ 60, Maturity ≥ 50 |
| Medium | Score 40-59 |
| High | Score < 40 |

---

## Getting Started

### Local Development

```bash
# Clone and install
git clone <repository>
cd chainscore
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Deployment

```bash
# Deploy to Vercel
npx vercel --prod
```

### Contract Deployment

1. Open GenLayer Studio
2. Load `contracts/chain_score.py`
3. Deploy to Testnet/Mainnet
4. Update `CONTRACT_ADDRESS` in `lib/genlayer.js`

---


## Links

- **Live Demo**: https://chainscore-theta.vercel.app
- **GenLayer**: https://genlayer.com
- **Documentation**: https://docs.genlayer.com

---


*Built with GenLayer - The Intelligent Blockchain*
