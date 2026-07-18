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
const privateKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;

const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID);
const wallet = new ethers.Wallet(privateKey, provider);
const account = wallet.address;

async function handleWalletRequest({ method, params = [] }) {
  switch (method) {
    case "eth_requestAccounts":
    case "eth_accounts":
      return [account];
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

function injectedProvider({ address, chainIdHex }) {
  const handlers = {};
  const eip1193 = {
    isMetaMask: true,
    chainId: chainIdHex,
    networkVersion: String(parseInt(chainIdHex, 16)),
    selectedAddress: address,
    request: (args) => window.__ctinWalletRequest(args),
    on: (event, handler) => {
      (handlers[event] = handlers[event] || []).push(handler);
    },
    removeListener: () => {},
    removeAllListeners: () => {},
  };
  window.ethereum = eip1193;
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

function setupCursorInPage() {
  if (document.getElementById("__ctin_cursor")) {
    return;
  }
  const cursor = document.createElement("div");
  cursor.id = "__ctin_cursor";
  cursor.style.cssText =
    "position:fixed;top:-80px;left:-80px;width:26px;height:26px;border-radius:50%;" +
    "background:radial-gradient(circle at 32% 30%, #ffe4c4, #ff6b1a 60%, #e11d2a);" +
    "box-shadow:0 0 20px 5px rgba(255,107,26,.7),0 0 8px rgba(255,228,196,.95);" +
    "z-index:2147483647;pointer-events:none;transform:translate(-50%,-50%);" +
    "transition:transform .08s ease";
  document.body.appendChild(cursor);
  window.__ctinCursorMove = (x, y) => {
    cursor.style.left = x + "px";
    cursor.style.top = y + "px";
  };
  window.__ctinCursorPress = (down) => {
    cursor.style.transform = down
      ? "translate(-50%,-50%) scale(0.58)"
      : "translate(-50%,-50%) scale(1)";
  };
}

const pointer = { x: 960, y: 220 };

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
    await page.waitForTimeout(10 + Math.random() * 8);
  }
  const overshootX = targetX + (Math.random() - 0.5) * 7;
  const overshootY = targetY + (Math.random() - 0.5) * 7;
  await moveCursor(page, overshootX, overshootY);
  await page.waitForTimeout(70);
  await moveCursor(page, targetX, targetY);
  await page.mouse.move(targetX, targetY);
  pointer.x = targetX;
  pointer.y = targetY;
}

async function clickHuman(page, locator, label) {
  await locator.waitFor({ state: "visible", timeout: 20000 });
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(`no bounding box for ${label}`);
  }
  const targetX = box.x + box.width / 2 + (Math.random() - 0.5) * (box.width * 0.24);
  const targetY = box.y + box.height / 2 + (Math.random() - 0.5) * (box.height * 0.24);
  await moveHuman(page, targetX, targetY);
  await page.waitForTimeout(180 + Math.random() * 160);
  await page.evaluate(() => window.__ctinCursorPress && window.__ctinCursorPress(true));
  await page.mouse.down();
  await page.waitForTimeout(90);
  await page.mouse.up();
  await page.evaluate(() => window.__ctinCursorPress && window.__ctinCursorPress(false));
  await page.waitForTimeout(480);
}

async function typeHuman(page, locator, text, label) {
  await clickHuman(page, locator, label);
  await locator.fill("");
  for (const character of text) {
    await page.keyboard.type(character);
    await page.waitForTimeout(70 + Math.random() * 70);
  }
  await page.waitForTimeout(500);
}

async function ensureCursor(page) {
  await page.evaluate(setupCursorInPage);
  await moveCursor(page, pointer.x, pointer.y);
}

async function run() {
  const recordingsDir = path.join(here, "capture", "recordings");
  const debugDir = path.join(here, "capture", "debug");
  fs.mkdirSync(recordingsDir, { recursive: true });
  fs.mkdirSync(debugDir, { recursive: true });
  let shotIndex = 0;
  const shot = async (currentPage, label) => {
    shotIndex += 1;
    const name = `${String(shotIndex).padStart(2, "0")}-${label}.png`;
    await currentPage.screenshot({ path: path.join(debugDir, name) });
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir: recordingsDir, size: { width: 1920, height: 1080 } },
  });
  await context.exposeFunction("__ctinWalletRequest", handleWalletRequest);
  await context.addInitScript(injectedProvider, {
    address: account,
    chainIdHex: CHAIN_ID_HEX,
  });

  const page = await context.newPage();
  console.log(`operator/institution account: ${account}`);

  const recordingStart = Date.now();
  const deadRanges = [];
  const secondsSinceStart = () => (Date.now() - recordingStart) / 1000;
  const deadWait = async (ms, keepMs = 1800) => {
    await page.waitForTimeout(keepMs);
    const start = secondsSinceStart();
    await page.waitForTimeout(Math.max(0, ms - keepMs));
    deadRanges.push([start, secondsSinceStart()]);
  };

  const openNav = async (linkName, urlPattern, label) => {
    await clickHuman(
      page,
      page.getByRole("link", { name: linkName }).first(),
      `${label} nav`
    );
    await page.waitForURL(urlPattern, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);
    await ensureCursor(page);
    await page.waitForTimeout(1200);
  };

  await page.goto(`${BASE_URL}/operator`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await ensureCursor(page);
  await page.waitForTimeout(2500);
  await shot(page, "operator-loaded");

  const openBatchButton = page
    .getByRole("button", { name: /open new batch/i })
    .first();
  if (await openBatchButton.isEnabled().catch(() => false)) {
    await clickHuman(page, openBatchButton, "open new batch");
    await deadWait(16000);
    await shot(page, "operator-opened");
  }

  await openNav(/institution/i, /\/institution/, "institution");
  await shot(page, "institution-loaded");

  await clickHuman(page, page.getByRole("button", { name: /^buy$/i }).first(), "buy");
  await clickHuman(page, page.getByRole("button", { name: /^eth$/i }).first(), "eth");
  await typeHuman(page, page.getByPlaceholder("0.0"), "400", "amount");
  await shot(page, "amount-entered");
  await clickHuman(
    page,
    page.getByRole("button", { name: /encrypt and submit intent/i }).first(),
    "submit"
  );
  await deadWait(16000);
  await shot(page, "after-submit");

  const decryptButton = page.getByRole("button", { name: /^decrypt$/i }).first();
  if (await decryptButton.isVisible().catch(() => false)) {
    await clickHuman(page, decryptButton, "decrypt");
    await deadWait(8000);
    await shot(page, "after-decrypt");
  }

  await openNav(/explorer/i, /\/explorer/, "explorer");
  await page.waitForTimeout(2500);
  await shot(page, "explorer");

  await openNav(/auditor/i, /\/auditor/, "auditor");
  try {
    await typeHuman(
      page,
      page.getByPlaceholder("0xAuditorAddress"),
      account,
      "auditor address"
    );
    await clickHuman(
      page,
      page.getByRole("button", { name: /grant disclosure/i }).first(),
      "grant"
    );
    await deadWait(9000);
    await shot(page, "after-grant");
  } catch (auditorError) {
    console.log(`auditor step skipped: ${auditorError.message}`);
  }

  fs.writeFileSync(
    path.join(here, "capture", "timeline.json"),
    JSON.stringify({ deadRanges }, null, 2)
  );
  await page.waitForTimeout(1200);
  await context.close();
  await browser.close();

  const files = fs
    .readdirSync(recordingsDir)
    .filter((name) => name.endsWith(".webm"));
  console.log(`recording saved in ${recordingsDir}`);
  files.forEach((name) => console.log(`  ${name}`));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
