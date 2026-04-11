import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { checkBlockchain } from "./blockchain.js";
import { verifyEmail } from "./controllers/authController.js";
import { PORT, CORS_ORIGINS } from "./config.js";

const app = express();
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (CORS_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy does not allow origin ${origin}`), false);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.get("/verify/:token", verifyEmail);
app.use("/api", routes);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  const ok = await checkBlockchain();
  console.log(`Contract status: ${ok ? "available" : "missing (check CONTRACT_ADDRESS / RPC_URL)"}`);
});
