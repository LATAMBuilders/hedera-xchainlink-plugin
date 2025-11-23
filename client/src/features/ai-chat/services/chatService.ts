import { Message } from '../types';

// Mock AI service simulating hedera-xchainlink-plugin interactions
export const sendMessageToAI = async (messages: Message[]): Promise<string> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const lastMessage = messages[messages.length - 1].content.toLowerCase();

  if (lastMessage.includes('hbar') || lastMessage.includes('price')) {
    return "Using `hedera-xchainlink-plugin` to fetch HBAR/USD price feed... \n\nLatest price from Chainlink Oracle on Hedera Testnet: $0.1245 \nTimestamp: " + new Date().toLocaleTimeString();
  }
  
  if (lastMessage.includes('transfer') || lastMessage.includes('send')) {
    return "Initiating cross-chain transfer request via CCIP... \n\nPlugin status: Transaction constructed. \nSource: Hedera Testnet \nTarget: Ethereum Sepolia \n\nPlease confirm the transaction in your wallet.";
  }

  if (lastMessage.includes('contract') || lastMessage.includes('smart')) {
    return "Querying smart contract state using the plugin... \n\nContract Address: 0.0.123456 \nState: Active \nData Feed: Chainlink Aggregator V3";
  }

  if (lastMessage.includes('hello') || lastMessage.includes('hi')) {
    return "Hello! I'm powered by the `hedera-xchainlink-plugin`. I can help you interact with Hedera and Chainlink services using natural language. Try asking for HBAR price or simulating a transfer.";
  }

  return "I can process that request using the `hedera-xchainlink-plugin`. Try asking about:\n- HBAR Price Feeds\n- Cross-chain transfers\n- Smart Contract interactions";
};
