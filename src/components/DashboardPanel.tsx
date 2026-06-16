import React, { useState, useEffect } from "react";
import { AnalysisResult } from "../types";
import { 
  Activity, Shield, Cpu, Layers, AlertCircle, Sparkle, 
  ArrowRight, Radio, BellRing, CheckSquare, Zap, BarChart3, 
  Workflow, Terminal, Play, RotateCcw, TrendingUp, Calendar
} from "lucide-react";
import { motion } from "motion/react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from "recharts";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const SreCustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#02040a]/95 border border-white/10 rounded-xl p-3 shadow-2xl font-sans" id="sre-custom-recharts-tooltip">
        <p className="text-[10px] uppercase font-bold text-zinc-550 mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-zinc-450 font-normal capitalize">{entry.name}:</span>
              <span className="text-white font-mono font-bold">
                {entry.value}
                {entry.name === "Tech Debt" ? "%" : " / 5.0"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface DashboardPanelProps {
  analysis: AnalysisResult;
  setActiveTab: (tab: any) => void;
  systemName: string;
}

export default function DashboardPanel({ analysis, setActiveTab, systemName }: DashboardPanelProps) {
  // Live simulated metric ticks to show active integrity monitoring
  const [liveCpu, setLiveCpu] = useState(41.4);
  const [liveRps, setLiveRps] = useState(10480);
  const [liveLatency, setLiveLatency] = useState(18.2);
  const [liveLocks, setLiveLocks] = useState(2);
  const [lastCheck, setLastCheck] = useState<string>("");

  // Recharts states for historical trends
  const [timeframe, setTimeframe] = useState<"30d" | "90d" | "180d">("180d");
  const [metricView, setMetricView] = useState<"combined" | "health" | "debt">("combined");

  useEffect(() => {
    setLastCheck(new Date().toLocaleTimeString());
    
    const interval = setInterval(() => {
      setLiveCpu(parseFloat((40 + Math.random() * 4).toFixed(1)));
      setLiveRps(Math.round(10200 + Math.random() * 500));
      setLiveLatency(parseFloat((17.5 + Math.random() * 2).toFixed(1)));
      setLiveLocks(Math.floor(1 + Math.random() * 3));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const ratings = analysis.architectureRatings;
  const avgScore = Number(((ratings.scalability + ratings.security + ratings.maintainability + ratings.performance) / 4).toFixed(1));
  const ratingPercent = Math.round(avgScore * 20);
  const debtScore = Math.round(100 - ratings.maintainability * 16);

  // Timeframe and metric datasets
  const trendData180d = [
    { period: "Jan", health: 3.1, debt: 59, deployments: 14 },
    { period: "Feb", health: 3.3, debt: 55, deployments: 18 },
    { period: "Mar", health: 3.4, debt: 51, deployments: 22 },
    { period: "Apr", health: 3.6, debt: 48, deployments: 25 },
    { period: "May", health: 3.9, debt: 42, deployments: 29 },
    { period: "Jun (Current)", health: avgScore, debt: debtScore, deployments: 34 }
  ];

  const trendData90d = [
    { period: "Apr", health: 3.6, debt: 48, deployments: 25 },
    { period: "May", health: 3.9, debt: 42, deployments: 29 },
    { period: "Jun (Current)", health: avgScore, debt: debtScore, deployments: 34 }
  ];

  const trendData30d = [
    { period: "Wk 1", health: Number((avgScore * 0.9).toFixed(1)), debt: Math.round(debtScore * 1.1), deployments: 30 },
    { period: "Wk 2", health: Number((avgScore * 0.95).toFixed(1)), debt: Math.round(debtScore * 1.05), deployments: 32 },
    { period: "Wk 3", health: Number((avgScore * 0.98).toFixed(1)), debt: Math.round(debtScore * 1.01), deployments: 33 },
    { period: "Wk 4 (Current)", health: avgScore, debt: debtScore, deployments: 34 }
  ];

  const activeTrendData = timeframe === "30d" 
    ? trendData30d 
    : timeframe === "90d" 
      ? trendData90d 
      : trendData180d;

  const getHealthGradient = (score: number) => {
    if (score >= 4.0) return "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20 text-emerald-400";
    if (score >= 3.0) return "from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/20 text-amber-400";
    return "from-red-500/10 via-rose-500/5 to-transparent border-rose-500/20 text-rose-400";
  };

  const getSeverityBadgeColor = (severity: string) => {
    const s = severity.toLowerCase();
    if (s.includes("critical")) return "bg-red-500/15 text-red-400 border-red-500/20";
    if (s.includes("high")) return "bg-orange-500/15 text-orange-400 border-orange-500/20";
    return "bg-indigo-500/15 text-indigo-400 border-indigo-500/20";
  };

  return (
    <div className="space-y-6" id="architecture-dashboard-control-deck">
      
      {/* 1. ROW OF LIVE HARDWARE METRICS PULSE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="telemetry-pulse-metrics">
        {[
          { 
            label: "ESTIMATED THROUGHPUT", 
            value: `${liveRps.toLocaleString()} req/s`, 
            sub: "Auto-scaling replica load", 
            icon: Radio, 
            color: "text-blue-400", 
            glow: "border-blue-500/10 hover:border-blue-500/30"
          },
          { 
            label: "AVERAGE RESPONSE TIME", 
            value: `${liveLatency} ms`, 
            sub: "Read/write cache hit: 94%", 
            icon: Zap, 
            color: "text-amber-400", 
            glow: "border-amber-500/10 hover:border-amber-500/30"
          },
          { 
            label: "SIMULATED CPU LOAD", 
            value: `${liveCpu}%`, 
            sub: "Dynamic Kubernetes threshold", 
            icon: Cpu, 
            color: "text-indigo-400", 
            glow: "border-indigo-500/10 hover:border-indigo-500/30"
          },
          { 
            label: "ACTIVE ACQUISITION LOCKS", 
            value: `${liveLocks} nodes`, 
            sub: "Redis lock consensus live", 
            icon: Activity, 
            color: "text-emerald-400", 
            glow: "border-emerald-500/10 hover:border-emerald-500/30"
          }
        ].map((met, i) => {
          const Icon = met.icon;
          return (
            <div 
              key={i} 
              className={`stellar-card rounded-2xl p-4.5 flex items-center justify-between transition-all duration-300 relative overflow-hidden group border ${met.glow}`}
            >
              <div className="space-y-1">
                <span className="text-[8.5px] font-mono tracking-widest text-zinc-500 block uppercase font-bold">{met.label}</span>
                <span className="text-xl font-bold font-mono text-white tracking-tight">{met.value}</span>
                <span className="text-[10px] text-zinc-400 block leading-none pt-0.5">{met.sub}</span>
              </div>
              <div className={`p-2.5 bg-white/[0.02] border border-white/5 rounded-xl ${met.color} group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. MAIN LAYOUT GRID (LEFT: COMPLIANCE GAUGES & HOTSPOTS, RIGHT: QUICK DIRECTIVES & ACTION LAUNCHER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Vitals Core Score Card & High priority alerts (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Visual Health meter */}
          <div className="border border-white/10 rounded-2xl bg-[#02040a]/35 backdrop-blur-md p-5 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-[240px] h-full bg-gradient-to-r ${getHealthGradient(avgScore)} pointer-events-none`} />
            
            {/* Visual Circular ring */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="6" />
                <circle 
                  cx="64" cy="64" r="54" 
                  fill="transparent" 
                  stroke={avgScore >= 4.0 ? "#10b981" : avgScore >= 3.0 ? "#f59e0b" : "#ef4444"} 
                  strokeWidth="6" 
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={(2 * Math.PI * 54) * (1 - avgScore / 5.0)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black font-mono text-white leading-none">{avgScore}</span>
                <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">HEALTH SCORE</span>
              </div>
            </div>

            <div className="space-y-2 flex-1 relative">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400">
                  HEALTH v{ratingPercent}%
                </span>
                <span className="text-[10px] font-mono text-zinc-500">• Last audited at {lastCheck}</span>
              </div>
              <h3 className="text-sm font-semibold text-white">Continuous Architectural Assurance</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The evaluated design model of <strong className="text-zinc-200">{systemName}</strong> demonstrates robust resiliency indices. 
                Average decoupling limits are stabilized, and threat surfaces are managed securely under mock replication cycles.
              </p>
              
              <div className="grid grid-cols-2 pt-1 gap-4 font-mono text-[10px] text-zinc-500">
                <div>
                  <span className="font-bold text-zinc-450 uppercase block">Modular Decoupling</span>
                  <span className="text-zinc-350">{avgScore >= 4.0 ? "EXCELLENT" : "IMPROVABLE"}</span>
                </div>
                <div>
                  <span className="font-bold text-zinc-450 uppercase block">Scale Thread Horizon</span>
                  <span className="text-zinc-350">PROJECTION: ROBUST</span>
                </div>
              </div>
            </div>
          </div>

          {/* SRE ARCHITECTURE HISTORICAL TREND INDEX */}
          <div className="border border-white/10 rounded-2xl bg-[#02040a]/35 backdrop-blur-md p-5 space-y-4" id="sre-historical-trend-analysis">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2.5">
                <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
                <div>
                  <span className="text-[9.5px] font-mono text-indigo-400 uppercase tracking-wider block font-bold">Historical Audits Analytics</span>
                  <h3 className="text-sm font-semibold text-white">SRE Architecture Trajectory Trend</h3>
                </div>
              </div>

              {/* Timeframe Toggles */}
              <div className="flex bg-white/[0.03] border border-white/5 p-1 rounded-xl" id="timeframe-control-tabs">
                {(["30d", "90d", "180d"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    type="button"
                    className={`px-3 py-1 text-[10px] font-mono rounded-lg transition-all cursor-pointer ${
                      timeframe === t
                        ? "bg-[#334155]/60 text-white border border-white/5 shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t === "30d" ? "30 Days" : t === "90d" ? "90 Days" : "180 Days"}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Perspective Filters */}
            <div className="flex flex-wrap gap-2 pt-1" id="metrics-view-toggles">
              {[
                { id: "combined", label: "Dual-Scale Comparison", color: "text-[#3b82f6] border-blue-500/10" },
                { id: "health", label: "Health Score Trend (0-5.0)", color: "text-[#10b981] border-emerald-500/10" },
                { id: "debt", label: "Technical Debt Index (0-100%)", color: "text-[#f43f5e] border-rose-500/10" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMetricView(m.id as any)}
                  type="button"
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono transition-all duration-250 cursor-pointer ${
                    metricView === m.id
                      ? "bg-white/[0.04] text-white border-white/25"
                      : `bg-transparent text-zinc-400 border-white/5 hover:border-white/10`
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Render interactive Recharts line chart */}
            <div className="w-full h-[260px] pt-4 font-mono" id="recharts-dynamic-canvas-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={activeTrendData} 
                  margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
                  <XAxis 
                    dataKey="period" 
                    stroke="rgba(255, 255, 255, 0.25)" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  
                  {/* Left Y-Axis for Health Score */}
                  {(metricView === "combined" || metricView === "health") && (
                    <YAxis 
                      yAxisId="health"
                      domain={[2.0, 5.0]}
                      stroke="#10b981"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      tickCount={4}
                      dx={5}
                    />
                  )}

                  {/* Right Y-Axis for Technical Debt percentage */}
                  {(metricView === "combined" || metricView === "debt") && (
                    <YAxis 
                      yAxisId="debt"
                      orientation="right"
                      domain={[0, 100]}
                      stroke="#f43f5e"
                      fontSize={9}
                      tickLine={false}
                      axisLine={false}
                      tickCount={5}
                      dx={-5}
                    />
                  )}

                  <Tooltip content={<SreCustomTooltip />} />
                  
                  <Legend 
                    verticalAlign="top" 
                    height={32} 
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "10px", color: "#a1a1aa", paddingTop: "-10px" }}
                  />

                  {/* Health line */}
                  {(metricView === "combined" || metricView === "health") && (
                    <Line
                      yAxisId="health"
                      type="monotone"
                      dataKey="health"
                      name="Health Index"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 3, stroke: "#10b981", strokeWidth: 1, fill: "#0c0f1d" }}
                      activeDot={{ r: 5, stroke: "#10b981", strokeWidth: 2, fill: "#10b981" }}
                      animationDuration={800}
                    />
                  )}

                  {/* Technical Debt Index line */}
                  {(metricView === "combined" || metricView === "debt") && (
                    <Line
                      yAxisId="debt"
                      type="monotone"
                      dataKey="debt"
                      name="Tech Debt"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      dot={{ r: 3, stroke: "#f43f5e", strokeWidth: 1, fill: "#0c0f1d" }}
                      activeDot={{ r: 5, stroke: "#f43f5e", strokeWidth: 2, fill: "#f43f5e" }}
                      animationDuration={800}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 font-mono">
              <span>Trajectory projection: Stable SRE recovery</span>
              <span className="text-[#10b981] flex items-center gap-1">
                <Sparkle className="w-3.5 h-3.5 animate-pulse" />
                Avg Health Score +{((avgScore - 3.1) / 3.1 * 100).toFixed(0)}% since Jan
              </span>
            </div>
          </div>

          {/* ACTIVE ADVISORY HOTSPOTS CENTER */}
          <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2.5">
                <BellRing className="w-4.5 h-4.5 text-orange-400 animate-pulse" />
                <div>
                  <span className="text-[9.5px] font-mono text-orange-400 uppercase tracking-wider block font-bold">Risk Management Desk</span>
                  <h3 className="text-sm font-semibold text-white">Active Architectural Risks Discovered</h3>
                </div>
              </div>
              <span className="text-[9.5px] font-mono text-zinc-500">
                {analysis.ctoOverview.risks.length} threats flagged
              </span>
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto scrollbar-thin">
              {analysis.ctoOverview.risks.map((risk, idx) => (
                <div 
                  key={idx}
                  className="bg-zinc-950/45 border border-white/5 p-3.5 rounded-xl hover:border-white/10 transition flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${getSeverityBadgeColor(risk.severity)}`}>
                        {risk.severity}
                      </span>
                      <h4 className="text-xs font-semibold text-white font-sans">{risk.title}</h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal font-sans pt-1">
                      {risk.description}
                    </p>
                    <div className="text-[10px] text-zinc-500 pt-1 flex items-center gap-1">
                      <span className="font-bold uppercase tracking-wider font-mono text-teal-400">Mitigation:</span>
                      <span className="font-sans text-zinc-400">{risk.mitigation}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab("cto")}
                    className="p-1 px-2 border border-white/5 hover:border-indigo-500/25 bg-white/[0.01] hover:bg-indigo-500/10 rounded-lg shrink-0 text-[10px] text-indigo-400 font-mono transition"
                  >
                    Resolve →
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DIRECTIVE ACTION HUB & PRESET CONTROLS (col-span-5) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* QUICK CHANNELS & WORKSPACE SHORTCUTS */}
          <div className="border border-white/10 rounded-2xl bg-[#02040a]/45 p-5 space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <span className="text-[9.5px] font-mono text-[#3b82f6] uppercase block tracking-wider font-bold">Assurance Navigation</span>
              <h3 className="text-sm font-semibold text-white mt-1">AETHER Tool Shortcuts</h3>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed mt-0.5">
                Quickly jump into multi-vector diagnostic workspaces built inside our cognitive engine.
              </p>
            </div>

            <div className="space-y-2.5 py-4">
              {[
                { 
                  title: "Dependency Galaxy Graph", 
                  desc: "Visual interactive 2D node map with force-directed collisions.",
                  tab: "galaxy", 
                  icon: Workflow,
                  color: "border-blue-500/10 hover:border-blue-500/30 text-blue-400 bg-blue-500/5"
                },
                { 
                  title: "AI Synthesizer Workspace", 
                  desc: "Declare code modules & prompt deep structural adjustments.",
                  tab: "aether", 
                  icon: Terminal,
                  color: "border-purple-500/10 hover:border-purple-500/30 text-purple-400 bg-purple-500/5"
                },
                { 
                  title: "AI CTO Consultation Cockpit", 
                  desc: "Chat with pragmatic advisors configured to your choice strategy.",
                  tab: "cto", 
                  icon: Cpu,
                  color: "border-teal-500/10 hover:border-teal-500/30 text-teal-400 bg-teal-500/5"
                },
                { 
                  title: "Technical Debt Matrix Radar", 
                  desc: "Interactive radar polygon displaying structural remediation pathways.",
                  tab: "debt", 
                  icon: BarChart3,
                  color: "border-red-500/10 hover:border-red-500/30 text-red-400 bg-red-500/5"
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full flex items-center justify-between text-left p-3 rounded-xl border transition-all duration-300 ${item.color}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="p-2 bg-white/[0.02] border border-white/5 rounded-lg">
                        <Icon className="w-4 h-4 shrink-0" />
                      </span>
                      <div>
                        <h4 className="text-xs font-semibold text-white leading-none">{item.title}</h4>
                        <p className="text-[9.5px] text-zinc-400 mt-1 leading-snug line-clamp-1">{item.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-550 shrink-0 transform translate-x-0 group-hover:translate-x-1.5 transition-transform" />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-1 text-[9px] font-mono text-zinc-550">
              <CheckSquare className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span>Full compliance verified. SRE system state fully healthy.</span>
            </div>
          </div>

          {/* SIMULATED SYSTEM LOGS */}
          <div className="border border-white/10 rounded-2xl bg-zinc-950/60 p-4.5 font-mono text-[9.5px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5 shrink-0 text-zinc-500 font-semibold uppercase">
              <span>SIMULATED HOST LOGSTREAM</span>
              <span className="flex items-center space-x-1 text-emerald-400 animate-pulse">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>STATE_OK</span>
              </span>
            </div>
            <div className="space-y-1.5 h-[115px] overflow-hidden select-none select-none-all text-zinc-400 text-xs text-zinc-500 leading-normal text-left">
              <p><span className="text-[#3b82f6]">10:34:02 UTC</span> [inf-01] Listening on 0.0.0.0:3000</p>
              <p><span className="text-[#3b82f6]">10:34:02 UTC</span> [sys-01] GPU cluster cold-starts completed</p>
              <p><span className="text-purple-400">10:34:05 UTC</span> [engine] Compiled {systemName} metrics</p>
              <p><span className="text-emerald-450">10:34:05 UTC</span> [sre] Auto-remediation forecast successfully compiled</p>
              <p><span className="text-zinc-600">10:41:20 UTC</span> [trace-01] Polled 4 active links, verified 0 loops</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
