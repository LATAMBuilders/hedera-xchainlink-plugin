import { z } from "zod";
import { Client } from "@hashgraph/sdk";
import { ethers } from "ethers";
import {
  Context,
  Tool,
  AGGREGATOR_V3_INTERFACE_ABI,
  PRICE_FEEDS,
} from "../../types";

// Define parameter schema
const getPriceFeedParameters = (context: Context = {}) =>
  z.object({
    pair: z
      .string()
      .describe(
        "The trading pair to query (e.g., 'BTC/USD', 'ETH/USD', 'HBAR/USD'). Available pairs: BTC/USD, ETH/USD, HBAR/USD, LINK/USD, USDC/USD, USDT/USD, DAI/USD"
      ),
  });

// Create prompt function
const getPriceFeedPrompt = (context: Context = {}) => {
  return `
  Query the latest price from a Chainlink Price Feed oracle on Hedera Testnet.
  
  This tool connects to Chainlink's decentralized oracle network to retrieve
  real-time cryptocurrency price data. The price feeds are updated regularly
  by multiple independent node operators.

  Parameters:
  - pair (string, required): The trading pair to query. Must be one of:
    * BTC/USD - Bitcoin to US Dollar
    * ETH/USD - Ethereum to US Dollar  
    * HBAR/USD - Hedera to US Dollar
    * LINK/USD - Chainlink to US Dollar
    * USDC/USD - USD Coin to US Dollar
    * USDT/USD - Tether to US Dollar
    * DAI/USD - DAI Stablecoin to US Dollar

  Returns:
  - pair: The trading pair queried
  - price: Raw price value from the oracle
  - formattedPrice: Human-readable price with currency formatting
  - decimals: Number of decimal places in the raw price
  - roundId: The round ID of the price update
  - updatedAt: Timestamp when the price was last updated

  Example usage:
  - "What's the price of Bitcoin?"
  - "Get me the current HBAR price"
  - "Show me ETH/USD price"
  `;
};

// Implement tool logic
const getPriceFeedExecute = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof getPriceFeedParameters>>
): Promise<any> => {
  try {
    const { pair } = params;

    // Normalize pair format
    const normalizedPair = pair.toUpperCase();
    const contractAddress = PRICE_FEEDS[normalizedPair];

    if (!contractAddress) {
      const availablePairs = Object.keys(PRICE_FEEDS).join(", ");
      return {
        success: false,
        error: `Price feed for ${pair} not found. Available pairs: ${availablePairs}`,
      };
    }

    // Connect to Hedera Testnet via HashIO RPC
    const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");

    // Normalize address to lowercase to avoid checksum validation
    const normalizedAddress = contractAddress.toLowerCase();

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

    return {
      success: true,
      data: {
        pair: normalizedPair,
        address: contractAddress,
        price: price.toString(),
        formattedPrice: `$${formattedPrice}`,
        decimals: Number(decimals),
        roundId: roundData.roundId.toString(),
        updatedAt: new Date(Number(roundData.updatedAt) * 1000).toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to fetch price feed: ${error.message}`,
      };
    }
    return {
      success: false,
      error: "Failed to fetch price feed: Unknown error",
    };
  }
};

export const GET_PRICE_FEED_TOOL = "get_price_feed_tool";

const tool = (context: Context): Tool => ({
  method: GET_PRICE_FEED_TOOL,
  name: "Get Chainlink Price Feed",
  description: getPriceFeedPrompt(context),
  parameters: getPriceFeedParameters(context),
  execute: getPriceFeedExecute,
});

export default tool;
