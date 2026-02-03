import express from "express";
import { contract, checkBlockchain } from "./blockchain.js";

const router = express.Router();

/**
 * Health check
 */
router.get("/health", async (req, res) => {
  const ok = await checkBlockchain();
  res.json({ blockchain: ok ? "online" : "offline" });
});

/**
 * Register document hash
 */
router.post("/register", async (req, res) => {
  try {
    const { hash } = req.body;

    if (!hash || hash.length !== 64 || !/^[a-f0-9]{64}$/i.test(hash)) {
      return res.status(400).json({ error: "Invalid hash" });
    }

    const ok = await checkBlockchain();
    if (!ok) {
      return res.status(503).json({
        error: "Contract unavailable. Check CONTRACT_ADDRESS and Hardhat node."
      });
    }

    const tx = await contract.registerDocument(hash);
    await tx.wait();

    res.json({ message: "Document registered successfully!" });
  } catch (err) {
    res.status(400).json({
      error: err.reason || err.message || "Registration failed"
    });
  }
});

/**
 * Verify document hash
 */
router.get("/verify/:hash", async (req, res) => {
  try {
    const { hash } = req.params;

    if (!hash || hash.length !== 64 || !/^[a-f0-9]{64}$/i.test(hash)) {
      return res.status(400).json({ error: "Invalid hash" });
    }

    const ok = await checkBlockchain();
    if (!ok) {
      return res.status(503).json({
        error: "Contract unavailable. Check CONTRACT_ADDRESS and Hardhat node."
      });
    }

    const result = await contract.verifyDocument(hash);

    res.json({
      exists: result[0],
      issuer: result[1],
      timestamp: Number(result[2])
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
