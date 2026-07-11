# CTIN — Confidential Treasury Intent Network

The confidential execution layer for institutional treasuries. Institutions submit
encrypted intents, the network nets them privately with Nox, executes a single opaque
trade on unmodified Safe and Uniswap, and returns confidential receipts. Strategy stays
hidden, custody stays in Safe, and auditors keep full visibility on demand.

Built for the iExec WTF Hackathon Summer Edition on Ethereum Sepolia.

## Repository layout

```
CTIN
  frontend    Next.js application deployed on Vercel
  contracts   Hardhat workspace with the Nox confidential contracts
```

## Frontend

The frontend is a Next.js application styled with the magma fissure theme.

```
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Deployment target is Vercel. The project root for the Vercel project is the `frontend`
directory.

### Frontend structure

```
frontend/app          Next.js routes, layout, and providers
frontend/source/design       Theme tokens
frontend/source/background   Magma fissure particle field
frontend/source/layout       Navigation and page shell
frontend/source/wallet       Wallet connection configuration
frontend/source/landing      Landing page sections
frontend/source/institution  Institution console
frontend/source/auditor      Auditor console
frontend/source/explorer     Batch explorer
frontend/source/shared       Shared components, domain types, and state
```

## Contracts

```
cd contracts
npm install
cp .env.example .env
npm run compile
npm run deploy:sepolia
```

### Contract structure

```
contracts/contracts/core        Confidential intent network and disclosure registry
contracts/contracts/adapters    Uniswap execution adapter
contracts/contracts/interfaces  Shared interfaces
contracts/scripts               Deployment scripts
```

## Networks

All contracts and the application run on Ethereum Sepolia.
