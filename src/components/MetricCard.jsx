import React from 'react';

export default function MetricCard({ label, value, trend, trendLabel, color = 'text-textPrimary', subValue }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors duration-300">
      <div className="text-sm font-medium text-textSecondary mb-2 uppercase tracking-wider">{label}</div>
      <div className={`text-3xl font-mono font-bold ${color} mb-3`}>
        {value}
      </div>
      <div className="flex items-center justify-between text-xs font-mono text-textMuted">
        {trend && (
          <div className="flex items-center space-x-1">
            <span className={trend === 'up' ? 'text-warning' : trend === 'down' ? 'text-healthy' : 'text-primary'}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
            <span>{trendLabel}</span>
          </div>
        )}
        {subValue && <span>{subValue}</span>}
      </div>
    </div>
  );
}
