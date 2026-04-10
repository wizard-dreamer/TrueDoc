import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { checkBlockchain } from "./blockchain.js";
import { verifyEmail } from "./controllers/authController.js";
import { PORT, CORS_ORIGIN } from "./config.js";

const app = express();
const corsOptions = {
  origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());
app.get("/verify/:token", verifyEmail);
app.use("/api", routes);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  const ok = await checkBlockchain();
  console.log(`Contract status: ${ok ? "available" : "missing (check CONTRACT_ADDRESS / RPC_URL)"}`);
});
