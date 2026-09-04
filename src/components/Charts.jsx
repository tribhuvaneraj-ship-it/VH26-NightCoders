import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded shadow-lg font-mono text-xs">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 my-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-textSecondary">{entry.name}:</span>
            <span className="text-textPrimary font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TrafficChart({ data }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 h-64 flex flex-col">
      <div className="text-sm font-semibold tracking-wide text-textPrimary mb-4">Traffic vs Throughput</div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F7CFF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4F7CFF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#252A32" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis stroke="#5E6675" tick={{ fill: '#5E6675', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'Inter' }} iconType="circle" />
            <Area type="monotone" dataKey="traffic" name="Incoming Traffic" stroke="#4F7CFF" fillOpacity={1} fill="url(#colorTraffic)" strokeWidth={2} isAnimationActive={false} />
            <Area type="monotone" dataKey="throughput" name="Throughput" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorThroughput)" strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function LatencyChart({ data }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 h-64 flex flex-col">
      <div className="text-sm font-semibold tracking-wide text-textPrimary mb-4">Latency by Priority (ms)</div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252A32" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis stroke="#5E6675" tick={{ fill: '#5E6675', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'Inter' }} iconType="circle" />
            <Line type="monotone" dataKey="critical" name="Critical" stroke="#22C55E" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="medium" name="Medium" stroke="#4F7CFF" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="low" name="Low" stroke="#5E6675" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
