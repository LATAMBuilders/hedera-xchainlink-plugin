import { useState } from 'react';

export const useWallet = () => {
  // Hardcoded address as per requirements
  const [address, setAddress] = useState<string>('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');

  const connect = () => {
    // Placeholder for Web3 connection
    console.log('Connecting wallet...');
  };

  const disconnect = () => {
    setAddress('');
  };

  return {
    address,
    connect,
    disconnect,
    isConnected: !!address,
  };
};
