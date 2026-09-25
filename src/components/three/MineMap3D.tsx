'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { WorkerTelemetry } from '@/types/telemetry';
import { getWorkerLevel } from '@/lib/mine-levels';

// Level definitions
export interface LevelInfo {
  id: number;
  name: string;
  depth: string;
  depthNum: number;
  yNormal: number;
  yStacked: number;
}

export const LEVELS: LevelInfo[] = [
  { id: 0, name: 'Surface Ground', depth: '0m', depthNum: 0, yNormal: 0, yStacked: 8 },
  { id: 1, name: 'Shaft Level 1', depth: '-90m', depthNum: -90, yNormal: -12, yStacked: -8 },
  { id: 2, name: 'Shaft Level 2', depth: '-180m', depthNum: -180, yNormal: -24, yStacked: -26 },
  { id: 3, name: 'Shaft Level 3 (Deep Incline)', depth: '-320m', depthNum: -320, yNormal: -38, yStacked: -46 },
];

interface MineMap3DProps {
  activeLevelIndex: number;
  is3dStackedView: boolean;
  zoomScale: number;
  /** Increment to fly the camera back to the default viewing angle */
  resetViewKey: number;
  workers: WorkerTelemetry[];
  selectedWorkerId: string | null;
  /** Logged-in worker, drawn with a "YOU" badge */
  myWorkerId?: string | null;
  onSelectWorker: (id: string | null) => void;
  onSelectLevel: (levelIndex: number) => void;
}

// ----------------------------------------------------------------------
// CAMERA CONTROLLER
// Drag (mouse or one finger) rotates and tilts, wheel or pinch zooms,
// right-drag or two fingers pans. The camera only flies on its own when the
// level, selected worker, zoom buttons or reset change; otherwise the user's
// hand owns it.
// ----------------------------------------------------------------------
const MIN_DISTANCE = 8;
const MAX_DISTANCE = 140;
// Default view: 45° tilt, looking from the +Z side
const DEFAULT_VIEW_DIR = new THREE.Vector3(0, Math.cos(Math.PI / 4), Math.sin(Math.PI / 4));

function CameraController({
  activeLevelIndex,
  is3dStackedView,
  zoomScale,
  resetViewKey,
  selectedWorkerPos,
}: {
  activeLevelIndex: number;
  is3dStackedView: boolean;
  zoomScale: number;
  resetViewKey: number;
  selectedWorkerPos: [number, number, number] | null;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const targetCamPos = useRef(new THREE.Vector3(0, 35, 55));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isFlying = useRef(true);
  const prevZoomScale = useRef(zoomScale);
  const prevResetKey = useRef(resetViewKey);

  // Direction the user is currently looking from, so a flight keeps their angle
  const currentViewDir = () => {
    const target = controlsRef.current?.target ?? targetLookAt.current;
    const dir = camera.position.clone().sub(target);
    return dir.lengthSq() > 0.0001 ? dir.normalize() : DEFAULT_VIEW_DIR.clone();
  };

  // Level, stacked view, selected worker or reset: fly to a new focus point
  useEffect(() => {
    let lookAt: THREE.Vector3;
    let baseDistance: number;

    if (selectedWorkerPos) {
      lookAt = new THREE.Vector3(...selectedWorkerPos);
      baseDistance = 22;
    } else {
      const currentLevel = LEVELS[activeLevelIndex] || LEVELS[0];
      lookAt = new THREE.Vector3(0, is3dStackedView ? currentLevel.yStacked : currentLevel.yNormal, 0);
      baseDistance = activeLevelIndex === 0 ? 54 : 36;
    }

    const resetRequested = resetViewKey !== prevResetKey.current;
    prevResetKey.current = resetViewKey;
    const dir = resetRequested || !controlsRef.current ? DEFAULT_VIEW_DIR.clone() : currentViewDir();
    const distance = THREE.MathUtils.clamp(baseDistance / Math.max(zoomScale, 0.4), MIN_DISTANCE, MAX_DISTANCE);

    targetLookAt.current.copy(lookAt);
    targetCamPos.current.copy(lookAt).addScaledVector(dir, distance);
    isFlying.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLevelIndex, is3dStackedView, selectedWorkerPos, resetViewKey]);

  // Zoom buttons: move closer or further along the current viewing angle
  useEffect(() => {
    if (prevZoomScale.current === zoomScale || !controlsRef.current) {
      prevZoomScale.current = zoomScale;
      return;
    }
    const target = controlsRef.current.target;
    const currentDistance = camera.position.distanceTo(target);
    const distance = THREE.MathUtils.clamp(
      currentDistance * (prevZoomScale.current / zoomScale),
      MIN_DISTANCE,
      MAX_DISTANCE
    );
    prevZoomScale.current = zoomScale;

    targetLookAt.current.copy(target);
    targetCamPos.current.copy(target).addScaledVector(currentViewDir(), distance);
    isFlying.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomScale]);

  useFrame((_, delta) => {
    if (!isFlying.current || !controlsRef.current) return;
    const lerpSpeed = Math.min(delta * 3.5, 0.18);
    camera.position.lerp(targetCamPos.current, lerpSpeed);
    controlsRef.current.target.lerp(targetLookAt.current, lerpSpeed);
    if (camera.position.distanceTo(targetCamPos.current) < 0.05) {
      isFlying.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.02}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      rotateSpeed={0.9}
      zoomSpeed={0.9}
      panSpeed={1.0}
      // The moment the user grabs the view, stop any automatic flight
      onStart={() => {
        isFlying.current = false;
      }}
    />
  );
}

// ----------------------------------------------------------------------
// SURFACE TERRAIN & BUILDINGS (0m Surface Ground)
// ----------------------------------------------------------------------
function SurfaceStructures({ opacity }: { opacity: number }) {
  const transparent = opacity < 0.95;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Ground Surface (Green / Earthy Terrain with Cutaway) */}
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[48, 0.4, 42]} />
        <meshStandardMaterial
          color="#3b7d44"
          roughness={0.85}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* Access Roads */}
      <mesh position={[-4, 0.42, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 32]} />
        <meshStandardMaterial
          color="#475569"
          roughness={0.9}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>
      <mesh position={[6, 0.42, -6]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[8, 30]} />
        <meshStandardMaterial
          color="#475569"
          roughness={0.9}
          transparent={transparent}
          opacity={opacity}
        />
      </mesh>

      {/* 2. Mine Headframe Tower over Main Shaft (Steel A-Frame Lattice) */}
      <group position={[0, 0.4, 0]}>
        {/* Headframe legs */}
        <mesh position={[-2.5, 6, -2.5]} rotation={[0.08, 0, -0.15]}>
          <cylinderGeometry args={[0.25, 0.35, 12, 6]} />
          <meshStandardMaterial color="#dc2626" metalness={0.6} roughness={0.4} transparent={transparent} opacity={opacity} />
        </mesh>
        <mesh position={[2.5, 6, -2.5]} rotation={[0.08, 0, 0.15]}>
          <cylinderGeometry args={[0.25, 0.35, 12, 6]} />
          <meshStandardMaterial color="#dc2626" metalness={0.6} roughness={0.4} transparent={transparent} opacity={opacity} />
        </mesh>
        <mesh position={[-2.5, 6, 2.5]} rotation={[-0.08, 0, -0.15]}>
          <cylinderGeometry args={[0.25, 0.35, 12, 6]} />
          <meshStandardMaterial color="#dc2626" metalness={0.6} roughness={0.4} transparent={transparent} opacity={opacity} />
        </mesh>
        <mesh position={[2.5, 6, 2.5]} rotation={[-0.08, 0, 0.15]}>
          <cylinderGeometry args={[0.25, 0.35, 12, 6]} />
          <meshStandardMaterial color="#dc2626" metalness={0.6} roughness={0.4} transparent={transparent} opacity={opacity} />
        </mesh>

        {/* Headframe Sheave Wheels on Top */}
        <mesh position={[0, 12.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.8, 1.8, 0.5, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.2} transparent={transparent} opacity={opacity} />
        </mesh>
        <mesh position={[0, 12.8, 0]}>
          <boxGeometry args={[4, 0.4, 4]} />
          <meshStandardMaterial color="#1e293b" transparent={transparent} opacity={opacity} />
        </mesh>
      </group>

      {/* 3. Surface Control Room Building */}
      <group position={[-12, 1.8, -8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[8, 3.2, 6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} transparent={transparent} opacity={opacity} />
        </mesh>
        {/* Glass Windows */}
        <mesh position={[0, 0.3, 3.02]}>
          <planeGeometry args={[6.5, 1.4]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.8} transparent={transparent} opacity={opacity * 0.8} />
        </mesh>
        {/* Rooftop AC unit */}
        <mesh position={[2, 1.9, 0]}>
          <boxGeometry args={[1.8, 0.8, 1.4]} />
          <meshStandardMaterial color="#94a3b8" transparent={transparent} opacity={opacity} />
        </mesh>
      </group>

      {/* 4. Processing Plant & Ore Conveyor Shed */}
      <group position={[14, 2.5, -4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[10, 4.8, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.3} roughness={0.7} transparent={transparent} opacity={opacity} />
        </mesh>
        {/* Inclined Conveyor Tube */}
        <mesh position={[-6, 0, 2]} rotation={[0, 0, 0.45]}>
          <cylinderGeometry args={[0.7, 0.7, 9, 8]} />
          <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.5} transparent={transparent} opacity={opacity} />
        </mesh>
      </group>

      {/* 5. Storage Warehouses & Fuel Tanks */}
      <group position={[-14, 1.4, 8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 2.6, 5]} />
          <meshStandardMaterial color="#cbd5e1" transparent={transparent} opacity={opacity} />
        </mesh>
      </group>
      <group position={[15, 1.8, 8]}>
        {/* Cylindrical Storage Tanks */}
        <mesh position={[-2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.4, 1.4, 3.4, 16]} />
          <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} transparent={transparent} opacity={opacity} />
        </mesh>
        <mesh position={[2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.4, 1.4, 3.4, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.2} transparent={transparent} opacity={opacity} />
        </mesh>
      </group>

      {/* 6. Low-poly Surface Trees */}
      {[
        [-18, 0, -14],
        [-20, 0, 4],
        [-8, 0, 14],
        [8, 0, 14],
        [20, 0, -12],
        [18, 0, 14],
      ].map((pos, idx) => (
        <group key={idx} position={[pos[0], 0, pos[2]]}>
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.2, 0.25, 1.6, 5]} />
            <meshStandardMaterial color="#78350f" transparent={transparent} opacity={opacity} />
          </mesh>
          <mesh position={[0, 2.2, 0]}>
            <coneGeometry args={[1.2, 2.4, 6]} />
            <meshStandardMaterial color="#15803d" roughness={0.8} transparent={transparent} opacity={opacity} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ----------------------------------------------------------------------
// CUTAWAY ROCK WALLS (Stratified Sedimentary Subterranean Rock Strata)
// ----------------------------------------------------------------------
function RockStrataCutaway({
  activeLevelIndex,
  is3dStackedView,
}: {
  activeLevelIndex: number;
  is3dStackedView: boolean;
}) {
  // Semi-transparency when user is focused on underground levels
  const isDeepFocus = activeLevelIndex > 0;
  const rockOpacity = isDeepFocus ? 0.18 : 0.95;
  const transparent = true;

  return (
    <group position={[0, 0, 0]}>
      {/* Front Cutaway Rock Cross-Section (Layered Rock Colors) */}
      {!is3dStackedView && (
        <>
          {/* Top Sandstone Layer (0m to -90m) */}
          <mesh position={[0, -6, 21.05]}>
            <boxGeometry args={[48, 12, 0.5]} />
            <meshStandardMaterial
              color="#a88b68"
              roughness={0.95}
              transparent={transparent}
              opacity={rockOpacity}
            />
          </mesh>

          {/* Shale & Clay Layer (-90m to -180m) */}
          <mesh position={[0, -18, 21.05]}>
            <boxGeometry args={[48, 12, 0.5]} />
            <meshStandardMaterial
              color="#57534e"
              roughness={0.95}
              transparent={transparent}
              opacity={rockOpacity}
            />
          </mesh>

          {/* Deep Coal & Ore Seam Layer (-180m to -320m) */}
          <mesh position={[0, -31, 21.05]}>
            <boxGeometry args={[48, 14, 0.5]} />
            <meshStandardMaterial
              color="#292524"
              roughness={0.9}
              transparent={transparent}
              opacity={rockOpacity}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

// ----------------------------------------------------------------------
// UNDERGROUND LEVEL (3D Tube Tunnels, Arched Ribs, Refuge, Substation, UWB)
// ----------------------------------------------------------------------
function UndergroundLevel({
  level,
  isActive,
  isAboveActive,
  is3dStackedView,
  onSelect,
}: {
  level: LevelInfo;
  isActive: boolean;
  isAboveActive: boolean;
  is3dStackedView: boolean;
  onSelect: () => void;
}) {
  const posY = is3dStackedView ? level.yStacked : level.yNormal;

  // Level dimming: levels above selected fade to 10% opacity, active level is bright
  const levelOpacity = isActive ? 1.0 : isAboveActive ? 0.12 : 0.45;
  const transparent = !isActive;

  // Tunnel Colors
  const tunnelColor = isActive ? '#0284c7' : '#64748b';
  const rockFloorColor = isActive ? '#1e293b' : '#334155';

  return (
    <group position={[0, posY, 0]} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {/* Level Floor Slab Plane */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[44, 0.3, 36]} />
        <meshStandardMaterial
          color={rockFloorColor}
          roughness={0.8}
          transparent={transparent}
          opacity={isActive ? 0.9 : levelOpacity * 0.6}
        />
      </mesh>

      {/* Grid Floor Overlay on Selected Level */}
      {isActive && (
        <gridHelper args={[44, 22, '#38bdf8', '#0c4a6e']} position={[0, 0.08, 0]} />
      )}

      {/* 3D Level Label Tag in 3D Space */}
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.2}>
        <Html position={[-20, 2.5, -14]} center>
          {/* Other levels get a small muted tag so they don't crowd the active one */}
          <div
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={`rounded-xl border font-mono font-bold shadow-lg transition-all cursor-pointer flex items-center whitespace-nowrap ${
              isActive
                ? 'px-3 py-1.5 gap-2 text-xs bg-slate-900 text-white border-sky-400 ring-2 ring-sky-400/40'
                : 'px-2 py-0.5 gap-1.5 text-[10px] bg-slate-900/60 text-slate-300 border-slate-600 opacity-80 hover:opacity-100 hover:bg-slate-900'
            }`}
          >
            <span className={`rounded-full ${isActive ? 'w-2 h-2 bg-sky-400 animate-pulse' : 'w-1.5 h-1.5 bg-slate-400'}`} />
            <span>{level.name}</span>
            <span className={isActive ? 'text-sky-400 font-extrabold' : 'text-slate-400'}>{level.depth}</span>
          </div>
        </Html>
      </Float>

      {/* ---------------- 3D TUNNEL MESHES ---------------- */}
      {/* Main East-West Haulage Drift (Arched Tube Tunnel) */}
      <group position={[0, 1.2, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[2.2, 2.2, 38, 12, 1, true, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial
            color={tunnelColor}
            roughness={0.7}
            side={THREE.DoubleSide}
            transparent={transparent}
            opacity={levelOpacity}
          />
        </mesh>
      </group>

      {/* Crosscut Gallery Tunnel (North-South Heading) */}
      <group position={[-6, 1.2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[2.0, 2.0, 24, 12, 1, true, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial
            color={tunnelColor}
            roughness={0.7}
            side={THREE.DoubleSide}
            transparent={transparent}
            opacity={levelOpacity}
          />
        </mesh>
      </group>

      {/* Incline Crosscut Tunnel Heading East */}
      <group position={[10, 1.2, 4]} rotation={[0, -0.3, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.9, 1.9, 20, 12, 1, true, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial
            color={tunnelColor}
            roughness={0.7}
            side={THREE.DoubleSide}
            transparent={transparent}
            opacity={levelOpacity}
          />
        </mesh>
      </group>

      {/* Steel Support Arches / Ribs Along Tunnels */}
      {[-16, -12, -8, -4, 0, 4, 8, 12, 16].map((x, i) => (
        <mesh key={i} position={[x, 1.25, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[2.22, 0.08, 6, 12, Math.PI]} />
          <meshStandardMaterial
            color={isActive ? '#38bdf8' : '#475569'}
            metalness={0.8}
            transparent={transparent}
            opacity={levelOpacity}
          />
        </mesh>
      ))}

      {/* Spaced Tunnel Lights (Warm Point Lights + Glowing Fixtures) */}
      {[-12, 0, 12].map((x, i) => (
        <group key={i} position={[x, 2.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color={isActive ? '#fef08a' : '#94a3b8'}
              emissive={isActive ? '#facc15' : '#000000'}
              emissiveIntensity={isActive ? 1.5 : 0}
              transparent={transparent}
              opacity={levelOpacity}
            />
          </mesh>
          {isActive && (
            <pointLight distance={12} intensity={0.8} color="#fef08a" />
          )}
        </group>
      ))}

      {/* ---------------- 3D REFUGE SHELTER #2 (Green Emergency Block) ---------------- */}
      <group position={[12, 1.3, -8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.2, 2.4, 3.2]} />
          <meshStandardMaterial
            color="#15803d"
            metalness={0.4}
            roughness={0.5}
            transparent={transparent}
            opacity={levelOpacity}
          />
        </mesh>
        {/* Green Emergency Strobe Beacon */}
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.4, 8]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={isActive ? 2 : 0.5}
            transparent={transparent}
            opacity={levelOpacity}
          />
        </mesh>
        {isActive && (
          <Html position={[0, 2.2, 0]} center>
            <div className="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500 whitespace-nowrap shadow-xs">
              REFUGE #2 (O₂ Safe)
            </div>
          </Html>
        )}
      </group>

      {/* ---------------- 3D SUB-STATION 4 (Equipment Box) ---------------- */}
      <group position={[-14, 1.1, 8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.6, 2.0, 2.6]} />
          <meshStandardMaterial
            color="#0369a1"
            metalness={0.6}
            roughness={0.4}
            transparent={transparent}
            opacity={levelOpacity}
          />
        </mesh>
        {/* Substation Meter LED */}
        <mesh position={[0, 0.3, 1.32]}>
          <planeGeometry args={[1.8, 0.6]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} />
        </mesh>
        {isActive && (
          <Html position={[0, 1.8, 0]} center>
            <div className="px-2 py-0.5 rounded bg-sky-950/90 text-sky-300 font-mono text-[9px] font-bold border border-sky-400 whitespace-nowrap shadow-xs">
              SUB-STATION 4 (Sub-GHz)
            </div>
          </Html>
        )}
      </group>

      {/* ---------------- 3D UWB BEACON NODES ON TUNNEL WALLS ---------------- */}
      {[
        [-10, 1.6, -1.8],
        [6, 1.6, 1.8],
        [-6, 1.6, 8],
      ].map((pos, idx) => (
        <group key={idx} position={[pos[0], pos[1], pos[2]]}>
          <mesh>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#38bdf8"
              emissiveIntensity={isActive ? 2.5 : 0.5}
              transparent={transparent}
              opacity={levelOpacity}
            />
          </mesh>
          {isActive && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
              <ringGeometry args={[0.3, 0.55, 16]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

// ----------------------------------------------------------------------
// VERTICAL CONNECTING SHAFTS (Main-Lift with Animated Cage, Shaft-A, Vent)
// ----------------------------------------------------------------------
function VerticalConnectingShafts({
  activeLevelIndex,
  is3dStackedView,
}: {
  activeLevelIndex: number;
  is3dStackedView: boolean;
}) {
  const liftRef = useRef<THREE.Group>(null);

  // Animated lift cage moving between surface and deep levels
  useFrame(({ clock }) => {
    if (liftRef.current) {
      const t = clock.getElapsedTime() * 0.4;
      const maxY = 0;
      const minY = is3dStackedView ? -46 : -38;
      // Ping pong motion
      const normY = (Math.sin(t) + 1) / 2;
      liftRef.current.position.y = THREE.MathUtils.lerp(minY + 2, maxY - 1, normY);
    }
  });

  const totalHeight = is3dStackedView ? 58 : 42;
  const centerY = is3dStackedView ? -20 : -19;

  return (
    <group>
      {/* 1. MAIN-LIFT SHAFT (Framed Vertical Column) */}
      <group position={[0, centerY, 0]}>
        <mesh>
          <cylinderGeometry args={[2.5, 2.5, totalHeight, 16, 1, true]} />
          <meshStandardMaterial
            color="#38bdf8"
            metalness={0.7}
            roughness={0.3}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Vertical Shaft Steel Framing Ribs */}
        <mesh>
          <cylinderGeometry args={[2.55, 2.55, totalHeight, 8, 8, true]} />
          <meshStandardMaterial color="#0284c7" wireframe transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Animated Moving Lift Cage */}
      <group ref={liftRef} position={[0, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.6, 3.2, 2.6]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 1.32]}>
          <planeGeometry args={[1.4, 2.0]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <pointLight distance={6} intensity={1} color="#f59e0b" />
      </group>

      {/* 2. SHAFT-A (Secondary Vertical Service Shaft) */}
      <group position={[-10, centerY, -6]}>
        <mesh>
          <cylinderGeometry args={[1.8, 1.8, totalHeight, 12, 1, true]} />
          <meshStandardMaterial color="#6366f1" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[1.82, 1.82, totalHeight, 6, 6, true]} />
          <meshStandardMaterial color="#4f46e5" wireframe transparent opacity={0.4} />
        </mesh>
      </group>

      {/* 3. AIR-VENTILATION SHAFT (Exhaust Shaft) */}
      <group position={[14, centerY, 6]}>
        <mesh>
          <cylinderGeometry args={[1.6, 1.6, totalHeight, 12, 1, true]} />
          <meshStandardMaterial color="#10b981" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// ----------------------------------------------------------------------
// 3D WORKER FIGURE (Capsule, Hard-Hat, Pulsing Status Ring, Floating Label)
// ----------------------------------------------------------------------
function Worker3DFigure({
  worker,
  levelIndex,
  is3dStackedView,
  isSelected,
  isMe,
  isOnActiveLevel,
  onSelect,
  waypointOffset,
}: {
  worker: WorkerTelemetry;
  levelIndex: number;
  is3dStackedView: boolean;
  isSelected: boolean;
  isMe: boolean;
  isOnActiveLevel: boolean;
  onSelect: () => void;
  waypointOffset: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const levelInfo = LEVELS[levelIndex] || LEVELS[3];
  const baseY = is3dStackedView ? levelInfo.yStacked : levelInfo.yNormal;

  // Compute smooth moving path along the tunnel
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 0.5 + waypointOffset;
      // Path oscillates naturally along tunnel X and slight Z
      const posX = Math.sin(t) * 12 + (waypointOffset % 4) * 2;
      const posZ = Math.cos(t * 0.7) * 2.2;
      groupRef.current.position.x = posX;
      groupRef.current.position.z = posZ;
      groupRef.current.position.y = baseY + 0.9;
    }

    // Pulse SOS emergency ring
    if (ringRef.current && (worker.sosActive || worker.status === 'critical')) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 8) * 0.35;
      ringRef.current.scale.set(s, s, s);
    }
  });

  const isSOS = worker.sosActive || worker.status === 'critical';
  const isWarning = worker.status === 'warning';

  const statusColor = isSOS ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

  // Worker initials
  const initials = worker.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <group ref={groupRef} position={[0, baseY + 0.9, 0]} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {/* 3D Worker Person / Hardhat Figure */}
      <group>
        {/* Worker Torso / Hi-Vis Jacket */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 0.8, 8]} />
          <meshStandardMaterial
            color={isSelected || isMe ? '#0284c7' : '#f97316'}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>

        {/* Hard Hat Helmet */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <sphereGeometry args={[0.32, 12, 12]} />
          <meshStandardMaterial color="#facc15" roughness={0.3} metalness={0.3} />
        </mesh>

        {/* Headlamp Spotlight Beam */}
        <mesh position={[0, 1.0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* Ground Status Ring Indicator */}
      <mesh ref={ringRef} position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.85, 24]} />
        <meshBasicMaterial
          color={statusColor}
          transparent
          opacity={isSOS ? 0.95 : 0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Drei Floating Circular Avatar Label & Info Badge */}
      <Html position={[0, 1.8, 0]} center>
        {!isOnActiveLevel && !isSelected && !isMe ? (
          // Workers on other levels: just a small status dot so labels don't pile up
          <div
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            title={`${worker.name} (${worker.jacketId})`}
            className={`w-2.5 h-2.5 rounded-full border border-white/60 cursor-pointer opacity-80 ${
              isSOS ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
        ) : (
        <div
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={`flex flex-col items-center group cursor-pointer transition-transform ${
            isSelected ? 'scale-125' : 'hover:scale-115'
          }`}
        >
          {/* "YOU" tag above the logged-in worker */}
          {isMe && (
            <div className="mb-0.5 px-1.5 py-px rounded-full bg-sky-500 text-white text-[8px] font-black tracking-wider shadow-md shadow-sky-500/40">
              YOU
            </div>
          )}

          {/* Circular Avatar Ring */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-white shadow-lg border-2 transition-all ${
              isMe && !isSOS
                ? 'bg-sky-500 border-white ring-4 ring-sky-400/50'
                : isSOS
                ? 'bg-rose-600 border-rose-300 ring-4 ring-rose-500/40 animate-bounce'
                : isWarning
                ? 'bg-amber-500 border-amber-300'
                : 'bg-emerald-600 border-emerald-300'
            }`}
          >
            {initials}
          </div>

          {/* Jacket Tag ID */}
          <div className="mt-0.5 px-1.5 py-0.2 rounded bg-slate-900/90 text-white font-mono text-[8px] font-extrabold border border-slate-700 whitespace-nowrap shadow-xs">
            {worker.jacketId}
          </div>
        </div>
        )}
      </Html>
    </group>
  );
}

// ----------------------------------------------------------------------
// MAIN EXPORTED 3D SCENE COMPONENT
// ----------------------------------------------------------------------
export default function MineMap3D({
  activeLevelIndex,
  is3dStackedView,
  zoomScale,
  resetViewKey,
  workers,
  selectedWorkerId,
  myWorkerId = null,
  onSelectWorker,
  onSelectLevel,
}: MineMap3DProps) {
  // Find selected worker 3D coordinates for camera tracking
  const selectedIndex = selectedWorkerId ? workers.findIndex((w) => w.id === selectedWorkerId) : -1;
  const selectedWorkerPos = useMemo<[number, number, number] | null>(() => {
    if (!selectedWorkerId) return null;
    const lvl = LEVELS[getWorkerLevel(selectedWorkerId, Math.max(selectedIndex, 0))] || LEVELS[3];
    const posY = is3dStackedView ? lvl.yStacked : lvl.yNormal;
    return [0, posY + 1, 0];
  }, [selectedWorkerId, selectedIndex, is3dStackedView]);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing select-none touch-none bg-slate-950">
      <Canvas
        shadows
        camera={{ position: [0, 35, 55], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Sky Ambient Light */}
        <ambientLight intensity={0.7} />

        {/* Sunlight Directional Light (Casting Soft Shadows) */}
        <directionalLight
          position={[30, 45, 25]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={120}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />

        {/* Subterranean Fill Light */}
        <pointLight position={[0, -20, 20]} intensity={0.6} color="#38bdf8" />

        {/* Camera Navigation Controller */}
        <CameraController
          activeLevelIndex={activeLevelIndex}
          is3dStackedView={is3dStackedView}
          zoomScale={zoomScale}
          resetViewKey={resetViewKey}
          selectedWorkerPos={selectedWorkerPos}
        />

        {/* 1. Surface Ground 0m */}
        <SurfaceStructures
          opacity={activeLevelIndex === 0 ? 1.0 : 0.15}
        />

        {/* 2. Cutaway Stratified Rock Layers */}
        <RockStrataCutaway
          activeLevelIndex={activeLevelIndex}
          is3dStackedView={is3dStackedView}
        />

        {/* 3. Vertical Shafts Connecting All Levels */}
        <VerticalConnectingShafts
          activeLevelIndex={activeLevelIndex}
          is3dStackedView={is3dStackedView}
        />

        {/* 4. Underground Mine Levels (Shaft Level 1, Level 2, Level 3) */}
        {LEVELS.slice(1).map((lvl) => (
          <UndergroundLevel
            key={lvl.id}
            level={lvl}
            isActive={activeLevelIndex === lvl.id}
            isAboveActive={activeLevelIndex > lvl.id}
            is3dStackedView={is3dStackedView}
            onSelect={() => onSelectLevel(lvl.id)}
          />
        ))}

        {/* 5. 3D Workers Stratified Across Mine Galleries */}
        {workers.map((w, index) => {
          const assignedLevel = getWorkerLevel(w.id, index);
          return (
            <Worker3DFigure
              key={w.id}
              worker={w}
              levelIndex={assignedLevel}
              is3dStackedView={is3dStackedView}
              isSelected={w.id === selectedWorkerId}
              isMe={w.id === myWorkerId}
              isOnActiveLevel={assignedLevel === activeLevelIndex}
              onSelect={() => onSelectWorker(w.id)}
              waypointOffset={index * 1.57}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
