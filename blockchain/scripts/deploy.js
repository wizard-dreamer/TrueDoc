import pkg from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const { ethers } = pkg;

async function main() {
  const TrueDoc = await ethers.getContractFactory("TrueDoc");
  const trueDoc = await TrueDoc.deploy();
  await trueDoc.waitForDeployment();

  const address = await trueDoc.getAddress();
  console.log("TrueDoc deployed to:", address);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envPath = path.resolve(__dirname, "..", "..", "backend", ".env");

  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, "utf-8");
    const next = env.match(/^CONTRACT_ADDRESS=/m)
      ? env.replace(/^CONTRACT_ADDRESS=.*/m, `CONTRACT_ADDRESS=${address}`)
      : `${env.trim()}\nCONTRACT_ADDRESS=${address}\n`;
    fs.writeFileSync(envPath, next);
    console.log(`Updated backend/.env CONTRACT_ADDRESS -> ${address}`);
  } else {
    console.log("backend/.env not found; update CONTRACT_ADDRESS manually.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
