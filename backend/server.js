import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { checkBlockchain } from "./blockchain.js";

const app = express();
const PORT = 3000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use("/api", routes);

app.listen(PORT, async () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  const ok = await checkBlockchain();
  console.log(`Contract status: ${ok ? "available" : "missing (check CONTRACT_ADDRESS / Hardhat)"}`);
});
