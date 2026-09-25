'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  enableTilt?: boolean;
}

export function Card3D({
  children,
  className = '',
  onClick,
  style = {},
  enableTilt = true,
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  // Raw cursor position relative to card center (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for rotation
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 });

  // Rotate up to 8 degrees
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  // Dynamic light glare position
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isTouchDevice || !enableTilt) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  if (isTouchDevice || !enableTilt) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`relative bg-white border border-[var(--border)] rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-3d)] transition-shadow duration-200 ${className}`}
        style={style}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      style={{ perspective: 1000 }}
      className="h-full w-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          ...style,
        }}
        animate={{
          y: isHovered ? -6 : 0,
          boxShadow: isHovered
            ? '0 1px 0 rgba(255,255,255,0.9) inset, 0 22px 40px -12px rgba(120, 72, 10, 0.28), 0 4px 10px rgba(0,0,0,0.06)'
            : '0 1px 0 rgba(255,255,255,0.8) inset, 0 10px 24px -8px rgba(120, 72, 10, 0.18), 0 2px 6px rgba(0,0,0,0.05)',
        }}
        transition={{ duration: 0.2 }}
        className={`relative bg-white border border-[var(--border)] rounded-[var(--radius-card)] p-5 cursor-pointer select-none overflow-hidden ${className}`}
      >
        {/* Dynamic Glare Overlay */}
        {isHovered && (
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-[var(--radius-card)] opacity-40 transition-opacity duration-300 z-10"
            style={{
              background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 60%)`,
            }}
          />
        )}
        <div style={{ transform: 'translateZ(20px)' }}>{children}</div>
      </motion.div>
    </div>
  );
}

export default Card3D;
