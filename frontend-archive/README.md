# AlphaFlow Frontend

Frontend application for AlphaFlow — an autonomous multi-chain DeFi agent that combines Avail Nexus (unified liquidity), ASI agents (strategy reasoning), and Lit Protocol Vincent (trustless execution). Built with React, Vite, Tailwind CSS v4, and RainbowKit.

## 🚀 Tech Stack

- **React 19** - UI library with React Compiler enabled
- **TypeScript** - Type safety
- **Vite 7** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **RainbowKit 2.2** - Wallet connection UI
- **Wagmi 2.13** - React hooks for Ethereum
- **Viem 2.21** - TypeScript Ethereum library
- **Lucide React** - Beautiful icons
- **TanStack Query 5** - Data fetching and caching

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or pnpm

## 🛠️ Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Get a WalletConnect Project ID:
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create a new project
   - Copy the Project ID to `.env`

3. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173)

## 🎨 Tailwind CSS v4 Features

This project uses Tailwind CSS v4 with custom theme variables defined in `src/index.css`:

- **Custom Colors**: `hedera-purple`, `avail-blue`, `neon-cyan`
- **Custom Breakpoints**: `3xl` (1920px)
- **Custom Shadows**: `shadow-glow`, `shadow-glow-blue`

Example usage:
```tsx
<div className="bg-hedera-purple text-white shadow-glow">
  Custom themed component
</div>
```

## 🔗 Multi-Chain Integration

The app is designed to integrate with multiple chains via the Avail Nexus SDK. Chain configs and RPC endpoints are in `src/config/chains.ts`.

## 📦 Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🧪 Lint

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── config/
│   ├── chains.ts        # Hedera chain configurations
│   └── wagmi.ts         # Wagmi and RainbowKit config
├── providers.tsx        # Web3 providers wrapper
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles with Tailwind
```

## 🎯 Next Steps

1. **Add Vincent (LIT Protocol) integration** for user-controlled transaction signing
2. **Create dashboard components** for liquidity pools and AI agent status
3. **Implement cross-chain swap UI** with ML predictions
4. **Add real-time price charts** using TradingView or lightweight-charts

## 🔐 Security Notes

- Never commit `.env` files to version control
- Keep your private keys secure
- Use hardware wallets for production deployments

## 📚 Resources

- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/)
- [RainbowKit Docs](https://www.rainbowkit.com/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Hedera Documentation](https://docs.hedera.com/)

