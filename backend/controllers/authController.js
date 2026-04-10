import {
  getSessionFromRequest,
  loginUser,
  registerUser,
  resendVerificationEmail,
  verifyEmailToken
} from "../services/authService.js";

function sendError(res, error, fallbackMessage, statusCode = 400) {
  res.status(statusCode).json({
    error: error.message || fallbackMessage,
    code: error.code || null,
    verificationRequired: Boolean(error.verificationRequired),
    verificationLink: error.verificationLink || null
  });
}

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body || {};
    const result = await registerUser({ name, email, password });
    res.status(201).json(result);
  } catch (error) {
    sendError(res, error, "Signup failed");
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    const result = await loginUser({ email, password });
    res.json(result);
  } catch (error) {
    sendError(res, error, "Login failed", 401);
  }
}

export async function resendVerification(req, res) {
  try {
    const { email } = req.body || {};
    const result = await resendVerificationEmail(email);
    res.json(result);
  } catch (error) {
    sendError(res, error, "Unable to resend verification email");
  }
}

export function verifyEmail(req, res) {
  try {
    const result = verifyEmailToken(req.params.token);
    res.json(result);
  } catch (error) {
    sendError(res, error, "Email verification failed");
  }
}

export function verifyEmailFromBody(req, res) {
  try {
    const result = verifyEmailToken(req.body?.token);
    res.json(result);
  } catch (error) {
    sendError(res, error, "Email verification failed");
  }
}

export function getCurrentUser(req, res) {
  const session = getSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }

  res.json({ user: session });
}
