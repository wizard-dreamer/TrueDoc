import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

export const ROOT_DIR = __dirname;
export const PORT = Number(process.env.PORT || 3000);
export const FRONTEND_URL = String(process.env.FRONTEND_URL || "").trim();
export const BACKEND_BASE_URL = String(process.env.BACKEND_BASE_URL || `http://127.0.0.1:${PORT}`).replace(/\/$/, "");

export const RPC_URL = String(process.env.RPC_URL || "").trim();
export const PRIVATE_KEY = String(process.env.PRIVATE_KEY || "").trim();
export const CONTRACT_ADDRESS = String(process.env.CONTRACT_ADDRESS || "").trim();

export const SMTP_HOST = String(process.env.SMTP_HOST || "").trim();
export const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
export const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
export const SMTP_USER = String(process.env.SMTP_USER || "").trim();
export const SMTP_PASS = String(process.env.SMTP_PASS || "").trim();
export const EMAIL_FROM = String(process.env.EMAIL_FROM || process.env.SMTP_USER || "").trim();

export const SUPERUSER_NAME = String(process.env.SUPERUSER_NAME || "Admin").trim();
export const SUPERUSER_EMAIL = String(process.env.SUPERUSER_EMAIL || "admin@example.com").trim();
export const SUPERUSER_PASSWORD = String(process.env.SUPERUSER_PASSWORD || "Admin123").trim();

export const CORS_ORIGIN = FRONTEND_URL || "*";
