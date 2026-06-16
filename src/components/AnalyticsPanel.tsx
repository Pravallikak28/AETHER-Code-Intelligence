import React, { useState } from "react";
import { PredictiveAnalysis, Bottleneck, GrowthTrajectory } from "../types";
import { BarChart3, Clock, AlertTriangle, TrendingUp, Cpu, Flame, ShieldAlert, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface AnalyticsPanelProps {
  analytics?: PredictiveAnalysis;
}

export default function AnalyticsPanel({ analytics }: AnalyticsPanelProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center h-96 border border-white/5 rounded-2xl bg-white/[0.02] p-6 text-center">
        <BarChart3 className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" />
        <p className="text-zinc-400 font-medium font-sans">Analytics Stream Offline</p>
        <p className="text-zinc-650 text-xs mt-1">Please select an engineering preset or parse custom codebases to trigger latency forecasts.</p>
      </div>
    );
  }

  // Draw Dynamic SVG Spark Growth Trend graph
  const points = analytics.growthTrajectory || [];
  const svgWidth = 460;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  // Compute scale boundaries
  const maxVal = Math.max(...points.map(p => p.expectedComplexity), 10);
  const minVal = 0;

  const getCoordinates = () => {
    if (points.length === 0) return [];
    const stepX = (svgWidth - 2 * paddingX) / (points.length - 1 || 1);
    const rangeY = maxVal - minVal || 1;
    return points.map((p, idx) => {
      const x = paddingX + idx * stepX;
      // invert Y coordinate for SVG space
      const y = svgHeight - paddingY - ((p.expectedComplexity - minVal) / rangeY) * (svgHeight - 2 * paddingY);
      return { x, y, label: p.label, val: p.expectedComplexity };
    });
  };

  const coords = getCoordinates();
  const pathData = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  // Fill gradient path
  const areaPath = coords.length > 0 
    ? `${pathData} L${coords[coords.length - 1].x},${svgHeight - paddingY} L${coords[0].x},${svgHeight - paddingY} Z` 
    : "";

  const getTimelineColor = (timeline: string) => {
    const tl = timeline.toLowerCase();
    if (tl.includes("immediate") || tl.includes("now") || tl.includes("critical")) return "text-red-400 border-red-500/10 bg-red-500/10";
    if (tl.includes("months") || tl.includes("soon") || tl.includes("near")) return "text-amber-400 border-amber-500/10 bg-amber-500/10";
    return "text-indigo-400 border-indigo-500/10 bg-indigo-500/10";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="analytics-panel">
      
      {/* Dynamic Growth Trajectory Projection (col-span-7) */}
      <div className="lg:col-span-7 border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-md p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[9px] font-mono text-zinc-550 block">SIMULATED SCALING LOAD</span>
              <h3 className="text-sm font-semibold text-white">Expected System Complexity Trajectory</h3>
            </div>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/10 animate-pulse">
            LIVE PREDICTION ENGINE
          </span>
        </div>

        {/* SVG Sparkline Graph */}
        <div className="w-full h-[180px] my-4 relative flex items-center justify-center">
          {coords.length > 0 ? (
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.01" />
                </linearGradient>
                <linearGradient id="stroke-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>

              {/* Horizontal Help lines */}
              {[0.25, 0.5, 0.75].map((scale, i) => (
                <line
                  key={i}
                  x1={paddingX}
                  y1={paddingY + scale * (svgHeight - 2 * paddingY)}
                  x2={svgWidth - paddingX}
                  y2={paddingY + scale * (svgHeight - 2 * paddingY)}
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth="1"
                />
              ))}

              {/* Shaded Area */}
              <path d={areaPath} fill="url(#area-grad)" className="transition duration-500" />

              {/* Graph stroke path */}
              <path d={pathData} fill="none" stroke="url(#stroke-grad)" strokeWidth="2" className="transition duration-500" />

              {/* Dynamic Interactive Dot Nodes */}
              {coords.map((c, i) => (
                <g 
                  key={i}
                  onMouseEnter={() => setHoveredNode(i)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={hoveredNode === i ? 6 : 4}
                    fill={hoveredNode === i ? "#ffffff" : "#8b5cf6"}
                    className="transition-all duration-150"
                  />
                  {hoveredNode === i && (
                    <g>
                      {/* Hover stats tooltips */}
                      <rect
                        x={c.x - 36}
                        y={c.y - 30}
                        width="72"
                        height="20"
                        rx="4"
                        fill="#050816"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="0.5"
                      />
                      <text
                        x={c.x}
                        y={c.y - 17}
                        textAnchor="middle"
                        className="fill-white font-mono text-[8px] font-bold"
                      >
                        Comp: {c.val}
                      </text>
                    </g>
                  )}
                  {/* Bottom labels */}
                  <text
                    x={c.x}
                    y={svgHeight - 4}
                    textAnchor="middle"
                    className="fill-zinc-500 font-mono text-[7.5px]"
                  >
                    {c.label}
                  </text>
                </g>
              ))}
            </svg>
          ) : (
            <p className="text-zinc-650 text-xs italic">Constructing trajectory forecast model...</p>
          )}
        </div>

        <div className="flex justify-between items-center bg-zinc-950/40 border border-white/5 p-3 rounded-xl font-mono text-[9px] text-zinc-500 shrink-0">
          <span>COGNITIVE FORECAST VECTOR: EXPONENTIAL LOAD SCALING</span>
          <span>INTELLIGENCE CONFIDENCE: 94%</span>
        </div>
      </div>

      {/* Resource Constraints & Bottlenecks (col-span-5) */}
      <div className="lg:col-span-5 border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-md p-5 flex flex-col h-[360px] overflow-hidden justify-between">
        <div className="shrink-0">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Flame className="w-4 h-4 text-red-400 animate-pulse" />
            <div>
              <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest block font-bold">Active Hotspots</span>
              <h3 className="text-sm font-semibold text-white">Decoupling & Bottleneck Indexes</h3>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 scrollbar-thin">
          {analytics.bottlenecks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <ShieldAlert className="w-8 h-8 text-semibold text-emerald-400/80 mb-2" />
              <p className="text-xs text-zinc-500 italic font-sans">No persistent constraints identified.</p>
            </div>
          ) : (
            analytics.bottlenecks.map((btn, idx) => (
              <div
                key={idx}
                className="border border-white/5 bg-zinc-950/30 p-3 rounded-xl transition hover:border-white/10 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                    <h4 className="text-xs font-semibold text-white leading-relaxed">{btn.resource}</h4>
                  </div>
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${getTimelineColor(btn.timeline)}`}>
                    {btn.timeline}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-500 leading-normal">
                  <div>
                    <span className="text-[8.5px] font-bold block text-zinc-550 uppercase">LIKELIHOOD INDEX:</span>
                    <span className="text-zinc-200">{btn.likelihood}</span>
                  </div>
                  <div>
                    <span className="text-[8.5px] font-bold block text-zinc-550 uppercase">SCALING IMPACT:</span>
                    <span className="text-zinc-300">{btn.impact}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center space-x-2 text-[9.5px] font-mono text-zinc-500 shrink-0 border-t border-white/5 pt-3.5">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Real-time simulations compiled per 10k RPS.</span>
        </div>
      </div>

    </div>
  );
}
