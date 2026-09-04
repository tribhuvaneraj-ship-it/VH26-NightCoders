import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PressureIndicator({ pressureState, criticalDropped }) {
  
  const getPressureColor = () => {
    switch(pressureState) {
      case 'NORMAL': return 'bg-healthy';
      case 'ELEVATED': return 'bg-primary';
      case 'HIGH': return 'bg-warning';
      case 'CRITICAL': return 'bg-critical animate-pulse';
      default: return 'bg-healthy';
    }
  };

  const getPressureIndex = () => {
    switch(pressureState) {
      case 'NORMAL': return 0;
      case 'ELEVATED': return 1;
      case 'HIGH': return 2;
      case 'CRITICAL': return 3;
      default: return 0;
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Critical Protection Panel */}
      <div className={`p-4 rounded-xl border ${criticalDropped === 0 ? 'bg-healthy/10 border-healthy/30' : 'bg-critical/10 border-critical/30'} flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <ShieldCheck className={`w-6 h-6 ${criticalDropped === 0 ? 'text-healthy' : 'text-critical'}`} />
          <div>
            <div className="text-sm font-semibold tracking-wide text-textPrimary">CRITICAL EVENTS PROTECTED</div>
            <div className="text-xs font-mono text-textMuted mt-0.5">PRIORITY BYPASS ACTIVE</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-mono font-bold ${criticalDropped === 0 ? 'text-healthy' : 'text-critical'}`}>
            {criticalDropped}
          </div>
          <div className="text-xs font-mono text-textSecondary uppercase">Dropped</div>
        </div>
      </div>

      {/* Pressure Gauge */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium tracking-wide text-textSecondary">SYSTEM PRESSURE</div>
          <div className={`text-sm font-mono font-bold ${getPressureColor().replace('bg-', 'text-').replace(' animate-pulse', '')}`}>
            {pressureState}
          </div>
        </div>
        
        <div className="flex space-x-1 h-3 mb-2">
          {['NORMAL', 'ELEVATED', 'HIGH', 'CRITICAL'].map((state, i) => (
            <div 
              key={state} 
              className={`flex-1 rounded-sm transition-all duration-500 ${i <= getPressureIndex() ? getPressureColor() : 'bg-surface'}`}
            ></div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] font-mono text-textMuted">
          <span>NORMAL</span>
          <span>ELEVATED</span>
          <span>HIGH</span>
          <span>CRITICAL</span>
        </div>
      </div>
    </div>
  );
}
