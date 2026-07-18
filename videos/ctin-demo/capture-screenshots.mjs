import { chromium } from "playwright";
import { ethers } from "ethers";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, "../../contracts/.env") });

const BASE_URL = process.env.DEMO_BASE_URL ?? "http://localhost:3000";
const RPC_URL = process.env.SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
const CHAIN_ID = 11155111;
const CHAIN_ID_HEX = "0xaa36a7";

const rawKey = process.env.DEPLOYER_PRIVATE_KEY ?? "";
const institutionKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
const auditorKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
const wallets = [new ethers.Wallet(institutionKey, provider), new ethers.Wallet(auditorKey, provider)];
const accounts = wallets.map((wallet) => wallet.address);
let activeIndex = 0;

async function handleWalletRequest({ method, params = [] }) {
  const wallet = wallets[activeIndex];
  switch (method) {
    case "eth_requestAccounts":
    case "eth_accounts":
      return [accounts[activeIndex]];
    case "eth_chainId":
      return CHAIN_ID_HEX;
    case "net_version":
      return String(CHAIN_ID);
    case "wallet_requestPermissions":
      return [{ parentCapability: "eth_accounts" }];
    case "wallet_getPermissions":
      return [{ parentCapability: "eth_accounts" }];
    case "wallet_switchEthereumChain":
    case "wallet_addEthereumChain":
    case "wallet_watchAsset":
      return null;
    case "personal_sign": {
      const message = params[0];
      const bytes = typeof message === "string" && message.startsWith("0x") ? ethers.getBytes(message) : message;
      return wallet.signMessage(bytes);
    }
    case "eth_signTypedData_v4": {
      const payload = typeof params[1] === "string" ? JSON.parse(params[1]) : params[1];
      const types = { ...payload.types };
      delete types.EIP712Domain;
      const domain = { ...payload.domain };
      if (typeof domain.chainId === "string" && domain.chainId.startsWith("0x")) {
        domain.chainId = Number(BigInt(domain.chainId));
      }
      return wallet.signTypedData(domain, types, payload.message);
    }
    default:
      return provider.send(method, params);
  }
}

function switchAccount(index) {
  activeIndex = index;
  return accounts[index];
}

function injectedProvider({ chainIdHex }) {
  const handlers = {};
  const eip1193 = {
    isMetaMask: true,
    chainId: chainIdHex,
    request: (args) => window.__ctinWalletRequest(args),
    on: (event, handler) => {
      (handlers[event] = handlers[event] || []).push(handler);
    },
    removeListener: () => {},
    removeAllListeners: () => {},
  };
  window.ethereum = eip1193;
  window.__ctinEmit = (event, payload) => {
    (handlers[event] || []).forEach((handler) => handler(payload));
  };
  const info = { uuid: "b3f1a2c4-5d6e-4f80-9a1b-2c3d4e5f6071", name: "MetaMask", icon: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=", rdns: "io.metamask" };
  const announce = () => window.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail: Object.freeze({ info, provider: eip1193 }) }));
  window.addEventListener("eip6963:requestProvider", announce);
  announce();
  window.dispatchEvent(new Event("ethereum#initialized"));
}

async function run() {
  const outDir = path.join(here, "../../assets/screenshots");
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await context.exposeFunction("__ctinWalletRequest", handleWalletRequest);
  await context.exposeFunction("__ctinSwitchAccount", switchAccount);
  await context.addInitScript(injectedProvider, { chainIdHex: CHAIN_ID_HEX });
  const page = await context.newPage();

  const capture = async (route, name) => {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: path.join(outDir, `${name}.png`) });
    console.log(`captured ${name}`);
  };

  await capture("/", "landing");
  await capture("/institution", "institution");
  await capture("/explorer", "explorer");
  await capture("/operator", "operator");

  await page.goto(`${BASE_URL}/auditor`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const address = await window.__ctinSwitchAccount(1);
    window.__ctinEmit("accountsChanged", [address]);
  });
  await page.waitForTimeout(3500);
  const decrypt = page.getByRole("button", { name: /^decrypt$/i }).first();
  if (await decrypt.isVisible().catch(() => false)) {
    await decrypt.click();
    await page.waitForTimeout(6000);
  }
  await page.screenshot({ path: path.join(outDir, "auditor.png") });
  console.log("captured auditor");

  await context.close();
  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
