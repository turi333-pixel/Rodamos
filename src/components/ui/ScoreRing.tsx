"use client";
import { useEffect, useRef } from "react";
import { scoreToColor, scoreToLabel } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  animated?: boolean;
  className?: string;
}

export function ScoreRing({
  score,
  size = 160,
  strokeWidth = 8,
  label,
  animated = true,
  className = "",
}: ScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = scoreToColor(score);
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    if (!animated || !circleRef.current) return;
    circleRef.current.style.strokeDashoffset = String(circumference);
    requestAnimationFrame(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.32,0.72,0,1)";
        circleRef.current.style.strokeDashoffset = String(offset);
      }
    });
  }, [score, circumference, offset, animated]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : offset}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-zinc-400 mt-0.5">/ 100</span>
        {label && (
          <span className="text-xs font-medium text-zinc-300 mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}
