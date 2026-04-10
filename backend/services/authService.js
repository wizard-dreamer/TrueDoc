import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildVerificationLink } from "./emailService.js";
import { SUPERUSER_EMAIL, SUPERUSER_NAME, SUPERUSER_PASSWORD } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "..", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const sessions = new Map();

// Create the JSON file the first time the app runs.
function ensureUserStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]", "utf-8");
  }
}

function readUsers() {
  ensureUserStore();

  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  ensureUserStore();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// Never send password hashes or tokens back to the client.
function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    isVerified: Boolean(user.isVerified)
  };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, expectedHash] = String(storedHash || "").split(":");
  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(actualHash, "hex"),
    Buffer.from(expectedHash, "hex")
  );
}

function createVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Store a simple in-memory session token after a successful login.
function createSession(user) {
  const token = crypto.randomBytes(32).toString("hex");

  sessions.set(token, {
    ...sanitizeUser(user),
    issuedAt: Date.now()
  });

  return token;
}

function buildVerificationPayload(user) {
  return {
    verificationRequired: !user.isVerified,
    verificationLink: user.verificationToken ? buildVerificationLink(user.verificationToken) : null
  };
}

function findUserByEmail(users, email) {
  return users.find((user) => user.email === normalizeEmail(email));
}

function upgradeUserShape(user) {
  // Keep old data compatible if it used `emailVerified`.
  if (typeof user.isVerified === "undefined") {
    user.isVerified = Boolean(user.emailVerified);
  }

  if (Object.prototype.hasOwnProperty.call(user, "emailVerified")) {
    delete user.emailVerified;
  }

  // Keep old data compatible if it used `passwordHash`.
  if (!user.password && user.passwordHash) {
    user.password = user.passwordHash;
  }

  if (Object.prototype.hasOwnProperty.call(user, "passwordHash")) {
    delete user.passwordHash;
  }

  if (typeof user.verificationToken === "undefined") {
    user.verificationToken = null;
  }

  return user;
}

function upgradeStoredUsers(users) {
  let changed = false;

  for (const user of users) {
    const before = JSON.stringify(user);
    upgradeUserShape(user);
    if (before !== JSON.stringify(user)) {
      changed = true;
    }
  }

  if (changed) {
    writeUsers(users);
  }

  return users;
}

export function getSuperuserConfig() {
  const email = normalizeEmail(SUPERUSER_EMAIL);
  const password = SUPERUSER_PASSWORD;
  const name = SUPERUSER_NAME;

  return {
    configured: Boolean(email && password),
    email,
    password,
    name
  };
}

export async function registerUser({ name, email, password }) {
  const trimmedName = String(name || "").trim();
  const normalizedEmail = normalizeEmail(email);
  const rawPassword = String(password || "");

  if (trimmedName.length < 2) {
    throw new Error("Name must be at least 2 characters");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Invalid email address");
  }

  if (rawPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const superuser = getSuperuserConfig();
  if (superuser.configured && normalizedEmail === superuser.email) {
    throw new Error("This email is reserved for the super user");
  }

  const users = upgradeStoredUsers(readUsers());
  if (findUserByEmail(users, normalizedEmail)) {
    throw new Error("Account already exists");
  }

  // Verification is disabled for now, so new users become active immediately.
  const user = {
    id: crypto.randomUUID(),
    name: trimmedName,
    email: normalizedEmail,
    password: hashPassword(rawPassword),
    role: "issuer",
    createdAt: new Date().toISOString(),
    isVerified: true,
    verificationToken: null
  };

  users.push(user);
  writeUsers(users);

  return {
    message: "Signup successful. You can now log in.",
    user: sanitizeUser(user)
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const rawPassword = String(password || "");

  const superuser = getSuperuserConfig();
  if (
    superuser.configured &&
    normalizedEmail === superuser.email &&
    rawPassword === superuser.password
  ) {
    const superuserSession = {
      id: "superuser",
      name: superuser.name,
      email: superuser.email,
      role: "superuser",
      createdAt: new Date().toISOString(),
      isVerified: true
    };

    return {
      token: createSession(superuserSession),
      user: sanitizeUser(superuserSession)
    };
  }

  const users = upgradeStoredUsers(readUsers());
  const user = findUserByEmail(users, normalizedEmail);

  if (!user || !verifyPassword(rawPassword, user.password)) {
    throw new Error("Invalid email or password");
  }

  return {
    token: createSession(user),
    user: sanitizeUser(user)
  };
}

export async function resendVerificationEmail(email) {
  const users = upgradeStoredUsers(readUsers());
  const user = findUserByEmail(users, email);

  if (!user) {
    throw new Error("Account not found");
  }

  return {
    message: "Email verification is disabled right now.",
    user: sanitizeUser(user),
    verificationRequired: false,
    verificationLink: null
  };
}

export function verifyEmailToken(token) {
  const rawToken = String(token || "").trim();
  if (!rawToken) {
    throw new Error("Verification token is required");
  }

  const users = upgradeStoredUsers(readUsers());
  const user = users.find((entry) => entry.verificationToken === rawToken);

  if (!user) {
    throw new Error("Invalid verification token");
  }

  user.isVerified = true;
  user.verificationToken = null;
  writeUsers(users);

  return {
    message: "Email verified successfully. You can now log in.",
    user: sanitizeUser(user)
  };
}

export function getSessionFromRequest(req) {
  const header = String(req.headers.authorization || "");
  const [, token] = header.match(/^Bearer\s+(.+)$/i) || [];

  if (!token) {
    return null;
  }

  return sessions.get(token) || null;
}

export function requireRole(roles) {
  return (req, res, next) => {
    const session = getSessionFromRequest(req);

    if (!session) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(session.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    req.user = session;
    next();
  };
}

export function getAuthSummary() {
  return upgradeStoredUsers(readUsers()).map(sanitizeUser);
}

export function getUserCount() {
  return upgradeStoredUsers(readUsers()).length;
}
