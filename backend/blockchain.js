import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * ES Module __dirname fix
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

/**
 * ENV VALIDATION (prevents ENS errors)
 */
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL) {
  throw new Error("RPC_URL missing in .env");
}

if (!PRIVATE_KEY || !PRIVATE_KEY.startsWith("0x") || PRIVATE_KEY.length !== 66) {
  throw new Error("Invalid PRIVATE_KEY in .env");
}

if (!CONTRACT_ADDRESS || !CONTRACT_ADDRESS.startsWith("0x") || CONTRACT_ADDRESS.length !== 42) {
  throw new Error("Invalid CONTRACT_ADDRESS in .env");
}

/**
 * Load ABI safely (no import assertions)
 */
const abiPath = path.join(__dirname, "abi", "TrueDocABI.json");
const abi = JSON.parse(fs.readFileSync(abiPath, "utf-8"));

/**
 * Provider (Hardhat / Localhost)
 */
export const provider = new ethers.JsonRpcProvider(RPC_URL);

/**
 * Wallet (SERVER-SIDE SIGNER - NO METAMASK)
 */
export const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

/**
 * Contract instance
 */
export const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  abi,
  wallet
);

/**
 * Blockchain health check
 */
export async function checkBlockchain() {
  try {
    await provider.getBlockNumber();
    const code = await provider.getCode(CONTRACT_ADDRESS);
    return code && code !== "0x";
  } catch {
    return false;
  }
}
