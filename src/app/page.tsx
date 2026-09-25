'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { ThreeStage } from '@/components/landing/ThreeStage';

// Public 3D landing page; the Register/Login buttons lead into the dashboard's /login
export default function LandingPage() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll position drives the 3D tunnel camera and the depth readout
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / totalScroll)));
      }
      if (window.scrollY > 40) setHasScrolled(true);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const depthMeters = Math.round(140 + scrollProgress * 880);

  return (
    <div className="relative min-h-screen overflow-x-hidden select-none bg-[#0F0D0B] text-white font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 3D WebGL tunnel */}
      <ThreeStage
        scrollProg={scrollProgress}
        inApp={false}
        studioTabActive={false}
        studioView="front"
        alarmLevel={0}
        linked={true}
      />

      {/* Top bar */}
      <header
        id="topbar"
        className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-5 sm:px-8 py-4 border-b bg-slate-950/90 border-amber-500/20 backdrop-blur-md shadow-lg"
      >
        <span className="text-lg font-black tracking-[0.25em] uppercase flex items-center gap-1 text-white">
          MINE<b className="text-amber-400">GUARD</b>
        </span>
        <Link
          href="/login"
          id="top-signin-btn"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all transform hover:scale-105 shadow-md shadow-amber-500/20"
        >
          Register
        </Link>
      </header>

      {/* Depth indicator */}
      <aside
        id="depth-indicator"
        aria-hidden="true"
        className="fixed left-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-3 text-xs font-bold text-amber-400 select-none pointer-events-none drop-shadow-md"
        style={{ writingMode: 'vertical-rl' }}
      >
        <span className="text-slate-200 tracking-wider">
          Level <b className="text-amber-400 font-black">−{depthMeters} m</b>
        </span>
        <div className="w-[3px] h-32 bg-slate-800/80 border border-amber-500/30 relative rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full bg-amber-400 transition-all duration-100 shadow-[0_0_10px_#f59e0b]"
            style={{ height: `${(scrollProgress * 100).toFixed(1)}%` }}
          />
        </div>
      </aside>

      {/* Scroll cue */}
      <div
        id="scroll-cue"
        className={`fixed left-1/2 -translate-x-1/2 bottom-6 z-20 flex flex-col items-center gap-1.5 pointer-events-none transition-all duration-500 ${
          hasScrolled || scrollProgress > 0.02 ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
        }`}
      >
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-200 drop-shadow-md">
          Scroll into the drift
        </span>
        <ChevronDown className="w-5 h-5 text-amber-400 animate-bounce" />
      </div>

      {/* Scrollytelling cards */}
      <main id="landing" className="relative z-10">
        {/* Act 1: Intro / Card 1 */}
        <section className="min-h-screen flex items-center px-5 sm:px-12 md:pl-16 lg:pl-20 py-24">
          <div className="w-full max-w-lg">
            <div data-scrolly-card className="relative bg-slate-950/85 border border-amber-500/40 p-6 sm:p-8 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/80">
              <p className="text-xs font-extrabold tracking-[0.18em] uppercase text-amber-400 mb-2">
                Smart Safety System
              </p>
              <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
                Smart Underground Safety Jacket
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-3 leading-relaxed font-normal">
                Keeping miners safe with real-time health tracking, hazard detection, and instant location monitoring - all built into one wearable jacket.
              </p>
            </div>
          </div>
        </section>

        {/* Act 2: Working Face */}
        <section className="min-h-[52vh] flex items-center justify-end px-5 sm:px-12 md:pr-16 lg:pr-20 py-8 sm:py-10">
          <div className="w-full max-w-md">
            <div data-scrolly-card className="relative bg-slate-950/85 border border-amber-500/40 p-6 sm:p-7 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/80">
              <p className="text-xs font-extrabold tracking-[0.18em] uppercase text-amber-400 mb-2">
                Hazard Detection
              </p>
              <h2 className="text-xl sm:text-2xl font-black leading-snug tracking-tight text-white drop-shadow-sm">
                Environmental Monitoring
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed font-normal">
                Detects dangerous gases, dust, radiation, and extreme heat around the miner in real time — so threats are spotted before they become emergencies.
              </p>
            </div>
          </div>
        </section>

        {/* Act 3: Wearable Jacket */}
        <section className="min-h-[52vh] flex items-center px-5 sm:px-12 md:pl-16 lg:pl-20 py-8 sm:py-10">
          <div className="w-full max-w-md">
            <div data-scrolly-card className="relative bg-slate-950/85 border border-amber-500/40 p-6 sm:p-7 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/80">
              <p className="text-xs font-extrabold tracking-[0.18em] uppercase text-amber-400 mb-2">
                Smart Wearable
              </p>
              <h2 className="text-xl sm:text-2xl font-black leading-snug tracking-tight text-white drop-shadow-sm">
                The Safety Jacket
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed font-normal">
                Packed with smart sensors that continuously check the miner&apos;s health and surroundings. All data is sent live to the control room for instant action.
              </p>
            </div>
          </div>
        </section>

        {/* Act 4: Back & Positioning */}
        <section className="min-h-[52vh] flex items-center justify-end px-5 sm:px-12 md:pr-16 lg:pr-20 py-8 sm:py-10">
          <div className="w-full max-w-md">
            <div data-scrolly-card className="relative bg-slate-950/85 border border-amber-500/40 p-6 sm:p-7 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/80">
              <p className="text-xs font-extrabold tracking-[0.18em] uppercase text-amber-400 mb-2">
                Location & Cooling
              </p>
              <h2 className="text-xl sm:text-2xl font-black leading-snug tracking-tight text-white drop-shadow-sm">
                UWB Tracking & Cooling System
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed font-normal">
                Pinpoints each miner&apos;s exact underground position using UWB technology. Built-in cooling pads keep body temperature in check during long, hot shifts.
              </p>
            </div>
          </div>
        </section>

        {/* Act 5: Chest Sensors & SOS */}
        <section className="min-h-[52vh] flex items-center px-5 sm:px-12 md:pl-16 lg:pl-20 py-8 sm:py-10">
          <div className="w-full max-w-md">
            <div data-scrolly-card className="relative bg-slate-950/85 border border-amber-500/40 p-6 sm:p-7 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/80">
              <p className="text-xs font-extrabold tracking-[0.18em] uppercase text-amber-400 mb-2">
                Emergency & Health
              </p>
              <h2 className="text-xl sm:text-2xl font-black leading-snug tracking-tight text-white drop-shadow-sm">
                SOS Button & Vital Signs
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed font-normal">
                One-press SOS button sends an instant distress alert with the miner&apos;s location. Heart rate and SpO2 sensors track vitals continuously so the control room can act fast if something goes wrong.
              </p>
            </div>
          </div>
        </section>

        {/* Act 6: Call to Action */}
        <section className="min-h-[52vh] flex items-center justify-center px-5 sm:px-12 py-8 sm:py-10">
          <div className="w-full max-w-md">
            <div data-scrolly-card className="relative bg-slate-950/85 border border-amber-500/40 p-7 sm:p-8 text-center backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/80">
              <p className="text-xs font-extrabold tracking-[0.18em] uppercase text-amber-400 mb-2">
                Control Room
              </p>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
                Login to Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed font-normal">
                Sign in to monitor worker safety, live locations, health data, and hazard alerts in real time.
              </p>

              <div className="mt-6 flex justify-center">
                <Link
                  href="/login"
                  id="open-control-room-btn"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs sm:text-sm font-extrabold px-6 py-3 rounded-xl cursor-pointer transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-amber-500/25"
                >
                  Login <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

