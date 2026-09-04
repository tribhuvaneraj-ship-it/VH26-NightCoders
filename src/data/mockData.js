// Mock data representing the initial or base state of the system
export const initialMetrics = {
  trafficRate: 1024,
  throughput: 982,
  queueDepth: 42,
  criticalLatency: 38,
  mediumLatency: 65,
  lowLatency: 82,
  systemLoad: 12,
  queuePressure: 5,
  workerUtilization: 18,
  pressureState: 'NORMAL',
  criticalDropped: 0,
  strategy: 'STANDARD PROCESSING',
  decisions: {
    critical: 'STREAM',
    medium: 'STREAM',
    low: 'STREAM'
  },
  queues: {
    critical: 12,
    medium: 84,
    low: 420
  }
};

export const eventTypes = [
  { type: 'Payment', priority: 'CRITICAL' },
  { type: 'Order', priority: 'CRITICAL' },
  { type: 'Inventory', priority: 'MEDIUM' },
  { type: 'Click', priority: 'LOW' },
  { type: 'Log', priority: 'LOW' }
];
