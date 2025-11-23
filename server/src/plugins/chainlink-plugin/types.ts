import { z } from "zod";
import { Client } from "@hashgraph/sdk";

// Context for plugin execution
export interface Context {
  mode?: "AUTONOMOUS" | "RETURN_BYTES";
  [key: string]: any;
}

// Tool interface that all plugin tools must implement
export interface Tool {
  method: string;
  name: string;
  description: string;
  parameters: z.ZodObject<any, any>;
  execute: (client: Client, context: Context, params: any) => Promise<any>;
}

// Plugin interface
export interface Plugin {
  name: string;
  version?: string;
  description?: string;
  tools: (context: Context) => Tool[];
}

// Chainlink Price Feed ABI
export const AGGREGATOR_V3_INTERFACE_ABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
    name: "getRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Available price feeds on Hedera Testnet (direcciones verificadas y funcionando)
export const PRICE_FEEDS: Record<string, string> = {
  "BTC/USD": "0x058fE79CB5775d4b167920Ca6036B824805A9ABd",
  "ETH/USD": "0xb9d461e0b962aF219866aDfA7DD19C52bB9871b9",
  "HBAR/USD": "0x59bC155EB6c6C415fE43255aF66EcF0523c92B4a",
  "LINK/USD": "0xEB93a53C648e3e89Bc0FC327D36A37619B1Cf0cd",
  "USDC/USD": "0x2946220288DbaeC91A26c772f5A1bb7B191c1A73",
  "USDT/USD": "0x1c5275A77d74c89256801322e9A52a991c68e79b",
  "DAI/USD": "0xb7546c6ebfc0b6b4fe68909734d7e2c1c5a3ffdf",
};
