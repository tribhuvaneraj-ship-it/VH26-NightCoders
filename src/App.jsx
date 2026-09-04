import React from 'react';
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import { useSimulation } from './hooks/useSimulation';

function App() {
  const simulation = useSimulation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Overview simulation={simulation} />
    </div>
  );
}

export default App;
