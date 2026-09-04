import React from 'react';
import { BrainCircuit } from 'lucide-react';

export default function DecisionEngine({ load, pressure, worker, strategy, decisions }) {
  return (
    <div className="bg-card border-2 border-adaptive/30 rounded-xl p-6 relative overflow-hidden shadow-[0_0_30px_-10px_rgba(139,92,246,0.15)]">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <BrainCircuit className="w-32 h-32 text-adaptive" />
      </div>
      
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-adaptive/10 rounded-lg">
          <BrainCircuit className="w-5 h-5 text-adaptive" />
        </div>
        <h2 className="text-lg font-semibold text-textPrimary tracking-wide">ADAPTIVE DECISION ENGINE</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <div className="text-xs text-textSecondary mb-1">System Load</div>
          <div className="font-mono text-xl text-textPrimary">{load}%</div>
        </div>
        <div>
          <div className="text-xs text-textSecondary mb-1">Queue Pressure</div>
          <div className="font-mono text-xl text-textPrimary">{pressure}%</div>
        </div>
        <div>
          <div className="text-xs text-textSecondary mb-1">Worker Utilization</div>
          <div className="font-mono text-xl text-textPrimary">{worker}%</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-xs text-textSecondary mb-2 uppercase tracking-wider">Current Strategy</div>
        <div className="text-adaptive font-mono font-bold text-lg">{strategy}</div>
        <p className="text-sm text-textMuted mt-1">Processing strategy automatically adapts to traffic pressure while protecting critical events.</p>
      </div>

      <div className="space-y-3">
        <DecisionRow label="CRITICAL" decision={decisions.critical} color="text-healthy" />
        <DecisionRow label="MEDIUM" decision={decisions.medium} color="text-primary" />
        <DecisionRow label="LOW" decision={decisions.low} color={decisions.low === 'SHED' ? 'text-critical' : 'text-warning'} />
      </div>
    </div>
  );
}

function DecisionRow({ label, decision, color }) {
  return (
    <div className="flex items-center justify-between bg-surface p-3 rounded-lg border border-border">
      <div className="font-semibold text-sm tracking-wide text-textSecondary">{label}</div>
      <div className="flex items-center space-x-3">
        <span className="text-textMuted text-xs">→</span>
        <span className={`font-mono font-bold text-sm ${color}`}>{decision}</span>
      </div>
    </div>
  );
}
