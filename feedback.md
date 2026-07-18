# Feedback on iExec Nox tools

This document records our experience building **CTIN — Confidential Treasury Intent Network** with the
iExec Nox tooling during the WTF Hackathon Summer Edition. CTIN nets encrypted treasury intents with
Nox and settles the single net residual from an existing Safe onto unmodified Uniswap v3, with
revocable auditor disclosure. The notes below reference the Nox docs (docs.noxprotocol.io) and the
concepts they define: Nox Smart Contracts, Handles, the Handle Gateway, and handle ACLs.

## Tools used

- Nox confidential smart contracts (Solidity) — encrypted `euint256` values referenced through Handles
- Nox JavaScript SDK — `encryptInput`, `decrypt`, and viewer/ACL management via the Handle Gateway
- Nox Hardhat plugin and Nox Hardhat starter
- Confidential smart contracts wizard (cdefi-wizard)
- Nox on Ethereum Sepolia

## What worked well

- **Handles + ACL model mapped cleanly onto our use case.** Referencing confidential values as Handles
  and gating them with an ACL (Manage Handle Access / Manage Viewers) was exactly the primitive we
  needed for auditor disclosure: `fromExternal` to ingest encrypted intents, private netting over the
  handles, and adding a specific auditor as a viewer so they — and only they — can `decrypt`. Revoking
  that access again was straightforward once the ACL flow clicked.
- **Composability held.** Because the confidential token stays ERC-20 compatible, we settled the net
  residual on unmodified Uniswap v3 and pulled funds through an unmodified Safe via a Safe Module. We
  did not have to fork liquidity or rewrite the underlying protocols — which is the whole premise of the
  challenge.
- **Confidentiality-without-anonymity** is the right mental model for institutional DeFi. The docs frame
  this well, and it let us keep amounts encrypted to the market while remaining fully accountable to an
  authorized auditor.
- **Hardhat plugin + starter** got us from zero to a deployable confidential contract quickly, so most
  of our time went into the surrounding treasury/Safe/Uniswap logic rather than fighting the toolchain.

## Friction and issues

- **Docs host redirect.** `docs.iex.ec/nox-protocol/...` (the URL in the hackathon brief and in older
  search results) 308-redirects to `docs.noxprotocol.io`. Deep links and bookmarks broke until we
  realised the canonical host had changed.
- **Archive RPC for event reads.** Our event-driven frontend uses `eth_getLogs` over the deployment
  block range. The common public Sepolia endpoint (publicnode) rejects historical log queries with
  "Archive requests require a personal token", which silently returned empty batch lists. Switching the
  frontend RPC to an archive-capable endpoint (Tenderly) fixed it. A recommended archive RPC in the
  getting-started guide would save builders hours.
- **ACL failure modes are the hardest part to debug.** The happy path (`fromExternal` → compute →
  `addViewer` → `decrypt`) is clear, but when a caller lacks access the error surface is opaque. It was
  not always obvious whether a failed `decrypt` was a missing `allow`/`allowThis`, a missing viewer
  grant, or a stale handle. Clearer, typed error messages for ACL denials would shorten this loop a lot.
- **Latency/gas expectations undocumented.** We could not find guidance on how long a `decrypt` round
  trip through the Handle Gateway takes or the gas cost of handle operations, which made designing
  frontend loading states guesswork.

## Suggestions

- Publish a **single end-to-end runnable example**: `encryptInput` on the client → a contract that
  computes over Handles → `addViewer` for a third party → that party calls `decrypt`. This one script
  would cover 80% of what most builders need and demystify the ACL lifecycle.
- Expand the **JS SDK reference** with the full ACL lifecycle (`allow`, `allowThis`, add/remove viewer,
  `publicDecrypt`) and the exact error each call throws when access is missing.
- Add a short **"Manage Viewers vs Manage Public Decryption"** decision note — when to grant a private
  viewer versus expose a value publicly.
- Document **decrypt latency and per-operation gas** so builders can design UX around it.
- Recommend an **archive-capable Sepolia RPC** in getting-started, since any event-driven dApp will hit
  the historical `eth_getLogs` limitation immediately.
- Keep old `docs.iex.ec` links **redirecting with anchors preserved**, or add a banner pointing to
  `docs.noxprotocol.io`.
