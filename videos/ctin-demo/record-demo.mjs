import { chromium } from "playwright";
import { ethers } from "ethers";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, "../../contracts/.env") });

const BASE_URL = process.env.DEMO_BASE_URL ?? "http://localhost:3000";
const RPC_URL =
  process.env.SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";
const CHAIN_ID = 11155111;
const CHAIN_ID_HEX = "0xaa36a7";

const rawKey =
  process.env.DEMO_PRIVATE_KEY ?? process.env.DEPLOYER_PRIVATE_KEY ?? "";
if (!rawKey) {
  throw new Error("Set DEPLOYER_PRIVATE_KEY in contracts/.env");
}
const institutionKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
const auditorKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
const wallets = [
  new ethers.Wallet(institutionKey, provider),
  new ethers.Wallet(auditorKey, provider),
];
const accounts = wallets.map((wallet) => wallet.address);

let activeIndex = 0;
let isConnected = false;

async function handleWalletRequest({ method, params = [] }) {
  const wallet = wallets[activeIndex];
  switch (method) {
    case "eth_requestAccounts":
      isConnected = true;
      return [accounts[activeIndex]];
    case "eth_accounts":
      return isConnected ? [accounts[activeIndex]] : [];
    case "eth_chainId":
      return CHAIN_ID_HEX;
    case "net_version":
      return String(CHAIN_ID);
    case "wallet_requestPermissions":
      isConnected = true;
      return [{ parentCapability: "eth_accounts" }];
    case "wallet_getPermissions":
      return [{ parentCapability: "eth_accounts" }];
    case "wallet_switchEthereumChain":
    case "wallet_addEthereumChain":
    case "wallet_watchAsset":
      return null;
    case "personal_sign": {
      const message = params[0];
      const bytes =
        typeof message === "string" && message.startsWith("0x")
          ? ethers.getBytes(message)
          : message;
      return wallet.signMessage(bytes);
    }
    case "eth_signTypedData_v4": {
      const payload =
        typeof params[1] === "string" ? JSON.parse(params[1]) : params[1];
      const types = { ...payload.types };
      delete types.EIP712Domain;
      const domain = { ...payload.domain };
      if (typeof domain.chainId === "string" && domain.chainId.startsWith("0x")) {
        domain.chainId = Number(BigInt(domain.chainId));
      }
      return wallet.signTypedData(domain, types, payload.message);
    }
    case "eth_sendTransaction": {
      const tx = params[0];
      const sent = await wallet.sendTransaction({
        to: tx.to,
        data: tx.data,
        value: tx.value ? BigInt(tx.value) : undefined,
        gasLimit: tx.gas ? BigInt(tx.gas) : undefined,
      });
      return sent.hash;
    }
    default:
      return provider.send(method, params);
  }
}

function switchAccount(index) {
  activeIndex = index;
  isConnected = true;
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
  const info = {
    uuid: "b3f1a2c4-5d6e-4f80-9a1b-2c3d4e5f6071",
    name: "MetaMask",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjY4NTFiIi8+PC9zdmc+",
    rdns: "io.metamask",
  };
  const announce = () => {
    window.dispatchEvent(
      new CustomEvent("eip6963:announceProvider", {
        detail: Object.freeze({ info, provider: eip1193 }),
      })
    );
  };
  window.addEventListener("eip6963:requestProvider", announce);
  announce();
  window.dispatchEvent(new Event("ethereum#initialized"));
}

function injectedOverlay() {
  if (document.getElementById("__ctin_cursor")) {
    return;
  }
  const cursor = document.createElement("div");
  cursor.id = "__ctin_cursor";
  cursor.style.cssText =
    "position:fixed;top:-80px;left:-80px;width:26px;height:26px;border-radius:50%;" +
    "background:radial-gradient(circle at 32% 30%, #ffe4c4, #ff6b1a 60%, #e11d2a);" +
    "box-shadow:0 0 20px 5px rgba(255,107,26,.7),0 0 8px rgba(255,228,196,.95);" +
    "z-index:2147483647;pointer-events:none;transform:translate(-50%,-50%);transition:transform .08s ease";
  document.body.appendChild(cursor);

  const step = document.createElement("div");
  step.id = "__ctin_step";
  step.style.cssText =
    "position:fixed;top:96px;left:50%;transform:translateX(-50%);z-index:2147483646;" +
    "pointer-events:none;font-family:'JetBrains Mono',monospace;font-size:22px;letter-spacing:2px;" +
    "color:#ffd7a8;background:rgba(5,5,5,0.72);border:1px solid #ff6b1a;border-radius:999px;" +
    "padding:12px 26px;opacity:0;transition:opacity .3s ease";
  document.body.appendChild(step);

  window.__ctinCursorMove = (x, y) => {
    cursor.style.left = x + "px";
    cursor.style.top = y + "px";
  };
  window.__ctinCursorPress = (down) => {
    cursor.style.transform = down
      ? "translate(-50%,-50%) scale(0.58)"
      : "translate(-50%,-50%) scale(1)";
  };
  window.__ctinSetStep = (text) => {
    step.textContent = text;
    step.style.opacity = text ? "1" : "0";
  };
}

const pointer = { x: 960, y: 240 };

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

async function moveCursor(page, x, y) {
  await page.evaluate(
    (coords) => window.__ctinCursorMove && window.__ctinCursorMove(coords[0], coords[1]),
    [x, y]
  );
}

async function moveHuman(page, targetX, targetY) {
  const startX = pointer.x;
  const startY = pointer.y;
  const distance = Math.hypot(targetX - startX, targetY - startY);
  const steps = Math.max(18, Math.min(46, Math.round(distance / 14)));
  const arc = (Math.random() - 0.5) * Math.min(120, distance * 0.22);
  const midX = (startX + targetX) / 2 - (targetY - startY) * 0.12;
  const midY = (startY + targetY) / 2 + arc;
  for (let index = 1; index <= steps; index += 1) {
    const t = easeInOutCubic(index / steps);
    const inv = 1 - t;
    const jitterX = (Math.random() - 0.5) * 1.6;
    const jitterY = (Math.random() - 0.5) * 1.6;
    const x = inv * inv * startX + 2 * inv * t * midX + t * t * targetX + jitterX;
    const y = inv * inv * startY + 2 * inv * t * midY + t * t * targetY + jitterY;
    await moveCursor(page, x, y);
    await page.mouse.move(x, y);
    await page.waitForTimeout(10 + Math.random() * 8);
  }
  await moveCursor(page, targetX, targetY);
  await page.mouse.move(targetX, targetY);
  pointer.x = targetX;
  pointer.y = targetY;
}

async function hoverAndClick(page, locator, label) {
  await locator.waitFor({ state: "visible", timeout: 20000 });
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(`no bounding box for ${label}`);
  }
  const targetX = box.x + box.width / 2 + (Math.random() - 0.5) * (box.width * 0.2);
  const targetY = box.y + box.height / 2 + (Math.random() - 0.5) * (box.height * 0.2);
  await moveHuman(page, targetX, targetY);
  await page.waitForTimeout(600 + Math.random() * 200);
  await page.evaluate(() => window.__ctinCursorPress && window.__ctinCursorPress(true));
  await page.mouse.down();
  await page.waitForTimeout(100);
  await page.mouse.up();
  await page.evaluate(() => window.__ctinCursorPress && window.__ctinCursorPress(false));
  await page.waitForTimeout(520);
}

async function typeHuman(page, locator, text, label) {
  await hoverAndClick(page, locator, label);
  await locator.fill("");
  for (const character of text) {
    await page.keyboard.type(character);
    await page.waitForTimeout(70 + Math.random() * 70);
  }
  await page.waitForTimeout(500);
}

async function run() {
  const recordingsDir = path.join(here, "capture", "recordings");
  const debugDir = path.join(here, "capture", "debug");
  fs.mkdirSync(recordingsDir, { recursive: true });
  fs.mkdirSync(debugDir, { recursive: true });
  let shotIndex = 0;
  const shot = async (page, label) => {
    shotIndex += 1;
    await page.screenshot({ path: path.join(debugDir, `${String(shotIndex).padStart(2, "0")}-${label}.png`) });
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir: recordingsDir, size: { width: 1920, height: 1080 } },
  });
  await context.exposeFunction("__ctinWalletRequest", handleWalletRequest);
  await context.exposeFunction("__ctinSwitchAccount", switchAccount);
  await context.addInitScript(injectedProvider, { chainIdHex: CHAIN_ID_HEX });

  const page = await context.newPage();
  console.log(`institution ${accounts[0]}`);
  console.log(`auditor ${accounts[1]}`);

  const recordingStart = Date.now();
  const deadRanges = [];
  const stepMarks = [];
  const secondsSinceStart = () => (Date.now() - recordingStart) / 1000;
  const deadWait = async (ms, keepMs = 1800) => {
    await page.waitForTimeout(keepMs);
    const start = secondsSinceStart();
    await page.waitForTimeout(Math.max(0, ms - keepMs));
    deadRanges.push([start, secondsSinceStart()]);
  };
  const ensureOverlay = async () => {
    await page.evaluate(injectedOverlay);
    await moveCursor(page, pointer.x, pointer.y);
  };
  const setStep = async (text) => {
    if (text) {
      stepMarks.push({ label: text, t: secondsSinceStart() });
    }
    await page.evaluate((value) => window.__ctinSetStep && window.__ctinSetStep(value), text);
  };
  const navigate = async (linkName, urlPattern) => {
    await hoverAndClick(page, page.getByRole("link", { name: linkName }).first(), `${linkName} nav`);
    await page.waitForURL(urlPattern, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1400);
    await ensureOverlay();
  };

  await page.goto(`${BASE_URL}/institution`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await ensureOverlay();

  await setStep("STEP 1 of 6  ·  CONNECT WALLET");
  await hoverAndClick(page, page.getByRole("button", { name: /^connect$/i }).first(), "connect");
  await page.waitForTimeout(1200);
  await shot(page, "connect-modal");
  const walletOption = page.getByText(/metamask/i).first();
  if (await walletOption.isVisible().catch(() => false)) {
    await hoverAndClick(page, walletOption, "wallet option");
  }
  await page.waitForTimeout(2500);
  await shot(page, "connected");

  await navigate(/operator/i, /\/operator/);
  await setStep("STEP 2 of 6  ·  OPERATOR OPENS A BATCH");
  const openButton = page.getByRole("button", { name: /open new batch/i }).first();
  if (await openButton.isEnabled().catch(() => false)) {
    await hoverAndClick(page, openButton, "open batch");
    await deadWait(16000);
  }
  await shot(page, "opened");

  await navigate(/auditor/i, /\/auditor/);
  await setStep("STEP 3 of 6  ·  AUTHORIZE AN AUDITOR");
  await typeHuman(page, page.getByPlaceholder("0xAuditorAddress"), accounts[1], "auditor address");
  await hoverAndClick(page, page.getByRole("button", { name: /grant disclosure/i }).first(), "authorize");
  await deadWait(16000);
  await shot(page, "authorized");

  await navigate(/institution/i, /\/institution/);
  await setStep("STEP 4 of 6  ·  SUBMIT ENCRYPTED INTENT");
  await hoverAndClick(page, page.getByRole("button", { name: /^buy$/i }).first(), "buy");
  await hoverAndClick(page, page.getByRole("button", { name: /^eth$/i }).first(), "eth");
  await typeHuman(page, page.getByPlaceholder("0.0"), "400", "amount");
  await hoverAndClick(page, page.getByRole("button", { name: /encrypt and submit intent/i }).first(), "submit");
  await deadWait(16000);
  const ownDecrypt = page.getByRole("button", { name: /^decrypt$/i }).first();
  if (await ownDecrypt.isVisible().catch(() => false)) {
    await hoverAndClick(page, ownDecrypt, "own decrypt");
    await deadWait(8000);
  }
  await shot(page, "submitted");

  await navigate(/explorer/i, /\/explorer/);
  await setStep("STEP 5 of 6  ·  PUBLIC SEES ONLY THE NET");
  await page.waitForTimeout(3000);
  await shot(page, "explorer");

  await page.evaluate(async () => {
    const address = await window.__ctinSwitchAccount(1);
    window.__ctinEmit("accountsChanged", [address]);
  });
  await page.waitForTimeout(2500);
  await navigate(/auditor/i, /\/auditor/);
  await setStep("STEP 6 of 6  ·  AUDITOR DECRYPTS + REPORT");
  await page.waitForTimeout(3500);
  const auditorDecrypt = page.getByRole("button", { name: /^decrypt$/i }).first();
  if (await auditorDecrypt.isVisible().catch(() => false)) {
    await hoverAndClick(page, auditorDecrypt, "auditor decrypt");
    await deadWait(9000);
  }
  await shot(page, "auditor-decrypt");
  const exportButton = page.getByRole("button", { name: /export compliance report/i }).first();
  if (await exportButton.isVisible().catch(() => false)) {
    await hoverAndClick(page, exportButton, "export report");
    await deadWait(6000);
  }
  await shot(page, "report");
  await setStep("");

  fs.writeFileSync(
    path.join(here, "capture", "timeline.json"),
    JSON.stringify({ deadRanges, stepMarks, rawEnd: secondsSinceStart() }, null, 2)
  );
  await page.waitForTimeout(1500);
  await context.close();
  await browser.close();

  const files = fs.readdirSync(recordingsDir).filter((name) => name.endsWith(".webm"));
  console.log(`recording saved in ${recordingsDir}`);
  files.forEach((name) => console.log(`  ${name}`));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
