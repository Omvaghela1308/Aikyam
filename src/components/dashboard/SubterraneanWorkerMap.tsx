'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  Compass,
  Wifi,
  Box,
  Layers3,
  Layers,
  RotateCcw,
  Hand,
  Users
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import { useTelemetry } from '@/context/TelemetryContext';
import { useRole } from '@/context/RoleContext';
import { getWorkerLevel, MY_WORKER_ID } from '@/lib/mine-levels';

// Dynamic import with SSR disabled for Three.js WebGL canvas
const MineMap3D = dynamic(() => import('@/components/three/MineMap3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-amber-400 gap-3">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono font-bold tracking-wider">LOADING 3D SUBTERRANEAN MINE SCENE...</span>
    </div>
  ),
});

interface SubterraneanWorkerMapProps {
  title?: string;
  subtitle?: string;
  showAllWorkers?: boolean;
}

export default function SubterraneanWorkerMap({
  title = "3D Interactive Multi-Depth Subterranean Mine Shaft Map",
  subtitle = "Live 3D UWB (±0.4m) depth-stratified tracking across underground mine gallery levels",
  showAllWorkers = true
}: SubterraneanWorkerMapProps) {
  const { workers, allWorkers } = useTelemetry();
  const { role } = useRole();

  const [activeLevelIndex, setActiveLevelIndex] = useState<number>(3); // Default Level 3 (-320m)
  const [is3dStackedView, setIs3dStackedView] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [resetViewKey, setResetViewKey] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(timer);
  }, []);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);

  const levelDetails = [
    { id: 0, name: 'Surface Ground', depth: '0m' },
    { id: 1, name: 'Shaft Level 1', depth: '-90m' },
    { id: 2, name: 'Shaft Level 2', depth: '-180m' },
    { id: 3, name: 'Shaft Level 3 (Deep Incline)', depth: '-320m' },
  ];

  const currentLevel = levelDetails[activeLevelIndex] || levelDetails[3];

  // Filter workers based on role; with showAllWorkers a Worker also sees their co-workers
  const displayedWorkers = role === 'Worker'
    ? showAllWorkers
      ? allWorkers
      : workers.filter((w) => w.id === 'W1026' || w.jacketId === 'SJ-003')
    : workers;

  const selectedWorker = displayedWorkers.find((w) => w.id === selectedPin) || null;

  // Worker role: find "me" and the co-workers on my level
  const isWorkerView = role === 'Worker';
  const myIndex = displayedWorkers.findIndex((w) => w.id === MY_WORKER_ID);
  const me = isWorkerView && myIndex >= 0 ? displayedWorkers[myIndex] : null;
  const myLevel = me ? getWorkerLevel(me.id, myIndex) : null;
  const nearbyWorkers = me
    ? displayedWorkers.filter((w, i) => w.id !== me.id && getWorkerLevel(w.id, i) === myLevel)
    : [];

  // Open the map on the worker's own level (adjusted during render once the role is known)
  const [syncedMyLevel, setSyncedMyLevel] = useState<number | null>(null);
  if (myLevel !== null && myLevel !== syncedMyLevel) {
    setSyncedMyLevel(myLevel);
    setActiveLevelIndex(myLevel);
  }

  const focusWorker = (id: string, levelIndex: number) => {
    setActiveLevelIndex(levelIndex);
    setSelectedPin(id);
  };

  return (
    <Card padding="none" className="overflow-hidden border-slate-200/90 bg-white shadow-lg rounded-3xl">
      {/* Map Header Toolbar */}
      <div className="p-5 bg-gradient-to-r from-amber-50 via-slate-50 to-orange-50 text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 border border-amber-200">
              <Layers3 className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">{title}</h2>
          </div>
        </div>

        {/* Level Depth Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-white/95 rounded-2xl border border-slate-200 shadow-2xs">
          {levelDetails.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => {
                setActiveLevelIndex(lvl.id);
                setSelectedPin(null);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeLevelIndex === lvl.id
                  ? 'bg-slate-900 text-white shadow-sm scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeLevelIndex === lvl.id ? 'bg-amber-400 animate-ping' : 'bg-slate-300'}`} />
              <span>{lvl.name} ({lvl.depth})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3D Interactive Subterranean Canvas Area */}
      <div className="relative w-full h-[580px] bg-slate-950 p-4 flex flex-col justify-between overflow-hidden">
        
        {/* Top View Controls & Active Depth Focus (gaps between pills let drags reach the map) */}
        <div className="flex flex-wrap items-center justify-between gap-2 z-30 pointer-events-none [&>*]:pointer-events-auto">
          {/* Active Depth Focus Pill */}
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 shadow-md">
            <Compass className="w-4 h-4 text-amber-600" />
            <span>Active Depth Focus: <strong className="text-amber-700 font-mono">{currentLevel.name} ({currentLevel.depth})</strong></span>
          </div>

          {/* View Toolbar Controls */}
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 shadow-md">
            {/* 3D Stacked View Toggle Button */}
            <button
              onClick={() => setIs3dStackedView(!is3dStackedView)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                is3dStackedView
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>{is3dStackedView ? 'Realistic Cutaway' : '3D Stacked View'}</span>
            </button>

            {/* Reset camera to the default angle */}
            <button
              onClick={() => {
                setZoomScale(1);
                setResetViewKey((k) => k + 1);
              }}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              title="Reset View"
              aria-label="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Zoom Controls */}
            <button
              onClick={() => setZoomScale(prev => Math.min(prev + 0.15, 1.6))}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScale(prev => Math.max(prev - 0.15, 0.6))}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Real Three.js Canvas Scene */}
        <div className="absolute inset-0 z-10" onPointerDown={() => setShowHint(false)}>
          <MineMap3D
            activeLevelIndex={activeLevelIndex}
            is3dStackedView={is3dStackedView}
            zoomScale={zoomScale}
            resetViewKey={resetViewKey}
            workers={displayedWorkers}
            selectedWorkerId={selectedPin}
            myWorkerId={me?.id ?? null}
            onSelectWorker={(id) => setSelectedPin(id)}
            onSelectLevel={(lvlIdx) => setActiveLevelIndex(lvlIdx)}
          />
        </div>

        {/* How to move the view; fades after the first touch or a few seconds */}
        <div className={`absolute left-1/2 -translate-x-1/2 bottom-24 sm:bottom-20 z-20 pointer-events-none transition-opacity duration-700 ${showHint ? 'opacity-100' : 'opacity-0'} flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-sm border border-white/10 text-[11px] font-semibold text-slate-200 whitespace-nowrap`}>
          <Hand className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Drag to rotate &amp; tilt · Scroll to zoom · Right-drag to pan</span>
          <span className="sm:hidden">Drag to rotate · Pinch to zoom</span>
        </div>

        {/* Selected Worker Info Overlay Card */}
        {selectedWorker && (
          <div className="absolute top-16 left-6 right-6 z-40 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-amber-300 text-slate-900 shadow-2xl flex items-center justify-between animate-in fade-in duration-200 pointer-events-auto">
            <div className="flex items-center gap-3.5">
              <Avatar
                name={selectedWorker.name}
                role={selectedWorker.role}
                size="md"
                status={selectedWorker.status === 'critical' ? 'danger' : selectedWorker.status === 'warning' ? 'warning' : 'safe'}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-slate-900">{selectedWorker.name}</h4>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Jacket {selectedWorker.jacketId}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {selectedWorker.role} • Zone: <strong className="text-slate-800">{selectedWorker.zone}</strong> • Level: <strong className="font-mono text-amber-600">{currentLevel.depth}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono font-bold">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Live Telemetry</span>
                <span className="text-amber-600 font-bold">{selectedWorker.h2s.toFixed(1)} ppm H₂S</span> | <span className="text-rose-600 font-bold">{selectedWorker.heartRate} bpm</span> | <span className="text-emerald-600 font-bold">⚡ {selectedWorker.battery}%</span>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Map Bottom Legend & Statistics Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 z-30 pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-md text-xs mt-auto">
          <div className="flex items-center gap-4 text-[11px] text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Safe Personnel ({displayedWorkers.filter(w => w.status === 'online').length})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Warning ({displayedWorkers.filter(w => w.status === 'warning').length})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>SOS Emergency ({displayedWorkers.filter(w => w.sosActive || w.status === 'critical').length})</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-amber-700 font-bold">
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-amber-600" />
              Multi-Level 3D Mesh Anchors (-74 dBm)
            </span>
          </div>
        </div>
      </div>

      {/* Worker role: co-workers on the same level */}
      {me && myLevel !== null && (
        <div className="p-4 sm:p-5 border-t border-slate-200/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              Workers near you
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {levelDetails[myLevel].name} ({levelDetails[myLevel].depth})
              </span>
            </h3>
            <button
              onClick={() => focusWorker(me.id, myLevel)}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              Show me on map
            </button>
          </div>

          {nearbyWorkers.length === 0 ? (
            <p className="text-xs text-slate-500">No other workers on your level right now.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {nearbyWorkers.map((w) => {
                const isSOS = w.sosActive || w.status === 'critical';
                const statusLabel = isSOS ? 'SOS' : w.status === 'warning' ? 'Warning' : 'Safe';
                return (
                  <button
                    key={w.id}
                    onClick={() => focusWorker(w.id, myLevel)}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-colors cursor-pointer ${
                      selectedPin === w.id ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Avatar
                      name={w.name}
                      role={w.role}
                      size="sm"
                      status={isSOS ? 'danger' : w.status === 'warning' ? 'warning' : 'safe'}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">{w.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{w.role} · {w.zone}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        isSOS
                          ? 'bg-rose-100 text-rose-700'
                          : w.status === 'warning'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
