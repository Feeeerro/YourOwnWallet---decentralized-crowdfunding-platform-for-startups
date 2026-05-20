# YourOwnWallet

A decentralized crowdfunding platform built on blockchain technology. Startups can create fundraising campaigns, judges approve or reject them, and investors fund them directly through smart contracts. All financial transactions are handled on-chain ensuring full transparency and security.

---

## Author

**Feeeerro**  
GitHub: [@Feeeerro](https://github.com/Feeeerro)

---

## Tech Stack

### Backend

- **Django 5.2** — REST API
- **Django REST Framework** — API endpoints
- **PostgreSQL** — database
- **Web3.py** — blockchain interaction
- **JWT** — authentication

### Frontend

- **React + Vite** — UI framework
- **Tailwind CSS** — styling
- **Axios** — HTTP client
- **React Router** — navigation

### Blockchain

- **Solidity** — smart contracts
- **Hardhat** — contract compilation and testing
- **Ganache** — local blockchain

### Infrastructure

- **Docker + Docker Compose** — containerization

---

## Features

- 👤 **User roles** — Investor, Startupper, Judge
- 🚀 **Startup management** — create and browse startups
- 📋 **Campaign management** — create campaigns with automatic smart contract deployment
- ⚖️ **Judge approval system** — 3 judges must approve a campaign before it goes live
- 💰 **Blockchain funding** — investors fund campaigns directly on-chain
- 🔄 **Automatic finalization** — campaigns are finalized when the deadline passes
- 💸 **Withdraw & Refund** — owners withdraw funds on success, investors get refunds on failure
- 🔐 **JWT authentication** — secure login and registration
- 🔗 **Wallet assignment** — each user gets a unique blockchain wallet address on registration

---

## Prerequisites

Make sure you have the following installed on your machine:

| Tool           | Version | Download                                       |
| -------------- | ------- | ---------------------------------------------- |
| Python         | 3.10+   | https://www.python.org                         |
| Node.js        | 20.x    | https://nodejs.org                             |
| Docker Desktop | latest  | https://www.docker.com/products/docker-desktop |
| Ganache        | latest  | `npm install -g ganache`                       |
| Git            | latest  | https://git-scm.com                            |

---

## Project Structure

---

YourOwnWallet/
├── backend/ ← Django project
│ ├── backend/ ← Django settings, urls, wsgi
│ ├── users/ ← User model and auth endpoints
│ ├── startup/ ← Startup model and endpoints
│ ├── campaign/ ← Campaign model and endpoints
│ ├── transaction/ ← Transaction model and endpoints
│ ├── web3_utils.py ← Blockchain utility functions
│ ├── Dockerfile
│ └── requirements.txt
├── blockchain/ ← Smart contracts
│ ├── contracts/
│ │ ├── Campaign.sol
│ │ └── CampaignApproval.sol
│ ├── scripts/
│ │ └── deploy.js
│ ├── test/
│ │ └── Campaign.test.js
│ └── hardhat.config.js
├── frontend/ ← React application
│ ├── src/
│ │ ├── api/ ← Axios configuration
│ │ ├── components/ ← Reusable components
│ │ ├── context/ ← Auth context
│ │ └── pages/ ← Page components
│ └── package.json
├── docker-compose.yml
└── README.md

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Feeeerro/YourOwnWallet.git
cd YourOwnWallet
```

### 2. Configure environment variables

Create `backend/.env`:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=yow
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=db
DB_PORT=5432

GANACHE_RPC_URL=http://host.docker.internal:8545
```

Create `.env` in the root folder (for Docker Compose):

```env
DB_NAME=yow
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

> Make sure `DB_USER` and `DB_PASSWORD` match in both files.

### 3. Start the blockchain

Install Ganache if you haven't:

```bash
npm install -g ganache
```

Start Ganache with a fixed mnemonic (creates the same accounts every time):

```bash
cd blockchain
ganache --database.dbPath ./ganache-db --wallet.mnemonic "test test test test test test test test test test test junk" --wallet.defaultBalance 10000
```

> Keep this terminal open. Ganache must be running whenever you use the application.

### 4. Install blockchain dependencies and compile contracts

```bash
cd blockchain
npm install
npx hardhat compile
```

### 5. Start the backend and database

```bash
cd ..
docker-compose up --build
```

This will:

- Start PostgreSQL
- Run Django migrations automatically
- Start the Django server at `http://localhost:8000`

### 6. Install and start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## First Time Setup

After starting everything, you need to register at least **3 judge users** before campaigns can be created.

### Register judges

Go to `http://localhost:5173/register` and create 3 users with role **Judge**. The system automatically assigns them blockchain wallet addresses from Ganache's accounts.

### Deploy contracts (optional)

Contracts are deployed automatically when a campaign is created. If you want to manually test deployment:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

---

## Running Tests

### Smart contract tests

```bash
cd blockchain
npx hardhat test
```

### Expected output

49 passing

## API Endpoints

### Authentication

| Method | Endpoint               | Description         | Auth |
| ------ | ---------------------- | ------------------- | ---- |
| POST   | `/api/users/register/` | Register a new user | No   |
| POST   | `/api/users/login/`    | Login               | No   |
| GET    | `/api/users/me/`       | Get current user    | Yes  |

### Startups

| Method | Endpoint             | Description       | Auth        |
| ------ | -------------------- | ----------------- | ----------- |
| GET    | `/api/startup/`      | List all startups | No          |
| POST   | `/api/startup/`      | Create a startup  | Yes         |
| GET    | `/api/startup/<id>/` | Get a startup     | No          |
| PUT    | `/api/startup/<id>/` | Update a startup  | Yes (owner) |
| DELETE | `/api/startup/<id>/` | Delete a startup  | Yes (owner) |

### Campaigns

| Method | Endpoint                       | Description        | Auth           |
| ------ | ------------------------------ | ------------------ | -------------- |
| GET    | `/api/campaign/`               | List all campaigns | No             |
| POST   | `/api/campaign/`               | Create a campaign  | Yes            |
| GET    | `/api/campaign/<id>/`          | Get a campaign     | No             |
| PUT    | `/api/campaign/<id>/`          | Update a campaign  | Yes (owner)    |
| DELETE | `/api/campaign/<id>/`          | Delete a campaign  | Yes (owner)    |
| POST   | `/api/campaign/<id>/approve/`  | Judge approves     | Yes (judge)    |
| POST   | `/api/campaign/<id>/reject/`   | Judge rejects      | Yes (judge)    |
| POST   | `/api/campaign/<id>/fund/`     | Fund a campaign    | Yes (investor) |
| POST   | `/api/campaign/<id>/finalize/` | Finalize campaign  | Yes            |
| POST   | `/api/campaign/<id>/withdraw/` | Withdraw funds     | Yes (owner)    |
| POST   | `/api/campaign/<id>/refund/`   | Claim refund       | Yes (investor) |

### Transactions

| Method | Endpoint                          | Description           | Auth |
| ------ | --------------------------------- | --------------------- | ---- |
| GET    | `/api/transaction/`               | My transactions       | Yes  |
| GET    | `/api/transaction/<id>/`          | Get a transaction     | Yes  |
| GET    | `/api/transaction/campaign/<id>/` | Campaign transactions | No   |

---

## Smart Contracts

### CampaignApproval.sol

Handles the judge voting system.

- 3 judges must all approve for a campaign to be activated
- A single rejection blocks the campaign permanently
- Each judge can only vote once

### Campaign.sol

Handles the full campaign lifecycle.

- Accepts ETH funding from investors
- Holds funds until the deadline
- On success: owner can withdraw
- On failure: investors can claim refunds

---

## User Roles

| Role           | Permissions                                            |
| -------------- | ------------------------------------------------------ |
| **Investor**   | Browse campaigns, fund active campaigns, claim refunds |
| **Startupper** | Create startups, create campaigns, withdraw funds      |
| **Judge**      | Approve or reject pending campaigns                    |

---

## Daily Development Workflow

Every time you work on the project, start these in order:

**Terminal 1 — Blockchain:**

```bash
cd blockchain
ganache --database.dbPath ./ganache-db --wallet.mnemonic "test test test test test test test test test test test junk" --wallet.defaultBalance 10000
```

**Terminal 2 — Backend + Database:**

```bash
docker-compose up
```

**Terminal 3 — Frontend:**

```bash
cd frontend
npm run dev
```

---

## Environment Variables Reference

### `backend/.env`

| Variable          | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `SECRET_KEY`      | Django secret key                                    |
| `DEBUG`           | Debug mode (`True` for development)                  |
| `ALLOWED_HOSTS`   | Allowed hosts                                        |
| `DB_NAME`         | PostgreSQL database name                             |
| `DB_USER`         | PostgreSQL username                                  |
| `DB_PASSWORD`     | PostgreSQL password                                  |
| `DB_HOST`         | Database host (`db` for Docker)                      |
| `DB_PORT`         | Database port (`5432`)                               |
| `GANACHE_RPC_URL` | Ganache RPC URL (`http://host.docker.internal:8545`) |

---

## License

This project is private and not licensed for public use.
