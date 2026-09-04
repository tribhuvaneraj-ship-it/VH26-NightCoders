import { useState, useEffect, useCallback, useRef } from 'react';
import { initialMetrics, eventTypes } from '../data/mockData';

const NORMAL_TRAFFIC = 1024;
const SPIKE_TRAFFIC = 20000;
const TICK_RATE = 1000; // 1 second updates

export function useSimulation() {
  const [simulationState, setSimulationState] = useState('IDLE'); // IDLE, RUNNING, SPIKE, HIGH_LOAD, RECOVERING
  
  const [metrics, setMetrics] = useState(initialMetrics);

  const [history, setHistory] = useState({
    traffic: [],
    throughput: [],
    latency: { critical: [], medium: [], low: [] }
  });

  const [events, setEvents] = useState([]);
  const targetTrafficRef = useRef(NORMAL_TRAFFIC);
  const currentTrafficRef = useRef(NORMAL_TRAFFIC);

  // Initialize history with empty data
  useEffect(() => {
    const initialHistory = Array(20).fill(0).map((_, i) => ({
      time: i,
      traffic: 0,
      throughput: 0
    }));
    setHistory({
      traffic: initialHistory,
      latency: Array(20).fill(0).map((_, i) => ({
        time: i,
        critical: 0,
        medium: 0,
        low: 0
      }))
    });
  }, []);

  const generateEventId = () => `evt_${Math.random().toString(16).substr(2, 6).toUpperCase()}`;

  const triggerSpike = useCallback(() => {
    setSimulationState('SPIKE');
    targetTrafficRef.current = SPIKE_TRAFFIC;
  }, []);

  const startSimulation = useCallback(() => {
    setSimulationState('RUNNING');
    targetTrafficRef.current = NORMAL_TRAFFIC;
    currentTrafficRef.current = NORMAL_TRAFFIC;
  }, []);

  const recover = useCallback(() => {
    setSimulationState('RECOVERING');
    targetTrafficRef.current = NORMAL_TRAFFIC;
  }, []);

  const reset = useCallback(() => {
    setSimulationState('IDLE');
    targetTrafficRef.current = NORMAL_TRAFFIC;
    currentTrafficRef.current = NORMAL_TRAFFIC;
    setMetrics(initialMetrics);
    setEvents([]);
  }, []);

  // Main simulation loop
  useEffect(() => {
    if (simulationState === 'IDLE') return;

    const interval = setInterval(() => {
      // 1. Update Traffic
      const target = targetTrafficRef.current;
      let current = currentTrafficRef.current;
      
      // Move current towards target
      if (current < target) {
        current += (target - current) * 0.2 + 500;
        if (current > target) current = target;
      } else if (current > target) {
        current -= (current - target) * 0.2 + 500;
        if (current < target) current = target;
      }
      
      // Add a bit of jitter
      current = Math.floor(current + (Math.random() * 200 - 100));
      if (current < 0) current = 0;
      currentTrafficRef.current = current;

      // 2. Derive System State
      const loadRatio = current / SPIKE_TRAFFIC; // 0.0 to 1.0+
      
      let pressureState = 'NORMAL';
      let strategy = 'STANDARD PROCESSING';
      let decisions = { critical: 'STREAM', medium: 'STREAM', low: 'STREAM' };
      
      if (loadRatio > 0.8) {
        pressureState = 'CRITICAL';
        strategy = 'PRIORITY-AWARE SHEDDING';
        decisions = { critical: 'STREAM', medium: 'BATCH', low: 'SHED' };
        if (simulationState === 'SPIKE') setSimulationState('HIGH_LOAD');
      } else if (loadRatio > 0.5) {
        pressureState = 'HIGH';
        strategy = 'PRIORITY-AWARE ADAPTATION';
        decisions = { critical: 'STREAM', medium: 'BATCH', low: 'DEFER' };
      } else if (loadRatio > 0.2) {
        pressureState = 'ELEVATED';
        strategy = 'BATCH OPTIMIZATION';
        decisions = { critical: 'STREAM', medium: 'STREAM', low: 'BATCH' };
      }

      if (simulationState === 'RECOVERING' && loadRatio < 0.2) {
        setSimulationState('RUNNING');
      }

      // 3. Calculate Metrics
      // Throughput tries to keep up but caps out around 18.5k
      const maxThroughput = 18500;
      let throughput = current > maxThroughput ? maxThroughput - (Math.random() * 500) : current * 0.98;
      
      // Queues
      let qCritical = Math.floor(12 + Math.random() * 10);
      let qMedium = Math.floor(80 + (loadRatio * 2000));
      let qLow = decisions.low === 'SHED' ? 0 : Math.floor(400 + (loadRatio * 8000));
      
      if (decisions.low === 'DEFER') qLow += Math.floor(Math.random() * 500);

      const totalQueue = qCritical + qMedium + qLow;

      // Latencies
      // Critical is protected
      const latCritical = 38 + Math.floor(loadRatio * 10) + Math.floor(Math.random() * 4);
      const latMedium = 65 + Math.floor(loadRatio * 120) + Math.floor(Math.random() * 10);
      const latLow = decisions.low === 'SHED' ? 0 : 82 + Math.floor(loadRatio * 350);

      const newMetrics = {
        trafficRate: Math.floor(current),
        throughput: Math.floor(throughput),
        queueDepth: totalQueue,
        criticalLatency: latCritical,
        mediumLatency: latMedium,
        lowLatency: latLow,
        systemLoad: Math.floor(Math.min(99, 12 + loadRatio * 85)),
        queuePressure: Math.floor(Math.min(99, 5 + loadRatio * 90)),
        workerUtilization: Math.floor(Math.min(99, 18 + loadRatio * 80)),
        pressureState,
        criticalDropped: 0, // Always protected
        strategy,
        decisions,
        queues: {
          critical: qCritical,
          medium: qMedium,
          low: qLow
        }
      };

      setMetrics(newMetrics);

      // 4. Update History
      setHistory(prev => {
        const newTraffic = [...prev.traffic.slice(1), { 
          time: Date.now(), 
          traffic: newMetrics.trafficRate, 
          throughput: newMetrics.throughput 
        }];
        const newLatency = [...prev.latency.slice(1), {
          time: Date.now(),
          critical: latCritical,
          medium: latMedium,
          low: latLow
        }];
        return { traffic: newTraffic, latency: newLatency };
      });

      // 5. Generate feed events
      const newEvents = Array(Math.floor(Math.random() * 3) + 2).fill(0).map(() => {
        const evt = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        let mode = decisions[evt.priority.toLowerCase()];
        let latency = evt.priority === 'CRITICAL' ? latCritical : 
                      evt.priority === 'MEDIUM' ? latMedium : latLow;
        
        return {
          id: generateEventId(),
          type: evt.type,
          priority: evt.priority,
          mode: mode,
          latency: mode === 'SHED' || mode === 'DEFER' ? '--' : `${latency}ms`,
          timestamp: Date.now()
        };
      });

      setEvents(prev => [...newEvents, ...prev].slice(0, 8)); // keep last 8

    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [simulationState]);

  return {
    simulationState,
    metrics,
    history,
    events,
    startSimulation,
    triggerSpike,
    recover,
    reset
  };
}
