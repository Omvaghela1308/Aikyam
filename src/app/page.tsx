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
    <div className="relative min-h-screen overflow-x-hidden select-none bg-[#0F172A] text-white font-sans selection:bg-[#D97706] selection:text-white">
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
        className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-5 py-3.5 border-b bg-[#0F172A]/80 border-white/10 backdrop-blur-md"
      >
        <span className="text-base font-bold tracking-[0.2em] uppercase flex items-center gap-1 text-white">
          MINE<b className="text-[#F59E0B]">GUARD</b>
        </span>
        <Link
          href="/login"
          id="top-signin-btn"
          className="border border-[#D97706] bg-[#D97706] text-white hover:bg-[#B45309] text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
        >
          Register
        </Link>
      </header>

      {/* Depth indicator */}
      <aside
        id="depth-indicator"
        aria-hidden="true"
        className="fixed left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-3 text-xs font-medium text-[#94A3B8] select-none pointer-events-none"
        style={{ writingMode: 'vertical-rl' }}
      >
        <span>
          Level <b className="text-[#F59E0B] font-semibold">−{depthMeters} m</b>
        </span>
        <div className="w-[2px] h-28 bg-white/15 relative rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full bg-[#F59E0B] transition-all duration-100"
            style={{ height: `${(scrollProgress * 100).toFixed(1)}%` }}
          />
        </div>
      </aside>

      {/* Scroll cue */}
      <div
        id="scroll-cue"
        className={`fixed left-1/2 -translate-x-1/2 bottom-6 z-20 flex flex-col items-center gap-1.5 pointer-events-none transition-all duration-500 ${hasScrolled || scrollProgress > 0.02 ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
          }`}
      >
        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#CBD5E1]">
          Scroll into the drift
        </span>
        <ChevronDown className="w-5 h-5 text-[#F59E0B]" />
      </div>

      {/* Scrollytelling cards */}
      <main id="landing" className="relative z-10">
        {/* Act 1: Intro / Card 1 */}
        <section className="min-h-screen flex items-center px-5 sm:px-12 md:pl-16 lg:pl-20 py-24">
          <div className="w-full max-w-lg">
            <div data-scrolly-card className="relative bg-[#0D1117]/80 border border-[#F59E0B]/15 p-6 sm:p-8 backdrop-blur-md rounded-2xl shadow-2xl">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#F59E0B] mb-2">
                Smart Safety System
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white">
                Smart Underground Safety Jacket
              </h1>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-3 leading-relaxed">
                Keeping miners safe with real-time health tracking, hazard detection, and instant location monitoring - all built into one wearable jacket.
              </p>
            </div>
          </div>
        </section>

        {/* Act 2: Working Face */}
        <section className="min-h-[52vh] flex items-center justify-end px-5 sm:px-12 md:pr-16 lg:pr-20 py-8 sm:py-10">
          <div className="w-full max-w-md">
            <div data-scrolly-card className="relative bg-[#0D1117]/80 border border-[#F59E0B]/15 p-5 sm:p-6 backdrop-blur-md rounded-2xl shadow-2xl">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#F59E0B] mb-2">
                Hazard Detection
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold leading-snug tracking-tight text-white">
                Environmental Monitoring
              </h2>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-2 leading-relaxed">
                Detects dangerous gases, dust, radiation, and extreme heat around the miner in real time — so threats are spotted before they become emergencies.
              </p>
            </div>
          </div>
        </section>

        {/* Act 3: Wearable Jacket */}
        <section className="min-h-[52vh] flex items-center px-5 sm:px-12 md:pl-16 lg:pl-20 py-8 sm:py-10">
          <div className="w-full max-w-md">
            <div data-scrolly-card className="relative bg-[#0D1117]/80 border border-[#F59E0B]/15 p-5 sm:p-6 backdrop-blur-md rounded-2xl shadow-2xl">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#F59E0B] mb-2">
                Smart Wearable
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold leading-snug tracking-tight text-white">
                The Safety Jacket
              </h2>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-2 leading-relaxed">
                Packed with smart sensors that continuously check the miner&apos;s health and surroundings. All data is sent live to the control room for instant action.
              </p>
            </div>
          </div>
        </section>

        {/* Act 4: Back & Positioning */}
        <section className="min-h-[52vh] flex items-center justify-end px-5 sm:px-12 md:pr-16 lg:pr-20 py-8 sm:py-10">
          <div className="w-full max-w-md">
            <div data-scrolly-card className="relative bg-[#0D1117]/80 border border-[#F59E0B]/15 p-5 sm:p-6 backdrop-blur-md rounded-2xl shadow-2xl">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#F59E0B] mb-2">
                Location & Cooling
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold leading-snug tracking-tight text-white">
                UWB Tracking & Cooling System
              </h2>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-2 leading-relaxed">
                Pinpoints each miner&apos;s exact underground position using UWB technology. Built-in cooling pads keep body temperature in check during long, hot shifts.
              </p>
            </div>
          </div>
        </section>

        {/* Act 5: Chest Sensors & SOS */}
        <section className="min-h-[52vh] flex items-center px-5 sm:px-12 md:pl-16 lg:pl-20 py-8 sm:py-10">
          <div className="w-full max-w-md">
            <div data-scrolly-card className="relative bg-[#0D1117]/80 border border-[#F59E0B]/15 p-5 sm:p-6 backdrop-blur-md rounded-2xl shadow-2xl">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#F59E0B] mb-2">
                Emergency & Health
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold leading-snug tracking-tight text-white">
                SOS Button & Vital Signs
              </h2>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-2 leading-relaxed">
                One-press SOS button sends an instant distress alert with the miner&apos;s location. Heart rate and SpO2 sensors track vitals continuously so the control room can act fast if something goes wrong.
              </p>
            </div>
          </div>
        </section>

        {/* Act 6: Call to Action */}
        <section className="min-h-[52vh] flex items-center justify-center px-5 sm:px-12 py-8 sm:py-10">
          <div className="w-full max-w-md">
            <div data-scrolly-card className="relative bg-[#0D1117]/80 border border-[#F59E0B]/15 p-6 sm:p-7 text-center backdrop-blur-md rounded-2xl shadow-2xl">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#F59E0B] mb-2">
                Control Room
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Login to Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-2 leading-relaxed">
                Sign in to monitor worker safety, live locations, health data, and hazard alerts in real time.
              </p>

              <div className="mt-5 flex justify-center">
                <Link
                  href="/login"
                  id="open-control-room-btn"
                  className="border border-[#D97706] bg-[#D97706] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg cursor-pointer hover:bg-[#B45309] transition-colors flex items-center gap-2"
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
