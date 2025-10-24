# DeFlow - Automate DeFi Like Clockwork

> Cross-chain DeFi automation platform with visual workflow builder, powered by Lit Protocol Vincent and Avail Nexus.

![Built for EthOnline](https://img.shields.io/badge/Built%20for-EthOnline-orange)
![Work in Progress](https://img.shields.io/badge/Status-WIP-yellow)

---

## 🎯 Overview

**DeFlow** is a node-based DeFi automation platform that lets users build, test, and deploy cross-chain workflows without writing code. Think Zapier meets DeFi.

### Key Features

- 🔗 **Visual Workflow Builder** - Drag-and-drop nodes to create automated strategies
- 🔐 **Non-Custodial** - Powered by Lit Protocol Vincent (PKPs), you control your keys
- 🌉 **Cross-Chain** - Avail Nexus SDK enables seamless multi-chain operations
- 🤖 **AI-Powered** - Optional AI decision nodes for intelligent automation
- 📊 **Full History** - Track every execution with detailed logs

### Supported DeFi Protocols

- **Uniswap** - Automated swaps with custom conditions
- **Aave V3** - Supply, borrow, and manage positions
- **Cross-Chain Bridging** - Avail Nexus for ETH/USDC/USDT
- **More coming soon...**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│  • Visual Workflow Builder  • Vincent Auth  • User Dashboard│
└────────────────────────┬────────────────────────────────────┘
                         │ JWT Authentication
┌────────────────────────┴────────────────────────────────────┐
│              Backend (Express + MongoDB)                     │
│  • Workflow Storage  • User Management  • Execution History │
└────────────────────────┬────────────────────────────────────┘
                         │ Orchestration
┌────────────────────────┴────────────────────────────────────┐
│                 Execution Layer                              │
│  ┌──────────────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │  Vincent (PKP)   │  │  Avail Nexus  │  │Custom Logic  │ │
│  │  • Uniswap Swap  │  │  • Bridge     │  │  • AI Node   │ │
│  │  • Aave Supply   │  │  • Transfer   │  │  • If/Else   │ │
│  │  • ERC20 Actions │  │  • Execute    │  │  • Compare   │ │
│  └──────────────────┘  └───────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Why Vincent + Avail?

**Vincent (Lit Protocol)**
- Non-custodial execution via PKPs (Programmable Key Pairs)
- Pre-built abilities for major DeFi protocols
- User-defined policies and guardrails

**Avail Nexus**
- Unified balances across 11+ chains
- Bridge + Execute in ONE transaction
- Intent-based routing via solver competition

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB
- Vincent App ID (create at [Vincent Dashboard](https://dashboard.heyvincent.ai))

### 1. Clone Repository

```bash
git clone <repo-url>
cd ethonline-defi-layer
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

**Required Environment Variables:**
- `MONGODB_URI` - MongoDB connection string
- `VINCENT_APP_ID` - Your Vincent App ID
- `VINCENT_ALLOWED_AUDIENCE` - Frontend URL
- `VINCENT_DELEGATEE_PRIVATE_KEY` - Delegatee EOA private key

See [backend/README.md](backend/README.md) for detailed setup.

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

**Required Environment Variables:**
- `VITE_API_URL` - Backend URL (default: http://localhost:3001)
- `VITE_VINCENT_APP_ID` - Your Vincent App ID
- `VITE_REDIRECT_URI` - OAuth callback URL (default: http://localhost:5176/auth/callback)

### 4. Access Application

- Frontend: http://localhost:5176
- Backend API: http://localhost:3001

---

## 📖 Documentation

- [Vincent Plan](vincent-plan.md) - Complete architectural plan
- [Backend API Docs](backend/README.md) - API endpoints and schemas
- [Vincent Documentation](https://docs.heyvincent.ai) - Official Vincent docs
- [Avail Nexus Docs](https://docs.availproject.org) - Avail SDK reference

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- React Router DOM
- Tailwind CSS v4
- Vincent App SDK

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Vincent App SDK (JWT auth)
- Avail Nexus SDK

### Execution
- Lit Protocol (Vincent Abilities)
- Avail Nexus (Cross-chain)
- OpenAI/Anthropic (AI nodes - optional)

---

## 🎨 Example Workflows

### 1. Cross-Chain Yield Optimizer
```
[Unified Balance] → [Compare APY] → [Bridge + Supply to Best Chain]
```

### 2. Automated DCA Strategy
```
[Schedule Trigger] → [Check Price] → [Swap if Condition Met]
```

### 3. AI-Powered Rebalancing
```
[Get Portfolio] → [AI Decision] → [Rebalance Across Chains]
```

---

## 🔐 Security

- **Non-custodial**: Users control their Vincent Wallet (PKP)
- **JWT Authentication**: Secure backend API access
- **Policy Enforcement**: Vincent Policies act as programmable guardrails
- **Audit Trail**: Full execution history stored

---

## 📊 Project Status

**Current Phase**: MVP Development

- ✅ Frontend architecture (React + Tailwind v4)
- ✅ Vincent authentication (OAuth flow)
- ✅ Backend API (Express + MongoDB)
- ✅ User and workflow storage
- ✅ Architecture planning
- 🚧 Workflow builder UI (in progress)
- 🚧 Vincent App deployment
- 🚧 Avail Nexus integration
- 🚧 Custom abilities (AI node)
- ⏳ Testing and deployment

---

## 🤝 Contributing

This is an EthOnline hackathon project. Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

Built with:
- [Lit Protocol Vincent](https://heyvincent.ai) - Non-custodial execution layer
- [Avail Nexus](https://availproject.org) - Cross-chain infrastructure
- [EthOnline](https://ethglobal.com/events/ethonline2024) - Hackathon sponsor

---

**Built for EthOnline 2024** | [Demo](#) | [Presentation](#)
