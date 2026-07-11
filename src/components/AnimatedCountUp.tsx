import { useEffect, useState, useRef } from 'react';

interface AnimatedCountUpProps {
  value: number;
  duration?: number; // duration in ms
  formatter?: (val: number) => string;
}

export function AnimatedCountUp({ value, duration = 1000, formatter }: AnimatedCountUpProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const valueRef = useRef(value);
  const displayValueRef = useRef(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValueRef.current;
    const endValue = value;
    
    // Update ref for current target
    valueRef.current = value;

    if (startValue === endValue) return;

    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth Expo ease-out curve
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentVal = startValue + (endValue - startValue) * easedProgress;
      displayValueRef.current = currentVal;
      setDisplayValue(currentVal);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {formatter ? formatter(displayValue) : Math.round(displayValue)}
    </span>
  );
}
