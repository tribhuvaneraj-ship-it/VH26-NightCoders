// API service layer for future backend integration

export const apiService = {
  // Example REST endpoints for future backend
  
  async getMetrics() {
    // In future: return fetch('/api/metrics').then(res => res.json());
    return Promise.resolve(null);
  },
  
  async triggerSpike(intensity = 20) {
    // In future: return fetch('/api/simulation/spike', { method: 'POST', body: JSON.stringify({ intensity }) });
    return Promise.resolve(true);
  },
  
  async recoverSystem() {
    // In future: return fetch('/api/simulation/recover', { method: 'POST' });
    return Promise.resolve(true);
  },
  
  // WebSocket setup example
  connectWebSocket(onMessage) {
    // const ws = new WebSocket('ws://api.adaptiveflow.local/stream');
    // ws.onmessage = (event) => onMessage(JSON.parse(event.data));
    // return ws;
    return null;
  }
};
