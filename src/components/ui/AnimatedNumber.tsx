'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
}: AnimatedNumberProps) {
  const springValue = useSpring(0, {
    stiffness: 80,
    damping: 20,
  });

  const [displayValue, setDisplayValue] = useState<string>(
    `${prefix}${value.toFixed(decimals)}${suffix}`
  );

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(`${prefix}${latest.toFixed(decimals)}${suffix}`);
    });
    return () => unsubscribe();
  }, [springValue, decimals, prefix, suffix]);

  return (
    <span className={`font-mono tabular-nums inline-block ${className}`}>
      {displayValue}
    </span>
  );
}

export default AnimatedNumber;
