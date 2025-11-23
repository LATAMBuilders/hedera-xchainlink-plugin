# Chainlink Plugin Integration Example

This document shows how to integrate the Chainlink plugin into your existing Hedera Agent Kit project.

## Current Project Integration

Since your project doesn't use the full Hedera Agent Kit toolkit structure, here's how to use the plugin tools directly:

### Option 1: Direct Tool Integration (Recommended for this project)

```typescript
// src/services/AIAgent.ts
import { Client } from "@hashgraph/sdk";
import getPriceFeedTool from "../plugins/chainlink-plugin/tools/price-feeds/get-price-feed";
import getAllPricesTool from "../plugins/chainlink-plugin/tools/price-feeds/get-all-prices";

class AIAgent {
  private hederaClient: Client;
  
  constructor() {
    this.hederaClient = Client.forTestnet();
    // ... existing setup
  }

  async processMessage(message: string): Promise<string> {
    // Detect price queries
    const priceKeywords = ["precio", "price", "cotiza", "vale", "cuesta"];
    const hasKeyword = priceKeywords.some(kw => 
      message.toLowerCase().includes(kw)
    );

    if (hasKeyword) {
      return await this.handlePriceQueryWithPlugin(message);
    }

    // ... existing AI agent logic
  }

  private async handlePriceQueryWithPlugin(message: string): Promise<string> {
    const context = { mode: "AUTONOMOUS" };
    
    // Map crypto mentions to pairs
    const cryptoMap: Record<string, string> = {
      bitcoin: "BTC/USD",
      btc: "BTC/USD",
      ethereum: "ETH/USD",
      eth: "ETH/USD",
      hbar: "HBAR/USD",
      hedera: "HBAR/USD",
      // ... add more mappings
    };

    // Try to find specific crypto
    for (const [keyword, pair] of Object.entries(cryptoMap)) {
      if (message.toLowerCase().includes(keyword)) {
        const tool = getPriceFeedTool(context);
        const result = await tool.execute(this.hederaClient, context, { pair });
        
        if (result.success) {
          return `El precio actual de ${pair} es ${result.data.formattedPrice} (actualizado: ${result.data.updatedAt})`;
        }
        return result.error;
      }
    }

    // If no specific crypto, return all prices
    const allPricesTool = getAllPricesTool(context);
    const result = await allPricesTool.execute(this.hederaClient, context, {});
    
    if (result.success) {
      const priceList = result.data
        .map((p: any) => `${p.pair}: ${p.formattedPrice}`)
        .join("\n");
      return `Precios actuales:\n${priceList}`;
    }
    
    return result.error;
  }
}
```

### Option 2: Full Hedera Agent Kit Integration

If you want to use the full Hedera Agent Kit with LangChain:

```typescript
// src/services/AIAgent.ts
import { HederaLangchainToolkit } from "hedera-agent-kit";
import { chainlinkPlugin, chainlinkPluginToolNames } from "../plugins/chainlink-plugin";

const toolkit = new HederaLangchainToolkit({
  client: this.hederaClient,
  configuration: {
    tools: [
      // Core Hedera tools
      "TRANSFER_HBAR_TOOL",
      "CREATE_TOPIC_TOOL",
      "SUBMIT_TOPIC_MESSAGE_TOOL",
      
      // Chainlink tools
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

### Option 3: Standalone Service

Keep your existing `ChainlinkService.ts` but use plugin tools internally:

```typescript
// src/services/ChainlinkService.ts
import { Client } from "@hashgraph/sdk";
import getPriceFeedTool from "../plugins/chainlink-plugin/tools/price-feeds/get-price-feed";
import getAllPricesTool from "../plugins/chainlink-plugin/tools/price-feeds/get-all-prices";

export class ChainlinkService {
  private hederaClient: Client;
  private context = { mode: "AUTONOMOUS" as const };

  constructor() {
    this.hederaClient = Client.forTestnet();
  }

  async getPriceFeed(pair: string): Promise<any> {
    const tool = getPriceFeedTool(this.context);
    return await tool.execute(this.hederaClient, this.context, { pair });
  }

  async getAllPrices(): Promise<any> {
    const tool = getAllPricesTool(this.context);
    return await tool.execute(this.hederaClient, this.context, {});
  }
}
```

## API Endpoints Integration

Update your Express routes to use the plugin:

```typescript
// src/index.ts
import { chainlinkPlugin } from "./plugins/chainlink-plugin";

const context = { mode: "AUTONOMOUS" as const };
const tools = chainlinkPlugin.tools(context);
const [getPriceFeedTool, getAllPricesTool] = tools;

app.get("/api/prices/:pair", async (req, res) => {
  try {
    const { pair } = req.params;
    const result = await getPriceFeedTool.execute(hederaClient, context, { pair });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/prices", async (req, res) => {
  try {
    const result = await getAllPricesTool.execute(hederaClient, context, {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## Benefits of Using the Plugin Architecture

1. **Standardization**: Follows Hedera Agent Kit conventions
2. **Reusability**: Can be published as npm package
3. **Type Safety**: Full TypeScript support with Zod validation
4. **Testability**: Each tool can be tested independently
5. **Extensibility**: Easy to add new price feeds or tools
6. **AI-Ready**: Works seamlessly with LangChain and AI agents

## Migration Path

To fully migrate your existing code to use the plugin:

1. ✅ Plugin structure created
2. ✅ Tools implemented with proper interfaces
3. ✅ Documentation complete
4. ⏳ Replace direct ethers calls with plugin tools
5. ⏳ Update AIAgent to use plugin tools
6. ⏳ Update API endpoints to use plugin tools
7. ⏳ Add plugin to package.json for publishing (optional)

## Next Steps

Choose one of the integration options above and implement it. The recommended approach for your current project is **Option 1: Direct Tool Integration**, which gives you the plugin benefits without requiring a full rewrite of your existing architecture.
