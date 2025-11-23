import { Message } from '../types';

// Mock AI service simulating hedera-xchainlink-plugin interactions
export const sendMessageToAI = async (messages: Message[]): Promise<string> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const lastMessage = messages[messages.length - 1].content.toLowerCase();

  if (lastMessage.includes('btc') || lastMessage.includes('price')) {
    return "Using `hedera-xchainlink-plugin` to fetch BTC/USD price feed... \n\nLatest price from Chainlink Oracle on Hedera is $84,325 USD.";
  }
  
  return "I can process that request using the `hedera-xchainlink-plugin`. Try asking about cryptocurrency prices or data from Chainlink oracles on Hedera!";
};
