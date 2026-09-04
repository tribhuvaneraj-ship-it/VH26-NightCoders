import React from 'react';
import MetricCard from '../components/MetricCard';
import QueueCard from '../components/QueueCard';
import DecisionEngine from '../components/DecisionEngine';
import PressureIndicator from '../components/PressureIndicator';
import EventFeed from '../components/EventFeed';
import { TrafficChart, LatencyChart } from '../components/Charts';
import PipelineScene from '../three/PipelineScene';

export default function Overview({ simulation }) {
  const { metrics, history, events, simulationState, startSimulation, triggerSpike, recover, reset } = simulation;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Hero & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-textPrimary tracking-tight mb-2">Adaptive Event Processing</h1>
          <p className="text-lg text-textSecondary mb-4">Survive the spike. Protect what matters.</p>
          <p className="text-sm text-textMuted max-w-2xl">
            Intelligently route, batch, defer and protect event traffic under sudden load.
          </p>
        </div>
        
        <div className="mt-6 md:mt-0 flex flex-col items-end space-y-3">
          <div className="flex items-center space-x-2 px-3 py-1 bg-surface rounded-full border border-border text-xs font-mono mb-2">
            <div className={`w-2 h-2 rounded-full ${simulationState === 'IDLE' ? 'bg-textMuted' : simulationState === 'SPIKE' || simulationState === 'HIGH_LOAD' ? 'bg-warning animate-pulse' : 'bg-primary animate-pulse'}`}></div>
            <span className="text-textSecondary uppercase">{simulationState.replace('_', ' ')}</span>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={startSimulation}
              disabled={simulationState !== 'IDLE'}
              className="px-4 py-2 bg-surface hover:bg-surface/80 border border-border rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              START SIMULATION
            </button>
            <button 
              onClick={triggerSpike}
              disabled={simulationState === 'IDLE' || simulationState === 'SPIKE' || simulationState === 'HIGH_LOAD'}
              className="px-4 py-2 bg-critical/10 hover:bg-critical/20 text-critical border border-critical/30 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              TRIGGER 20× SPIKE
            </button>
            <button 
              onClick={recover}
              disabled={simulationState !== 'HIGH_LOAD' && simulationState !== 'SPIKE'}
              className="px-4 py-2 bg-healthy/10 hover:bg-healthy/20 text-healthy border border-healthy/30 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              RECOVER
            </button>
            <button 
              onClick={reset}
              className="px-4 py-2 text-textMuted hover:text-textPrimary transition-colors text-sm"
            >
              RESET
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard 
          label="TRAFFIC RATE" 
          value={metrics.trafficRate.toLocaleString()} 
          subValue="events/min"
          color="text-primary"
        />
        <MetricCard 
          label="THROUGHPUT" 
          value={metrics.throughput.toLocaleString()} 
          subValue="events/min"
          color="text-adaptive"
        />
        <MetricCard 
          label="QUEUE DEPTH" 
          value={metrics.queueDepth.toLocaleString()} 
          trend={metrics.queueDepth > 1000 ? 'up' : metrics.queueDepth < 100 ? 'down' : null}
        />
        <MetricCard 
          label="CRITICAL LATENCY" 
          value={`${metrics.criticalLatency}ms`} 
          color="text-healthy"
        />
        <MetricCard 
          label="SYSTEM HEALTH" 
          value={metrics.pressureState} 
          color={metrics.pressureState === 'NORMAL' ? 'text-healthy' : metrics.pressureState === 'CRITICAL' ? 'text-critical' : 'text-warning'}
        />
      </div>

      {/* 3D Pipeline */}
      <div className="rounded-xl overflow-hidden shadow-2xl shadow-primary/5">
        <PipelineScene metrics={metrics} />
      </div>

      {/* Queues & Decision Engine & Pressure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-textPrimary uppercase">Priority Queues</h2>
          <QueueCard 
            title="CRITICAL" 
            events={['Payment', 'Order']} 
            queued={metrics.queues.critical} 
            mode={metrics.decisions.critical} 
            colorClass="text-healthy border-healthy" 
          />
          <QueueCard 
            title="MEDIUM" 
            events={['Inventory']} 
            queued={metrics.queues.medium} 
            mode={metrics.decisions.medium} 
            colorClass="text-primary border-primary" 
          />
          <QueueCard 
            title="LOW" 
            events={['Click', 'Log']} 
            queued={metrics.queues.low} 
            mode={metrics.decisions.low} 
            colorClass="text-textMuted border-textMuted" 
          />
        </div>
        
        <div className="lg:col-span-4">
          <DecisionEngine 
            load={metrics.systemLoad} 
            pressure={metrics.queuePressure} 
            worker={metrics.workerUtilization}
            strategy={metrics.strategy}
            decisions={metrics.decisions}
          />
        </div>

        <div className="lg:col-span-3">
          <PressureIndicator pressureState={metrics.pressureState} criticalDropped={metrics.criticalDropped} />
        </div>
      </div>

      {/* Charts & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TrafficChart data={history.traffic} />
        </div>
        <div className="lg:col-span-1">
          <LatencyChart data={history.latency} />
        </div>
        <div className="lg:col-span-1 h-64">
          <EventFeed events={events} />
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center py-6 text-xs font-mono text-textMuted border-t border-border mt-12">
        SIMULATION MODE • DEMO DATA
      </div>
    </div>
  );
}
