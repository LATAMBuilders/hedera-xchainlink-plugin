'use client';

import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

export const WalletConnect = () => {
  const { address, isConnected } = useWallet();

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // Could add a toast notification here
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return <Button variant="outline">Connect Wallet</Button>;
  }

  return (
    <div className="flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2 border border-slate-700">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-sm font-mono text-slate-200">
        {shortenAddress(address)}
      </span>
      <button
        onClick={copyToClipboard}
        className="text-slate-400 hover:text-white transition-colors"
        title="Copy address"
      >
        <Copy size={14} />
      </button>
    </div>
  );
};
