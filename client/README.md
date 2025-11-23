# CryptoDash - AI Powered Crypto Tracker

A modern cryptocurrency dashboard featuring real-time price updates and an AI assistant.

## Features

- **Real-time Crypto Prices**: Live updates for BTC, ETH, SOL, USDT, and BNB every 30 seconds.
- **AI Chat Assistant**: Interactive chat widget to ask about market trends and prices.
- **Wallet Integration**: Mock wallet connection with address display and copy functionality.
- **Modern UI**: Dark mode design with responsive layout.

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Data**: CoinGecko API

## Project Structure

The project follows a Feature-Based Architecture:

```
src/
├── features/
│   ├── crypto-prices/   # Price tracking logic and components
│   ├── ai-chat/         # AI chat widget and service
│   └── wallet/          # Wallet connection logic
├── shared/              # Shared components and utilities
└── layouts/             # Page layouts
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables

No environment variables are required for the basic features.
The CoinGecko API is used in public mode (rate limited).

## Future Improvements

- Integrate real Web3 wallet connection (MetaMask/Wagmi).
- Connect to a real AI provider (OpenAI/Anthropic).
- Add historical price charts.
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
