import React from 'react';

export default function QueueCard({ title, events, queued, mode, colorClass }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-semibold text-textPrimary tracking-wide">{title}</h3>
          <p className="text-xs text-textMuted mt-1">{events.join(', ')}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-mono font-bold ${colorClass} bg-opacity-10 border border-current`}>
          {mode}
        </div>
      </div>
      
      <div className="flex items-end justify-between mt-2">
        <div className="text-textSecondary text-xs">Queued</div>
        <div className="font-mono text-2xl font-bold text-textPrimary">{queued}</div>
      </div>
    </div>
  );
}
