# 📄 TrueDoc — Blockchain Document Verification System

TrueDoc is a **blockchain-backed document verification system** that provides **proof of existence** for digital documents.
It allows users to register a document’s cryptographic fingerprint on the Ethereum blockchain and later verify its authenticity — **without storing the actual file on-chain**.

> 🔐 Privacy-first • ⛓️ Blockchain-secured • 🚫 No MetaMask required for users

---

## 🚀 Project Overview

* Users upload a document
* A **SHA-256 hash** is generated **locally in the browser**
* The hash is registered on the **Ethereum Sepolia testnet**
* Anyone can later verify the document by re-uploading it
* Verification checks if the hash exists on-chain

✔ The original document never leaves the user’s device
✔ Only a hash is stored on the blockchain
✔ Verification is public and wallet-free

---

## 🧠 Why Blockchain?

Traditional document verification relies on centralized servers that can be:

* Modified
* Deleted
* Backdated

Blockchain ensures:

* **Immutability** (data cannot be changed)
* **Timestamping**
* **Public verifiability**
* **Trust without intermediaries**

---

## 🏗️ System Architecture

```
Frontend (Browser)
 ├─ File Upload
 ├─ SHA-256 Hashing (Web Crypto API)
 └─ API Calls
        ↓
Backend (Node.js + Express)
 ├─ Wallet (Private Key)
 ├─ Ethers.js
 └─ Infura RPC
        ↓
Blockchain (Ethereum Sepolia)
 └─ TrueDoc Smart Contract
```

---

## 🔑 Key Features

* 🔐 **Privacy Preserving** — files never uploaded to blockchain
* ⛽ **Low Cost** — only a hash is stored (very low gas usage)
* 🚫 **No MetaMask Required** — backend signs transactions
* 🔍 **Public Verification** — anyone can verify documents
* 🧪 **Testnet Deployment** — safe for demos and academic use

---

## 🛠️ Tech Stack

### Blockchain

* Solidity `^0.8.19`
* Ethereum Sepolia Testnet
* Hardhat (development & deployment)

### Backend

* Node.js
* Express.js
* Ethers.js v6
* Infura RPC

### Frontend

* HTML / CSS / JavaScript
* Web Crypto API (SHA-256)
* Fetch API

---

## 📂 Project Structure

```
TrueDoc/
├── blockchain/
│   ├── contracts/
│   │   └── TrueDoc.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── hardhat.config.cjs
│   └── package.json
│
├── backend/
│   ├── abi/
│   │   └── TrueDocABI.json
│   ├── blockchain.js
│   ├── routes.js
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── index.html
│   ├── upload.html
│   ├── verify.html
│   └── js/
│       ├── upload.js
│       └── verify.js
│
└── README.md
```

---

## 📜 Smart Contract (TrueDoc.sol)

### Core Functions

```solidity
registerDocument(string hash)
```

* Stores document hash
* Records issuer address
* Records timestamp
* Prevents duplicate registration

```solidity
verifyDocument(string hash)
```

* Checks if hash exists
* Returns:

  * validity (bool)
  * issuer address
  * timestamp

---

## ⛽ Gas & Cost

* **Register document:** ~0.00002 ETH
* **Verify document:** Free (read-only)
* File size does **not** affect cost

With ~0.05 ETH → **~2000 uploads**

---

## 🔐 Environment Variables

Create `backend/.env`:

```env
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0xYOUR_BACKEND_WALLET_PRIVATE_KEY
CONTRACT_ADDRESS=0xDEPLOYED_CONTRACT_ADDRESS
```

⚠️ Never commit `.env` to GitHub

---

## ▶️ Running the Project

### 1️⃣ Install dependencies

```bash
cd blockchain
npm install

cd ../backend
npm install
```

### 2️⃣ Start backend

```bash
node server.js
```

### 3️⃣ Open frontend

Open `frontend/upload.html` or `index.html` in browser

---

## 🔎 Verification Flow

1. User uploads a document
2. SHA-256 hash is generated
3. Hash is compared with blockchain record
4. Result shows:

   * Valid / Invalid
   * Issuer
   * Timestamp

---

## 🎓 Academic / Viva Explanation (One-liner)

> *TrueDoc uses blockchain immutability to provide proof of document existence by storing cryptographic hashes on Ethereum, ensuring integrity without exposing file contents.*

---

## 🧪 Testnet Details

* Network: **Ethereum Sepolia**
* RPC Provider: **Infura**
* Wallet: Backend-managed (no MetaMask)
* Contract Address:

```
0x8c762f8Fa1F77e7a8bc5BbBe3b366348F0A4751A
```

---

## 🚧 Future Improvements

* Mainnet deployment
* IPFS integration
* User authentication
* Upload limits & analytics
* UI dashboard for issuers
* Multi-chain support
