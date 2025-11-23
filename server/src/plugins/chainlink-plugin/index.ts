import { Context, Plugin } from "./types";
import getPriceFeedTool, {
  GET_PRICE_FEED_TOOL,
} from "./tools/price-feeds/get-price-feed";
import getAllPricesTool, {
  GET_ALL_PRICES_TOOL,
} from "./tools/price-feeds/get-all-prices";

export const chainlinkPlugin: Plugin = {
  name: "chainlink-plugin",
  version: "1.0.0",
  description:
    "A plugin for querying Chainlink Price Feed oracles on Hedera Testnet. Provides real-time cryptocurrency price data from decentralized oracle networks.",
  tools: (context: Context) => {
    return [getPriceFeedTool(context), getAllPricesTool(context)];
  },
};

export const chainlinkPluginToolNames = {
  GET_PRICE_FEED_TOOL,
  GET_ALL_PRICES_TOOL,
} as const;

export default { chainlinkPlugin, chainlinkPluginToolNames };
