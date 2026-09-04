import React from 'react';
import { Activity } from 'lucide-react';

export default function EventFeed({ events }) {
  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface/50">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-wide text-textPrimary">RECENT EVENT ACTIVITY</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-healthy animate-pulse"></div>
          <span className="text-xs font-mono text-textMuted">LIVE</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
        <div className="grid grid-cols-5 gap-2 px-3 py-2 text-[10px] font-mono text-textMuted uppercase border-b border-border/50 mb-2">
          <div className="col-span-1">Event ID</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-1">Mode</div>
          <div className="col-span-1 text-right">Latency</div>
        </div>

        {events.map((evt, idx) => (
          <div 
            key={`${evt.id}-${evt.timestamp}-${idx}`} 
            className="grid grid-cols-5 gap-2 px-3 py-2 items-center rounded bg-surface/30 hover:bg-surface border border-transparent hover:border-border transition-colors text-xs"
          >
            <div className="col-span-1 font-mono text-textSecondary">{evt.id}</div>
            <div className="col-span-1 text-textPrimary">{evt.type}</div>
            <div className={`col-span-1 font-mono font-medium ${
              evt.priority === 'CRITICAL' ? 'text-healthy' : 
              evt.priority === 'MEDIUM' ? 'text-primary' : 'text-textMuted'
            }`}>
              {evt.priority}
            </div>
            <div className={`col-span-1 font-mono ${
              evt.mode === 'STREAM' ? 'text-textPrimary' :
              evt.mode === 'BATCH' ? 'text-primary' :
              evt.mode === 'SHED' ? 'text-critical' : 'text-warning'
            }`}>
              {evt.mode}
            </div>
            <div className="col-span-1 font-mono text-right text-textSecondary">{evt.latency}</div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-textMuted text-xs">
            <Activity className="w-6 h-6 mb-2 opacity-20" />
            Waiting for events...
          </div>
        )}
      </div>
    </div>
  );
}
