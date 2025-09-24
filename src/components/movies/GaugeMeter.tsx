"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GaugeLevel {
  name: string;
  color: string; // e.g., "stroke-green-500"
}

interface GaugeMeterProps {
  label: string;
  value: number; // Current value
  min?: number;
  max?: number;
  levels: GaugeLevel[];
  className?: string;
}

// Function to describe an SVG arc
const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

// Function to convert polar coordinates to cartesian
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

export default function GaugeMeter({
  label,
  value,
  min = 0,
  max = 100,
  levels,
  className,
}: GaugeMeterProps) {
  const svgSize = 100;
  const strokeWidth = 8;
  const center = svgSize / 2;
  const radius = center - strokeWidth;
  const startAngle = -90; // Start from the bottom left
  const endAngle = 90; // End at the bottom right
  const angleRange = endAngle - startAngle;

  // Clamp value to be within min/max
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);
  const needleAngle = startAngle + percentage * angleRange;

  const levelCount = levels.length;
  const anglePerLevel = angleRange / levelCount;

  return (
    <div
      className={cn("flex flex-col items-center gap-2 text-center", className)}
    >
      <h3 className="text-xl font-headline font-semibold text-foreground">
        {label}
      </h3>
      <div className="relative w-[150px] md:w-[200px]  h-[120px]">
        <svg
          viewBox={`0 0 ${svgSize} ${svgSize / 2 + 10}`}
          className="w-full h-full"
        >
          {/* Background Track */}
          <path
            d={describeArc(center, center, radius, startAngle, endAngle)}
            fill="none"
            className="stroke-muted"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Colored Level Segments */}
          {levels.map((level, index) => {
            const levelStartAngle = startAngle + index * anglePerLevel;
            const levelEndAngle = levelStartAngle + anglePerLevel;
            return (
              <path
                key={level.name}
                d={describeArc(
                  center,
                  center,
                  radius,
                  levelStartAngle,
                  levelEndAngle
                )}
                fill="none"
                className={cn(level.color)}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            );
          })}

          {/* Needle */}
          <g transform={`rotate(${needleAngle} ${center} ${center})`}>
            <polygon
              points={`${center},${center - 5} ${center + 5},${center + 10} ${
                center - 5
              },${center + 10}`}
              className="fill-destructive"
            />
            <line
              x1={center}
              y1={center}
              x2={center}
              y2={strokeWidth - 5}
              className="stroke-destructive"
              strokeWidth="2"
            />
            <circle
              cx={center}
              cy={center}
              r="6"
              className="fill-background stroke-destructive"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
