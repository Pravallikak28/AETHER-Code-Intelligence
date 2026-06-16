import React, { useState } from "react";
import { ArchitectureRatings, Risk } from "../types";
import { ShieldCheck, Target, AlertCircle, Sparkles, HelpCircle, Hammer, DollarSign } from "lucide-react";
import { motion } from "motion/react";

interface TechDebtRadarProps {
  ratings?: ArchitectureRatings;
  risks?: Risk[];
}

export default function TechDebtRadar({ ratings, risks = [] }: TechDebtRadarProps) {
  const [hoveredAxis, setHoveredAxis] = useState<number | null>(null);

  // Compute baseline score dimensions or fallbacks
  const dataPoints = [
    {
      category: "Security",
      score: ratings ? ratings.security * 20 : 75,
      estimatedCost: "$1,200",
      priority: "CRITICAL",
      issue: "Stateful token stores are vulnerable to token leakage on clustering.",
      fix: "Implement Redis state replication or change authentication to stateless asymmetric JWT verification."
    },
    {
      category: "Complexity",
      score: ratings ? (5 - ((ratings.maintainability + ratings.performance) / 2)) * 20 : 60,
      estimatedCost: "$3,400",
      priority: "HIGH",
      issue: "High static modules coupling in transactional service layers.",
      fix: "Abstract communication interfaces behind pub-sub event buffers."
    },
    {
      category: "Documentation",
      score: ratings ? ratings.maintainability * 16 : 50,
      estimatedCost: "$800",
      priority: "LOW",
      issue: "Missing API contract constraints on payment transaction channels.",
      fix: "Utilize strict JSON Schema validation and auto-generate Swagger models on build cycles."
    },
    {
      category: "Testing",
      score: ratings ? (ratings.security + ratings.performance) / 2 * 17 : 65,
      estimatedCost: "$2,200",
      priority: "MEDIUM",
      issue: "Zero integration testing coverage detected for failover database replicas.",
      fix: "Establish localized Docker Testcontainers validating read/write master replica failovers."
    },
    {
      category: "Coupling",
      score: ratings ? (5 - ratings.scalability) * 20 : 70,
      estimatedCost: "$4,500",
      priority: "CRITICAL",
      issue: "Billing layers are strictly bound to transactional stateful databases.",
      fix: "Extract billing records logic into an isolated domain event logger cluster."
    },
    {
      category: "Scalability",
      score: ratings ? ratings.scalability * 20 : 80,
      estimatedCost: "$1,505",
      priority: "HIGH",
      issue: "Horizontal scale bottlenecks in shared-memory locks.",
      fix: "Replace state memory locks with distributed Redis Redlock models."
    },
    {
      category: "Performance",
      score: ratings ? ratings.performance * 20 : 85,
      estimatedCost: "$2,900",
      priority: "MEDIUM",
      issue: "Direct file indexing slows down memory-mapped caches.",
      fix: "Migrate flat indexes to memory-mapped database rows using B-trees."
    }
  ];

  // SVG Radar Dimensions
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 110;
  const axisCount = dataPoints.length;

  // Compute standard radar polygon paths
  const getRadarPath = (isGrid: boolean, gridLevel = 1.0) => {
    const points = dataPoints.map((dp, i) => {
      const angle = (i * 2 * Math.PI) / axisCount - Math.PI / 2;
      const currentRadius = isGrid ? radius * gridLevel : radius * (dp.score / 100);
      const x = cx + currentRadius * Math.cos(angle);
      const y = cy + currentRadius * Math.sin(angle);
      return `${x},${y}`;
    });
    return points.join(" ");
  };

  const getHeatColor = (score: number) => {
    if (score >= 75) return "text-red-400 border-red-500/20 bg-red-950/20";
    if (score >= 55) return "text-amber-400 border-amber-500/20 bg-amber-950/20";
    return "text-emerald-400 border-emerald-500/20 bg-emerald-950/20";
  };

  const activeHoverData = hoveredAxis !== null ? dataPoints[hoveredAxis] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="tech-debt-radar-panel">
      
      {/* Interactive SVG Radar (col-span-5) */}
      <div className="lg:col-span-5 border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-md p-5 flex flex-col items-center justify-center relative">
        <div className="absolute top-4 left-4">
          <span className="text-[9px] font-mono text-zinc-550 block">STELLAR SCANNER TYPE-01</span>
          <h4 className="text-xs font-semibold text-white mt-1">Multi-vector Risk Mesh</h4>
        </div>

        {/* Radar Diagram */}
        <div className="w-full max-w-[340px] flex justify-center items-center py-6 mt-4">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
            {/* Defs glow */}
            <defs>
              <linearGradient id="primary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.45" />
              </linearGradient>
            </defs>

            {/* Grid web rings */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((step, idx) => (
              <polygon
                key={idx}
                points={getRadarPath(true, step)}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
            ))}

            {/* Angular axes beams */}
            {dataPoints.map((_, i) => {
              const angle = (i * 2 * Math.PI) / axisCount - Math.PI / 2;
              const x2 = cx + radius * Math.cos(angle);
              const y2 = cy + radius * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth="1"
                  strokeDasharray="2, 2"
                />
              );
            })}

            {/* Actual scoring polygon overlay */}
            <polygon
              points={getRadarPath(false)}
              fill="url(#primary-grad)"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
              className="transition duration-500"
            />

            {/* Interactive vertices representing the parameters */}
            {dataPoints.map((dp, i) => {
              const angle = (i * 2 * Math.PI) / axisCount - Math.PI / 2;
              const currentRadius = radius * (dp.score / 100);
              const x = cx + currentRadius * Math.cos(angle);
              const y = cy + currentRadius * Math.sin(angle);
              const labelX = cx + (radius * 1.25) * Math.cos(angle);
              const labelY = cy + (radius * 1.2) * Math.sin(angle);

              return (
                <g 
                  key={i}
                  onMouseEnter={() => setHoveredAxis(i)}
                  onMouseLeave={() => setHoveredAxis(null)}
                  className="cursor-pointer"
                >
                  {/* Glowing halo node */}
                  <circle
                    cx={x}
                    cy={y}
                    r={hoveredAxis === i ? 7 : 4}
                    fill={dp.score >= 75 ? "#ef4444" : dp.score >= 55 ? "#f59e0b" : "#10b981"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all duration-250 animate-pulse"
                  />
                  {/* Labels text */}
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className="fill-zinc-400 font-sans text-[8.5px] font-medium"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                  >
                    {dp.category}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="text-[10px] text-zinc-550 font-mono text-center">
          ● Hover vertices to compile audit remediation pathways
        </div>
      </div>

      {/* Recommended fix details display (col-span-7) */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        
        {activeHoverData ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-white/10 rounded-2xl bg-white/[0.02] p-5 flex-1 flex flex-col justify-between"
            id="remediation-console"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
                    <Target className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[9px] font-mono text-zinc-550 block uppercase">REMEDIATION DESK</span>
                    <h3 className="text-sm font-semibold text-white">{activeHoverData.category} Dimension</h3>
                  </div>
                </div>
                
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${getHeatColor(activeHoverData.score)}`}>
                  {activeHoverData.score}% Structural Debt
                </span>
              </div>

              <div className="space-y-4 py-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    Detected Architectural Friction:
                  </span>
                  <p className="text-xs text-white leading-relaxed font-sans">{activeHoverData.issue}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                    <Hammer className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    Specialist Structural Fix Suggestion:
                  </span>
                  <p className="text-xs text-zinc-350 leading-relaxed font-sans bg-zinc-950/60 p-3.5 rounded-xl border border-white/5">
                    {activeHoverData.fix}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-zinc-950/50 p-3 rounded-xl border border-white/5 mt-4 shrink-0 font-mono text-[10px]">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-500">ESTIMATED REMEDIATION COST:</span>
                <span className="text-white font-semibold">{activeHoverData.estimatedCost}</span>
              </div>
              <div>
                <span className="text-zinc-550 shrink-0">PRIORITY:</span>
                <span className={`ml-1.5 font-bold ${
                  activeHoverData.priority === "CRITICAL" ? "text-red-400" :
                  activeHoverData.priority === "HIGH" ? "text-orange-400" : "text-zinc-400"
                }`}>{activeHoverData.priority}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="border border-white/10 rounded-2xl bg-white/[0.01] p-6 flex flex-col items-center justify-center text-center h-full text-zinc-550 italic space-y-2">
            <Sparkles className="w-8 h-8 text-zinc-700 animate-pulse" />
            <div className="max-w-md">
              <p className="text-xs text-zinc-400 font-medium">Interactive Technical Debt Remediation Suite</p>
              <p className="text-[11px] text-zinc-600 mt-1 leading-normal">
                Hover any vertex metric dot on the multi-vector Risk Mesh to map specific architectural dysfunctions, estimated refactor cost, priority scoring, and recommended mitigation actions.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
