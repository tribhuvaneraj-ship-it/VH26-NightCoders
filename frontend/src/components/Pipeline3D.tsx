"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SystemMode } from "../types";
import { Layers, Eye, RotateCw } from "lucide-react";

interface Pipeline3DProps {
  eventsPerMinute: number;
  systemMode: SystemMode;
  queueDepths: { critical: number; high: number; low: number; total: number };
}

export const Pipeline3D: React.FC<Pipeline3DProps> = ({
  eventsPerMinute,
  systemMode,
  queueDepths,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 380;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    scene.fog = new THREE.FogExp2(0x0a0e17, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 14, 24);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 50);
    pointLight.position.set(0, 10, 5);
    scene.add(pointLight);

    const redLight = new THREE.PointLight(0xef4444, 1.5, 30);
    redLight.position.set(6, 0, 0);
    scene.add(redLight);

    // 3. Pipeline Structural Nodes
    // Ingestion Node (Source)
    const ingestGeo = new THREE.CylinderGeometry(1.8, 1.4, 0.8, 32);
    const ingestMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.8,
    });
    const ingestNode = new THREE.Mesh(ingestGeo, ingestMat);
    ingestNode.position.set(0, 7, -6);
    scene.add(ingestNode);

    // Ingestion Halo Ring
    const ringGeo = new THREE.TorusGeometry(2.3, 0.06, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    const ingestRing = new THREE.Mesh(ringGeo, ringMat);
    ingestRing.rotation.x = Math.PI / 2;
    ingestRing.position.set(0, 7, -6);
    scene.add(ingestRing);

    // Priority Router Switch (Center)
    const routerGeo = new THREE.OctahedronGeometry(1.2, 0);
    const routerMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.7,
      wireframe: false,
    });
    const routerNode = new THREE.Mesh(routerGeo, routerMat);
    routerNode.position.set(0, 4, -2);
    scene.add(routerNode);

    // 4. Three Parallel Conveyor Lanes (Tubes)
    // Lane 1: Critical Fast Lane (Left, Cyan)
    const critCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 4, -2),
      new THREE.Vector3(-4.5, 2, 3),
      new THREE.Vector3(-4, -2, 8),
      new THREE.Vector3(0, -4, 11),
    ]);
    const critTubeGeo = new THREE.TubeGeometry(critCurve, 40, 0.18, 8, false);
    const critTubeMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });
    const critTube = new THREE.Mesh(critTubeGeo, critTubeMat);
    scene.add(critTube);

    // Lane 2: High Priority Batch Lane (Center, Amber)
    const highCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 4, -2),
      new THREE.Vector3(0, 1.5, 3),
      new THREE.Vector3(0, -1.5, 7),
      new THREE.Vector3(0, -4, 11),
    ]);
    const highTubeGeo = new THREE.TubeGeometry(highCurve, 40, 0.18, 8, false);
    const highTubeMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });
    const highTube = new THREE.Mesh(highTubeGeo, highTubeMat);
    scene.add(highTube);

    // Micro-Batch Collector Box (on High Lane)
    const batchBoxGeo = new THREE.BoxGeometry(1.4, 0.8, 1.4);
    const batchBoxMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
    });
    const batchBox = new THREE.Mesh(batchBoxGeo, batchBoxMat);
    batchBox.position.set(0, 0.2, 5);
    scene.add(batchBox);

    // Lane 3: Low Priority Adaptive Lane (Right, Purple/Red)
    const lowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 4, -2),
      new THREE.Vector3(4.5, 2, 3),
      new THREE.Vector3(5, -1, 7),
      new THREE.Vector3(0, -4, 11),
    ]);
    const lowTubeGeo = new THREE.TubeGeometry(lowCurve, 40, 0.18, 8, false);
    const lowTubeMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });
    const lowTube = new THREE.Mesh(lowTubeGeo, lowTubeMat);
    scene.add(lowTube);

    // Deferral / Shed Overflow Chamber
    const deferChamberGeo = new THREE.SphereGeometry(0.9, 16, 16);
    const deferChamberMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const deferChamber = new THREE.Mesh(deferChamberGeo, deferChamberMat);
    deferChamber.position.set(6.2, 0.5, 4);
    scene.add(deferChamber);

    // Destination Node: MongoDB Processing Target (Bottom)
    const dbGeo = new THREE.CylinderGeometry(2.2, 2.2, 1.2, 32);
    const dbMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      emissive: 0x10b981,
      emissiveIntensity: 0.5,
      roughness: 0.2,
    });
    const dbNode = new THREE.Mesh(dbGeo, dbMat);
    dbNode.position.set(0, -4.5, 11);
    scene.add(dbNode);

    // Database Status Rings
    const dbRingGeo = new THREE.TorusGeometry(2.8, 0.05, 16, 64);
    const dbRingMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const dbRing = new THREE.Mesh(dbRingGeo, dbRingMat);
    dbRing.rotation.x = Math.PI / 2;
    dbRing.position.set(0, -4.5, 11);
    scene.add(dbRing);

    // 5. Flowing Particles
    const NUM_CRIT = 50;
    const NUM_HIGH = 40;
    const NUM_LOW = 40;

    interface FlowParticle {
      curve: THREE.CatmullRomCurve3;
      progress: number;
      speed: number;
      mesh: THREE.Mesh;
    }

    const particles: FlowParticle[] = [];

    // Critical Particles (Cyan)
    const pCritGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const pCritMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
    for (let i = 0; i < NUM_CRIT; i++) {
      const mesh = new THREE.Mesh(pCritGeo, pCritMat);
      scene.add(mesh);
      particles.push({
        curve: critCurve,
        progress: Math.random(),
        speed: 0.012, // High speed fast-lane
        mesh,
      });
    }

    // High Particles (Amber)
    const pHighGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const pHighMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    for (let i = 0; i < NUM_HIGH; i++) {
      const mesh = new THREE.Mesh(pHighGeo, pHighMat);
      scene.add(mesh);
      particles.push({
        curve: highCurve,
        progress: Math.random(),
        speed: 0.007,
        mesh,
      });
    }

    // Low Particles (Purple / Red)
    const pLowGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const pLowMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
    for (let i = 0; i < NUM_LOW; i++) {
      const mesh = new THREE.Mesh(pLowGeo, pLowMat);
      scene.add(mesh);
      particles.push({
        curve: lowCurve,
        progress: Math.random(),
        speed: 0.005,
        mesh,
      });
    }

    // Grid Floor
    const grid = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    grid.position.y = -6;
    scene.add(grid);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Rotate Router Switch
      routerNode.rotation.y += delta * 1.5;
      routerNode.rotation.x += delta * 0.8;
      ingestRing.rotation.z += delta * 0.5;
      dbRing.rotation.z -= delta * 0.8;

      // Adjust particle speeds according to mode
      const speedMultiplier = systemMode === "SPIKE" || systemMode === "EXTREME" ? 2.2 : 1.0;

      // Pulse Batch Container & Defer Chamber during load
      const pulse = Math.sin(elapsed * 4) * 0.15 + 1.0;
      batchBox.scale.set(pulse, pulse, pulse);
      deferChamber.rotation.y += delta * 1.2;

      // Move Particles
      for (const p of particles) {
        p.progress += p.speed * speedMultiplier;
        if (p.progress >= 1) {
          p.progress = 0;
        }

        // Evaluate curve position
        const pos = p.curve.getPointAt(p.progress);
        p.mesh.position.copy(pos);

        // In Extreme/Spike mode, divert some low particles into deferral chamber
        if (p.curve === lowCurve && (systemMode === "SPIKE" || systemMode === "EXTREME")) {
          if (p.progress > 0.4 && p.progress < 0.7) {
            // Jitter towards defer chamber
            p.mesh.position.x += Math.sin(elapsed * 10 + p.progress * 20) * 0.4;
          }
        }
      }

      // Gentle camera orbit if enabled
      if (isRotating) {
        const radius = 25;
        camera.position.x = Math.sin(elapsed * 0.1) * 6;
        camera.position.z = Math.cos(elapsed * 0.1) * 3 + 22;
        camera.lookAt(0, 0, 3);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 380;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [systemMode, isRotating]);

  return (
    <div className="relative w-full h-[380px] bg-slate-950/90 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* 3D WebGL Canvas Target */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Interactive Controls Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        <button
          onClick={() => setIsRotating(!isRotating)}
          title="Toggle Auto Orbit"
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 backdrop-blur-md transition-colors ${
            isRotating
              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
              : "bg-slate-900/80 border-slate-800 text-slate-400"
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Orbit</span>
        </button>
        <button
          onClick={() => setShowLabels(!showLabels)}
          title="Toggle Architectural Labels"
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 backdrop-blur-md transition-colors ${
            showLabels
              ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
              : "bg-slate-900/80 border-slate-800 text-slate-400"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Labels</span>
        </button>
      </div>

      {/* Lane Indicators & Legend (HUD) */}
      {showLabels && (
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px]">
          <div className="flex items-center gap-3 bg-slate-900/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl pointer-events-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
              <span className="text-cyan-300 font-bold">Fast-Lane (Payments/Orders)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
              <span className="text-amber-300 font-medium">Batch (Inventory)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
              <span className="text-purple-300 font-medium">Adaptive (Clicks/Logs)</span>
            </div>
          </div>

          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 font-mono">
            <span>Flow: </span>
            <span className="text-white font-bold">{eventsPerMinute.toLocaleString()} eps</span>
            <span className="mx-1 text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">Loss: 0%</span>
          </div>
        </div>
      )}
    </div>
  );
};