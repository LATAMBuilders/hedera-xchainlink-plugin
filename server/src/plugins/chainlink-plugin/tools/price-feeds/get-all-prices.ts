import { z } from "zod";
import { Client } from "@hashgraph/sdk";
import { ethers } from "ethers";
import {
  Context,
  Tool,
  AGGREGATOR_V3_INTERFACE_ABI,
  PRICE_FEEDS,
} from "../../types";

// Define parameter schema (no parameters needed)
const getAllPricesParameters = (context: Context = {}) => z.object({});

// Create prompt function
const getAllPricesPrompt = (context: Context = {}) => {
  return `
  Query all available Chainlink Price Feed oracles on Hedera Testnet.
  
  This tool retrieves current prices for all supported cryptocurrency pairs
  from Chainlink's decentralized oracle network. It provides a comprehensive
  overview of all available price feeds in a single query.

  Parameters:
  - None required. This tool fetches all available price feeds.

  Returns:
  An array of price feed data, each containing:
  - pair: The trading pair (e.g., BTC/USD)
  - price: Raw price value from the oracle
  - formattedPrice: Human-readable price with currency formatting
  - decimals: Number of decimal places in the raw price
  - roundId: The round ID of the price update
  - updatedAt: Timestamp when the price was last updated

  Available price feeds:
  - BTC/USD - Bitcoin to US Dollar
  - ETH/USD - Ethereum to US Dollar
  - HBAR/USD - Hedera to US Dollar
  - LINK/USD - Chainlink to US Dollar
  - USDC/USD - USD Coin to US Dollar
  - USDT/USD - Tether to US Dollar
  - DAI/USD - DAI Stablecoin to US Dollar

  Example usage:
  - "Show me all crypto prices"
  - "Get all available price feeds"
  - "What are the current prices?"
  `;
};

// Implement tool logic
const getAllPricesExecute = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof getAllPricesParameters>>
): Promise<any> => {
  try {
    // Connect to Hedera Testnet via HashIO RPC
    const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");

    const results = [];
    const errors = [];

    // Fetch all price feeds
    for (const [pair, address] of Object.entries(PRICE_FEEDS)) {
      try {
        // Normalize address to lowercase to avoid checksum validation
        const normalizedAddress = address.toLowerCase();

        // Create contract instance
        const priceFeed = new ethers.Contract(
          normalizedAddress,
          AGGREGATOR_V3_INTERFACE_ABI,
          provider
        );

        // Get latest price data
        const roundData = await priceFeed.latestRoundData();
        const decimals = await priceFeed.decimals();

        // Parse the data
        const price = Number(roundData.answer);
        const formattedPrice = (price / Math.pow(10, Number(decimals))).toFixed(
          Number(decimals)
        );

        results.push({
          pair,
          address,
          price: price.toString(),
          formattedPrice: `$${formattedPrice}`,
          decimals: Number(decimals),
          roundId: roundData.roundId.toString(),
          updatedAt: new Date(Number(roundData.updatedAt) * 1000).toISOString(),
        });
      } catch (error) {
        errors.push({
          pair,
          address,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: true,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to fetch price feeds: ${error.message}`,
      };
    }
    return {
      success: false,
      error: "Failed to fetch price feeds: Unknown error",
    };
  }
};

export const GET_ALL_PRICES_TOOL = "get_all_prices_tool";

const tool = (context: Context): Tool => ({
  method: GET_ALL_PRICES_TOOL,
  name: "Get All Chainlink Prices",
  description: getAllPricesPrompt(context),
  parameters: getAllPricesParameters(context),
  execute: getAllPricesExecute,
});

export default tool;
