import React from 'react';
import { Activity, Network } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2 text-textPrimary font-semibold tracking-wide">
            <Network className="w-5 h-5 text-primary" />
            <span>Adaptive Flow</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <button className="text-textPrimary font-medium border-b-2 border-primary h-14 px-1">Overview</button>
            <button className="text-textSecondary hover:text-textPrimary transition-colors h-14 px-1">Pipeline</button>
            <button className="text-textSecondary hover:text-textPrimary transition-colors h-14 px-1">Analytics</button>
            <button className="text-textSecondary hover:text-textPrimary transition-colors h-14 px-1">Benchmark</button>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono bg-surface px-3 py-1.5 rounded-full border border-border">
          <div className="w-2 h-2 rounded-full bg-healthy animate-pulse"></div>
          <span className="text-textSecondary">SYSTEM HEALTHY</span>
          <span className="text-textMuted mx-1">|</span>
          <span className="text-healthy">CONNECTED</span>
        </div>
      </div>
    </nav>
  );
}
