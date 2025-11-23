# Chainlink Plugin for Hedera Agent Kit

This plugin was built for the **Hedera Agent Kit** to enable seamless integration with **Chainlink Price Feed oracles** on Hedera Testnet. It was built to enable developers and AI agents to query real-time cryptocurrency price data from Chainlink's decentralized oracle network directly on Hedera.

## Overview

The Chainlink Plugin provides access to Chainlink's industry-standard Price Feed oracles deployed on Hedera Testnet. These oracles aggregate price data from multiple independent node operators, providing reliable, tamper-resistant price feeds for various cryptocurrency pairs.

This plugin enables both conversational AI agents and direct SDK usage to:
- Query individual cryptocurrency price feeds
- Fetch all available price feeds at once
- Access historical round data and timestamps
- Integrate oracle data into Hedera-based applications

## Installation

```bash
npm install ethers @hashgraph/sdk zod
```

> **Note**: This plugin is integrated into your Hedera Agent Kit project. If publishing as a standalone package, use:
> ```bash
> npm install @your-org/hedera-chainlink-plugin
> ```

## Usage

### Importing the Plugin

```typescript
import { chainlinkPlugin, chainlinkPluginToolNames } from "./plugins/chainlink-plugin";
import { HederaLangchainToolkit } from "hedera-agent-kit";
```

### Configuring with Hedera Agent Kit

```typescript
const hederaAgentToolkit = new HederaLangchainToolkit({
  client,
  configuration: {
    tools: [
      chainlinkPluginToolNames.GET_PRICE_FEED_TOOL,
      chainlinkPluginToolNames.GET_ALL_PRICES_TOOL,
    ],
    context: {
      mode: AgentMode.AUTONOMOUS,
    },
    plugins: [
      coreAccountPlugin,
      coreConsensusPlugin,
      coreTokenPlugin,
      chainlinkPlugin, // Add Chainlink plugin
    ],
  },
});
```

### Using Specific Tools Only

You can cherry-pick individual tools if you don't need all functionality:

```typescript
const hederaAgentToolkit = new HederaLangchainToolkit({
  client,
  configuration: {
    tools: [
      chainlinkPluginToolNames.GET_PRICE_FEED_TOOL, // Only enable price feed queries
    ],
    context: {
      mode: AgentMode.AUTONOMOUS,
    },
    plugins: [chainlinkPlugin],
  },
});
```

## Functionality

**Chainlink Price Feeds Plugin**  
_Query Chainlink oracle price data for cryptocurrencies on Hedera Testnet_

| Tool Name               | Description                                                  | Usage                                                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET_PRICE_FEED_TOOL`   | Query the latest price from a specific Chainlink Price Feed | **Parameters:**<br>- `pair` (string, required): Trading pair to query (e.g., "BTC/USD", "ETH/USD", "HBAR/USD")<br><br>**Available Pairs:** BTC/USD, ETH/USD, HBAR/USD, LINK/USD, USDC/USD, USDT/USD, DAI/USD<br><br>**Returns:** Price data including formatted price, decimals, round ID, and last update timestamp                 |
| `GET_ALL_PRICES_TOOL`   | Query all available Chainlink Price Feeds at once            | **Parameters:**<br>- None required<br><br>**Returns:** Array of all available price feeds with their current data. Each entry includes pair name, price, formatted price, decimals, round ID, and timestamp. Useful for market overviews or dashboards.                                                                                 |

## Natural Language Examples

The Chainlink plugin works seamlessly with conversational AI agents. Here are example commands:

### Querying Individual Prices

```
"What's the price of Bitcoin?"
"Get me the current HBAR price"
"Show me ETH/USD price"
"How much is LINK worth?"
"What's DAI trading at?"
"Dame el precio del BTC"
"Cuánto vale Ethereum?"
```

### Querying All Prices

```
"Show me all crypto prices"
"Get all available price feeds"
"What are the current prices?"
"List all cryptocurrency prices"
"Muestra todas las cotizaciones"
```

## Technical Details

### Supported Price Feeds

The plugin currently supports 7 Chainlink Price Feeds on Hedera Testnet:

| Pair       | Contract Address (Hedera Testnet)          |
| ---------- | ------------------------------------------ |
| BTC/USD    | 0xf600dc7e996d555dc44ff7c21f329f4b21e29aa3 |
| ETH/USD    | 0x9e7557be8c25d4a498c42cd92b870c46a3e23ba2 |
| HBAR/USD   | 0xfad570b8b7d4e10ae7e75068c0043ba9e0e14fcc |
| LINK/USD   | 0xeb93a53c648e3e89bc0fc327d36a37619b1cf0cd |
| USDC/USD   | 0x0d0f7f9a8864e20f8147ba793b6f58a54e9f2c83 |
| USDT/USD   | 0x4a1298f88a6cc06e61b2cd8a3f7a40f3d6168b47 |
| DAI/USD    | 0xb7546c6ebfc0b6b4fe68909734d7e2c1c5a3ffdf |

### RPC Endpoint

The plugin connects to Hedera Testnet via HashIO:
- **URL**: https://testnet.hashio.io/api
- **Network**: Hedera Testnet
- **Protocol**: JSON-RPC (Ethereum-compatible)

### Response Format

#### Individual Price Feed Response

```json
{
  "success": true,
  "data": {
    "pair": "BTC/USD",
    "address": "0xf600dc7e996d555dc44ff7c21f329f4b21e29aa3",
    "price": "4350000000000",
    "formattedPrice": "$43500.00000000",
    "decimals": 8,
    "roundId": "18446744073709562931",
    "updatedAt": "2025-01-18T15:30:45.000Z"
  }
}
```

#### All Prices Response

```json
{
  "success": true,
  "data": [
    {
      "pair": "BTC/USD",
      "address": "0xf600dc7e996d555dc44ff7c21f329f4b21e29aa3",
      "price": "4350000000000",
      "formattedPrice": "$43500.00000000",
      "decimals": 8,
      "roundId": "18446744073709562931",
      "updatedAt": "2025-01-18T15:30:45.000Z"
    },
    // ... more price feeds
  ],
  "timestamp": "2025-01-18T15:31:00.000Z"
}
```

## Direct SDK Usage

You can also use the plugin tools directly without an AI agent:

```typescript
import { Client } from "@hashgraph/sdk";
import getPriceFeedTool from "./plugins/chainlink-plugin/tools/price-feeds/get-price-feed";

// Initialize Hedera client
const client = Client.forTestnet();

// Create context
const context = { mode: "AUTONOMOUS" };

// Get the tool
const tool = getPriceFeedTool(context);

// Execute the tool
const result = await tool.execute(client, context, { pair: "BTC/USD" });

console.log(result);
```

## Error Handling

The plugin includes comprehensive error handling:

- **Invalid Pair**: Returns list of available pairs
- **Network Errors**: Catches RPC connection failures
- **Contract Errors**: Handles smart contract call failures
- **Checksum Issues**: Automatically normalizes addresses to lowercase

Example error response:

```json
{
  "success": false,
  "error": "Price feed for XYZ/USD not found. Available pairs: BTC/USD, ETH/USD, HBAR/USD, LINK/USD, USDC/USD, USDT/USD, DAI/USD"
}
```

## Architecture

The plugin follows the Hedera Agent Kit plugin architecture:

```
chainlink-plugin/
├── index.ts                          # Plugin definition and exports
├── tools/
│   └── price-feeds/
│       ├── get-price-feed.ts        # Individual price query tool
│       └── get-all-prices.ts        # All prices query tool
└── README.md                         # This file
```

### Tool Structure

Each tool implements the standard Tool interface:

```typescript
export interface Tool {
  method: string;                    // Unique tool identifier
  name: string;                      // Human-readable name
  description: string;               // Detailed prompt for AI agents
  parameters: z.ZodObject<any, any>; // Zod schema for validation
  execute: (client: Client, context: Context, params: any) => Promise<any>;
}
```

## Dependencies

- **@hashgraph/sdk**: Hedera SDK for client initialization
- **ethers**: Ethereum library for smart contract interactions
- **zod**: Schema validation for parameters

## Contributing

To extend this plugin with additional price feeds or functionality:

1. Add new contract addresses to the `PRICE_FEEDS` constant
2. Create new tool files following the existing pattern
3. Export new tools in `index.ts`
4. Update this README with new functionality

## Support

For issues or questions:
- Open an issue in the repository
- Join [Hedera Discord](https://hedera.com/discord) - Support > developer-help-desk channel
- Contact the Hedera Agent Kit maintainers

## License

This plugin is part of the Hedera Agent Kit project and follows the same license.

## Acknowledgments

Built for the Hedera Agent Kit by the Hedera developer community. Powered by Chainlink's decentralized oracle network.
