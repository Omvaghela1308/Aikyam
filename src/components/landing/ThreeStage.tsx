'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PARTS } from './mineguardData';

interface ThreeStageProps {
  scrollProg: number;
  inApp: boolean;
  studioTabActive: boolean;
  studioView: 'front' | 'turn' | 'cut';
  alarmLevel: number;
  linked: boolean;
  onWorkerProjected?: (pos: { x: number; y: number; visible: boolean }) => void;
}

// Short pill label on screen; full spec shown on hover
const SENSOR_LIST = [
  { key: 'h2s', name: 'H₂S Sensor', sub: 'MQ-136 · 0-100 ppm toxic gas' },
  { key: 'rad', name: 'Radiation', sub: 'SBM-20 Geiger-Müller tube · 0.01-1000 µSv/h' },
  { key: 'pms', name: 'Dust Sensor', sub: 'PMS5003 laser optical · PM2.5/PM10' },
  { key: 'dht', name: 'Temp / Humidity', sub: 'DHT22 capacitive · -40 to 80 °C' },
  { key: 'max', name: 'Heart Rate', sub: 'MAX30102 optical PPG & SpO₂' },
  { key: 'esp32', name: 'ESP32', sub: 'Dual-core 240 MHz controller + Bluetooth LE' },
  { key: 'lora', name: 'LoRa Radio', sub: 'SX1276 868 MHz long-range link' },
  { key: 'uwb', name: 'UWB Tag', sub: 'DW1000 time-of-flight · ±18 cm position' },
  { key: 'bat', name: 'Battery', sub: 'Li-ion 5000 mAh pack' },
  { key: 'pcm', name: 'Cooling Pack', sub: 'PCM paraffin latent heat sink · 28 °C' },
  { key: 'buz', name: 'Buzzer', sub: 'Piezo 85 dB @ 10 cm alarm' },
  { key: 'vib', name: 'Vibration', sub: 'ERM motor · tactile alert' },
  { key: 'sos', name: 'SOS Button', sub: 'IP67 emergency push button' },
];

const PILL_H = 26; // rendered pill height (px)
const PILL_GAP = 8; // vertical space between pills

interface MinerObj {
  g: THREE.Group;
  spine: THREE.Group;
  legs: { hip: THREE.Group; knee: THREE.Group }[];
  arms: { sh: THREE.Group; el: THREE.Group; hand: THREE.Group }[];
  head: THREE.Group;
  led: THREE.Mesh;
  reflMat?: THREE.MeshBasicMaterial;
  strobeLight?: THREE.PointLight;
  mode: string;
  ph: number;
  baseY: number;
  baseZ?: number;
  lampSpot?: THREE.SpotLight;
  toolObj?: THREE.Object3D;
  shovelLoad?: THREE.Mesh;
  recoilTimer?: number;
}

export const ThreeStage: React.FC<ThreeStageProps> = ({
  scrollProg,
  inApp,
  studioTabActive,
  studioView,
  alarmLevel,
  linked,
  onWorkerProjected,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sensorOverlayRef = useRef<HTMLDivElement>(null);
  const sensorSvgRef = useRef<SVGSVGElement>(null);
  const sensorDotRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const sensorChipRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const onWorkerProjectedRef = useRef(onWorkerProjected);

  useEffect(() => {
    onWorkerProjectedRef.current = onWorkerProjected;
  }, [onWorkerProjected]);

  const stateRef = useRef({
    studioAngle: 0,
    isDragging: false,
    lastX: 0,
    scrollProg: 0,
    inApp: false,
    studioTabActive: false,
    studioView: 'front' as 'front' | 'turn' | 'cut',
    alarmLevel: 0,
    linked: true,
  });

  useEffect(() => {
    stateRef.current.scrollProg = scrollProg;
    stateRef.current.inApp = inApp;
    stateRef.current.studioTabActive = studioTabActive;
    stateRef.current.studioView = studioView;
    stateRef.current.alarmLevel = alarmLevel;
    stateRef.current.linked = linked;
  }, [scrollProg, inApp, studioTabActive, studioView, alarmLevel, linked]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE & RENDERER SETUP
    const scene = new THREE.Scene();
    // Deep dark chocolate cavern atmosphere with pitch-dark distance falloff
    const fogRef = new THREE.FogExp2(0x050302, 0.016);
    scene.fog = fogRef;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 180);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    const clock = new THREE.Clock();

    const stdMat = (c: number, o: THREE.MeshStandardMaterialParameters = {}) => {
      o.color = c;
      return new THREE.MeshStandardMaterial(o);
    };
    const basMat = (c: number, o: THREE.MeshBasicMaterialParameters = {}) => {
      o.color = c;
      return new THREE.MeshBasicMaterial(o);
    };

    // =========================================================================
    // PROCEDURAL BLASTED ROCK DRIFT & SHOTCRETE TEXTURE GENERATOR (MATCHING IMAGES.JPG)
    // Cool slate-grey granite/limestone stone, angular blast cleavage, and stone dust
    // =========================================================================
    const generateBlastedRockDriftMaps = () => {
      const size = 1024;
      const diffCanvas = document.createElement('canvas');
      diffCanvas.width = size;
      diffCanvas.height = size;
      const diffCtx = diffCanvas.getContext('2d')!;

      const bumpCanvas = document.createElement('canvas');
      bumpCanvas.width = size;
      bumpCanvas.height = size;
      const bumpCtx = bumpCanvas.getContext('2d')!;

      const dImg = diffCtx.createImageData(size, size);
      const bImg = bumpCtx.createImageData(size, size);

      // Permutation noise generator
      const perm = new Uint8Array(1024);
      for (let i = 0; i < 512; i++) perm[i] = perm[i + 512] = Math.floor(Math.random() * 256);

      const grad2 = (hash: number, x: number, y: number) => {
        const h = hash & 7;
        const u = h < 4 ? x : y;
        const v = h < 4 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
      };

      const noise2 = (x: number, y: number) => {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const u = xf * xf * (3 - 2 * xf);
        const v = yf * yf * (3 - 2 * yf);
        const a = perm[X] + Y;
        const b = perm[X + 1] + Y;
        return (
          (1 - u) * ((1 - v) * grad2(perm[a], xf, yf) + v * grad2(perm[a + 1], xf, yf - 1)) +
          u * ((1 - v) * grad2(perm[b], xf - 1, yf) + v * grad2(perm[b + 1], xf - 1, yf - 1))
        );
      };

      // Voronoi / Worley noise for angular blast fracture facets & rock cleavage planes
      const numCells = 28;
      const cellPoints: [number, number][] = [];
      for (let i = 0; i < numCells * numCells; i++) {
        cellPoints.push([Math.random(), Math.random()]);
      }

      const cellularRock = (x: number, y: number) => {
        const cx = Math.floor(x * numCells);
        const cy = Math.floor(y * numCells);
        let minDist = 1.0;
        let secondDist = 1.0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = ((cx + dx) % numCells + numCells) % numCells;
            const ny = ((cy + dy) % numCells + numCells) % numCells;
            const pt = cellPoints[ny * numCells + nx];
            const px = (cx + dx + pt[0]) / numCells;
            const py = (cy + dy + pt[1]) / numCells;
            const dist = Math.hypot(x - px, y - py);
            if (dist < minDist) {
              secondDist = minDist;
              minDist = dist;
            } else if (dist < secondDist) {
              secondDist = dist;
            }
          }
        }
        return { f1: minDist * numCells, f2: secondDist * numCells };
      };

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const nx = x / size;
          const ny = y / size;

          const angleX = nx * Math.PI * 2;
          const angleY = ny * Math.PI * 2;
          const sx = Math.sin(angleX) * 1.5;
          const cx = Math.cos(angleX) * 1.5;
          const sy = Math.sin(angleY) * 1.5;
          const cy = Math.cos(angleY) * 1.5;

          // 1. Broad subterranean rock strata & geological cleavage planes
          const nBroad = noise2(sx * 2.4 + cx, sy * 2.4 + cy) * 0.5 + 0.5;
          // 2. Sharp rock shear ridges (absolute ridge noise for jagged fracture planes)
          const nRidge1 = 1.0 - Math.abs(noise2(sx * 5.2 + cy, sy * 5.2 - cx));
          const nRidge2 = 1.0 - Math.abs(noise2(sx * 12.5 - cy, sy * 12.5 + cx));
          // 3. Chisel gouges & mechanical pick drill scoring lines
          const nChisel = Math.abs(Math.sin(sx * 22.0 + sy * 14.0 + noise2(sx * 4.5, sy * 4.5) * 3.2));
          // 4. Coarse aggregate grit & shotcrete texture
          const nShotcrete = noise2(sx * 32.0 - cy, sy * 32.0 - cx) * 0.5 + 0.5;
          // 5. High-frequency micro-roughness
          const nMicroGrit = noise2(sx * 75.0 + cx, sy * 75.0 - cy) * 0.5 + 0.5;
          // 6. Angular fracture lines from Voronoi cells (f2 - f1 gives sharp rock joints)
          const vor = cellularRock(nx, ny);
          const jointEdge = Math.min(1, Math.max(0, (vor.f2 - vor.f1) * 3.2));
          const facetHeight = Math.pow(Math.min(1, Math.max(0, 1 - vor.f1 * 0.52)), 1.5);

          // Combined rich rock relief (bump map) with extreme micro-and-macro detail
          const rockHeight = Math.min(
            1,
            Math.max(
              0,
              facetHeight * 0.32 +
              jointEdge * 0.22 +
              nRidge1 * 0.18 +
              nRidge2 * 0.12 +
              nBroad * 0.08 +
              nChisel * 0.05 +
              nShotcrete * 0.06 +
              nMicroGrit * 0.04
            )
          );

          const idx = (y * size + x) * 4;

          // High-contrast bump map value
          const bVal = Math.floor(rockHeight * 255);
          bImg.data[idx] = bVal;
          bImg.data[idx + 1] = bVal;
          bImg.data[idx + 2] = bVal;
          bImg.data[idx + 3] = 255;

          // ===============================================================
          // ULTRA-DARK CHOCOLATE COMPACTED EARTH & ROCK PALETTE
          // - Appears near pitch-black / deep shadow in ambient darkness
          // - Blooms into rich, deep bittersweet chocolate brown (#26140a to #3d2111)
          //   with golden-amber silt and sand specks when struck by light
          // ===============================================================
          let r = 20 + nBroad * 16 + facetHeight * 14 + nMicroGrit * 4;
          let g = 11 + nBroad * 8 + facetHeight * 7 + nMicroGrit * 2;
          let b = 6 + nBroad * 4 + facetHeight * 4 + nMicroGrit * 1;

          // Subtle chocolate ridge highlights & dry cocoa clay ledges
          if (nRidge2 > 0.62) {
            const sp = (nRidge2 - 0.62) / 0.38;
            r += sp * 22;
            g += sp * 12;
            b += sp * 6;
          }

          // Dried chocolate silt settling on upper crests and edges
          if (rockHeight > 0.64) {
            const highlight = (rockHeight - 0.64) / 0.36;
            r += highlight * 28;
            g += highlight * 16;
            b += highlight * 8;
          }

          // Deep blast fracture crevices and shadowed earth seams (near pitch black cocoa)
          if (jointEdge < 0.32 || rockHeight < 0.28) {
            const shadow = Math.max(
              (0.32 - jointEdge) / 0.32,
              (0.28 - rockHeight) / 0.28
            );
            r *= (1 - shadow * 0.88);
            g *= (1 - shadow * 0.90);
            b *= (1 - shadow * 0.92);
          }

          // Dark damp organic soil & deep cocoa clay patches
          if (nBroad < 0.38) {
            const damp = (0.38 - nBroad) / 0.38;
            r *= (1 - damp * 0.45);
            g *= (1 - damp * 0.42);
            b *= (1 - damp * 0.40);
          }

          // Sparkling sand & fine amber quartz grains in chocolate soil
          if (Math.random() < 0.035) {
            r = Math.min(255, r + 32);
            g = Math.min(255, g + 20);
            b = Math.min(255, b + 10);
          }

          dImg.data[idx] = Math.min(255, Math.max(0, Math.floor(r)));
          dImg.data[idx + 1] = Math.min(255, Math.max(0, Math.floor(g)));
          dImg.data[idx + 2] = Math.min(255, Math.max(0, Math.floor(b)));
          dImg.data[idx + 3] = 255;
        }
      }

      diffCtx.putImageData(dImg, 0, 0);
      bumpCtx.putImageData(bImg, 0, 0);

      const rockTex = new THREE.CanvasTexture(diffCanvas);
      rockTex.wrapS = THREE.RepeatWrapping;
      rockTex.wrapT = THREE.RepeatWrapping;

      const bumpTex = new THREE.CanvasTexture(bumpCanvas);
      bumpTex.wrapS = THREE.RepeatWrapping;
      bumpTex.wrapT = THREE.RepeatWrapping;

      return { rockTex, bumpTex };
    };

    const { rockTex, bumpTex } = generateBlastedRockDriftMaps();

    // =========================================================================
    // TUNNEL WALLS: RUGGED BLASTED SLATE-GREY ROCK & SHOTCRETE (MATCHING IMAGES.JPG)
    // =========================================================================
    const R = 4.3;
    const LEN = 80;
    const tg = new THREE.CylinderGeometry(R, R, LEN, 48, 88, true);
    tg.rotateX(Math.PI / 2);
    const posAttr = tg.attributes.position;
    const tv = new THREE.Vector3();

    for (let i = 0; i < posAttr.count; i++) {
      tv.fromBufferAttribute(posAttr, i);

      // Blasted hard rock drift: chisel marks, fractured rock faces, blast shear bulges
      const blastGouge = Math.sin(tv.x * 3.8 + tv.z * 2.1) * Math.cos(tv.y * 3.2) * 0.16;
      const rockBulge = Math.sin(tv.z * 0.42) * Math.sin(tv.y * 0.95) * 0.22;
      const fracturedFacets = (Math.sin(tv.x * 9.2) + Math.cos(tv.z * 8.0)) * 0.055;
      const cleavageLedges = Math.sin(tv.y * 3.2 + tv.z * 0.4) * 0.10;

      const n = blastGouge + rockBulge + fracturedFacets + cleavageLedges;
      const s = 1 + n * 0.092;
      tv.x *= s;
      tv.y *= s;
      if (tv.y < -2.55) tv.y = -2.58 + n * 0.02;
      posAttr.setXYZ(i, tv.x, tv.y, tv.z);
    }
    tg.computeVertexNormals();

    const tunnelRockTex = rockTex.clone();
    tunnelRockTex.repeat.set(6, 26);
    const tunnelBumpTex = bumpTex.clone();
    tunnelBumpTex.repeat.set(6, 26);

    const tunnelMat = new THREE.MeshStandardMaterial({
      map: tunnelRockTex,
      bumpMap: tunnelBumpTex,
      bumpScale: 0.85,
      roughness: 0.92,
      metalness: 0.08,
      side: THREE.BackSide,
      flatShading: true,
    });
    const tunnel = new THREE.Mesh(tg, tunnelMat);
    tunnel.position.set(0, 2.6, -14);
    scene.add(tunnel);

    // =========================================================================
    // ROCK REINFORCEMENT BOLTS & WIRE MESH (CEILING REINFORCEMENT)
    // Square steel washer plates & central bolts pinned flush across high ceiling rock
    // =========================================================================
    const boltPlateGeo = new THREE.BoxGeometry(0.24, 0.24, 0.03);
    const boltHeadGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.045, 6);
    const boltSteelMat = stdMat(0x606870, { roughness: 0.45, metalness: 0.85 });
    const wireMeshMat = stdMat(0x485058, { roughness: 0.55, metalness: 0.8 });

    const roofAngles = [0.22 * Math.PI, 0.36 * Math.PI, 0.50 * Math.PI, 0.64 * Math.PI, 0.78 * Math.PI];

    for (let bz = -46; bz <= 22; bz += 4.5) {
      roofAngles.forEach((th) => {
        // Calculate position flush into the upper cavern ceiling rock (tunnel center at y=2.6, R=4.18)
        const bx = Math.cos(th) * 4.18;
        const by = 2.6 + Math.sin(th) * 4.18;
        const rockBolt = new THREE.Group();
        rockBolt.position.set(bx, by, bz);

        // Orient flush against the curved rock surface
        rockBolt.rotation.z = th - Math.PI / 2;

        const plate = new THREE.Mesh(boltPlateGeo, boltSteelMat);
        rockBolt.add(plate);

        const boltHead = new THREE.Mesh(boltHeadGeo, boltSteelMat);
        boltHead.position.z = 0.025;
        boltHead.rotation.x = Math.PI / 2;
        rockBolt.add(boltHead);

        scene.add(rockBolt);
      });

      // Steel reinforcement wire mesh arc pinned flush along the upper rock roof
      const meshArc = new THREE.Mesh(
        new THREE.TorusGeometry(4.16, 0.015, 6, 28, Math.PI * 0.60),
        wireMeshMat
      );
      meshArc.rotation.z = Math.PI * 0.20;
      meshArc.position.set(0, 2.6, bz);
      scene.add(meshArc);
    }

    // =========================================================================
    // EXCAVATION FACE: BLASTED HARD-ROCK ACTIVE WALL WHERE PICKAXES IMPACT
    // =========================================================================
    const faceGeo = new THREE.PlaneGeometry(8.4, 5.8, 36, 28);
    const fPos = faceGeo.attributes.position;
    const fv = new THREE.Vector3();
    for (let i = 0; i < fPos.count; i++) {
      fv.fromBufferAttribute(fPos, i);
      const bulge = (1 - Math.min(1, (fv.x / 4.2) ** 2)) * (1 - Math.min(1, (fv.y / 2.9) ** 2)) * 0.70;
      const blastFracture = Math.sin(fv.x * 4.8 + fv.y * 4.2) * 0.16 + Math.cos(fv.x * 3.1 - fv.y * 2.8) * 0.10;
      fv.z += bulge + blastFracture;
      fPos.setXYZ(i, fv.x, fv.y, fv.z);
    }
    faceGeo.computeVertexNormals();
    const faceTex = rockTex.clone();
    faceTex.repeat.set(3, 2);
    const faceBump = bumpTex.clone();
    faceBump.repeat.set(3, 2);
    const excavationFace = new THREE.Mesh(
      faceGeo,
      new THREE.MeshStandardMaterial({
        map: faceTex,
        bumpMap: faceBump,
        bumpScale: 0.95,
        roughness: 0.90,
        metalness: 0.08,
        flatShading: true,
      })
    );
    excavationFace.position.set(0, 2.3, 4.2);
    excavationFace.rotation.y = Math.PI;
    scene.add(excavationFace);

    // =========================================================================
    // FLOOR: COMPACTED GREY STONE DUST, CRUSHED GRAVEL & LOADER WHEEL TRACKS
    // =========================================================================
    const floorGeo = new THREE.PlaneGeometry(10, LEN, 52, 130);
    floorGeo.rotateX(-Math.PI / 2);
    const flPos = floorGeo.attributes.position;
    const flv = new THREE.Vector3();
    for (let i = 0; i < flPos.count; i++) {
      flv.fromBufferAttribute(flPos, i);
      let yOffset = 0;
      // Loose blasted rock scree ramp banked up along right wall (matching images.jpg)
      if (flv.x > 1.0) {
        yOffset += Math.pow((flv.x - 1.0) / 3.0, 1.5) * 0.65;
      }
      // Compacted rock bank on left wall
      if (flv.x < -1.4) {
        yOffset += Math.pow((-flv.x - 1.4) / 2.8, 2.0) * 0.45;
      }
      // Wheel tracks in compacted stone dust
      if (Math.abs(Math.abs(flv.x) - 0.72) < 0.22) {
        yOffset -= 0.028;
      }
      // Uneven crushed stone gravel ripples
      yOffset += Math.sin(flv.x * 3.1 + flv.z * 1.9) * 0.030 + Math.sin(flv.z * 5.2) * 0.018;
      flv.y = Math.max(0.005, yOffset);
      flPos.setXYZ(i, flv.x, flv.y, flv.z);
    }
    floorGeo.computeVertexNormals();

    const floorTex = rockTex.clone();
    floorTex.repeat.set(5, 26);
    const floorBump = bumpTex.clone();
    floorBump.repeat.set(5, 26);

    const floor = new THREE.Mesh(
      floorGeo,
      new THREE.MeshStandardMaterial({
        map: floorTex,
        bumpMap: floorBump,
        bumpScale: 0.68,
        roughness: 0.92,
        metalness: 0.06,
        flatShading: true,
      })
    );
    floor.position.set(0, 0, -14);
    scene.add(floor);

    // =========================================================================
    // LOOSE BLASTED ROCK SCREE RAMP ALONG RIGHT WALL (MATCHING IMAGES.JPG)
    // =========================================================================
    const rampGeo = new THREE.PlaneGeometry(3.6, LEN, 24, 80);
    rampGeo.rotateX(-Math.PI / 2);
    const rpPos = rampGeo.attributes.position;
    for (let i = 0; i < rpPos.count; i++) {
      const rx = rpPos.getX(i);
      const rz = rpPos.getZ(i);
      const normalized = Math.max(0, (rx - 1.2) / 2.4);
      const slopeHeight = Math.pow(normalized, 1.4) * 1.35;
      const rockRipples = Math.sin(rz * 2.4 + rx * 3.8) * 0.055 + Math.sin(rx * 7.0) * 0.035;
      rpPos.setY(i, Math.max(0.01, slopeHeight + rockRipples));
    }
    rampGeo.computeVertexNormals();

    const rampTex = rockTex.clone();
    rampTex.repeat.set(2.5, 20);
    const rampBump = bumpTex.clone();
    rampBump.repeat.set(2.5, 20);

    const rampMat = new THREE.MeshStandardMaterial({
      map: rampTex,
      bumpMap: rampBump,
      bumpScale: 0.85,
      roughness: 0.92,
      metalness: 0.06,
      flatShading: true,
    });
    const rockRamp = new THREE.Mesh(rampGeo, rampMat);
    rockRamp.position.set(1.4, 0, -14);
    scene.add(rockRamp);

    // Rails (aged industrial mining steel with sheen)
    const railMat = stdMat(0x656868, { roughness: 0.4, metalness: 0.75 });
    [-0.72, 0.72].forEach((rx) => {
      const r = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.1, LEN), railMat);
      r.position.set(rx, 0.09, -14);
      scene.add(r);
    });

    // Sleepers (timber ties bedded in the dirt)
    const slMat = stdMat(0x302013, { roughness: 0.94 });
    for (let z = -50; z <= 24; z += 1.35) {
      const sl = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 0.22), slMat);
      sl.position.set(0, 0.04, z);
      scene.add(sl);
    }

    // Timber sets & Overhead Industrial Work Lamps
    const woodMat = stdMat(0x483320, { roughness: 0.88 });
    const lampGlowMat = basMat(0xfffaea);
    const cageMat = stdMat(0xd4ac0d, { metalness: 0.8, roughness: 0.3 }); // High-vis yellow safety lamp cages

    for (let z = -46; z <= 22; z += 4.5) {
      const arch = new THREE.Group();
      arch.position.set(0, 0, z);

      [-1.9, 1.9].forEach((px) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 3.2, 8), woodMat);
        post.position.set(px, 1.6, 0);
        arch.add(post);

        // At z = -5.5 timber arch where worker is hammering, add heavy forged steel gusset & wedge
        if (Math.abs(z - (-5.5)) < 0.1 && px > 0) {
          const steelWedgeMat = stdMat(0x4a525a, { metalness: 0.9, roughness: 0.3 });
          const gusset = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.30, 0.22), steelWedgeMat);
          gusset.position.set(-0.10, 1.58, 0);
          post.add(gusset);

          const wedgePin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 0.16), stdMat(0x707882, { metalness: 0.95, roughness: 0.2 }));
          wedgePin.position.set(-0.14, 1.58, 0.04);
          wedgePin.rotation.y = -0.15;
          post.add(wedgePin);
        }
      });

      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 4.0, 8), woodMat);
      cap.rotation.z = Math.PI / 2;
      cap.position.set(0, 3.16, 0);
      arch.add(cap);

      // Industrial Caged Bulkhead Work Lamp hung from center of timber arch
      const lampHolder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8), cageMat);
      lampHolder.position.set(0, 3.0, 0);
      arch.add(lampHolder);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), lampGlowMat);
      bulb.position.set(0, 2.92, 0);
      arch.add(bulb);

      const lampCage = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.16, 8, 1, true), cageMat);
      lampCage.position.set(0, 2.92, 0);
      arch.add(lampCage);

      // Warm PointLight illuminating this earthen section of tunnel (placed selectively every ~9m for authentic underground light pools)
      if (Math.abs(Math.round(z)) % 9 === 0) {
        const ptLight = new THREE.PointLight(0xffdca8, 3.2, 9, 1.5);
        ptLight.position.set(0, 2.85, 0);
        arch.add(ptLight);
      }

      scene.add(arch);
    }

    // High-power Yellow Worksite Tripod Floodlights
    const makeTripodFloodlight = (x: number, y: number, z: number, targetX: number, targetY: number, targetZ: number) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);

      // Tripod legs & central pole
      const poleMat = stdMat(0xd4ac0d, { metalness: 0.7, roughness: 0.35 });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8), poleMat);
      pole.position.y = 1.1;
      g.add(pole);

      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.04), poleMat);
      crossbar.position.y = 2.15;
      g.add(crossbar);

      // Dual halogen lamp heads
      [-0.22, 0.22].forEach((lx) => {
        const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.12), stdMat(0x22262a, { metalness: 0.5 }));
        headBox.position.set(lx, 2.15, 0);
        g.add(headBox);

        const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.14), basMat(0xfffaea));
        lens.position.set(lx, 2.15, 0.065);
        g.add(lens);
      });

      // Target for spotlight
      const targetObj = new THREE.Object3D();
      targetObj.position.set(targetX, targetY, targetZ);
      scene.add(targetObj);

      // High output warm halogen spotlight
      const spot = new THREE.SpotLight(0xffeed6, 20.0, 35, Math.PI / 3.0, 0.35, 1.25);
      spot.position.set(x, y + 2.15, z);
      spot.target = targetObj;
      scene.add(spot);

      scene.add(g);
    };

    // Floodlight 1: Lighting the face miners and ore cart
    makeTripodFloodlight(-1.6, 0.0, 9.2, 0.8, 1.2, 5.5);

    // Floodlight 2: Lighting the Smart Safety Jacket inspection stand
    makeTripodFloodlight(1.5, 0.0, -17.8, -0.2, 1.5, -20.0);

    // Ultra-dim subterranean ambient lighting — keeps unlit walls near pitch-black, only revealing deep chocolate brown under direct lights
    const amb = new THREE.AmbientLight(0x050302, 0.16);
    scene.add(amb);

    // Subtle ceiling bounce
    const hemiLight = new THREE.HemisphereLight(0x0e0804, 0x010101, 0.16);
    scene.add(hemiLight);

    // Dedicated Camera Inspection Torch (Headlight) — cuts through the dark drift, revealing the deep chocolate rock right in front of the viewer!
    const cameraTorch = new THREE.SpotLight(0xffedd2, 22.0, 42, Math.PI / 4.2, 0.42, 1.2);
    cameraTorch.position.set(0, 0, 0);
    const torchTarget = new THREE.Object3D();
    torchTarget.position.set(0, 0, -8);
    camera.add(torchTarget);
    cameraTorch.target = torchTarget;
    camera.add(cameraTorch);
    scene.add(camera);

    // Soft localized key light near face
    const dirLight1 = new THREE.DirectionalLight(0xfff0dc, 0.4);
    dirLight1.position.set(-3.2, 5.5, 11);
    scene.add(dirLight1);

    // ORE CART & HEAPED BLASTED ORE ROCKS (MATCHING IMAGES.JPG)
    const cartG = new THREE.Group();
    cartG.position.set(0, 0.1, 9.8);
    const cartBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 1.8), stdMat(0x283036, { roughness: 0.7, metalness: 0.6 }));
    cartBody.position.y = 0.5;
    cartG.add(cartBody);

    // 4 flanged steel wheels running on rails
    const cartWheels: THREE.Group[] = [];
    const wheelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const flangeGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.02, 16);
    flangeGeo.rotateZ(Math.PI / 2);
    const wheelMat = stdMat(0x5a636c, { roughness: 0.35, metalness: 0.85 });

    [[-0.66, 0.16, 0.55], [0.66, 0.16, 0.55], [-0.66, 0.16, -0.55], [0.66, 0.16, -0.55]].forEach(([wx, wy, wz]) => {
      const wheelG = new THREE.Group();
      wheelG.position.set(wx, wy, wz);
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      wheelG.add(tire);
      const flange = new THREE.Mesh(flangeGeo, wheelMat);
      flange.position.x = wx > 0 ? 0.035 : -0.035;
      wheelG.add(flange);
      cartG.add(wheelG);
      cartWheels.push(wheelG);
    });

    // Mounded blasted ore rock chunks heaped inside ore cart (matching loader scoop in images.jpg)
    const cartRockTex = rockTex.clone();
    cartRockTex.repeat.set(2, 2);
    const cartRockBump = bumpTex.clone();
    cartRockBump.repeat.set(2, 2);
    const cartOreMat = new THREE.MeshStandardMaterial({
      map: cartRockTex,
      bumpMap: cartRockBump,
      bumpScale: 0.88,
      roughness: 0.90,
      metalness: 0.08,
      flatShading: true,
    });
    const cartRockMound = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.46, 12), cartOreMat);
    cartRockMound.scale.set(1.0, 1.0, 1.6);
    cartRockMound.position.set(0, 0.92, 0);
    cartG.add(cartRockMound);

    // Heaped angular dark chocolate soil & rock blocks sticking out of ore cart
    const oreChunkMat = stdMat(0x24130a, { roughness: 0.90, flatShading: true });
    for (let i = 0; i < 11; i++) {
      const chunk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.08, 0), oreChunkMat);
      chunk.position.set((Math.random() - 0.5) * 0.7, 0.95 + Math.random() * 0.18, (Math.random() - 0.5) * 1.2);
      chunk.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      cartG.add(chunk);
    }

    // Heavy tubular pushbar at rear of cart (+Z side) facing the trammer
    const pushBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8), stdMat(0x88929b, { metalness: 0.8, roughness: 0.3 }));
    pushBar.rotation.z = Math.PI / 2;
    pushBar.position.set(0, 0.88, 0.92);
    cartG.add(pushBar);
    scene.add(cartG);

    // Large blasted ore muck pile at shoveler workstation on left wall
    const heapTex = rockTex.clone();
    heapTex.repeat.set(3, 3);
    const heapBump = bumpTex.clone();
    heapBump.repeat.set(3, 3);
    const heapMat = new THREE.MeshStandardMaterial({
      map: heapTex,
      bumpMap: heapBump,
      bumpScale: 0.90,
      roughness: 0.90,
      metalness: 0.08,
      flatShading: true,
    });
    const spoilHeap = new THREE.Mesh(new THREE.ConeGeometry(1.25, 0.62, 14), heapMat);
    spoilHeap.position.set(-1.45, 0.25, 6.4);
    spoilHeap.scale.set(1.3, 0.9, 1.15);
    scene.add(spoilHeap);

    // Secondary blasted ore pile near the face pick miner at right rib seam
    const faceMound = new THREE.Mesh(new THREE.ConeGeometry(0.92, 0.48, 12), heapMat);
    faceMound.position.set(1.15, 0.2, 3.8);
    scene.add(faceMound);

    // ANGULAR ULTRA-DARK CHOCOLATE SOIL CLODS & COMPACTED EARTH RUBBLE
    const lightOreMat = stdMat(0x2f190e, { roughness: 0.92, flatShading: true });
    const medSlateMat = stdMat(0x1e1008, { roughness: 0.92, flatShading: true });
    const quartzRockMat = stdMat(0x381e10, { roughness: 0.90, flatShading: true });
    const darkBlastMat = stdMat(0x0e0603, { roughness: 0.94, flatShading: true });

    // 1. Angular blasted rocks around excavation face and cart tracks
    for (let i = 0; i < 38; i++) {
      const radius = 0.08 + Math.random() * 0.16;
      const clodGeo = new THREE.DodecahedronGeometry(radius, 0);
      const clodPos = clodGeo.attributes.position;
      for (let j = 0; j < clodPos.count; j++) {
        const factor = 0.82 + Math.random() * 0.36;
        clodPos.setXYZ(
          j,
          clodPos.getX(j) * factor,
          clodPos.getY(j) * factor,
          clodPos.getZ(j) * factor
        );
      }
      clodGeo.computeVertexNormals();

      const mat = i % 4 === 0 ? lightOreMat : i % 3 === 0 ? quartzRockMat : i % 2 === 0 ? medSlateMat : darkBlastMat;
      const clod = new THREE.Mesh(clodGeo, mat);
      clod.position.set(
        0.5 + (Math.random() - 0.5) * 2.2,
        radius * 0.5 + 0.02,
        5.5 + (Math.random() - 0.5) * 3.2
      );
      clod.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(clod);
    }

    // 2. Loose crushed rock chips scattered along the track bed
    for (let i = 0; i < 32; i++) {
      const crumbGeo = new THREE.DodecahedronGeometry(0.04 + Math.random() * 0.06, 0);
      const crumbMat = i % 2 === 0 ? lightOreMat : medSlateMat;
      const crumb = new THREE.Mesh(crumbGeo, crumbMat);
      crumb.position.set(
        (Math.random() - 0.5) * 2.4,
        0.04,
        1.0 + (Math.random() - 0.5) * 16.0
      );
      crumb.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      scene.add(crumb);
    }

    // Spark & rock chips particle pool for pickaxe strikes
    const sparkCount = 36;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities: THREE.Vector3[] = [];
    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = -10;
      sparkPositions[i * 3 + 2] = 0;
      sparkVelocities.push(new THREE.Vector3());
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xffaa33,
      size: 0.055,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkPoints);

    let sparkLife = 0;
    const triggerSparks = (origin: THREE.Vector3) => {
      sparkLife = 1.0;
      const p = sparkGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < sparkCount; i++) {
        p.setXYZ(i, origin.x, origin.y, origin.z);
        sparkVelocities[i].set(
          (Math.random() - 0.5) * 2.2,
          Math.random() * 2.5 + 0.5,
          (Math.random() - 0.5) * 2.2
        );
      }
      p.needsUpdate = true;
    };

    // FLOATING DUST PARTICLES
    const DUST_N = 280;
    const dg = new THREE.BufferGeometry();
    const dpos = new Float32Array(DUST_N * 3);
    for (let i = 0; i < DUST_N; i++) {
      dpos[i * 3] = (Math.random() - 0.5) * 6;
      dpos[i * 3 + 1] = Math.random() * 3.5;
      dpos[i * 3 + 2] = -40 + Math.random() * 64;
    }
    dg.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
    const dmat = new THREE.PointsMaterial({
      color: 0x9a7254,
      size: 0.028,
      transparent: true,
      opacity: 0.45,
    });
    const dust = new THREE.Points(dg, dmat);
    scene.add(dust);

    // ==========================================
    // REALISTIC MINER CREATION (REAL HUMAN BEINGS)
    // ==========================================
    // REALISTIC MINER TOOLS & EQUIPMENT
    // ==========================================
    const makePick = () => {
      const g = new THREE.Group();
      const woodMat = stdMat(0x6e4e2a, { roughness: 0.85 });
      const steelMat = stdMat(0x3e464e, { roughness: 0.4, metalness: 0.9 });
      const gripMat = stdMat(0x1a1d20, { roughness: 0.95 });

      // Handle grip sleeve centered at (0, 0, 0) - directly inside the worker's palm
      const palmGrip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.021, 0.021, 0.16, 8),
        gripMat
      );
      palmGrip.position.y = 0;
      g.add(palmGrip);

      // Handle extends slightly below hand to y = -0.08
      const lowerHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.017, 0.019, 0.08, 8),
        woodMat
      );
      lowerHandle.position.y = -0.04;
      g.add(lowerHandle);

      // Ash-wood ergonomic handle: extends up to head at y = 0.84
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.019, 0.84, 8),
        woodMat
      );
      handle.position.y = 0.42;
      g.add(handle);

      // Mid grip tape (forward left hand grip point)
      const frontGrip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.020, 0.020, 0.20, 8),
        gripMat
      );
      frontGrip.position.y = 0.36;
      g.add(frontGrip);

      // Forged steel eye and collar at top of handle
      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.028, 0.08, 8),
        steelMat
      );
      collar.position.y = 0.84;
      g.add(collar);

      // Heavy forged miner's pick head:
      // Front piercing pick spike: points FORWARD along +Z towards the rock face
      const headSpike = new THREE.Mesh(
        new THREE.ConeGeometry(0.038, 0.36, 6),
        stdMat(0x66707a, { roughness: 0.35, metalness: 0.85 })
      );
      headSpike.rotation.x = Math.PI / 2;
      headSpike.position.set(0, 0.84, 0.18);
      g.add(headSpike);

      // Rear flat rock chisel head: points BACKWARD along -Z
      const headChisel = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.045, 0.18),
        stdMat(0x56606a, { roughness: 0.4, metalness: 0.85 })
      );
      headChisel.position.set(0, 0.84, -0.09);
      g.add(headChisel);

      return g;
    };

    const makeShovel = () => {
      const g = new THREE.Group();

      const gripMat = stdMat(0x283038, { roughness: 0.7, metalness: 0.6 });
      const woodMat = stdMat(0x725432, { roughness: 0.85 });
      const bladeMat = stdMat(0x404850, { roughness: 0.45, metalness: 0.8 });
      const edgeMat = stdMat(0x606c78, { metalness: 0.9, roughness: 0.3 });

      // D-handle top crossbar grip held directly inside the worker's palm at (0, 0, 0)
      const crossBar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.092, 10),
        gripMat
      );
      crossBar.rotation.z = Math.PI / 2;
      crossBar.position.y = 0;
      g.add(crossBar);

      // Ergonomic rubber grip sleeve around the crossbar
      const palmGrip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.020, 0.020, 0.075, 10),
        gripMat
      );
      palmGrip.rotation.z = Math.PI / 2;
      palmGrip.position.y = 0;
      g.add(palmGrip);

      // D-handle side branches curving down from crossbar (y = 0) to socket (y = -0.075)
      const leftStrut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.011, 0.011, 0.08, 8),
        gripMat
      );
      leftStrut.position.set(-0.038, -0.038, 0);
      g.add(leftStrut);

      const rightStrut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.011, 0.011, 0.08, 8),
        gripMat
      );
      rightStrut.position.set(0.038, -0.038, 0);
      g.add(rightStrut);

      // D-handle base socket collar joining struts to wooden shaft
      const dBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.024, 0.032, 8),
        gripMat
      );
      dBase.position.y = -0.075;
      g.add(dBase);

      // Main ash-wood shaft extending down from D-handle along -Y
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.017, 0.016, 0.77, 8),
        woodMat
      );
      shaft.position.set(0, -0.46, 0);
      g.add(shaft);

      // Mid-shaft grip tape where forward hand grasps during full swing
      const midGrip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.021, 0.021, 0.16, 8),
        gripMat
      );
      midGrip.position.set(0, -0.42, 0);
      g.add(midGrip);

      // Steel socket ferrule connecting wood shaft to scoop blade
      const socket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.024, 0.08, 8),
        bladeMat
      );
      socket.position.set(0, -0.85, 0);
      g.add(socket);

      // Steel scoop blade at bottom tip (y = -0.85)
      const bladeGroup = new THREE.Group();
      bladeGroup.position.set(0, -0.85, 0);
      g.add(bladeGroup);

      // Flat scoop floor: extends forward (-Y in shaft space)
      const bladeFloor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.014), bladeMat);
      bladeFloor.position.set(0, -0.16, 0);
      bladeGroup.add(bladeFloor);

      // Flanged side lips of scoop (extending towards +Z skyward so cavity is right-side-up)
      const leftLip = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.30, 0.065), bladeMat);
      leftLip.position.set(-0.133, -0.16, 0.032);
      bladeGroup.add(leftLip);

      const rightLip = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.30, 0.065), bladeMat);
      rightLip.position.set(0.133, -0.16, 0.032);
      bladeGroup.add(rightLip);

      // Rear back wall of scoop (preventing rocks from spilling back on shaft)
      const backLip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.014, 0.065), bladeMat);
      backLip.position.set(0, -0.01, 0.032);
      bladeGroup.add(backLip);

      // Chisel cutting edge at the front tip of blade
      const cutEdge = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.028, 0.008), edgeMat);
      cutEdge.position.set(0, -0.32, 0);
      bladeGroup.add(cutEdge);

      // Broken ore load resting inside the open scoop cavity (on top of blade floor in +Z)
      const loadGeo = new THREE.DodecahedronGeometry(0.08, 1);
      loadGeo.scale(1.2, 1.4, 0.6);
      const load = new THREE.Mesh(
        loadGeo,
        stdMat(0x281c14, { roughness: 0.95, flatShading: true })
      );
      load.position.set(0, -0.16, 0.035);
      load.visible = false;
      bladeGroup.add(load);

      return { group: g, load };
    };

    const makeHammer = () => {
      const g = new THREE.Group();

      const woodMat = stdMat(0x825b34, { roughness: 0.85 });
      const steelMat = stdMat(0x3a424a, { metalness: 0.9, roughness: 0.35 });
      const faceMat = stdMat(0x76808a, { metalness: 0.95, roughness: 0.18 });
      const gripMat = stdMat(0x181c20, { roughness: 0.95 });

      // Handle grip sleeve centered at (0, 0, 0) - directly inside the worker's palm
      const palmGrip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.021, 0.021, 0.16, 10),
        gripMat
      );
      palmGrip.position.y = 0;
      g.add(palmGrip);

      // Lower handle pommel extending slightly below hand (y = 0 to y = -0.10)
      const lowerHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.017, 0.019, 0.10, 8),
        woodMat
      );
      lowerHandle.position.y = -0.05;
      g.add(lowerHandle);

      const buttCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.020, 0.025, 8),
        gripMat
      );
      buttCap.position.y = -0.095;
      g.add(buttCap);

      // Main handle extending up from hand grip (y = 0 to y = +0.50)
      const upperHandle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.018, 0.50, 8),
        woodMat
      );
      upperHandle.position.y = 0.25;
      g.add(upperHandle);

      // Steel eye collar at top of handle
      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.024, 0.08, 8),
        steelMat
      );
      collar.position.y = 0.48;
      g.add(collar);

      // Forged sledgehammer head mounted symmetrically at top of handle (y = 0.50)
      const headGroup = new THREE.Group();
      headGroup.position.y = 0.50;
      headGroup.rotation.x = 0;
      g.add(headGroup);

      // Central forged steel body
      const headBody = new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.076, 0.16), steelMat);
      headGroup.add(headBody);

      // Front striking face (+Z): polished, hardened tool steel face pointing squarely at timber wedge
      const frontFace = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.040, 0.040, 12), faceMat);
      frontFace.rotation.x = Math.PI / 2;
      frontFace.position.z = 0.098;
      headGroup.add(frontFace);

      // Rear striking face / wedge peen (-Z)
      const rearFace = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.038, 0.040, 12), faceMat);
      rearFace.rotation.x = Math.PI / 2;
      rearFace.position.z = -0.098;
      headGroup.add(rearFace);

      return g;
    };

    const makeGasDetector = () => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.13, 0.038), stdMat(0xd96818, { roughness: 0.5 }));
      g.add(body);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.055, 0.045), basMat(0x34e89e));
      screen.position.set(0, 0.02, 0.02);
      g.add(screen);
      const snorkel = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.045, 8), stdMat(0x22262a, { metalness: 0.6 }));
      snorkel.position.set(0.022, 0.08, 0);
      g.add(snorkel);
      return g;
    };

    const makeRealisticMiner = (opts: {
      skin: number;
      scale: number;
      helmet: number;
      jacketYellow?: number;
      jacketGrey?: number;
      trouserColor?: number;
    }) => {
      const sc = opts.scale || 1.0;
      const g = new THREE.Group();
      g.scale.set(sc, sc, sc);

      // Realistic Human Textures & Shading
      const skinMat = stdMat(opts.skin || 0xa26c47, { roughness: 0.82 });
      const trouMat = stdMat(opts.trouserColor || 0x22272c, { roughness: 0.95 });
      const bootMat = stdMat(0x1a1614, { roughness: 0.85, metalness: 0.1 });
      const bootCapMat = stdMat(0x3a3f44, { roughness: 0.4, metalness: 0.85 });
      const gloveMat = stdMat(0xc49a45, { roughness: 0.88 }); // Leather heavy duty work gloves
      const jacketYellowMat = stdMat(opts.jacketYellow || 0xe8a020, { roughness: 0.65, metalness: 0.05 });
      const jacketGreyMat = stdMat(opts.jacketGrey || 0x1e252b, { roughness: 0.9 });
      const reflBandMat = basMat(0xc0c8cc); // Micro-prismatic reflective tape
      const helmMat = stdMat(opts.helmet || 0xe6eef4, { roughness: 0.35, metalness: 0.15 });

      // LEGS & BOOTS
      const legs: { hip: THREE.Group; knee: THREE.Group }[] = [];
      [-0.115, 0.115].forEach((lx) => {
        const hipJ = new THREE.Group();
        hipJ.position.set(lx, 0.84, 0);
        g.add(hipJ);

        // Thigh
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.44, 12), trouMat);
        thigh.position.y = -0.21;
        hipJ.add(thigh);

        // Knee
        const kneeJ = new THREE.Group();
        kneeJ.position.y = -0.42;
        hipJ.add(kneeJ);

        // Calf & shin
        const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.066, 0.44, 12), trouMat);
        shin.position.y = -0.21;
        kneeJ.add(shin);

        // Boot
        const boot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.22), bootMat);
        boot.position.set(0, -0.38, 0.04);
        kneeJ.add(boot);

        // Steel toe cap
        const toeCap = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.058, 0.09, 10), bootCapMat);
        toeCap.position.set(0, -0.41, 0.12);
        toeCap.rotation.x = Math.PI / 2;
        kneeJ.add(toeCap);

        legs.push({ hip: hipJ, knee: kneeJ });
      });

      // SPINE & TORSO
      const spine = new THREE.Group();
      spine.position.y = 0.86;
      g.add(spine);

      // Pelvis & heavy work belt
      const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.175, 0.18, 16), trouMat);
      pelvis.scale.z = 0.74;
      pelvis.position.y = 0.05;
      spine.add(pelvis);

      const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.208, 0.208, 0.065, 16), stdMat(0x281f16, { roughness: 0.9 }));
      belt.scale.z = 0.76;
      belt.position.y = 0.14;
      spine.add(belt);

      // Miner battery pack on belt
      const beltPack = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.13, 0.06), stdMat(0x181f24, { roughness: 0.5 }));
      beltPack.position.set(-0.13, 0.12, -0.11);
      spine.add(beltPack);

      // Self-rescuer canister
      const selfRescuer = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.14, 10), stdMat(0xb85018, { roughness: 0.6 }));
      selfRescuer.position.set(0.14, 0.12, -0.1);
      spine.add(selfRescuer);

      // Lower jacket (Grey waterproof reinforcement)
      const lowerTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.255, 0.24, 18), jacketGreyMat);
      lowerTorso.scale.z = 0.72;
      lowerTorso.position.y = 0.28;
      spine.add(lowerTorso);

      // Upper jacket (High-vis fluorescent yellow)
      const upperTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.235, 0.36, 18), jacketYellowMat);
      upperTorso.scale.z = 0.72;
      upperTorso.position.y = 0.54;
      spine.add(upperTorso);

      // Chest volume & shoulders
      const chestVol = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), jacketYellowMat);
      chestVol.scale.set(1.05, 0.62, 0.73);
      chestVol.position.y = 0.73;
      spine.add(chestVol);

      // Reflective safety stripes around torso
      [0.26, 0.44, 0.66].forEach((stripeY) => {
        const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.246, 0.246, 0.048, 18), reflBandMat);
        stripe.scale.z = 0.73;
        stripe.position.y = stripeY;
        spine.add(stripe);
      });

      // Jacket collar
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.03, 8, 16), jacketGreyMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 0.88;
      spine.add(collar);

      // Jacket status LED on chest (subtle 8mm indicator)
      const ledMesh = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), basMat(0x35d6a0));
      ledMesh.position.set(-0.075, 0.62, 0.185);
      spine.add(ledMesh);

      // ARMS & HANDS (Anatomically positioned: arms hang straight down, hands clipped to sides at hip level)
      const arms: { sh: THREE.Group; el: THREE.Group; hand: THREE.Group }[] = [];
      [-1, 1].forEach((dir) => {
        const shJ = new THREE.Group();
        shJ.position.set(dir * 0.27, 0.73, 0);
        shJ.rotation.set(0, 0, dir * -0.04); // Natural outward hang along side of body
        spine.add(shJ);

        // Bicep / Upper Arm
        const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.050, 0.30, 12), jacketYellowMat);
        upperArm.position.y = -0.15;
        shJ.add(upperArm);

        // Reflective arm band
        const armBand = new THREE.Mesh(new THREE.CylinderGeometry(0.059, 0.059, 0.045, 12), reflBandMat);
        armBand.position.y = -0.20;
        shJ.add(armBand);

        // Elbow joint
        const elJ = new THREE.Group();
        elJ.position.y = -0.30;
        shJ.add(elJ);

        // Forearm (Grey cuff)
        const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.050, 0.042, 0.28, 12), jacketGreyMat);
        forearm.position.y = -0.14;
        elJ.add(forearm);

        // Hand & Work Glove group: positioned strictly at hip level (y = -0.29 in elJ)
        const handGroup = new THREE.Group();
        handGroup.position.set(0, -0.29, 0);
        elJ.add(handGroup);

        // Heavy work glove cuff (leather flared gauntlet collar)
        const cuffMat = stdMat(0x32383f, { roughness: 0.85 });
        const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.042, 0.055, 10), cuffMat);
        cuff.position.y = 0.032;
        handGroup.add(cuff);

        // Main leather work glove palm body
        const palm = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.076, 0.042), gloveMat);
        palm.position.set(0, 0, 0);
        handGroup.add(palm);

        // Reinforced leather inner palm pad (where the tool handle rests directly)
        const palmPadMat = stdMat(0x7a481c, { roughness: 0.92 });
        const palmPad = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.068, 0.038), palmPadMat);
        palmPad.position.set(-dir * 0.026, 0, 0.002);
        handGroup.add(palmPad);

        // Protective knuckle armor plate on back of hand
        const knuckleMat = stdMat(0x22262a, { roughness: 0.7 });
        const knuckleGuard = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.058, 0.036), knuckleMat);
        knuckleGuard.position.set(dir * 0.026, 0.006, 0);
        handGroup.add(knuckleGuard);

        // Curled glove fingers wrapped firmly around the tool grip handle
        const fingerGroup = new THREE.Group();
        fingerGroup.position.set(-dir * 0.012, -0.016, 0.018);
        handGroup.add(fingerGroup);

        for (let f = 0; f < 4; f++) {
          const fy = (f - 1.5) * 0.016;
          const finger = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0085, 0.008, 0.032, 8),
            gloveMat
          );
          finger.rotation.x = Math.PI / 2;
          finger.rotation.z = -dir * 0.32;
          finger.position.set(0, fy, 0.012);
          fingerGroup.add(finger);
        }

        // Glove thumb wrapping securely across the tool handle
        const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.036, 0.022), gloveMat);
        thumb.rotation.set(-0.25, 0, -dir * 0.45);
        thumb.position.set(-dir * 0.022, 0.024, 0.014);
        handGroup.add(thumb);

        arms.push({ sh: shJ, el: elJ, hand: handGroup });
      });

      // HEAD, FACE, RESPIRATOR & HELMET
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.064, 0.11, 10), skinMat);
      neck.position.y = 0.91;
      spine.add(neck);

      const headJ = new THREE.Group();
      headJ.position.y = 0.99;
      spine.add(headJ);

      // Human head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 18, 14), skinMat);
      head.scale.set(0.92, 1.08, 1.02);
      headJ.add(head);

      // Safety goggles / visor
      const goggleFrame = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.045, 0.04), stdMat(0x1a1e22, { roughness: 0.5 }));
      goggleFrame.position.set(0, 0.02, 0.108);
      headJ.add(goggleFrame);
      const goggleGlass = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.035, 0.02), stdMat(0x608a9f, { roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.85 }));
      goggleGlass.position.set(0, 0.02, 0.12);
      headJ.add(goggleGlass);

      // Hard hat
      const helm = new THREE.Mesh(new THREE.SphereGeometry(0.145, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), helmMat);
      helm.scale.set(1.02, 1.05, 1.05);
      helm.position.y = 0.024;
      headJ.add(helm);
      const peak = new THREE.Mesh(new THREE.BoxGeometry(0.195, 0.016, 0.115), helmMat);
      peak.position.set(0, 0.03, 0.12);
      headJ.add(peak);

      // Cap lamp & light beam
      const lampBox = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.05, 0.045), stdMat(0x20262b, { roughness: 0.4 }));
      lampBox.position.set(0, 0.052, 0.13);
      headJ.add(lampBox);
      const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.025, 14), basMat(0xfffae6));
      bulb.position.set(0, 0.052, 0.154);
      headJ.add(bulb);

      // Volumetric headlamp beam cone: starts narrow at the lamp lens (0.035m) and throws out wide (1.1m) forward
      const beamGeo = new THREE.CylinderGeometry(0.035, 1.1, 4.8, 20, 1, true);
      beamGeo.rotateX(-Math.PI / 2);
      beamGeo.translate(0, 0, 2.4);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xfffae0,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const beamCone = new THREE.Mesh(beamGeo, beamMat);
      beamCone.position.set(0, 0.052, 0.154);
      headJ.add(beamCone);

      // Authentic steady miner cap lamp (illuminates the rock face, cart, or drift ahead)
      const headTarget = new THREE.Object3D();
      headTarget.position.set(0, 0.05, 5.5);
      headJ.add(headTarget);

      const capLampSpot = new THREE.SpotLight(0xfffaea, 4.5, 9.5, Math.PI / 4, 0.4, 1.2);
      capLampSpot.position.set(0, 0.052, 0.16);
      capLampSpot.target = headTarget;
      headJ.add(capLampSpot);

      return {
        g,
        spine,
        legs,
        arms,
        head: headJ,
        led: ledMesh,
        reflMat: reflBandMat,
        mode: 'idle',
        ph: 0,
        baseY: 0,
      };
    };

    // Instantiate Realistic Working Miner Crew in Drift (Widely spaced along 25m drift)
    const miners: MinerObj[] = [];
    const CREWS = [
      // 1. Lead face miner working active right seam with pickaxe (excavation head)
      { pos: [1.35, 0, 3.8], ry: -2.6, mode: 'pick', ph: 0.0, tool: 'pick', o: { skin: 0x9f6a42, scale: 1.02, helmet: 0xe6eef4, trouserColor: 0x1f2429 } },
      // 2. Mucking shoveler loading broken rock from spoil heap into side channel (facing spoil heap at x = -2.1)
      { pos: [-1.40, 0, 7.2], ry: -1.35, mode: 'shovel', ph: 1.5, tool: 'shovel', o: { skin: 0xb57b54, scale: 1.0, helmet: 0xe6eef4, trouserColor: 0x1c2126 } },
      // 3. Cart trammer pushing ore cart along central haulage tracks (stands BEHIND cart at z=11.08 driving it forward into mine)
      { pos: [0.0, 0, 11.08], ry: Math.PI, mode: 'push', ph: 0.3, tool: null, o: { skin: 0x98633e, scale: 1.01, helmet: 0xf5d038, trouserColor: 0x22262a } },
      // 4. Secondary miner scaling left rib sidewall (facing left rock wall at x = -2.4)
      { pos: [-1.55, 0, -1.5], ry: -Math.PI / 2, mode: 'pick', ph: 0.8, tool: 'pick', o: { skin: 0x885433, scale: 0.98, helmet: 0xf5d038, trouserColor: 0x2b2824 } },
      // 5. Timber support framer & rock bolt worker driving reinforcement wedge on timber set
      { pos: [1.35, 0, -5.5], ry: -0.78, mode: 'hammer', ph: 2.1, tool: 'hammer', o: { skin: 0x8d5937, scale: 0.99, helmet: 0x4fa3d8, trouserColor: 0x292b2f } },
      // 6. Safety patrol deputy monitoring atmospheric air quality along haulage drift
      { pos: [-1.60, 0, -9.5], ry: Math.PI, mode: 'walk', ph: 3.2, tool: null, o: { skin: 0xad764e, scale: 1.0, helmet: 0xe6eef4, trouserColor: 0x1e2227 }, baseZ: -9.5 },
    ];

    CREWS.forEach((c) => {
      const m = makeRealisticMiner(c.o) as unknown as MinerObj;
      m.g.position.set(c.pos[0], c.pos[1], c.pos[2]);
      m.g.rotation.y = c.ry;
      m.mode = c.mode;
      m.ph = c.ph;
      m.baseY = c.pos[1];
      if (c.baseZ !== undefined) m.baseZ = c.baseZ;

      if (c.tool === 'pick') {
        const pk = makePick();
        // Pickaxe held firmly in palm, handle extending through fingers, spike pointing forward
        pk.position.set(0, 0, 0);
        pk.rotation.set(0.32, -0.06, 0.04);
        m.arms[1].hand.add(pk);
        m.toolObj = pk;
      } else if (c.tool === 'shovel') {
        const { group: sh, load } = makeShovel();
        // Shovel gripped by D-handle in palm, shaft angled forward-down, scoop right-side up
        sh.position.set(0, 0, 0);
        sh.rotation.set(-0.45, -0.04, 0.02);
        m.arms[1].hand.add(sh);
        m.toolObj = sh;
        m.shovelLoad = load;
      } else if (c.tool === 'hammer') {
        const hm = makeHammer();
        // Sledgehammer held firmly in palm, striking face aimed forward
        hm.position.set(0, 0, 0);
        hm.rotation.set(0.20, 0.04, -0.02);
        m.arms[1].hand.add(hm);
        m.toolObj = hm;
      }

      if (c.mode === 'walk') {
        const gd = makeGasDetector();
        // Gas detector held in palm, screen tilted up toward eyes
        gd.position.set(0, 0.02, 0.02);
        gd.rotation.set(-0.25, 0.20, 0);
        m.arms[0].hand.add(gd);
      }

      scene.add(m.g);
      miners.push(m);
    });

    // =======================================================
    // SMART SAFETY JACKET STAND (RESCUE STATION 2 AT Z = -20)
    // HIGH-VISIBILITY GOLDEN AMBER STANDING BY STATUS
    // =======================================================
    const jacketGroup = new THREE.Group();
    jacketGroup.position.set(0, 0, -20);
    scene.add(jacketGroup);

    // Inspection turntable base ring
    const standRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.84, 0.06, 32),
      stdMat(0x19222a, { roughness: 0.6, metalness: 0.5 })
    );
    standRing.position.y = 0.03;
    jacketGroup.add(standRing);

    // High-visibility golden amber neon ring for Station 2 standing by
    const ringNeon = new THREE.Mesh(
      new THREE.TorusGeometry(0.79, 0.022, 8, 32),
      basMat(0xf59e0b)
    );
    ringNeon.rotation.x = Math.PI / 2;
    ringNeon.position.y = 0.06;
    jacketGroup.add(ringNeon);

    // Station 2 amber floor beacon
    const stationBeacon = new THREE.PointLight(0xf59e0b, 1.8, 7, 2);
    stationBeacon.position.set(0, 0.18, 0);
    jacketGroup.add(stationBeacon);

    // Suspended Rescue Station 2 Overhead Signboard
    const stationSignGroup = new THREE.Group();
    stationSignGroup.position.set(0, 3.4, -20);

    const signBorder = new THREE.Mesh(
      new THREE.BoxGeometry(2.46, 0.52, 0.04),
      basMat(0xf59e0b)
    );
    signBorder.position.z = -0.01;
    stationSignGroup.add(signBorder);

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 96;
    const sCtx = signCanvas.getContext('2d')!;
    sCtx.fillStyle = '#0b1014';
    sCtx.fillRect(0, 0, 512, 96);
    sCtx.strokeStyle = '#f59e0b';
    sCtx.lineWidth = 6;
    sCtx.strokeRect(4, 4, 504, 88);
    sCtx.fillStyle = '#f59e0b';
    sCtx.font = 'bold 32px monospace';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText('RESCUE STATION 2 · STANDING BY', 256, 48);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signFace = new THREE.Mesh(
      new THREE.PlaneGeometry(2.38, 0.44),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signFace.position.z = 0.025;
    stationSignGroup.add(signFace);

    [-0.95, 0.95].forEach((cx) => {
      const chain = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.65, 6),
        stdMat(0x626b73, { metalness: 0.8, roughness: 0.3 })
      );
      chain.position.set(cx, 0.45, 0);
      stationSignGroup.add(chain);
    });
    scene.add(stationSignGroup);

    // Realistic Miner Mannequin wearing the Smart Safety Jacket
    const HV_Jacket = stdMat(0xd4ed31, { roughness: 0.72, metalness: 0.05, transparent: true, opacity: 1.0 });
    const TP_Jacket = basMat(0xecf8fa); // High-spec reflective tape
    const DarkJacketGrey = stdMat(0x222a30, { roughness: 0.85, transparent: true, opacity: 1.0 });
    const MannequinForm = stdMat(0x1b232a, { roughness: 0.8 });

    // Mannequin legs & head
    [-0.14, 0.14].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.08, 0.96, 12), MannequinForm);
      leg.position.set(lx, 0.58, 0);
      jacketGroup.add(leg);
    });

    const standHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 14), MannequinForm);
    standHead.position.y = 2.12;
    jacketGroup.add(standHead);

    const standHelmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.152, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
      stdMat(0xf0f4f8, { roughness: 0.35, metalness: 0.2 })
    );
    standHelmet.position.y = 2.15;
    jacketGroup.add(standHelmet);

    // Torso jacket geometry
    const jacketLower = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.36, 0.32, 24), DarkJacketGrey);
    jacketLower.scale.z = 0.7;
    jacketLower.position.y = 1.22;
    jacketGroup.add(jacketLower);

    const jacketUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.33, 0.58, 24), HV_Jacket);
    jacketUpper.scale.z = 0.7;
    jacketUpper.position.y = 1.62;
    jacketGroup.add(jacketUpper);

    // Shoulder curve & collar
    const jacketShoulders = new THREE.Mesh(new THREE.SphereGeometry(0.33, 18, 14), HV_Jacket);
    jacketShoulders.scale.set(1.05, 0.52, 0.72);
    jacketShoulders.position.y = 1.88;
    jacketGroup.add(jacketShoulders);

    const jacketCollar = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.04, 10, 24), DarkJacketGrey);
    jacketCollar.rotation.x = Math.PI / 2;
    jacketCollar.position.y = 1.99;
    jacketGroup.add(jacketCollar);

    // Arms
    [-1, 1].forEach((dir) => {
      const armUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.42, 14), HV_Jacket);
      armUpper.position.set(dir * 0.38, 1.66, 0);
      armUpper.rotation.z = dir * 0.14;
      jacketGroup.add(armUpper);

      const armLower = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.42, 14), DarkJacketGrey);
      armLower.position.set(dir * 0.43, 1.28, 0);
      armLower.rotation.z = dir * 0.1;
      jacketGroup.add(armLower);

      // Arm reflective stripes
      [1.7, 1.4].forEach((ay) => {
        const band = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.05, 14), TP_Jacket);
        band.position.set(dir * (0.38 + (1.7 - ay) * 0.15), ay, 0);
        jacketGroup.add(band);
      });
    });

    // Torso 360° reflective micro-prismatic bands
    [1.24, 1.54].forEach((by) => {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.065, 24), TP_Jacket);
      b.scale.z = 0.71;
      b.position.y = by;
      jacketGroup.add(b);
    });

    // Vertical shoulder reflective braces
    [-1, 1].forEach((dir) => {
      const br = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.44, 0.012), TP_Jacket);
      br.position.set(dir * 0.16, 1.78, 0.23);
      br.rotation.x = -0.22;
      br.rotation.z = dir * 0.15;
      jacketGroup.add(br);
    });

    // Center heavy zipper
    const zip = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.86, 0.016), stdMat(0x283038, { roughness: 0.4, metalness: 0.6 }));
    zip.position.set(0, 1.48, 0.245);
    jacketGroup.add(zip);

    // ========================================================
    // 13 REALISTIC HARDWARE COMPONENTS MOUNTED ON THE JACKET
    // Directly based on the user's Smart Safety Jacket image
    // ========================================================
    const placeOnJacket = (grp: THREE.Group, p: [number, number, number]) => {
      grp.position.set(p[0], p[1], p[2]);
      grp.lookAt(new THREE.Vector3(p[0] * 4, p[1], p[2] * 4));
      jacketGroup.add(grp);
      return grp;
    };

    const getPartPos = (k: string): [number, number, number] => {
      const part = PARTS.find((p) => p.k === k);
      return (part?.p as [number, number, number]) || [0, 1.5, 0.3];
    };

    // 1. H2S Sensor (Upper chest / breathing zone)
    const h2sG = new THREE.Group();
    h2sG.add(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.024, 16), stdMat(0x194569, { roughness: 0.5 })));
    const h2sMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.046, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
      stdMat(0xb0b8be, { roughness: 0.35, metalness: 0.75 })
    );
    h2sMesh.rotation.x = -Math.PI / 2;
    h2sMesh.position.z = 0.012;
    h2sG.add(h2sMesh);
    placeOnJacket(h2sG, getPartPos('h2s'));

    // 2. SBM-20 GM Tube (Radiation Detector on outer jacket rib)
    const radG = new THREE.Group();
    const gmShield = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.22, 14), stdMat(0x758088, { roughness: 0.4, metalness: 0.85 }));
    gmShield.rotation.z = Math.PI / 2;
    radG.add(gmShield);
    const gmTube = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.2, 14), stdMat(0xb87333, { roughness: 0.3, metalness: 0.9 })); // Copper GM tube
    gmTube.rotation.z = Math.PI / 2;
    radG.add(gmTube);
    [-0.09, 0.09].forEach((cx) => {
      const isolator = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.025, 12), stdMat(0x22262a, { roughness: 0.6 }));
      isolator.rotation.z = Math.PI / 2;
      isolator.position.x = cx;
      radG.add(isolator);
    });
    placeOnJacket(radG, getPartPos('rad'));

    // 3. DHT22 (Temperature & Humidity sensor on right lapel)
    const dhtG = new THREE.Group();
    const dhtBox = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.11, 0.03), stdMat(0xecf0f2, { roughness: 0.85 }));
    dhtG.add(dhtBox);
    // Louvered air vents on DHT22
    [-0.028, -0.01, 0.008, 0.026].forEach((vy) => {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.006, 0.005), stdMat(0x9aa2a8, { roughness: 0.9 }));
      vent.position.set(0, vy, 0.016);
      dhtG.add(vent);
    });
    placeOnJacket(dhtG, getPartPos('dht'));

    // 4. PMS5003 Dust Sensor (Laser scattering module on upper chest)
    const pmsG = new THREE.Group();
    const pmsBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.13, 0.045), stdMat(0x9aa8b4, { roughness: 0.35, metalness: 0.85 }));
    pmsG.add(pmsBody);
    const pmsAirInlet = new THREE.Mesh(new THREE.CircleGeometry(0.038, 16), stdMat(0x192128, { roughness: 0.95 }));
    pmsAirInlet.position.set(-0.04, 0, 0.024);
    pmsG.add(pmsAirInlet);
    placeOnJacket(pmsG, getPartPos('pms'));

    // 5. MAX30102 Heart Rate & SpO2 (on wrist / inner cuff)
    const maxG = new THREE.Group();
    const maxStrap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.065, 0.018), stdMat(0x281938, { roughness: 0.6 }));
    maxG.add(maxStrap);
    const maxSensorEye = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.025, 0.008), basMat(0xcc182a)); // Red/IR optical window
    maxSensorEye.position.z = 0.011;
    maxG.add(maxSensorEye);
    placeOnJacket(maxG, getPartPos('max'));

    // 6. SOS Emergency Button (Center chest prominent tactile badge)
    const sosG = new THREE.Group();
    const sosBase = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.018, 20), stdMat(0x282f36, { roughness: 0.5 }));
    sosBase.rotation.x = Math.PI / 2;
    sosG.add(sosBase);
    const sosBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.026, 20), stdMat(0xdc2626, { roughness: 0.35, metalness: 0.2 }));
    sosBtn.rotation.x = Math.PI / 2;
    sosBtn.position.z = 0.01;
    sosG.add(sosBtn);
    const sosEmblem = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.016, 0.005), basMat(0xffffff));
    sosEmblem.position.z = 0.024;
    sosG.add(sosEmblem);
    placeOnJacket(sosG, getPartPos('sos'));

    // 7. LoRa Module + Whip Antenna (Left shoulder strap)
    const loraG = new THREE.Group();
    const loraBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.035), stdMat(0x1a2430, { roughness: 0.6 }));
    loraG.add(loraBox);
    const antBase = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.04, 12), stdMat(0xc9a227, { metalness: 0.9 }));
    antBase.position.set(0.035, 0.09, 0);
    loraG.add(antBase);
    const whipAnt = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.34, 10), stdMat(0x101418, { roughness: 0.8 }));
    whipAnt.position.set(0.035, 0.27, 0);
    loraG.add(whipAnt);
    placeOnJacket(loraG, getPartPos('lora'));

    // 8. UWB Tag (Upper back between shoulder blades)
    const uwbG = new THREE.Group();
    const uwbBox = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.028), stdMat(0x152b20, { roughness: 0.6 }));
    uwbG.add(uwbBox);
    const ceramicAnt = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.012), stdMat(0xf0f2f4, { roughness: 0.4 }));
    ceramicAnt.position.set(0, 0.045, 0.018);
    uwbG.add(ceramicAnt);
    const uwbLed = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), basMat(0x4fd8ff));
    uwbLed.position.set(-0.04, -0.04, 0.018);
    uwbG.add(uwbLed);
    placeOnJacket(uwbG, getPartPos('uwb'));

    // 9. PCM Cooling Pack (Inner lower back lumbar pad - blue quilted thermal pad)
    const pcmG = new THREE.Group();
    const pcmBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.022), stdMat(0x1d4ed8, { roughness: 0.4 }));
    pcmG.add(pcmBase);
    // Quilted cooling gel cushion pillows
    [-0.08, 0.08].forEach((px) => {
      [-0.06, 0.06].forEach((py) => {
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.016), stdMat(0x3b82f6, { roughness: 0.25, metalness: 0.1 }));
        cushion.position.set(px, py, 0.014);
        pcmG.add(cushion);
      });
    });
    placeOnJacket(pcmG, getPartPos('pcm'));

    // 10. Li-ion Battery Pack (Inside zippered pocket)
    const batG = new THREE.Group();
    const batCell = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.052), stdMat(0x1a3854, { roughness: 0.6 }));
    batG.add(batCell);
    const batLead = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 6), stdMat(0xdc2626));
    batLead.rotation.z = Math.PI / 2;
    batLead.position.set(0.12, 0.05, 0);
    batG.add(batLead);
    placeOnJacket(batG, getPartPos('bat'));

    // 11. ESP32 MCU Board (Chest electronics compartment)
    const espG = new THREE.Group();
    const espPcb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.024), stdMat(0x184429, { roughness: 0.5 }));
    espG.add(espPcb);
    const rfShield = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.018), stdMat(0xc8d0d6, { metalness: 0.9, roughness: 0.2 }));
    rfShield.position.set(-0.02, 0, 0.015);
    espG.add(rfShield);
    const txLed = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), basMat(0x4fd8ff));
    txLed.position.set(0.075, 0.052, 0.022);
    espG.add(txLed);
    placeOnJacket(espG, getPartPos('esp32'));

    // 12. Vibration Motor (Shoulder strap)
    const vibG = new THREE.Group();
    const vibMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.016, 16), stdMat(0x8a9299, { metalness: 0.8, roughness: 0.3 }));
    vibMotor.rotation.x = Math.PI / 2;
    vibG.add(vibMotor);
    placeOnJacket(vibG, getPartPos('vib'));

    // 13. Audible Buzzer (Collar / lapel)
    const buzG = new THREE.Group();
    const buzHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.028, 16), stdMat(0x181c20, { roughness: 0.7 }));
    buzHorn.rotation.x = Math.PI / 2;
    buzG.add(buzHorn);
    placeOnJacket(buzG, getPartPos('buz'));

    // Keyframes for Cinematic Scroll Animation through the Mine (Warm earthen tunnel)
    // [camX, camY, camZ, tgtX, tgtY, tgtZ, turnsY, shellOpacity, fogDensity]
    const KEYS = [
      [-0.60, 1.78, 13.4, 0.00, 1.30, 5.0, 0.0, 1.0, 0.010], // Act 1: Wide view of drift with workers spaced along tunnel
      [-1.20, 1.74, 9.8, 1.80, 1.20, 3.8, 0.0, 1.0, 0.010], // Act 2: Intimate view of lead face miner excavating rock seam
      [0.00, 1.56, -16.60, -0.42, 1.50, -20.0, 0.0, 1.0, 0.007], // Act 3: Gliding up to Smart Safety Jacket station
      [0.00, 1.58, -16.80, 0.42, 1.50, -20.0, 0.5, 1.0, 0.007], // Act 4: Smooth orbit to back: UWB tag & PCM cooling pad
      [0.18, 1.50, -17.20, -0.38, 1.48, -20.0, 1.0, 0.22, 0.007], // Act 5: Zooming on chest cluster & cutaway battery
      [0.08, 2.05, -14.40, 0.00, 1.55, -20.0, 1.15, 0.60, 0.008], // Act 6: Looking towards surface control room (CTA)
    ];

    const curKey = [...KEYS[0]];
    const tmpPos = new THREE.Vector3();
    const toCam = new THREE.Vector3();
    const nrm = new THREE.Vector3();

    // INTERACTION DRAG
    const onPointerDown = (e: PointerEvent) => {
      if (!stateRef.current.inApp || !stateRef.current.studioTabActive) return;
      stateRef.current.isDragging = true;
      stateRef.current.lastX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!stateRef.current.isDragging) return;
      const dx = e.clientX - stateRef.current.lastX;
      stateRef.current.studioAngle += dx * 0.01;
      stateRef.current.lastX = e.clientX;
    };
    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // MAIN ANIMATION RENDER LOOP
    // ==========================================
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const T = clock.getElapsedTime();

      const {
        scrollProg: S,
        inApp,
        studioTabActive,
        studioView,
        alarmLevel,
        linked,
      } = stateRef.current;

      // CAMERA INTERPOLATION FOR SCROLLYTELLING
      let targetK: number[];
      let effectiveS = S;
      if (!inApp) {
        // Read directly from window.pageYOffset for immediate responsive sync with zero frame delay
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const directS = Math.min(1, Math.max(0, window.pageYOffset / maxScroll));
        effectiveS = Number.isFinite(directS) ? directS : S;

        const segs = KEYS.length - 1;
        const u = Math.min(Math.max(effectiveS, 0), 1) * segs;
        const i = Math.floor(u);
        const f = u - i;
        const kA = KEYS[Math.min(i, segs)];
        const kB = KEYS[Math.min(i + 1, segs)];
        targetK = kA.map((v, idx) => v + (kB[idx] - v) * f);
      } else {
        targetK = [0.0, 1.54, -16.85, 0.0, 1.50, -20.0, 0.0, 1.0, 0.028];
        if (studioView === 'turn') {
          targetK[6] = 0.5;
        } else if (studioView === 'cut') {
          targetK[7] = 0.18;
        }
      }

      // Responsive, buttery smooth exponential lerp (tight tracking with no sluggish lag)
      const camLerp = Math.min(1, 1 - Math.exp(-dt * 9.5));
      for (let j = 0; j < curKey.length; j++) {
        curKey[j] += (targetK[j] - curKey[j]) * camLerp;
      }

      camera.position.set(curKey[0], curKey[1], curKey[2]);
      camera.lookAt(curKey[3], curKey[4], curKey[5]);

      // Turn jacket turntable
      let targetRotY = curKey[6] * Math.PI * 2;
      if (inApp && studioTabActive) {
        targetRotY += stateRef.current.studioAngle;
      }
      jacketGroup.rotation.y += (targetRotY - jacketGroup.rotation.y) * 0.08;

      // Jacket cutaway shell transparency
      const shellOpacity = curKey[7];
      HV_Jacket.opacity = shellOpacity;
      DarkJacketGrey.opacity = shellOpacity;
      HV_Jacket.depthWrite = shellOpacity > 0.85;
      DarkJacketGrey.depthWrite = shellOpacity > 0.85;

      fogRef.density = curKey[8];

      // Spark chips update
      if (sparkLife > 0) {
        sparkLife -= dt * 2.2;
        const sp = sparkGeo.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < sparkCount; i++) {
          const vx = sparkVelocities[i].x;
          const vy = sparkVelocities[i].y - 9.8 * dt;
          const vz = sparkVelocities[i].z;
          sparkVelocities[i].y = vy;
          sp.setXYZ(
            i,
            sp.getX(i) + vx * dt,
            Math.max(0.05, sp.getY(i) + vy * dt),
            sp.getZ(i) + vz * dt
          );
        }
        sp.needsUpdate = true;
        sparkMat.opacity = Math.max(0, sparkLife);
      }

      // ===============================================
      // REALISTIC HUMAN NATURAL BODY MECHANICS & GAIT
      // ===============================================
      miners.forEach((m) => {
        // Status LED on miner's jacket
        (m.led.material as THREE.MeshBasicMaterial).color.setHex(
          !linked ? 0x1b2228 : alarmLevel === 2 ? 0xff4a4a : alarmLevel === 1 ? 0xffae2e : 0x35d6a0
        );

        // Breathing chest heave
        const breathe = Math.sin(T * 2.4 + m.ph) * 0.015;
        m.spine.scale.set(1 + breathe, 1 + breathe * 0.5, 1 + breathe);

        if (m.mode === 'pick') {
          // REALISTIC TWO-HANDED PICKAXE MINING
          const cyc = 1.30;
          const t = ((T + m.ph) % cyc) / cyc;

          if (t < 0.50) {
            // WIND-UP: Miner raises pickaxe high back over shoulder with both hands
            const p = t / 0.50;
            // Right arm (primary power hand on grip):
            m.arms[1].sh.rotation.set(-0.15 - p * 0.95, -p * 0.18, -0.06 - p * 0.20);
            m.arms[1].el.rotation.set(-0.30 - p * 0.85, 0, 0);
            m.arms[1].hand.rotation.set(-p * 0.25, -p * 0.12, 0);

            // Left arm (guiding hand reaching up to shaft):
            m.arms[0].sh.rotation.set(-0.10 - p * 0.60, 0.20 + p * 0.20, 0.15 + p * 0.12);
            m.arms[0].el.rotation.set(-0.40 - p * 0.65, 0, 0);
            m.arms[0].hand.rotation.set(-p * 0.20, 0, 0);

            m.spine.rotation.x = -0.04 - p * 0.06;
            m.spine.rotation.y = -p * 0.12;
            m.g.position.y = m.baseY;
            m.legs[0].knee.rotation.x = 0;
            m.legs[1].knee.rotation.x = 0;
            m.head.rotation.x = 0.04 - p * 0.06;
            m.head.rotation.y = 0.08;
          } else if (t < 0.66) {
            // DOWNWARD POWER STRIKE: Full-body swing driving pickaxe spike into rock
            const p = (t - 0.50) / 0.16;
            // Right arm:
            m.arms[1].sh.rotation.set(-1.10 + p * 1.85, -0.18 + p * 0.26, -0.26 + p * 0.18);
            m.arms[1].el.rotation.set(-1.15 + p * 0.95, 0, 0);
            m.arms[1].hand.rotation.set(-0.25 + p * 0.65, -0.12 + p * 0.16, 0);

            // Left arm:
            m.arms[0].sh.rotation.set(-0.70 + p * 1.30, 0.40 - p * 0.20, 0.27 - p * 0.12);
            m.arms[0].el.rotation.set(-1.05 + p * 0.70, 0, 0);
            m.arms[0].hand.rotation.set(-0.20 + p * 0.50, 0, 0);

            m.spine.rotation.x = -0.10 + p * 0.42;
            m.spine.rotation.y = -0.12 + p * 0.20;
            m.g.position.y = m.baseY - p * 0.06;
            m.legs[0].knee.rotation.x = p * 0.26;
            m.legs[1].knee.rotation.x = p * 0.20;
            m.head.rotation.x = 0.16;

            // Spark burst on rock seam impact
            if (t > 0.60 && t < 0.66 && sparkLife <= 0.12) {
              const hitPos = m.ph === 0.0
                ? new THREE.Vector3(1.95, 0.95, 3.5)
                : new THREE.Vector3(-2.35, 1.05, -1.5);
              triggerSparks(hitPos);
            }
          } else {
            // RECOIL & RECOVERY: Shockwave passes through arms and hands, resetting to ready
            const p = (t - 0.66) / 0.34;
            const shock = Math.sin(p * Math.PI * 5) * 0.08 * (1.0 - p);
            const handShock = Math.sin(p * Math.PI * 6) * 0.12 * (1.0 - p);

            // Right arm absorbing impact:
            m.arms[1].sh.rotation.set(0.75 - p * 0.90 + shock, 0.08 * (1.0 - p), -0.08 - p * 0.05);
            m.arms[1].el.rotation.set(-0.20 - p * 0.25 + shock * 0.6, 0, 0);
            m.arms[1].hand.rotation.set(0.40 - p * 0.40 + handShock, 0.04 * (1.0 - p), 0);

            // Left arm absorbing impact:
            m.arms[0].sh.rotation.set(0.60 - p * 0.70 + shock * 0.8, 0.20 * p, 0.15);
            m.arms[0].el.rotation.set(-0.35 - p * 0.20 + shock * 0.5, 0, 0);
            m.arms[0].hand.rotation.set(0.30 - p * 0.30, 0, 0);

            m.spine.rotation.x = 0.32 - p * 0.36 + shock * 0.4;
            m.spine.rotation.y = 0.08 * (1.0 - p);
            m.g.position.y = m.baseY - 0.06 * (1.0 - p);
            m.legs[0].knee.rotation.x = 0.26 * (1.0 - p);
            m.legs[1].knee.rotation.x = 0.20 * (1.0 - p);
            m.head.rotation.x = 0.16 - p * 0.12;
          }

        } else if (m.mode === 'shovel') {
          // REALISTIC SHOVELING / MUCKING: D-HANDLE THRUST, HEAVE, & SPOIL CAST
          const cyc = 2.4;
          const t = ((T + m.ph) % cyc) / cyc;

          if (t < 0.40) {
            // SCOOP: Knees and hips bend down, hands drive shovel into rubble pile
            const p = t / 0.40;
            const dip = Math.sin(p * Math.PI);

            // Right hand drives D-handle:
            m.arms[1].sh.rotation.set(0.22 + dip * 0.32, 0, -0.06 - dip * 0.06);
            m.arms[1].el.rotation.set(-0.28 - dip * 0.20, 0, 0);
            m.arms[1].hand.rotation.set(0.18 + dip * 0.15, 0, 0);

            // Left hand guides lower shaft:
            m.arms[0].sh.rotation.set(0.32 + dip * 0.42, 0.14 + dip * 0.08, 0.16);
            m.arms[0].el.rotation.set(-0.45 - dip * 0.32, 0, 0);
            m.arms[0].hand.rotation.set(0.20 + dip * 0.20, 0, 0);

            m.spine.rotation.x = 0.05 + dip * 0.32;
            m.spine.rotation.y = -dip * 0.08;
            m.g.position.y = m.baseY - dip * 0.08;
            m.legs[0].knee.rotation.x = dip * 0.30;
            m.legs[1].knee.rotation.x = dip * 0.24;
            m.head.rotation.x = 0.10 + dip * 0.22;
            if (m.shovelLoad) m.shovelLoad.visible = p > 0.40;
          } else if (t < 0.70) {
            // HEAVE & CAST: Straightening spine, arms lift loaded shovel and fling ore sideways
            const p = (t - 0.40) / 0.30;
            const turn = Math.sin(p * Math.PI * 0.5);

            // Left hand heaves up:
            m.arms[0].sh.rotation.set(0.50 - p * 0.90, 0.18 + turn * 0.42, 0.14);
            m.arms[0].el.rotation.set(-0.70 + p * 0.32, 0, 0);
            m.arms[0].hand.rotation.set(0.35 - p * 0.50, 0, 0);

            // Right hand swings D-handle:
            m.arms[1].sh.rotation.set(0.38 - p * 0.60, turn * 0.35, -0.08);
            m.arms[1].el.rotation.set(-0.38 - p * 0.15, 0, 0);
            m.arms[1].hand.rotation.set(0.25 - p * 0.40, 0, 0);

            m.spine.rotation.x = 0.05 * (1.0 - p);
            m.spine.rotation.y = turn * 0.45;
            m.g.position.y = m.baseY;
            m.legs[0].knee.rotation.x = 0;
            m.legs[1].knee.rotation.x = 0;
            m.head.rotation.x = 0.06;
            m.head.rotation.y = turn * 0.30;
            if (p > 0.55 && m.shovelLoad) m.shovelLoad.visible = false;
          } else {
            // RETURN: Resetting smoothly to face spoil heap
            const p = (t - 0.70) / 0.30;
            const ret = 1.0 - p;

            // Arms return to ready scoop:
            m.arms[1].sh.rotation.set(-0.22 + p * 0.44, ret * 0.35, -0.06);
            m.arms[1].el.rotation.set(-0.53 + p * 0.25, 0, 0);
            m.arms[1].hand.rotation.set(-0.15 + p * 0.33, 0, 0);

            m.arms[0].sh.rotation.set(-0.40 + p * 0.72, ret * 0.42 + p * 0.14, 0.14);
            m.arms[0].el.rotation.set(-0.38 - p * 0.07, 0, 0);
            m.arms[0].hand.rotation.set(-0.15 + p * 0.35, 0, 0);

            m.spine.rotation.x = 0.05 * p;
            m.spine.rotation.y = ret * 0.45;
            m.head.rotation.y = ret * 0.30;
            m.head.rotation.x = 0.06 + p * 0.04;
            if (m.shovelLoad) m.shovelLoad.visible = false;
          }

        } else if (m.mode === 'hammer') {
          // REALISTIC TWO-HANDED SLEDGEHAMMERING ON TIMBER WEDGE
          const cyc = 1.30;
          const t = ((T + m.ph) % cyc) / cyc;

          if (t < 0.50) {
            // HIGH OVERHEAD WIND-UP: Miner hoists sledgehammer high above shoulder
            const p = t / 0.50;

            // Right arm (primary driving hand):
            m.arms[1].sh.rotation.set(-p * 1.15, -p * 0.18, -0.06 - p * 0.20);
            m.arms[1].el.rotation.set(-p * 1.25, 0, 0);
            m.arms[1].hand.rotation.set(-p * 0.28, 0, 0);

            // Left arm (guiding lower shaft):
            m.arms[0].sh.rotation.set(-p * 0.72, p * 0.30, 0.14 + p * 0.10);
            m.arms[0].el.rotation.set(-p * 1.10, 0, 0);
            m.arms[0].hand.rotation.set(-p * 0.22, 0, 0);

            m.spine.rotation.x = -p * 0.08;
            m.spine.rotation.y = -p * 0.08;
            m.g.position.y = m.baseY;
            m.legs[0].knee.rotation.x = 0;
            m.legs[1].knee.rotation.x = 0;
            m.head.rotation.x = 0.05 - p * 0.04;
          } else if (t < 0.65) {
            // SLEDGEHAMMER IMPACT STRIKE: Full-force downward hammer blow
            const p = (t - 0.50) / 0.15;

            // Right arm driving down:
            m.arms[1].sh.rotation.set(-1.15 + p * 1.95, -0.18 + p * 0.24, -0.26 + p * 0.20);
            m.arms[1].el.rotation.set(-1.25 + p * 1.05, 0, 0);
            m.arms[1].hand.rotation.set(-0.28 + p * 0.68, 0, 0);

            // Left arm pulling down:
            m.arms[0].sh.rotation.set(-0.72 + p * 1.40, 0.30 - p * 0.18, 0.24 - p * 0.10);
            m.arms[0].el.rotation.set(-1.10 + p * 0.75, 0, 0);
            m.arms[0].hand.rotation.set(-0.22 + p * 0.50, 0, 0);

            m.spine.rotation.x = -0.08 + p * 0.38;
            m.spine.rotation.y = -0.08 + p * 0.14;
            m.g.position.y = m.baseY - p * 0.05;
            m.legs[0].knee.rotation.x = p * 0.22;
            m.legs[1].knee.rotation.x = p * 0.16;
            m.head.rotation.x = 0.14;

            // Spark burst on steel wedge impact
            if (t > 0.59 && t < 0.65 && sparkLife <= 0.12) {
              triggerSparks(new THREE.Vector3(1.84, 1.58, -5.5));
            }
          } else {
            // RECOIL & RECOVERY: Elastic rebound through arms and wrists
            const p = (t - 0.65) / 0.35;
            const shock = Math.sin(p * Math.PI * 6) * 0.08 * (1.0 - p);
            const handShock = Math.sin(p * Math.PI * 6) * 0.14 * (1.0 - p);

            // Right arm absorbing shock:
            m.arms[1].sh.rotation.set(0.80 - p * 0.80 + shock, 0.06 * (1.0 - p), -0.06);
            m.arms[1].el.rotation.set(-0.20 - p * 0.35 + shock * 0.6, 0, 0);
            m.arms[1].hand.rotation.set(0.40 - p * 0.40 + handShock, 0, 0);

            // Left arm absorbing shock:
            m.arms[0].sh.rotation.set(0.68 - p * 0.68 + shock * 0.8, 0.12 * (1.0 - p), 0.14);
            m.arms[0].el.rotation.set(-0.35 - p * 0.30 + shock * 0.5, 0, 0);
            m.arms[0].hand.rotation.set(0.28 - p * 0.28, 0, 0);

            m.spine.rotation.x = 0.30 - p * 0.30 + shock * 0.4;
            m.spine.rotation.y = 0.06 * (1.0 - p);
            m.g.position.y = m.baseY - 0.05 * (1.0 - p);
            m.legs[0].knee.rotation.x = 0.22 * (1.0 - p);
            m.legs[1].knee.rotation.x = 0.16 * (1.0 - p);
            m.head.rotation.x = 0.14 - p * 0.09;
          }

        } else if (m.mode === 'push') {
          // CART TRAMMER: HANDS FIRMLY PLANTED FORWARD ON PUSHBAR EXERTING FORWARD THRUST
          const tramProgress = Math.sin(T * 1.1 + m.ph);
          const cartZ = 9.8 - tramProgress * 0.55;
          cartG.position.z = cartZ;
          m.g.position.z = 11.08 - tramProgress * 0.55;

          // Wheels roll in physical sync with forward cart movement
          cartWheels.forEach((w) => {
            w.rotation.x = cartZ / 0.16;
          });

          // Hands planted on pushbar with muscular walking thrust
          const pushPh = T * 3.4 + m.ph;
          const thrust = Math.sin(pushPh) * 0.04;
          m.spine.rotation.x = 0.22;
          m.head.rotation.x = 0.12;

          // Right arm reaching forward and gripping pushbar:
          m.arms[1].sh.rotation.set(-0.55 + thrust, -0.06, 0.04);
          m.arms[1].el.rotation.set(-0.28 + Math.cos(pushPh) * 0.025, 0, 0);
          m.arms[1].hand.rotation.set(-0.20, 0, 0);

          // Left arm reaching forward and gripping pushbar:
          m.arms[0].sh.rotation.set(-0.55 - thrust, 0.06, -0.04);
          m.arms[0].el.rotation.set(-0.28 - Math.cos(pushPh) * 0.025, 0, 0);
          m.arms[0].hand.rotation.set(-0.20, 0, 0);

          const legAngle = Math.sin(pushPh) * 0.38;
          m.legs[0].hip.rotation.x = legAngle;
          m.legs[1].hip.rotation.x = -legAngle;
          m.legs[0].knee.rotation.x = Math.max(0, -legAngle * 0.75);
          m.legs[1].knee.rotation.x = Math.max(0, legAngle * 0.75);
          m.g.position.y = m.baseY + Math.abs(Math.sin(pushPh)) * 0.025;
          m.spine.rotation.z = Math.sin(pushPh) * 0.025;

        } else if (m.mode === 'walk') {
          // PATROL SAFETY DEPUTY: HAND ACTIVELY HOLDING GAS DETECTOR & MONITORING AIR READINGS
          const bZ = m.baseZ !== undefined ? m.baseZ : -9.5;
          const patrolZ = bZ + Math.sin(T * 0.42 + m.ph) * 1.8;
          m.g.position.z = patrolZ;
          const patrolVel = Math.cos(T * 0.42 + m.ph);
          m.g.rotation.y = patrolVel < 0 ? Math.PI : 0.0;

          const stepRate = 3.0;
          const walkPh = T * stepRate;
          const legSwing = Math.sin(walkPh) * 0.38;

          m.legs[0].hip.rotation.x = legSwing;
          m.legs[1].hip.rotation.x = -legSwing;
          m.legs[0].knee.rotation.x = Math.max(0, -legSwing * 0.70);
          m.legs[1].knee.rotation.x = Math.max(0, legSwing * 0.70);

          // Left hand holds gas detector in front of chest, screen tilted toward face:
          m.arms[0].sh.rotation.set(-0.42, 0.26, 0.15);
          m.arms[0].el.rotation.set(-0.95, 0, 0);
          m.arms[0].hand.rotation.set(-0.15, 0.20, 0.10);

          // Right arm swings naturally with walking pace:
          const armSwing = -Math.sin(walkPh) * 0.34;
          m.arms[1].sh.rotation.set(armSwing, 0, -0.06);
          m.arms[1].el.rotation.set(-0.20 - Math.max(0, armSwing * 0.40), 0, 0);
          m.arms[1].hand.rotation.set(armSwing * 0.20, 0, 0);

          // Deputy glances down at detector screen periodically:
          m.head.rotation.x = 0.08 + Math.sin(T * 1.6) * 0.06;
          m.head.rotation.y = -0.10 + Math.sin(T * 0.8) * 0.08;
          m.g.position.y = m.baseY + Math.abs(Math.sin(walkPh)) * 0.035;
          m.spine.rotation.z = Math.sin(walkPh) * 0.025;
        }
      });

      // Floating dust particles drifting through air
      const dp = dg.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < DUST_N; i++) {
        let z = dp.getZ(i) + 0.02;
        let y = dp.getY(i) + Math.sin(T * 0.8 + i) * 0.002;
        if (z > 24) z = -40;
        dp.setXYZ(i, dp.getX(i), y, z);
      }
      dp.needsUpdate = true;

      // Smart Safety Jacket LEDs (clean steady status indicators; no flashing or strobing on workers)
      miners.forEach((m) => {
        // High-vis micro-prismatic reflective safety tape is authentic passive 3M tape — always steady
        if (m.reflMat) {
          m.reflMat.color.setHex(0xddf0f8);
        }
        // Chest telemetry status LED is a solid, clean status indicator
        if (alarmLevel === 2) {
          (m.led.material as THREE.MeshBasicMaterial).color.setHex(0xff3333);
        } else if (alarmLevel === 1) {
          (m.led.material as THREE.MeshBasicMaterial).color.setHex(0xffaa00);
        } else {
          (m.led.material as THREE.MeshBasicMaterial).color.setHex(linked ? 0x35d6a0 : 0x182026);
        }
      });

      // Rescue Station 2 Standing Platform & Mannequin Jacket
      const flash = Math.sin(T * 8) > 0;
      const strobeFast = Math.sin(T * 16) > 0;

      if (alarmLevel === 2) {
        ringNeon.material.color.setHex(strobeFast ? 0xff1e1e : 0x440000);
        TP_Jacket.color.setHex(strobeFast ? 0xff1e1e : 0x550000);
        signBorder.material.color.setHex(strobeFast ? 0xff1e1e : 0x440000);
        stationBeacon.color.setHex(0xff1e1e);
        stationBeacon.intensity = strobeFast ? 4.0 : 0.2;
      } else if (alarmLevel === 1) {
        ringNeon.material.color.setHex(flash ? 0xf59e0b : 0x442800);
        TP_Jacket.color.setHex(flash ? 0xf59e0b : 0x442800);
        signBorder.material.color.setHex(flash ? 0xf59e0b : 0x442800);
        stationBeacon.color.setHex(0xf59e0b);
        stationBeacon.intensity = flash ? 2.5 : 0.5;
      } else {
        // Station 2 Standing By: High-visibility Golden Amber
        ringNeon.material.color.setHex(0xf59e0b);
        TP_Jacket.color.setHex(0xecf8fa);
        signBorder.material.color.setHex(0xf59e0b);
        stationBeacon.color.setHex(0xf59e0b);
        stationBeacon.intensity = 1.8;
      }

      (txLed.material as THREE.MeshBasicMaterial).color.setHex(
        linked && Math.sin(T * 3.1) > 0.5 ? 0x4fd8ff : 0x0e2733
      );

      // SOS Button pulsing glow when emergency is active
      if (alarmLevel === 2) {
        (sosBtn.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(
          strobeFast ? 0xff2222 : 0x440000
        );
      } else {
        (sosBtn.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x000000);
      }

      // ==========================================
      // SCREEN-PROJECTED SENSOR LABELS (RIGHT COLUMN)
      // ==========================================
      camera.getWorldPosition(toCam);
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      // Project worker position for SOS demo
      tmpPos.set(0, 1.45, -20.0);
      tmpPos.project(camera);
      const workerSx = (tmpPos.x * 0.5 + 0.5) * w;
      const workerSy = (-tmpPos.y * 0.5 + 0.5) * h;
      const workerVisible = tmpPos.z > -1 && tmpPos.z < 1;
      if (onWorkerProjectedRef.current) {
        onWorkerProjectedRef.current({ x: workerSx, y: workerSy, visible: workerVisible });
      }

      // Exploded view chapter active range: effectiveS ~ 0.68 to 0.88
      const isExplodedChapter = effectiveS >= 0.68 && effectiveS <= 0.88;
      let labelOpacity = 0;
      if (isExplodedChapter && (!inApp || studioTabActive)) {
        if (effectiveS < 0.73) {
          labelOpacity = (effectiveS - 0.68) / 0.05;
        } else if (effectiveS > 0.83) {
          labelOpacity = 1 - (effectiveS - 0.83) / 0.05;
        } else {
          labelOpacity = 1;
        }
      }
      labelOpacity = Math.max(0, Math.min(1, labelOpacity));

      if (sensorOverlayRef.current) {
        sensorOverlayRef.current.style.opacity = `${labelOpacity}`;
        sensorOverlayRef.current.style.display = labelOpacity > 0.01 && w >= 768 ? 'block' : 'none';
      }

      if (labelOpacity > 0.01 && w >= 768) {
        // Projected center of the jacket model on screen
        tmpPos.copy(jacketGroup.position).project(camera);
        const jacketSx = (tmpPos.x * 0.5 + 0.5) * w;

        interface SensorItem {
          key: string;
          name: string;
          sub: string;
          sx: number;
          sy: number;
          isLeft: boolean;
          targetY?: number;
          chipX?: number;
        }

        const leftItems: SensorItem[] = [];
        const rightItems: SensorItem[] = [];

        SENSOR_LIST.forEach((s) => {
          const part = PARTS.find((p) => p.k === s.key);
          if (!part || !part.p) return;

          tmpPos.set(part.p[0], part.p[1], part.p[2]);
          tmpPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), jacketGroup.rotation.y);
          tmpPos.add(jacketGroup.position);

          tmpPos.project(camera);
          const sx = (tmpPos.x * 0.5 + 0.5) * w;
          const sy = (-tmpPos.y * 0.5 + 0.5) * h;

          // Check if facing camera / in viewport
          if (tmpPos.z > -1 && tmpPos.z < 1 && sx > 16 && sx < w - 16 && sy > 40 && sy < h - 40) {
            const isLeft = sx < jacketSx;
            const item: SensorItem = { key: s.key, name: s.name, sub: s.sub, sx, sy, isLeft };
            if (isLeft) leftItems.push(item);
            else rightItems.push(item);
          }
        });

        // Keep both sides balanced: move the items nearest the jacket centre to the lighter side
        const byX = (a: SensorItem, b: SensorItem) => a.sx - b.sx;
        while (leftItems.length - rightItems.length > 1) {
          leftItems.sort(byX);
          const it = leftItems.pop()!;
          it.isLeft = false;
          rightItems.push(it);
        }
        while (rightItems.length - leftItems.length > 1) {
          rightItems.sort(byX);
          const it = rightItems.shift()!;
          it.isLeft = true;
          leftItems.push(it);
        }

        const rowH = PILL_H + PILL_GAP;
        const minY = 72;
        const maxY = h - 48 - PILL_H;
        const colGap = 44; // horizontal space between the jacket parts and the label column
        const pillMaxW = 140;

        // Landing text cards currently on screen: labels must not hide behind them
        const cardRects = Array.from(document.querySelectorAll('[data-scrolly-card]'))
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.bottom > 0 && r.top < h);

        // One aligned column per side, ordered top→bottom like the parts, never overlapping
        const solveColumn = (items: SensorItem[], isLeftFlank: boolean) => {
          if (items.length === 0) return;
          items.sort((a, b) => a.sy - b.sy);

          // Stack downward from each part's own height, no two rows closer than rowH
          const ys: number[] = [];
          items.forEach((it, i) => {
            const want = it.sy - PILL_H / 2;
            ys.push(i === 0 ? want : Math.max(want, ys[i - 1] + rowH));
          });
          // Re-centre the block on the parts it points at, then keep it on screen
          const meanWant = items.reduce((s, it) => s + it.sy - PILL_H / 2, 0) / items.length;
          const meanGot = ys.reduce((s, y) => s + y, 0) / ys.length;
          let shift = meanWant - meanGot;
          shift = Math.max(shift, minY - ys[0]);
          shift = Math.min(shift, maxY - ys[ys.length - 1]);
          const anchorX = isLeftFlank
            ? Math.max(170, Math.min(...items.map((it) => it.sx)) - colGap)
            : Math.min(w - 170, Math.max(...items.map((it) => it.sx)) + colGap);

          // Cards that cover this column's strip become no-go bands
          const colL = isLeftFlank ? anchorX - pillMaxW : anchorX;
          const colR = isLeftFlank ? anchorX : anchorX + pillMaxW;
          const blocks = cardRects
            .filter((r) => r.left < colR && r.right > colL)
            .map((r) => ({ top: r.top - 6, bottom: r.bottom + 6 }))
            .sort((a, b) => a.top - b.top);
          const hits = (y: number) => blocks.find((b) => y < b.bottom && y + PILL_H > b.top);

          const f = ys.map((y) => y + shift);
          if (blocks.length) {
            // Push rows down past any card, keeping order and spacing
            for (let i = 0; i < f.length; i++) {
              let y = i > 0 ? Math.max(f[i], f[i - 1] + rowH) : f[i];
              let b = hits(y);
              while (b) {
                y = b.bottom;
                b = hits(y);
              }
              f[i] = y;
            }
            // Ran off the bottom? Stack upward instead, above the cards
            if (f[f.length - 1] > maxY) {
              for (let i = f.length - 1; i >= 0; i--) {
                let y = i < f.length - 1 ? Math.min(f[i], f[i + 1] - rowH) : Math.min(f[i], maxY);
                let b = hits(y);
                while (b) {
                  y = b.top - PILL_H;
                  b = hits(y);
                }
                f[i] = Math.max(minY, y);
              }
            }
          }

          items.forEach((it, i) => {
            it.targetY = f[i];
            it.chipX = anchorX; // left column: pill's right edge; right column: pill's left edge
          });
        };

        solveColumn(leftItems, true);
        solveColumn(rightItems, false);

        const allVisible = [...leftItems, ...rightItems];
        const resolvedMap: Record<string, SensorItem> = {};
        allVisible.forEach((item) => {
          resolvedMap[item.key] = item;
        });

        // Render DOM dots, chips, and clean short SVG leader paths
        let svgPaths = '';
        SENSOR_LIST.forEach((s) => {
          const data = resolvedMap[s.key];
          const dotEl = sensorDotRefs.current[s.key];
          const chipEl = sensorChipRefs.current[s.key];

          if (!data || data.targetY === undefined || data.chipX === undefined) {
            if (dotEl) dotEl.style.display = 'none';
            if (chipEl) chipEl.style.display = 'none';
          } else {
            if (dotEl) {
              dotEl.style.display = 'block';
              dotEl.style.transform = `translate3d(${Math.round(data.sx - 3)}px, ${Math.round(data.sy - 3)}px, 0)`;
            }
            const ax = Math.round(data.chipX);
            const ty = Math.round(data.targetY);
            if (chipEl) {
              chipEl.style.display = 'block';
              // Left column is anchored by its right edge so all pills line up next to the jacket
              chipEl.style.transform = data.isLeft
                ? `translate3d(${ax}px, ${ty}px, 0) translateX(-100%)`
                : `translate3d(${ax}px, ${ty}px, 0)`;
            }

            // Leader: short straight stub out of the pill, then directly to the part
            const cy = ty + PILL_H / 2;
            const stubX = data.isLeft ? ax + 12 : ax - 12;
            svgPaths += `<path d="M ${ax} ${cy} L ${stubX} ${cy} L ${Math.round(data.sx)} ${Math.round(data.sy)}" stroke="#F59E0B" stroke-width="1.25" stroke-opacity="0.6" fill="none" stroke-linejoin="round" />`;
          }
        });

        if (sensorSvgRef.current) {
          sensorSvgRef.current.innerHTML = svgPaths;
        }
      } else {
        SENSOR_LIST.forEach((s) => {
          const dotEl = sensorDotRefs.current[s.key];
          const chipEl = sensorChipRefs.current[s.key];
          if (dotEl) dotEl.style.display = 'none';
          if (chipEl) chipEl.style.display = 'none';
        });
        if (sensorSvgRef.current) {
          sensorSvgRef.current.innerHTML = '';
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="three-stage-container"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* Active Broadcast Alarm HUD Annunciator */}
      {alarmLevel === 2 && (
        <div
          id="broadcast-alarm-overlay"
          className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-gradient-to-r from-[#DC2626] via-[#B91C1C] to-[#DC2626] text-white px-5 py-2 rounded-full shadow-[0_0_35px_rgba(220,38,38,0.85)] border-2 border-[#DC2626] flex items-center gap-3"
        >
          <span className="w-3 h-3 rounded-full bg-white shrink-0" />
          <span className="font-mono font-black text-xs sm:text-sm tracking-wider uppercase drop-shadow whitespace-nowrap">
            ALARM BROADCAST TO ALL JACKETS ACTIVE
          </span>
        </div>
      )}

      {/* Rebuilt Sensor Labels Overlay (Jacket Flanks & SVG Lines) */}
      <div
        ref={sensorOverlayRef}
        id="rebuilt-sensor-labels-overlay"
        style={{ display: 'none', opacity: 0 }}
        className="absolute inset-0 pointer-events-none z-20 select-none hidden min-[768px]:block"
      >
        {/* SVG Leader Lines Layer */}
        <svg
          ref={sensorSvgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Accent Dots on Jacket */}
        {SENSOR_LIST.map((s) => (
          <div
            key={`dot-${s.key}`}
            ref={(el) => {
              sensorDotRefs.current[s.key] = el;
            }}
            className="absolute pointer-events-none"
            style={{ display: 'none', top: 0, left: 0, willChange: 'transform' }}
          >
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] ring-2 ring-[#0F172A] shadow-[0_0_10px_#F59E0B] block" />
          </div>
        ))}

        {/* Flanking Component Chips Near Jacket */}
        {SENSOR_LIST.map((s) => (
          <div
            key={`chip-${s.key}`}
            id={`sensor-chip-${s.key}`}
            ref={(el) => {
              sensorChipRefs.current[s.key] = el;
            }}
            title={s.sub}
            className="group absolute bg-[#0D1117]/90 border border-[#F59E0B]/25 hover:border-[#F59E0B] backdrop-blur-md rounded-full px-3 shadow-lg pointer-events-auto transition-colors cursor-default"
            style={{ display: 'none', top: 0, left: 0, height: PILL_H, willChange: 'transform' }}
          >
            <span className="flex items-center gap-1.5 h-full whitespace-nowrap text-[11.5px] font-semibold text-white leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
              {s.name}
            </span>
            {/* Full spec on hover */}
            <span className="hidden group-hover:block absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#0F172A] border border-white/10 px-2 py-1 text-[10.5px] text-[#CBD5E1] shadow-xl z-10">
              {s.sub}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
