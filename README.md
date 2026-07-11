<p align="center">
  <img src="./assets/banner.svg" alt="CTIN — Confidential Treasury Intent Network" width="100%" />
</p>

<p align="center">
  <b>The confidential execution layer for institutional treasuries.</b>
</p>

<p align="center">
  Ethereum Sepolia &nbsp;·&nbsp; Nox FHE &nbsp;·&nbsp; Safe &nbsp;·&nbsp; Uniswap &nbsp;·&nbsp; Next.js &nbsp;·&nbsp; Vercel
</p>

---

CTIN lets many institutions submit encrypted treasury intents, nets them privately with Nox,
executes a single opaque trade on unmodified Safe and Uniswap, and returns confidential
receipts. Strategy stays hidden, custody stays in Safe, and auditors keep full visibility on
demand. Built for the iExec WTF Hackathon Summer Edition.

## Problem

Every DAO, crypto fund, stablecoin issuer, and tokenized asset manager has a treasury. The
moment they rebalance, buy, sell, or pay on-chain, everyone sees it.

- **Strategy leakage** — competitors read positions, runway, and counterparties directly from the chain.
- **Extractable value** — sandwich attacks extracted more than 289 million dollars in the first half of 2025 by watching trade size before execution.
- **Copy trading** — large intents are front-run and mirrored, pushing price away before an institution finishes its order.

Institutions therefore avoid moving treasury operations fully on-chain.

## Solution

CTIN is a shared confidential execution layer. Existing "private" tools hide one transaction.
CTIN hides the entire treasury strategy across many institutions by netting encrypted intents
before anything touches the market.

```
Institution A: Buy  400 ETH
Institution B: Sell 350 ETH          netted with Nox          Single on-chain trade
Institution C: Buy  100 ETH   ───────────────────────────▶   Buy 150 ETH
                                                             (nobody sees who or how much)
```

- **Encrypted intents** — amounts, direction, and beneficiaries are encrypted with Nox before submission.
- **Homomorphic netting** — intents are summed on encrypted data so only the net residual is ever revealed.
- **Fair clearing price** — internal crosses settle at a blended executed volume weighted and oracle price.
- **Custody stays in Safe** — a scoped Safe module authorizes each batch; funds never leave institution custody.
- **Selective disclosure** — each institution grants auditors decryption rights to its own data on demand.
- **Confidential receipts** — every party decrypts only its own fill and private execution report.

## Architecture

The flow runs from the treasury signer through the browser and frontend to the wallet, then
into the confidential contracts and on to execution.

<p align="center">
  <img src="./assets/architecture.svg" alt="CTIN architecture and flow" width="100%" />
</p>

Text view of the confidential execution flow:

```
Treasury Signer -> Browser -> CTIN Frontend -> Wallet -> Safe -> Safe Module
      -> Confidential Intent Network (Nox) -> TEE Runner -> Uniswap Adapter -> Uniswap v3
```

### Repository layout

```
CTIN
├── frontend     Next.js application (magma fissure theme, deployed on Vercel)
├── contracts    Hardhat workspace with the Nox confidential contracts
└── assets       Brand assets
```

### Frontend structure

```
frontend/app                 Next.js routes, root layout, and providers
frontend/source/design       Theme tokens
frontend/source/background   Magma fissure particle field
frontend/source/wallet       Wallet connection configuration
frontend/source/layout       Navigation and page shell
frontend/source/landing      Landing page sections
frontend/source/institution  Institution console
frontend/source/auditor      Auditor console
frontend/source/explorer     Batch explorer
frontend/source/shared       Shared components, domain types, and state
```

### Contracts structure

```
contracts/contracts/core        Intent network, disclosure registry, and safe module
contracts/contracts/adapters    Uniswap execution adapter
contracts/contracts/interfaces  Shared interfaces
contracts/contracts/mocks       Mock safe and token for tests
contracts/test                  Contract tests
contracts/scripts               Deployment scripts
```

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, Space Grotesk, JetBrains Mono |
| Motion | Canvas magma fissure particle field, Framer Motion |
| Wallet | wagmi, viem, RainbowKit |
| State | Zustand |
| Confidential compute | Nox confidential smart contracts (FHE + TEE) |
| Contracts | Solidity 0.8.35, Hardhat |
| Integrated protocols | Safe, Uniswap v3 (both unmodified) |
| Network | Ethereum Sepolia |
| Deployment | Vercel |

## Installation and setup

### Prerequisites

- Node.js 18 or later
- A WalletConnect project id
- A funded Sepolia account for contract deployment

### Frontend

```
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000. Build for production with `npm run build`.

Frontend environment variables:

```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
NEXT_PUBLIC_SEPOLIA_RPC_URL
NEXT_PUBLIC_INTENT_NETWORK_CONTRACT_ADDRESS
NEXT_PUBLIC_SAFE_MODULE_CONTRACT_ADDRESS
```

### Contracts

```
cd contracts
npm install
cp .env.example .env
npm run compile
npm run deploy:sepolia
```

Contract environment variables:

```
SEPOLIA_RPC_URL
DEPLOYER_PRIVATE_KEY
```

### Deploy the frontend to Vercel

- Set the Vercel project root directory to `frontend`.
- Framework preset is detected as Next.js.
- Add the frontend environment variables in the Vercel project settings.

## Networks

All contracts and the application run on Ethereum Sepolia.
