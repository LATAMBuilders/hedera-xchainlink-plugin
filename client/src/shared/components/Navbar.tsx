'use client';

import React from 'react';
import { WalletConnect } from '@/src/features/wallet/components/WalletConnect';
import { LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="w-full h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md fixed top-0 z-50">
      <div className="container mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            CryptoDash
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
};
