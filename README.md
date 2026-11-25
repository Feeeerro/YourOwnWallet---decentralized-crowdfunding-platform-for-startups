# YourOwnWallet

YourOwnWallet is a decentralized crowdfunding platform built on a blockchain. Startups create fundraising campaigns, judges approve or reject them, and investors fund them directly through smart contracts. Every financial transaction happens on-chain, which keeps the whole process transparent and secure.

## Author

Feeeerro, [@Feeeerro](https://github.com/Feeeerro) on GitHub.

## Tech stack

Backend:

- Django 5.2 for the REST API
- Django REST Framework for the API endpoints
- PostgreSQL as the database
- Web3.py to talk to the blockchain
- JWT for authentication

Frontend:

- React and Vite for the UI
- Tailwind CSS for styling
- Axios as the HTTP client
- React Router for navigation

Blockchain:

- Solidity for the smart contracts
- Hardhat to compile and test the contracts
- Ganache as the local blockchain

Infrastructure:

- Docker and Docker Compose to run the containers

## Features

- Three user roles: investor, startupper and judge.
- Startups can be created and browsed, with filters.
- Creating a campaign deploys its smart contracts automatically.
- A campaign goes live only after all 3 judges approve it.
- Investors fund campaigns directly on-chain.
- When the deadline passes, the campaign is finalized automatically, whether the visitor is logged in or not.
- If a campaign succeeds the owner withdraws the funds; if it fails, investors get a refund.
- Login and registration are secured with JWT.
- Every user gets a unique blockchain wallet address when they register.
- Campaigns and startups can be filtered by status and category.
- List pages show 12 items per page.
- The layout is responsive, with a mobile-friendly navbar.

## Prerequisites

You need these tools installed:

| Tool           | Version | Download                                       |
| -------------- | ------- | ---------------------------------------------- |
| Python         | 3.10+   | https://www.python.org                         |
| Node.js        | 20.x    | https://nodejs.org                             |
| Docker Desktop | latest  | https://www.docker.com/products/docker-desktop |
| Ganache        | latest  | `npm install -g ganache`                       |
| Git            | latest  | https://git-scm.com                            |

## Project structure

```
YourOwnWallet/
├── backend/                        ← Django project
│   ├── backend/                    ← Django settings, urls, wsgi
│   ├── users/                      ← User model, auth endpoints, wallet assignment
│   │   └── management/
│   │       └── commands/
│   │           └── create_judges.py ← auto-creates 3 default judges
│   ├── startup/                    ← Startup model and endpoints
│   ├── campaign/                   ← Campaign model, endpoints, blockchain integration
│   ├── transaction/                ← Transaction model and endpoints
│   ├── web3_utils.py               ← Blockchain utility functions
│   ├── Dockerfile
│   └── requirements.txt
├── blockchain/                     ← Smart contracts
│   ├── contracts/
│   │   ├── Campaign.sol            ← handles funding, withdrawal, refunds
│   │   └── CampaignApproval.sol   ← handles judge voting
│   ├── scripts/
│   │   └── deploy.js               ← manual deployment script
│   ├── test/
│   │   └── Campaign.test.js        ← 49 tests, all passing
│   ├── start-ganache.bat           ← starts Ganache with fixed mnemonic
│   └── hardhat.config.js
├── frontend/                       ← React application
│   ├── src/
│   │   ├── api/                    ← Axios configuration with JWT interceptor
│   │   ├── components/             ← Navbar, Pagination, CampaignCard, StartupCard
│   │   ├── context/                ← Auth context (global auth state)
│   │   └── pages/                  ← Home, Login, Register, Startups, Campaigns, Account
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Installation and setup

### 1. Clone the repository

```bash
git clone https://github.com/Feeeerro/YourOwnWallet.git
cd YourOwnWallet
```

### 2. Set the environment variables

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
SYSTEM_WALLET=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

> `SYSTEM_WALLET` is the first Ganache account (index 0), kept aside to finalize campaigns automatically. It has to match the first account your Ganache mnemonic generates.

Then create a `.env` in the root folder for Docker Compose:

```env
DB_NAME=yow
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

> `DB_USER` and `DB_PASSWORD` must be the same in both files.

### 3. Start the blockchain

Start Ganache with the fixed mnemonic, so it generates the same accounts every time:

```bash
cd blockchain
start-ganache.bat
```

Or start it by hand:

```bash
ganache --database.dbPath ./ganache-db --wallet.mnemonic "angry stock army post essence palace ride extra member ensure shell add" --wallet.defaultBalance 10000
```

> Leave this terminal open. The application needs Ganache running the whole time.

> The `ganache-db` folder saves the blockchain state, so contracts and transactions survive a restart.

### 4. Install the blockchain dependencies and compile the contracts

```bash
cd blockchain
npm install
npx hardhat compile
```

### 5. Start the backend and the database

```bash
cd ..
docker-compose up --build
```

This starts PostgreSQL, runs the Django migrations, creates the 3 default judge accounts and starts the Django server at `http://localhost:8000`.

### 6. Install and start the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Default judge accounts

The first startup creates three judge accounts:

| Username | Email                      | Password      |
| -------- | -------------------------- | ------------- |
| `judge1` | `judge1@yourownwallet.com` | `Judge1Pass!` |
| `judge2` | `judge2@yourownwallet.com` | `Judge2Pass!` |
| `judge3` | `judge3@yourownwallet.com` | `Judge3Pass!` |

The judges get Ganache accounts 1, 2 and 3. Account 0 is kept as the system wallet.

## Wallet addresses

| Account    | Purpose                                   |
| ---------- | ----------------------------------------- |
| Account 0  | System wallet (reserved for finalization) |
| Account 1  | Judge 1                                   |
| Account 2  | Judge 2                                   |
| Account 3  | Judge 3                                   |
| Account 4+ | Assigned to users on registration         |

## Running the tests

To run the smart contract tests:

```bash
cd blockchain
npx hardhat test
```

You should see `49 passing`.

## API endpoints

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

| Method | Endpoint                                | Description                  | Auth           |
| ------ | --------------------------------------- | ---------------------------- | -------------- |
| GET    | `/api/campaign/`                        | List all campaigns           | No             |
| POST   | `/api/campaign/`                        | Create a campaign            | Yes            |
| GET    | `/api/campaign/<id>/`                   | Get a campaign               | No             |
| PUT    | `/api/campaign/<id>/`                   | Update a campaign            | Yes (owner)    |
| DELETE | `/api/campaign/<id>/`                   | Delete a campaign            | Yes (owner)    |
| POST   | `/api/campaign/<id>/approve/`           | Judge approves               | Yes (judge)    |
| POST   | `/api/campaign/<id>/reject/`            | Judge rejects                | Yes (judge)    |
| POST   | `/api/campaign/<id>/fund/`              | Fund a campaign              | Yes (investor) |
| POST   | `/api/campaign/<id>/withdraw/`          | Withdraw funds               | Yes (owner)    |
| POST   | `/api/campaign/<id>/refund/`            | Claim refund                 | Yes (investor) |
| GET    | `/api/campaign/<id>/judge-status/`      | Check judge vote status      | Yes (judge)    |
| GET    | `/api/campaign/<id>/user-status/`       | Check withdraw/refund status | Yes            |
| GET    | `/api/campaign/<id>/blockchain-status/` | Check blockchain deadline    | No             |

### Transactions

| Method | Endpoint                          | Description           | Auth |
| ------ | --------------------------------- | --------------------- | ---- |
| GET    | `/api/transaction/`               | My transactions       | Yes  |
| GET    | `/api/transaction/<id>/`          | Get a transaction     | Yes  |
| GET    | `/api/transaction/campaign/<id>/` | Campaign transactions | No   |

## Smart contracts

### CampaignApproval.sol

This contract runs the judge vote. A campaign is activated only when all 3 judges approve it, and a single rejection blocks it for good. Each judge can vote once. The contract follows the Checks-Effects-Interactions pattern for security.

### Campaign.sol

This contract covers the rest of a campaign's life. It accepts ETH from investors and holds it securely until the deadline. If the campaign succeeds, the owner can withdraw everything; if it fails, each investor can claim a refund. It is protected against reentrancy attacks.

## User roles

| Role       | Permissions                                                                        |
| ---------- | ---------------------------------------------------------------------------------- |
| Investor   | Browse campaigns, fund active campaigns, claim refunds, view investments           |
| Startupper | Create startups, create campaigns, withdraw funds, view own startups and campaigns |
| Judge      | Approve or reject pending campaigns, view campaigns awaiting vote                  |

## Campaign lifecycle

```
Created (pending)
↓
All 3 judges approve → Active
↓
Deadline passes → Auto-finalized
↓
┌──────────────────────┐
│ funded >= target     │ → Completed → Owner withdraws
│ funded < target      │ → Failed    → Investors claim refunds
└──────────────────────┘
Any judge rejects → Rejected (permanently blocked)
```

## Daily development workflow

Each time you work on the project, start these in order, each in its own terminal.

First the blockchain:

```bash
cd blockchain
start-ganache.bat
```

Then the backend and the database:

```bash
docker-compose up
```

Then the frontend:

```bash
cd frontend
npm run dev
```

## Environment variables

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
| `SYSTEM_WALLET`   | First Ganache account reserved for system operations |

## License

This project is private and not licensed for public use.
