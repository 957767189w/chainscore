# ChainScore Protocol

On-chain Reputation Scoring Protocol - Built on GenLayer

Users connect MetaMask and sign a transaction to receive an AI-analyzed credit score.

---

## Project Structure

```
chainscore/
├── app/                    # Next.js App Router
│   ├── layout.js           # Root layout
│   ├── page.js             # Main page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── Header.js           # Top navigation
│   └── ScoreCard.js        # Score card
├── lib/                    # Utilities
│   ├── genlayer.js         # GenLayer SDK wrapper
│   ├── useWallet.js        # Wallet hook
│   └── useScore.js         # Score query hook
├── contracts/              # Smart contracts
│   └── chain_score.py      # GenLayer contract
├── public/                 # Static assets
├── package.json
├── next.config.js
├── vercel.json             # Vercel deployment config
└── .env.example            # Environment variables template
```

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_GENLAYER_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
```

### 3. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## Deploy Smart Contract

### Option 1: GenLayer Studio (Recommended)

1. Visit https://studio.genlayer.com/
2. Create new contract, paste `contracts/chain_score.py` content
3. Click Deploy
4. Copy contract address to `.env.local`

### Option 2: GenLayer CLI

```bash
# Install CLI
npm install -g genlayer-cli

# Configure network
genlayer network testnet

# Deploy contract
genlayer deploy --contract contracts/chain_score.py
```

---

## Deploy to Vercel

### Option 1: GitHub Integration (Recommended)

1. Push code to GitHub
2. Visit https://vercel.com/new
3. Import GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_GENLAYER_NETWORK`: `testnet`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: `YourContractAddress`
5. Click Deploy

### Option 2: Vercel CLI

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## MetaMask Configuration

Users need to add GenLayer network on first use:

| Config | Testnet Asimov |
|--------|----------------|
| Network Name | GenLayer Testnet |
| RPC URL | https://testnet-rpc.genlayer.com |
| Chain ID | 61998 |
| Currency Symbol | GEN |
| Block Explorer | https://testnet-explorer.genlayer.com |

**The app will automatically prompt to add the network.**

---

## Query Mechanism

Current version: **Free queries** (query_fee = 0)

Flow:
1. User initiates query
2. MetaMask popup for transaction confirmation (gas fee only)
3. User confirms transaction
4. Contract executes AI analysis
5. Returns score result

To enable paid queries, modify `query_fee` in the contract.

---

## Modify Query Fee

Current: Free (`query_fee = 0`). To enable fees, modify the contract:

```python
# Current: Free
self.query_fee = 0

# Change to 0.1 GEN
self.query_fee = 100000000000000000
```

Also update frontend `lib/genlayer.js`:

```javascript
export const QUERY_FEE = BigInt('100000000000000000');
```

---

## Development Notes

### Local Development (Using Studio)

1. Start GenLayer Studio

```bash
genlayer init
genlayer up
```

2. Update environment variable

```env
NEXT_PUBLIC_GENLAYER_NETWORK=studionet
```

3. Deploy contract in Studio

4. Start frontend

```bash
npm run dev
```

### Network Configuration

| Network | RPC | Chain ID |
|---------|-----|----------|
| studionet | http://localhost:4000/api | 61999 |
| testnet | https://testnet-rpc.genlayer.com | 61998 |

---

## Test GEN Tokens

Get test tokens on Testnet:

1. Join GenLayer Discord: https://discord.gg/genlayer
2. Request tokens in #faucet channel
3. Or visit official Faucet (if available)

---

## FAQ

### Q: MetaMask not popping up?

- Check if MetaMask is installed
- Check if browser is blocking popups
- Try refreshing the page

### Q: Shows "Payment failed"?

- Check if GEN balance is sufficient for gas
- Confirm you're on the correct network
- Verify contract address is correct

### Q: Score takes too long?

- GenLayer AI consensus requires multiple validators
- First query typically takes 20-30 seconds
- Cached scores return faster

### Q: How to modify UI?

- Styles: `app/globals.css`
- Main page: `app/page.js`
- Score card: `components/ScoreCard.js`

---

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Smart Contract**: GenLayer (Python)
- **SDK**: genlayer-js
- **Deployment**: Vercel
- **Wallet**: MetaMask

---

## Links

- GenLayer Docs: https://docs.genlayer.com/
- GenLayer Studio: https://studio.genlayer.com/
- GenLayer JS SDK: https://docs.genlayer.com/api-references/genlayer-js
- Testnet Asimov: https://www.genlayer.com/testnet

---

