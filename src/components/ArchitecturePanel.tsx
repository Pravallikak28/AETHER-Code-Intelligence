import React from "react";
import { ArchitectureRatings } from "../types";
import { Server, Shield, Hammer, Gauge, Info, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface ArchitecturePanelProps {
  ratings?: ArchitectureRatings;
}

export default function ArchitecturePanel({ ratings }: ArchitecturePanelProps) {
  if (!ratings) {
    return (
      <div className="flex flex-col items-center justify-center h-96 border border-zinc-800 rounded-xl bg-zinc-950 p-6 text-center">
        <Server className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" />
        <p className="text-zinc-400 font-medium">No system architecture data compiled.</p>
        <p className="text-zinc-600 text-xs mt-1">Select a template or parse custom codebase files to map architecture intelligence metrics.</p>
      </div>
    );
  }

  const items = [
    {
      key: "scalability",
      label: "Scalability Intelligence",
      score: ratings.scalability,
      details: ratings.scalabilityDetails,
      icon: TrendingUp,
      color: "from-cyan-500 to-blue-500",
      textColor: "text-cyan-400"
    },
    {
      key: "security",
      label: "Security Posture",
      score: ratings.security,
      details: ratings.securityDetails,
      icon: Shield,
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400"
    },
    {
      key: "maintainability",
      label: "Architectural Cleanliness",
      score: ratings.maintainability,
      details: ratings.maintainabilityDetails,
      icon: Hammer,
      color: "from-purple-500 to-indigo-500",
      textColor: "text-purple-400"
    },
    {
      key: "performance",
      label: "Performance Efficiency",
      score: ratings.performance,
      details: ratings.performanceDetails,
      icon: Gauge,
      color: "from-orange-500 to-amber-500",
      textColor: "text-orange-400"
    }
  ];

  const averageScore = Number(
    ((ratings.scalability + ratings.security + ratings.maintainability + ratings.performance) / 4).toFixed(1)
  );

  return (
    <div className="space-y-6" id="architecture-panel">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-zinc-800 rounded-xl bg-zinc-950/70 p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">System Architectural Vital</span>
            <h3 className="text-3xl font-sans font-semibold tracking-tight text-white mt-1">
              {averageScore} <span className="text-sm font-normal text-zinc-500">/ 5.0</span>
            </h3>
          </div>
          <div className="mt-4 flex items-center space-x-2 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Grade: {averageScore >= 4.0 ? "Core Grade A (Scale-Ready)" : averageScore >= 3.0 ? "Core Grade B (Functional)" : "Core Grade C (Debt-Heavy)"}</span>
          </div>
        </div>

        <div className="border border-zinc-800 rounded-xl bg-zinc-950/70 p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Dominant Constraints</span>
            <p className="text-white font-medium mt-1.5 text-sm leading-relaxed">
              {ratings.scalability < 4 ? "Stateful synchronization overhead limits horizontal scale-outs." : "Stateless Gateway facilitates linear horizontal scaling."}
            </p>
          </div>
          <div className="mt-4 text-xs text-zinc-500 font-mono">
            BOUNDED_BY: {ratings.performance >= 4 ? "NETWORK_LATENCY" : "DATABASE_LOCKS"}
          </div>
        </div>

        <div className="border border-zinc-800 rounded-xl bg-zinc-950/70 p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Strategic Recommendations</span>
            <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
              {ratings.maintainability < 4 
                ? "Extract tightly coupled database queries into isolated domain adapters or bounded micro-repositories."
                : "Introduce bi-temporal database logs and Kafka event replication for cold disaster-recovery clusters."}
            </p>
          </div>
          <p className="text-xs text-indigo-400 font-mono mt-3">Ready for CTO audit</p>
        </div>
      </div>

      {/* Metrics Loop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 space-y-4 hover:border-zinc-700 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-zinc-900 border border-zinc-800 ${item.textColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{item.label}</h4>
                    <span className="text-xs text-zinc-500 font-mono">DIMENSION: {item.key.toUpperCase()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-mono font-semibold text-white">{item.score}</span>
                  <span className="text-xs text-zinc-500"> / 5</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.score / 5) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                />
              </div>

              {/* Detailed Intelligence Text */}
              <div className="flex items-start space-x-2 bg-zinc-950/80 border border-zinc-900 p-3 rounded-lg">
                <Info className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                <p className="text-xs text-zinc-400 leading-relaxed">{item.details}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
