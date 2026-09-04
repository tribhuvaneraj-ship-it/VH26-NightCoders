import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';

// Pipeline node coordinates spanning the entire wide canvas
const NODE_COORDS = {
  gen:     [-19, 0, 0],
  ingest:  [-12.5, 0, 0],
  class:   [-6.5, 0, 0],
  q_crit:  [0, 5.5, 0],
  q_med:   [0, 0, 0],
  q_low:   [0, -5.5, 0],
  engine:  [6.5, 0, 0],
  workers: [12.5, 0, 0],
  sink:    [19, 0, 0]
};

// 3 explicit routing paths for Critical, Medium, and Low
const PATHS = [
  // 0: Critical Path (top green branch)
  [
    NODE_COORDS.gen,
    NODE_COORDS.ingest,
    NODE_COORDS.class,
    NODE_COORDS.q_crit,
    NODE_COORDS.engine,
    NODE_COORDS.workers,
    NODE_COORDS.sink
  ],
  // 1: Medium Path (center blue branch)
  [
    NODE_COORDS.gen,
    NODE_COORDS.ingest,
    NODE_COORDS.class,
    NODE_COORDS.q_med,
    NODE_COORDS.engine,
    NODE_COORDS.workers,
    NODE_COORDS.sink
  ],
  // 2: Low Path (bottom muted branch)
  [
    NODE_COORDS.gen,
    NODE_COORDS.ingest,
    NODE_COORDS.class,
    NODE_COORDS.q_low,
    NODE_COORDS.engine,
    NODE_COORDS.workers,
    NODE_COORDS.sink
  ]
];

// Physical connection conduits linking the topology
const CONDUIT_LINES = [
  { start: NODE_COORDS.gen,    end: NODE_COORDS.ingest, color: '#252A32' },
  { start: NODE_COORDS.ingest, end: NODE_COORDS.class,  color: '#252A32' },
  // Branching to 3 queues
  { start: NODE_COORDS.class,  end: NODE_COORDS.q_crit, color: '#22C55E' },
  { start: NODE_COORDS.class,  end: NODE_COORDS.q_med,  color: '#4F7CFF' },
  { start: NODE_COORDS.class,  end: NODE_COORDS.q_low,  color: '#475569' },
  // Converging from queues to Decision Engine
  { start: NODE_COORDS.q_crit, end: NODE_COORDS.engine, color: '#22C55E' },
  { start: NODE_COORDS.q_med,  end: NODE_COORDS.engine, color: '#4F7CFF' },
  { start: NODE_COORDS.q_low,  end: NODE_COORDS.engine, color: '#475569' },
  // Processing pipeline
  { start: NODE_COORDS.engine, end: NODE_COORDS.workers, color: '#8B5CF6' },
  { start: NODE_COORDS.workers, end: NODE_COORDS.sink,   color: '#22C55E' }
];

/* 3D Geometric Node */
function PipelineNode({ 
  pos, 
  color, 
  label, 
  subLabel, 
  labelPosition = 'top', // 'top' or 'bottom'
  size = 1.3,
  shape = 'cube', // 'cube', 'diamond', 'cylinder'
  isQueue = false,
  queueDepth = 0,
  queueMax = 100,
  isEngine = false,
  strategy = ''
}) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current && (isEngine || isQueue)) {
      // Gentle pulse for active nodes
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.y = t * 0.5;
    }
  });

  const pct = Math.min(100, Math.max(0, Math.round((queueDepth / queueMax) * 100)));

  return (
    <group position={pos}>
      {/* Outer Glowing Wireframe */}
      <mesh ref={meshRef}>
        {shape === 'diamond' ? (
          <octahedronGeometry args={[0.9 * size, 0]} />
        ) : shape === 'cylinder' ? (
          <cylinderGeometry args={[0.7 * size, 0.7 * size, 0.9 * size, 16]} />
        ) : (
          <boxGeometry args={[size, size, size]} />
        )}
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={isEngine ? 0.6 : 0.35} 
          wireframe={true} 
        />
      </mesh>

      {/* Solid Inner Core */}
      <mesh>
        {shape === 'diamond' ? (
          <octahedronGeometry args={[0.75 * size, 0]} />
        ) : shape === 'cylinder' ? (
          <cylinderGeometry args={[0.6 * size, 0.6 * size, 0.8 * size, 16]} />
        ) : (
          <boxGeometry args={[size * 0.85, size * 0.85, size * 0.85]} />
        )}
        <meshStandardMaterial color="#12161C" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* HTML Label positioned with ample breathing room */}
      <Html 
        position={[0, labelPosition === 'top' ? size * 0.9 + 0.6 : -(size * 0.9 + 0.6), 0]} 
        center 
        zIndexRange={[100, 0]}
      >
        <div className="flex flex-col items-center pointer-events-none select-none">
          <div className="bg-[#12161C]/95 border border-[#252A32] px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md flex flex-col items-center min-w-[110px]">
            <span className="text-[11px] font-bold tracking-wider text-[#F5F7FA] uppercase whitespace-nowrap">
              {label}
            </span>
            
            {subLabel && (
              <span className="text-[10px] font-mono text-[#8B93A3] mt-0.5 whitespace-nowrap">
                {subLabel}
              </span>
            )}

            {isQueue && (
              <div className="w-full mt-1.5 flex flex-col items-center">
                <div className="w-full bg-[#0B0D10] h-1.5 rounded-full overflow-hidden border border-[#252A32]">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${pct}%`, 
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}`
                    }} 
                  />
                </div>
                <div className="flex justify-between w-full text-[9px] font-mono mt-1 text-[#8B93A3]">
                  <span>{queueDepth.toLocaleString()} queued</span>
                  <span style={{ color }}>{pct}%</span>
                </div>
              </div>
            )}

            {isEngine && strategy && (
              <span className="text-[9px] font-mono font-semibold text-[#8B5CF6] mt-1 bg-[#8B5CF6]/10 px-1.5 py-0.5 rounded border border-[#8B5CF6]/30 uppercase">
                {strategy}
              </span>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* Event Particles moving across the conduits */
function EventParticles({ metrics }) {
  const mesh = useRef();
  const maxParticles = 400;

  const particles = useMemo(() => {
    const list = [];
    for (let i = 0; i < maxParticles; i++) {
      // 0: Critical (green), 1: Medium (blue), 2: Low (muted gray)
      const pathIdx = i % 3;
      let pColor = pathIdx === 0 ? '#22C55E' : pathIdx === 1 ? '#4F7CFF' : '#94A3B8';
      
      list.push({
        t: Math.random(),
        baseSpeed: 0.0018 + Math.random() * 0.002,
        path: pathIdx,
        color: new THREE.Color(pColor),
        active: false,
        offsetY: (Math.random() - 0.5) * 0.35,
        offsetZ: (Math.random() - 0.5) * 0.35
      });
    }
    return list;
  }, []);

  useEffect(() => {
    if (!metrics) return;
    // Scale particle count based on incoming traffic rate
    const traffic = metrics.trafficRate || 1024;
    const targetCount = Math.min(maxParticles, Math.max(30, Math.floor(traffic / 55)));

    particles.forEach((p, i) => {
      p.active = i < targetCount;
      // If low priority is shed, deactivate low particles
      if (p.path === 2 && metrics.decisions?.low === 'SHED') {
        p.active = false;
      }
    });
  }, [metrics, particles]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!mesh.current || !metrics) return;

    const time = state.clock.getElapsedTime();
    // Batch release toggle every 0.8 seconds
    const isBatchRelease = Math.floor(time * 1.25) % 2 === 0;

    particles.forEach((p, i) => {
      if (!p.active) {
        dummy.position.set(2000, 2000, 2000);
        dummy.updateMatrix();
        mesh.current.setMatrixAt(i, dummy.matrix);
        return;
      }

      const numSegments = 6;
      const currentSegment = Math.floor(p.t * numSegments);
      const mode = p.path === 0 ? metrics.decisions?.critical :
                   p.path === 1 ? metrics.decisions?.medium :
                   metrics.decisions?.low;

      let speed = p.baseSpeed;

      // Processing Mode Behaviors
      if (mode === 'BATCH' && (currentSegment === 2 || currentSegment === 3)) {
        // Pool at queue then burst
        speed = isBatchRelease ? p.baseSpeed * 2.8 : p.baseSpeed * 0.15;
      } else if (mode === 'DEFER' && currentSegment >= 2) {
        // Defer slows low priority dramatically
        speed = p.baseSpeed * 0.18;
      }

      // Slightly faster overall during high spike
      if ((metrics.trafficRate || 0) > 10000) {
        speed *= 1.35;
      }

      p.t += speed;
      if (p.t >= 1) p.t = 0;

      // Linear interpolation along path segments
      const pts = PATHS[p.path];
      const scaledT = p.t * numSegments;
      const index = Math.min(Math.floor(scaledT), numSegments - 1);
      const progress = scaledT - index;

      const start = pts[index];
      const end = pts[index + 1];

      const x = start[0] + (end[0] - start[0]) * progress;
      const y = start[1] + (end[1] - start[1]) * progress + p.offsetY;
      const z = start[2] + (end[2] - start[2]) * progress + p.offsetZ;

      dummy.position.set(x, y, z);
      // Large, bright particles (0.28 scale)
      dummy.scale.set(0.28, 0.28, 0.28);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);

      if (mesh.current.setColorAt) {
        mesh.current.setColorAt(i, p.color);
      }
    });

    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) {
      mesh.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, maxParticles]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

/* Background Technical Grid */
function TopologyGrid() {
  return (
    <gridHelper 
      args={[50, 25, '#1E242D', '#12161C']} 
      position={[0, -7.5, 0]} 
    />
  );
}

/* Main Pipeline 3D Scene Component */
export default function PipelineScene({ metrics }) {
  const safeMetrics = metrics || {
    trafficRate: 1024,
    throughput: 982,
    workerUtilization: 42,
    strategy: 'ADAPTIVE',
    pressureState: 'NORMAL',
    queues: { critical: 12, medium: 84, low: 420 },
    decisions: { critical: 'STREAM', medium: 'BATCH', low: 'DEFER' }
  };

  const isHighLoad = safeMetrics.pressureState === 'HIGH' || safeMetrics.pressureState === 'CRITICAL';
  
  const statusColor = safeMetrics.pressureState === 'CRITICAL' ? '#EF4444' :
                      safeMetrics.pressureState === 'HIGH' ? '#F59E0B' : 
                      safeMetrics.pressureState === 'ELEVATED' ? '#4F7CFF' : '#22C55E';

  return (
    <div className="w-full h-[540px] bg-[#0B0D10] border border-border rounded-xl relative overflow-hidden flex flex-col justify-center">
      {/* Top Header Information Overlay */}
      <div className="absolute top-4 left-6 right-6 z-10 flex justify-between items-center pointer-events-none">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: statusColor }} />
          <span className="text-xs font-mono font-bold tracking-wider uppercase" style={{ color: statusColor }}>
            LIVE TRAFFIC TOPOLOGY — {safeMetrics.pressureState}
          </span>
          <span className="text-xs font-mono text-[#5E6675]">|</span>
          <span className="text-xs font-mono text-[#8B93A3]">
            {safeMetrics.trafficRate.toLocaleString()} EVENTS/MIN
          </span>
        </div>

        {/* Priority Routing Indicators */}
        <div className="hidden sm:flex items-center space-x-4 text-[11px] font-mono bg-[#12161C]/80 px-3 py-1.5 rounded-lg border border-[#252A32] backdrop-blur-sm">
          <span className="flex items-center space-x-1.5 text-[#22C55E]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span>CRIT: {safeMetrics.decisions?.critical || 'STREAM'}</span>
          </span>
          <span className="flex items-center space-x-1.5 text-[#4F7CFF]">
            <span className="w-2 h-2 rounded-full bg-[#4F7CFF]" />
            <span>MED: {safeMetrics.decisions?.medium || 'BATCH'}</span>
          </span>
          <span className="flex items-center space-x-1.5 text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-[#94A3B8]" />
            <span>LOW: {safeMetrics.decisions?.low || 'DEFER'}</span>
          </span>
        </div>
      </div>

      {/* 3D Canvas spanning the full width & height */}
      <Canvas 
        camera={{ position: [0, 0, 23.5], fov: 45 }}
        className="w-full h-full"
        gl={{ antialias: true }}
      >
        <ambientLight intensity={isHighLoad ? 1.0 : 0.6} />
        <pointLight position={[0, 15, 10]} intensity={1.5} color={isHighLoad ? statusColor : '#FFFFFF'} />
        <pointLight position={[-15, -10, 10]} intensity={0.8} />
        <pointLight position={[15, -10, 10]} intensity={0.8} />

        <TopologyGrid />

        {/* Thick Physical Conduits */}
        {CONDUIT_LINES.map((conduit, i) => (
          <group key={`conduit-${i}`}>
            {/* Background Conduit Pipe */}
            <Line
              points={[conduit.start, conduit.end]}
              color="#1B2028"
              lineWidth={4}
            />
            {/* Inner Glowing Pathway */}
            <Line
              points={[conduit.start, conduit.end]}
              color={conduit.color}
              lineWidth={isHighLoad ? 2.5 : 1.5}
              transparent
              opacity={isHighLoad ? 0.9 : 0.6}
            />
          </group>
        ))}

        {/* 1. Generator */}
        <PipelineNode 
          pos={NODE_COORDS.gen} 
          color="#4F7CFF" 
          label="GENERATOR" 
          subLabel={`${safeMetrics.trafficRate.toLocaleString()}/m`}
          labelPosition="top"
          size={1.4}
        />

        {/* 2. Ingestion */}
        <PipelineNode 
          pos={NODE_COORDS.ingest} 
          color="#8B93A3" 
          label="INGESTION" 
          subLabel="BUFFER ACTIVE"
          labelPosition="bottom"
          size={1.3}
        />

        {/* 3. Classifier */}
        <PipelineNode 
          pos={NODE_COORDS.class} 
          color="#8B93A3" 
          label="CLASSIFIER" 
          subLabel="3-WAY SPLIT"
          labelPosition="top"
          size={1.3}
          shape="diamond"
        />

        {/* 4. Priority Queues (Wide vertical distribution) */}
        <PipelineNode 
          pos={NODE_COORDS.q_crit} 
          color="#22C55E" 
          label="CRITICAL QUEUE" 
          subLabel="STREAM MODE"
          labelPosition="top"
          size={1.4}
          isQueue
          queueDepth={safeMetrics.queues?.critical || 0}
          queueMax={100}
        />

        <PipelineNode 
          pos={NODE_COORDS.q_med} 
          color="#4F7CFF" 
          label="MEDIUM QUEUE" 
          subLabel={safeMetrics.decisions?.medium || 'BATCH'}
          labelPosition="bottom"
          size={1.4}
          isQueue
          queueDepth={safeMetrics.queues?.medium || 0}
          queueMax={2500}
        />

        <PipelineNode 
          pos={NODE_COORDS.q_low} 
          color="#94A3B8" 
          label="LOW QUEUE" 
          subLabel={safeMetrics.decisions?.low || 'DEFER'}
          labelPosition="bottom"
          size={1.4}
          isQueue
          queueDepth={safeMetrics.queues?.low || 0}
          queueMax={10000}
        />

        {/* 5. Adaptive Decision Engine */}
        <PipelineNode 
          pos={NODE_COORDS.engine} 
          color="#8B5CF6" 
          label="DECISION ENGINE" 
          labelPosition="top"
          size={isHighLoad ? 1.8 : 1.5}
          shape="diamond"
          isEngine
          strategy={safeMetrics.strategy || 'ADAPTIVE'}
        />

        {/* 6. Workers */}
        <PipelineNode 
          pos={NODE_COORDS.workers} 
          color="#8B93A3" 
          label="WORKERS" 
          subLabel={`${safeMetrics.workerUtilization}% UTIL`}
          labelPosition="bottom"
          size={1.3}
          shape="cylinder"
        />

        {/* 7. Sink */}
        <PipelineNode 
          pos={NODE_COORDS.sink} 
          color="#22C55E" 
          label="SINK" 
          subLabel={`${safeMetrics.throughput.toLocaleString()}/m`}
          labelPosition="top"
          size={1.4}
        />

        {/* Moving Event Particles */}
        <EventParticles metrics={safeMetrics} />
      </Canvas>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-6 text-[10px] font-mono text-[#5E6675] pointer-events-none">
        AUTONOMOUS EVENT TOPOLOGY • ZERO CRITICAL DROPS
      </div>
    </div>
  );
}