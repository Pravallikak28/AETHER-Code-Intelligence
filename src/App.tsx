import React, { useState, useEffect } from "react";
import { AnalysisResult, ChatMessage, Decision } from "./types";
import { ARCHITECTURE_TEMPLATES } from "./data/templates";
import DependencyGraphPanel from "./components/DependencyGraphPanel";
import SequencesPanel from "./components/SequencesPanel";
import MemoryPanel from "./components/MemoryPanel";
import TechDebtRadar from "./components/TechDebtRadar";
import AnalyticsPanel from "./components/AnalyticsPanel";
import DashboardPanel from "./components/DashboardPanel";
import AiCtoSidebar from "./components/AiCtoSidebar";
import { 
  Terminal, ShieldAlert, Cpu, Sparkles, BookOpen, 
  Workflow, Play, BarChart3, HelpCircle, Loader2, 
  ArrowRight, MessageCircleCode, Settings, Layers, 
  FolderCode, History, AlertTriangle, Activity, Send, 
  User, CheckCircle2, TrendingUp, Info, Shield, 
  Menu, X, Sparkle, RefreshCw, Layers2, LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type TabType = "dashboard" | "aether" | "repository" | "galaxy" | "timeline" | "cto" | "debt" | "memory" | "analytics" | "settings";

export default function App() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("ecommerce-microservices");
  const [customCode, setCustomCode] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [systemName, setSystemName] = useState("Distributed E-Commerce Engine");
  
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Cognitive Engine Selector States (Settings)
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [selectedRole, setSelectedRole] = useState<string>("CTO");
  const [useThinking, setUseThinking] = useState<boolean>(false);

  // AI Code Synthesizer states
  const [refactorPrompt, setRefactorPrompt] = useState("");
  const [isRefactoring, setIsRefactoring] = useState(false);

  // CTO Chat states
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [userInput, setUserInput] = useState("");

  // Mobile sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize with the first template on component mount
  useEffect(() => {
    const firstTemplate = ARCHITECTURE_TEMPLATES.find(t => t.id === "ecommerce-microservices");
    if (firstTemplate) {
      setCustomCode(firstTemplate.code);
      setCustomDescription(firstTemplate.description);
      setSystemName(firstTemplate.name);
      triggerAnalysis(firstTemplate.code, firstTemplate.description, firstTemplate.name, "gemini-3.5-flash", false);
    }
  }, []);

  // Handler to load selected preset template
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = ARCHITECTURE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setCustomCode(template.code);
      setCustomDescription(template.description);
      setSystemName(template.name);
      triggerAnalysis(template.code, template.description, template.name, selectedModel, useThinking);
    }
  };

  // Trigger evaluation query from Express server
  const triggerAnalysis = async (
    codeStr: string, 
    descStr: string, 
    nameStr: string, 
    modelVal = selectedModel, 
    thinkVal = useThinking
  ) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: codeStr, 
          description: descStr, 
          systemName: nameStr,
          model: modelVal,
          useThinking: thinkVal
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to receive architectural evaluation result.");
      }

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data);
      
      // Seed first CTO greeting relative to the core system evaluated
      setChatHistory([
        {
          role: "assistant",
          content: `Telemetry compiling successful. Verified system architecture configuration for **${data.systemName || nameStr}** using **${modelVal}**.

Primary Specialty Mode: **${selectedRole}**
Cognitive Mode: **${thinkVal ? "DEEP COGNITIAL REASONING" : "RAPID COMPILER RESPONSE"}**

Explore raw dependency dynamics in the Galaxy tab, review technical debt forecasts, or instruct me on structural refactors right here!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "An unexpected error occurred during codebase analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAnalysis(customCode, customDescription, systemName, selectedModel, useThinking);
  };

  // Handle dynamic AI System synthesis & refactoring
  const handleAiRefactor = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!refactorPrompt.trim() || isRefactoring) return;
    setIsRefactoring(true);
    try {
      const response = await fetch("/api/generate/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: refactorPrompt.trim(),
          code: customCode,
          description: customDescription,
          model: selectedModel,
          useThinking: useThinking
        })
      });

      if (!response.ok) {
        throw new Error("Refinement layer execution failed.");
      }

      const data = await response.json();
      if (data.code || data.description) {
        if (data.code) setCustomCode(data.code);
        if (data.description) setCustomDescription(data.description);
        setRefactorPrompt("");
        
        triggerAnalysis(data.code || customCode, data.description || customDescription, systemName, selectedModel, useThinking);
      }
    } catch (err) {
      console.error("AI synthesize failed:", err);
    } finally {
      setIsRefactoring(false);
    }
  };

  // Handle live chat consult message
  const handleSendChat = async (messageText: string) => {
    if (!messageText.trim() || isChatLoading) return;
    const userMessage: ChatMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/cto/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: chatHistory.map(c => ({ role: c.role, content: c.content })),
          contextData: analysisResult,
          model: selectedModel,
          useThinking: useThinking,
          role: selectedRole
        })
      });

      if (!response.ok) {
        throw new Error("CTO consultation failed.");
      }

      const reply = await response.json();
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content: reply.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content: `Error consulting CTO: ${err.message || 'The server layer failed to process the request.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleConsultCtoAboutItem = (title: string, type: string) => {
    setActiveTab("cto");
    handleSendChat(
      `AETHER's ${selectedRole}, let's talk about resolving the ${type}: "${title}". What is the architectural solution pattern we should leverage?`
    );
  };

  // Add new Decision manually to ADR state memory
  const handleAddCustomDecision = (newDecision: Decision) => {
    if (!analysisResult) return;
    const updatedDecisions = [newDecision, ...analysisResult.repositoryMemory.architectureDecisions];
    setAnalysisResult({
      ...analysisResult,
      repositoryMemory: {
        ...analysisResult.repositoryMemory,
        architectureDecisions: updatedDecisions
      }
    });
  };

  // Metadata score calculations
  const ratings = analysisResult?.architectureRatings;
  const avgScore = ratings 
    ? Number(((ratings.scalability + ratings.security + ratings.maintainability + ratings.performance) / 4).toFixed(1))
    : 3.8;
  const ratingPercent = Math.round(avgScore * 20);

  const fileCount = analysisResult?.dependencyGraph?.nodes?.length ? analysisResult.dependencyGraph.nodes.length * 3 + 11 : 32;
  const linkCount = analysisResult?.dependencyGraph?.links?.length || 14;
  const debtScore = ratings ? Math.round(100 - ratings.maintainability * 16) : 48;

  // SRE ratings metrics mapping for Cockpit circular meters
  const cockpitMetrics = [
    { name: "Security", score: ratings ? Math.round(ratings.security * 20) : 74, trend: "↑ +3.1%", desc: "Encryption layer vulnerabilities, state verification, CVE surface exposure", explain: "State token parameters could leak during clustered horizontal replicas scale-outs." },
    { name: "Scalability", score: ratings ? Math.round(ratings.scalability * 20) : 80, trend: "↑ +4.5%", desc: "Horizontal clustering limiters, shared-memory synchronization lock points", explain: "Lock concurrency is managed with optimistic sync, leading to scalability multipliers." },
    { name: "Performance", score: ratings ? Math.round(ratings.performance * 20) : 85, trend: "↓ -1.2%", desc: "Write caching, indexed read latencies under synthetic load cycles", explain: "Direct file indexing processes slow memory-mapped caches slightly during concurrent locks." },
    { name: "Maintainability", score: ratings ? Math.round(ratings.maintainability * 20) : 70, trend: "↑ +2.0%", desc: "Static coupling constraints, interface abstraction boundaries, modular separation", explain: "Abstract interfaces are deployed, reducing circular dependency issues in microservices." },
    { name: "Documentation", score: ratings ? Math.round((ratings.maintainability + ratings.security) / 2 * 18) : 64, trend: "→ ±0.0%", desc: "API contract safety levels, JSON schema declarations", explain: "Contract safety verification is solid, but lack of API version mappings locks backward compatibility." },
    { name: "Testing", score: ratings ? Math.round((ratings.performance + ratings.security) / 2 * 19) : 76, trend: "↑ +5.0%", desc: "Unit coverage, replica failover integrity mock testings", explain: "Failover mock integration coverage keeps system stability resilient on unexpected crashes." },
    { name: "Technical Debt", score: ratings ? Math.round(100 - ratings.maintainability * 16) : 45, trend: "↓ -4.0%", desc: "Static architectural friction factors, legacy coupling clusters", explain: "Reductions are observed as database state storage modules are progressively isolated." }
  ];

  return (
    <div className="min-h-screen bg-[#050816] text-zinc-100 flex flex-col md:flex-row font-sans relative selection:bg-indigo-500/30 selection:text-white" id="main-app">
      
      {/* Visual background nebula ambient light */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#8b5cf6]/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-indigo-500/3 rounded-full blur-[140px] pointer-events-none" />

      {/* FIXED SIDEBAR (Left Column) */}
      <aside className={`w-[250px] bg-[#02040a]/90 border-r border-white/5 backdrop-blur-xl shrink-0 flex flex-col z-50 transition-all duration-300 fixed md:sticky top-0 h-screen ${
        sidebarOpen ? "left-0" : "-left-[250px] md:left-0"
      }`}>
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl relative overflow-hidden group">
              <Sparkle className="w-4 h-4 text-indigo-400 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </div>
            <div>
              <span className="text-[9px] font-mono tracking-widest text-[#3b82f6] font-bold block uppercase">AI COGNITIVE DESK</span>
              <h1 className="text-sm font-semibold tracking-wide text-white">AETHER INTEGRITY</h1>
            </div>
          </div>
          {/* Mobile close button */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {[
            { id: "dashboard", label: "Overview Dashboard", icon: LayoutDashboard, accent: "blue" },
            { id: "aether", label: "AETHER Console", icon: Terminal, accent: "blue" },
            { id: "repository", label: "Repository Specs", icon: FolderCode, accent: "purple" },
            { id: "galaxy", label: "Galaxy Network", icon: Workflow, accent: "blue" },
            { id: "timeline", label: "Trace Timeline", icon: History, accent: "purple" },
            { id: "cto", label: "AI CTO Cockpit", icon: Cpu, accent: "blue" },
            { id: "debt", label: "Tech Debt Radar", icon: AlertTriangle, accent: "red" },
            { id: "memory", label: "Repository Memory", icon: BookOpen, accent: "purple" },
            { id: "analytics", label: "Scale Analytics", icon: BarChart3, accent: "blue" },
            { id: "settings", label: "Cognitive Settings", icon: Settings, accent: "purple" }
          ].map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabType);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between text-xs py-2.5 px-3.5 rounded-xl transition-all relative group ${
                  isActive 
                    ? "bg-white/[0.04] text-white font-medium border-l-2 border-indigo-500" 
                    : "text-zinc-400 hover:bg-white/[0.015] hover:text-zinc-200"
                }`}
                id={`sidebar-tab-${item.id}`}
              >
                <div className="flex items-center space-x-2.5">
                  <IconComponent className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? "text-[#3b82f6] scale-110" : "text-zinc-500 group-hover:scale-105"
                  }`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Live operational state credits */}
        <div className="p-4 border-t border-white/5 bg-[#010205] text-[9.5px] font-mono font-medium text-zinc-500 space-y-1 shrink-0">
          <div className="flex items-center justify-between">
            <span>ENGINE: {selectedModel === "gemini-3.5-flash" ? "FLASH 3.5" : "PREVIEW PRO"}</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <div>UTC: {new Date().toISOString().substring(11, 19)}</div>
        </div>
      </aside>

      {/* MAIN CONTAINER CONTENT FOOTPRINT (Right Column) */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 bg-[#050816]/95 border-b border-white/5 sticky top-0 z-40">
          <div className="flex items-center space-x-2.5">
            <Sparkle className="w-4 h-4 text-indigo-400" />
            <h1 className="text-sm font-semibold tracking-wider text-white">AETHER INTEL</h1>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-1 px-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Hero Score metrics summary bar layout on TOP */}
        <section className="px-6 md:px-10 pt-6 md:pt-8" id="scrolling-vitals-dash">
          <div className="stellar-card rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 glow-purple">
            <div className="absolute top-0 right-0 w-[200px] h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-indigo-450 font-bold block uppercase">VERIFIED BLUEPRINT</span>
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center">
                {analysisResult?.systemName || systemName}
                <span className="text-xs font-mono font-normal ml-3 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5 text-zinc-400">
                  v{ratingPercent}% HEALTH
                </span>
              </h2>
              <p className="text-xs text-zinc-400 max-w-xl">
                AETHER cognitive core completed high-fidelity graph traces, technical debt mitigations, and compliance ratings.
              </p>
            </div>

            {/* Quick Hero grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
              <div className="border border-white/5 bg-zinc-950/20 p-3 py-2 rounded-xl text-center">
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase block">HEALTH RATING</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{avgScore} <span className="text-xs font-normal text-zinc-550">/ 5.0</span></span>
              </div>
              <div className="border border-white/5 bg-zinc-950/20 p-3 py-2 rounded-xl text-center">
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase block">FILES COUNT</span>
                <span className="text-lg font-bold font-mono text-indigo-400">{fileCount}</span>
              </div>
              <div className="border border-white/5 bg-zinc-950/20 p-3 py-2 rounded-xl text-center">
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase block">DEPENDENCIES</span>
                <span className="text-lg font-bold font-mono text-cyan-400">{linkCount}</span>
              </div>
              <div className="border border-white/5 bg-zinc-950/20 p-3 py-2 rounded-xl text-center">
                <span className="text-[8.5px] font-mono text-red-500/70 uppercase block">TECH DEBT INDEX</span>
                <span className="text-lg font-bold font-mono text-red-400">{debtScore}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Global Loading Overlay */}
        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <div className="px-6 md:px-10 py-10 flex-1 flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-md w-full border border-white/15 rounded-2xl bg-[#02040a]/80 backdrop-blur-xl p-8 flex flex-col items-center text-center space-y-4 glow-purple"
                id="global-analyser-shimmer"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border border-indigo-500/10 flex items-center justify-center bg-indigo-500/5 animate-pulse">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  </div>
                  <Sparkle className="w-4 h-4 text-indigo-300 absolute top-0.5 right-0.5 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold tracking-wide text-white font-sans">AETHER Compile Cycle Live...</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    Generating dynamic structural mappings, calculating transactional locks, and formulating risk prioritization guides using {selectedModel}.
                  </p>
                </div>
                <div className="flex items-center space-x-3.5 pt-2 text-[9.5px] font-mono text-zinc-550 border-t border-white/5 w-full justify-center">
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    <span>MAPPING_GRAPH</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>CALCULATE_RISKS</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* COMPILING ERROR STATE BANNER */}
        {!isAnalyzing && analysisError && (
          <section className="px-6 md:px-10 py-6" id="error-screen">
            <div className="border border-red-500/20 rounded-2xl bg-red-950/10 p-6 flex flex-col items-center text-center space-y-3 max-w-2xl mx-auto glow-red">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full">
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-white">Analysis Compile Exception</h3>
                <p className="text-xs text-red-300 leading-relaxed font-mono bg-red-950/20 p-3.5 rounded-xl border border-red-500/10">
                  {analysisError}
                </p>
                <p className="text-[10px] text-zinc-500 leading-relaxed pt-2">
                  Verify your <strong className="text-zinc-300">GEMINI_API_KEY</strong> secret environment variable is mapped correctly in <strong className="text-zinc-300">Settings &gt; Secrets</strong> tab of your active AI Studio.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* PRIMARY SCROLL VIEW WORKSPACE INTERFACES */}
        {!isAnalyzing && analysisResult && (
          <main className="flex-1 px-6 md:px-10 py-6 select-none">
            
            {/* 0. TABS: ARCHITECTURAL ASSURANCE DASHBOARD */}
            {activeTab === "dashboard" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} id="pane-dashboard">
                <DashboardPanel 
                  analysis={analysisResult} 
                  setActiveTab={setActiveTab} 
                  systemName={systemName} 
                />
              </motion.div>
            )}

            {/* 1. TABS: AETHER COG CONSOLE (Main Workspace, Presets, Composer form, custom refinement prompt) */}
            {activeTab === "aether" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" id="pane-aether">
                {/* Two-Column split of Presets Catalog and Code Composer Form */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Presets blueprint switcher catalog (col-span-4) */}
                  <div className="lg:col-span-4 border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-md p-5 flex flex-col space-y-4">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-550 block uppercase">ENGINEERING ARCHETYPES</span>
                      <h3 className="text-sm font-semibold text-white mt-1">Design Blueprint Presets</h3>
                      <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                        Select an industrial blueprint baseline below, or rewrite dynamic pseudo-code definitions to analyze custom structures.
                      </p>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto max-h-[350px]">
                      {ARCHITECTURE_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => handleTemplateSelect(tpl.id)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group ${
                            selectedTemplateId === tpl.id 
                              ? "bg-zinc-900 border-indigo-500/40 text-white" 
                              : "bg-zinc-950/25 border-white/5 text-zinc-400 hover:border-white/10"
                          }`}
                          id={`catalogue-preset-${tpl.id}`}
                        >
                          <div className="flex items-center justify-between font-mono text-[8px] text-indigo-400 uppercase font-semibold mb-1">
                            <span>{tpl.category}</span>
                            {selectedTemplateId === tpl.id && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-ping" />
                            )}
                          </div>
                          <h4 className="font-semibold text-xs leading-none">{tpl.name}</h4>
                          <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{tpl.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main dual text editor form (col-span-8) */}
                  <div className="lg:col-span-8 border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-md p-5 space-y-4">
                    <form onSubmit={handleRunAnalysis} className="space-y-4" id="composer-console">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-3">
                        <div>
                          <h3 className="text-sm font-semibold text-white">System Specification Composer</h3>
                          <p className="text-[11px] text-zinc-405 mt-0.5 leading-none">Declare modular files, data entities, routers, or communications streams.</p>
                        </div>
                        <input
                          type="text"
                          required
                          value={systemName}
                          onChange={(e) => setSystemName(e.target.value)}
                          className="text-xs bg-zinc-950 border border-white/5 rounded-xl px-3 py-1.5 text-white max-w-[200px] mt-2 sm:mt-0 focus:outline-none focus:border-indigo-550 font-semibold"
                          id="blueprint-name-input"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[9.5px] font-mono text-zinc-500 block uppercase">Project Modules Specification (Code/Types syntax)</span>
                          <textarea
                            rows={7}
                            value={customCode}
                            onChange={(e) => setCustomCode(e.target.value)}
                            className="w-full text-xs bg-zinc-950 border border-white/5 rounded-xl p-3 font-mono text-zinc-300 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none scrollbar-thin"
                            id="code-spec-textarea"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9.5px] font-mono text-zinc-500 block uppercase">Continuous Operations & Scenario Description</span>
                          <textarea
                            rows={7}
                            value={customDescription}
                            onChange={(e) => setCustomDescription(e.target.value)}
                            className="w-full text-xs bg-zinc-950 border border-white/5 rounded-xl p-3 text-zinc-300 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none scrollbar-thin"
                            id="dynamics-spec-textarea"
                          />
                        </div>
                      </div>

                      {/* AI Code Refactoring loop */}
                      <div className="border border-purple-500/10 bg-[#110e1a]/40 rounded-xl p-4 space-y-3">
                        <div className="flex items-center space-x-2">
                          <Sparkle className="w-4 h-4 text-purple-400" />
                          <h4 className="text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">AI Structural Code Synthesizer</h4>
                        </div>
                        <p className="text-[10.5px] text-zinc-400 leading-snug font-sans">
                          Describe a custom architectural change (e.g., refactor states to Redis, inject asymmetric authentication safeguards, decouple services with event logs).
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={refactorPrompt}
                            onChange={(e) => setRefactorPrompt(e.target.value)}
                            placeholder="E.g. Transition ledger database layer to serverless storage, then add Kafka streaming queues..."
                            className="flex-1 text-xs bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                            id="ai-prompt-input"
                          />
                          <button
                            type="button"
                            onClick={handleAiRefactor}
                            disabled={isRefactoring || !refactorPrompt.trim()}
                            className="text-xs px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl flex items-center space-x-1.5 transition shrink-0 disabled:opacity-40"
                          >
                            {isRefactoring ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Refinement compiling...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-purple-100" />
                                <span>Refactor specs</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Submit compiling triggers */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="flex items-center space-x-1 text-[9.5px] font-mono text-zinc-550">
                          <Info className="w-3.5 h-3.5 text-[#3b82f6]" />
                          <span>Simulation parses in 2 - 5 seconds under live GPU clusters.</span>
                        </div>
                        <button
                          type="submit"
                          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition glow-blue"
                          id="trigger-analysis-btn"
                        >
                          <Play className="w-3.5 h-3.5 text-white fill-current" />
                          <span>RE-COMPILE SYSTEM ARCHITECTURE</span>
                        </button>
                      </div>

                    </form>
                  </div>

                </div>
              </motion.div>
            )}

            {/* 2. TABS: REPOSITORY SPECIFICATIONS EXPLORATION */}
            {activeTab === "repository" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4" id="pane-repository">
                <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-5 space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-550 block">INDEXED COMPONENTS LIST</span>
                    <h3 className="text-lg font-semibold text-white">Parsed System Modules & Components Specs</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Listing of discovered processes, API layers, system boundaries, and active data stores detected within blueprint models.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisResult.dependencyGraph.nodes.map((node) => (
                      <div 
                        key={node.id}
                        className="bg-zinc-950/40 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all cursor-pointer flex flex-col justify-between h-[150px]"
                        onClick={() => handleConsultCtoAboutItem(node.label, "Module")}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono uppercase bg-white/5 px-2 py-0.5 border border-white/5 rounded text-zinc-400">
                              {node.type}
                            </span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              node.complexity === "High" ? "bg-red-500/10 text-red-400" :
                              node.complexity === "Medium" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                              {node.complexity} Complexity
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white mt-3.5 leading-snug">{node.label}</h4>
                          <p className="text-[11px] text-zinc-450 mt-1 line-clamp-2 leading-relaxed">{node.details}</p>
                        </div>
                        <div className="text-[9px] text-[#3b82f6] font-mono uppercase text-right hover:underline">
                          Consult CTO about module →
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. TABS: GALAXY NETWORK MAP */}
            {activeTab === "galaxy" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} id="pane-galaxy">
                <DependencyGraphPanel 
                  graph={analysisResult.dependencyGraph} 
                  risks={analysisResult?.ctoOverview?.risks}
                  bottlenecks={analysisResult?.predictiveAnalysis?.bottlenecks}
                />
              </motion.div>
            )}

            {/* 4. TABS: TRACE SCENARIOS & RUNTIME SEQUENCES */}
            {activeTab === "timeline" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" id="pane-timeline">
                
                {/* Historical Decisions/Evolution Chronicle */}
                <div className="border border-white/10 rounded-2xl bg-white/[0.02] p-5 space-y-4">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-550 block">CHRONOLOGICAL DECISIONS TIMELINE</span>
                    <h3 className="text-sm font-semibold text-white mt-1">System Evolution Chronicles</h3>
                  </div>

                  <div className="flex overflow-x-auto gap-4 py-4 pr-1 scrollbar-thin">
                    {[
                      { year: "2023", tpl: "Monolithic Blueprint", details: "Core ledger logic bound in basic synchronous loop state interfaces.", author: "Architect team", risk: "Low", benefit: "Fast prototype cycles" },
                      { year: "2024", tpl: "Decoupled API Gates", details: "Integration of separate routing gateways isolating security constraints.", author: "Infra lead", risk: "Medium", benefit: "Independent scale" },
                      { year: "2025", tpl: "Stateless Kafka Pipeline", details: "Transactions extracted into partition-based distributed log streams.", author: "AETHER Suggestion", risk: "High", benefit: "Resilient asynchronous fault recovery" },
                      { year: "Present", tpl: "Unified Micro-services Core", details: "Active ledger state replication, isolated adapters, full health metrics.", author: "CTO Live system", risk: "Mitigated", benefit: "Robust scale scalability" }
                    ].map((step, idx) => (
                      <div key={idx} className="min-w-[240px] border border-white/5 bg-zinc-950/45 p-4 rounded-xl space-y-2 shrink-0 select-none">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <span className="text-[10px] font-mono text-[#3b82f6] font-bold">{step.year}</span>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase">{step.risk} risk</span>
                        </div>
                        <h4 className="font-semibold text-xs text-white mt-1">{step.tpl}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{step.details}</p>
                        <div className="pt-2 text-[9px] font-mono text-zinc-500">
                          Benefit: <span className="text-emerald-450 font-sans">{step.benefit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <SequencesPanel sequences={analysisResult.sequences} />
              </motion.div>
            )}

            {/* 5. TABS: AI CTO COCKPIT (Ratings circular stats + Consult desk sidebar) */}
            {activeTab === "cto" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" id="pane-cto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Cockpit Ratings Circular widgets (col-span-6) */}
                  <div className="lg:col-span-6 border border-white/10 rounded-2xl bg-[#02040a]/40 p-5 flex flex-col space-y-4">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-550 block">COCKPIT MATRIX</span>
                      <h3 className="text-sm font-semibold text-white">Interactive SRE Circular Metrics</h3>
                      <p className="text-[11px] text-zinc-400 mt-1">Hover circular widgets to read targeted recommendations from AETHER.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                      {cockpitMetrics.map((met, idx) => {
                        const radius = 24;
                        const strokeDash = 2 * Math.PI * radius;
                        const strokeOffset = strokeDash - (met.score / 100) * strokeDash;
                        return (
                          <div 
                            key={idx}
                            className="stellar-card rounded-xl p-4 flex items-center justify-between group transition-all duration-300 hover:border-indigo-500/20"
                            title={met.desc}
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] text-white font-semibold flex items-center gap-1 leading-none">
                                {met.name === "Security" ? <Shield className="w-3.5 h-3.5 text-emerald-400" /> : met.name === "Scalability" ? <Cpu className="w-3.5 h-3.5 text-indigo-400" /> : <Layers2 className="w-3.5 h-3.5 text-purple-400" />}
                                {met.name}
                              </span>
                              <div className="flex items-center space-x-1.5 pt-1">
                                <span className="text-sm font-bold font-mono text-white mt-1 leading-none">{met.score}%</span>
                                <span className="text-[8px] font-mono text-emerald-400 font-semibold">{met.trend}</span>
                              </div>
                              <p className="text-[9px] text-zinc-500 leading-snug line-clamp-1">{met.desc}</p>
                            </div>

                            {/* SVG Circular meter path */}
                            <div className="relative w-12 h-12 flex justify-center items-center shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle 
                                  cx="24" cy="24" r={radius} 
                                  fill="transparent" 
                                  stroke="rgba(255,255,255,0.03)" 
                                  strokeWidth="3.5" 
                                />
                                <circle 
                                  cx="24" cy="24" r={radius} 
                                  fill="transparent" 
                                  stroke={met.score >= 75 ? "#10b981" : met.score >= 50 ? "#f59e0b" : "#ef4444"} 
                                  strokeWidth="3.5" 
                                  strokeDasharray={strokeDash}
                                  strokeDashoffset={strokeOffset}
                                  className="transition-all duration-700 ease-out"
                                />
                              </svg>
                              <span className="absolute text-[8.5px] font-mono text-white font-medium">{met.score}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: AI CTO Consult Desk chat desk (col-span-6) */}
                  <div className="lg:col-span-6 flex flex-col border border-white/10 rounded-2xl bg-white/[0.02]/40 overflow-hidden h-[540px]">
                    <div className="bg-[#02040a]/90 border-b border-white/5 py-4 px-5 flex items-center justify-between shrink-0">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-2 h-2 rounded-full ${isChatLoading ? "bg-[#8b5cf6] animate-ping" : "bg-emerald-500 animate-pulse"}`} />
                        <div>
                          <h3 className="text-xs font-semibold text-white leading-none">Interactive AETHER Consultation</h3>
                          <p className="text-[8.5px] font-mono text-zinc-550 uppercase tracking-widest mt-1">Core active specialty: {selectedRole}</p>
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages flow scroll frame */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-zinc-950/20 font-sans">
                      {chatHistory.map((chat, idx) => (
                        <div 
                          key={idx} 
                          className={`flex flex-col max-w-[85%] space-y-1.5 ${
                            chat.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                          }`}
                        >
                          <div className="flex items-center space-x-1 font-mono text-[9px] text-zinc-550 leading-none">
                            {chat.role === "user" ? (
                              <>
                                <span>DEVELOPER CLIENT</span>
                                <User className="w-3 h-3 text-cyan-450" />
                              </>
                            ) : (
                              <>
                                <Sparkle className="w-3 h-3 text-indigo-400" />
                                <span>{selectedRole.toUpperCase()}</span>
                              </>
                            )}
                            <span>• {chat.timestamp}</span>
                          </div>
                          <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            chat.role === "user"
                              ? "bg-indigo-600 text-white rounded-tr-none border border-indigo-500 font-medium"
                              : "bg-zinc-900 border border-white/5 text-zinc-300 rounded-tl-none whitespace-pre-wrap"
                          }`}>
                            {chat.content}
                          </div>
                        </div>
                      ))}

                      {isChatLoading && (
                        <div className="flex flex-col space-y-1.5 animate-pulse items-start">
                          <span className="text-[9px] font-mono text-[#3b82f6]">Generating solution dynamics...</span>
                          <div className="h-9 w-24 bg-zinc-900 border border-white/5 rounded-2xl rounded-tl-none flex items-center justify-center text-zinc-550">
                            <span className="inline-block w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce mx-0.5"></span>
                            <span className="inline-block w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce mx-0.5 [animation-delay:0.2s]"></span>
                            <span className="inline-block w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce mx-0.5 [animation-delay:0.4s]"></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Send interactive message bar */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!userInput.trim() || isChatLoading) return;
                        handleSendChat(userInput.trim());
                        setUserInput("");
                      }}
                      className="p-3 border-t border-white/5 bg-zinc-950 flex space-x-2 shrink-0"
                    >
                      <input
                        type="text"
                        required
                        disabled={isChatLoading}
                        placeholder={`Instruct specialist ${selectedRole} on refactoring codes...`}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        className="flex-1 text-xs bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-505"
                        id="cto-message-input"
                      />
                      <button
                        type="submit"
                        disabled={!userInput.trim() || isChatLoading}
                        className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition disabled:opacity-40"
                        id="cto-send-btn"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                  </div>

                </div>
              </motion.div>
            )}

            {/* 6. TABS: TECH DEBT RADAR */}
            {activeTab === "debt" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} id="pane-debt">
                <TechDebtRadar ratings={analysisResult.architectureRatings} risks={analysisResult.ctoOverview.risks} />
              </motion.div>
            )}

            {/* 7. TABS: REPOSITORY MEMORY & ADR RECORDER */}
            {activeTab === "memory" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} id="pane-memory">
                <MemoryPanel memory={analysisResult.repositoryMemory} onAddDecision={handleAddCustomDecision} />
              </motion.div>
            )}

            {/* 8. TABS: SCALABILITY & PERFORMANCE FORECASTS */}
            {activeTab === "analytics" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} id="pane-analytics">
                <AnalyticsPanel analytics={analysisResult.predictiveAnalysis} />
              </motion.div>
            )}

            {/* 9. TABS: COGNITIVE SYSTEM SETTINGS */}
            {activeTab === "settings" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" id="pane-settings">
                <div className="border border-white/10 rounded-2xl bg-white/[0.02]/40 p-5 space-y-6">
                  
                  <div className="border-b border-white/5 pb-3">
                    <span className="text-[9px] font-mono text-zinc-550 block">STELLAR COGNITIVE ENGINE CONFIGS</span>
                    <h3 className="text-sm font-semibold text-white mt-1">Cognitive Settings Panel</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Configure model backends, reasoning options, and personality settings.</p>
                  </div>

                  {/* Engine Model selector card */}
                  <div className="space-y-1.5 max-w-xl">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Engine Model Model</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "gemini-3.1-flash-lite", label: "Fast Core (Lite)" },
                        { id: "gemini-3.5-flash", label: "Standard flash Core" },
                        { id: "gemini-3.1-pro-preview", label: "Deep reasoning Core" }
                      ].map((modelOpt) => (
                        <button
                          key={modelOpt.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(modelOpt.id);
                            if (modelOpt.id !== "gemini-3.1-pro-preview") setUseThinking(false);
                          }}
                          className={`text-xs py-2 px-3 border rounded-xl text-center transition-all ${
                            selectedModel === modelOpt.id 
                              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-450 font-bold" 
                              : "bg-zinc-950/20 border-white/5 text-zinc-500 hover:text-white"
                          }`}
                          id={`model-selector-btn-${modelOpt.id}`}
                        >
                          {modelOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reasoning toggle (pro only) */}
                  <div className={`p-4 border rounded-xl space-y-2 max-w-xl transition-all duration-300 ${
                    selectedModel === "gemini-3.1-pro-preview" 
                      ? "bg-[#110e1a]/85 border-purple-500/10 opacity-100" 
                      : "border-white/5 bg-white/[0.01] opacity-40 pointer-events-none"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5 uppercase">
                          <Sparkle className="w-4 h-4 text-purple-400" />
                          Enable High Thinking Module
                        </span>
                        <p className="text-[10px] text-zinc-500 select-none pt-0.5 max-w-md">
                          Enables extensive strategic verification paths on complex backend systems mapping operations.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={selectedModel !== "gemini-3.1-pro-preview"}
                        onClick={() => setUseThinking(!useThinking)}
                        className={`w-12 h-6.5 rounded-full p-0.5 transition-colors focus:outline-none shrink-0 ${
                          useThinking ? "bg-purple-600" : "bg-zinc-800"
                        }`}
                        id="settings-thinking-toggle"
                      >
                        <div className={`bg-white w-5.5 h-5.5 rounded-full shadow-xl transform transition-transform ${
                          useThinking ? "translate-x-5.5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Personality specialties */}
                  <div className="space-y-1.5 max-w-xl">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Consultant Personality Specialty</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "CTO", label: "Pragmatic CTO", desc: "Focuses on commercial delivery speeds" },
                        { id: "Security Auditor", label: "Security Specialist", desc: "Focuses on static constraints & CVE threats" },
                        { id: "Systems Architect", label: "Systems Architect", desc: "Decoupling layouts on horizontal scaling" },
                        { id: "SRE Specialist", label: "SRE Consultant", desc: "Focuses on system fault-recovery bounds" }
                      ].map((spec) => (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => setSelectedRole(spec.id)}
                          className={`text-left p-3 border rounded-xl transition-all ${
                            selectedRole === spec.id 
                              ? "bg-indigo-500/10 border-indigo-500/20 text-white font-medium" 
                              : "bg-zinc-950/20 border-white/5 text-zinc-450 hover:text-white"
                          }`}
                          id={`settings-role-btn-${spec.id.toLowerCase().replace(" ", "-")}`}
                        >
                          <h4 className="text-xs font-semibold">{spec.label}</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">{spec.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </main>
        )}

        {/* Global Footer (Minimal & Premium) */}
        <footer className="border-t border-white/5 bg-[#010206] py-5 shrink-0 text-center text-[10px] font-mono text-zinc-650" id="global-footer">
          <div className="w-full max-w-7xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-zinc-600">
            <span>AETHER COGNITIVE SYSTEM • ALL ENGINE DRIVERS ONLINE</span>
            <div className="flex justify-center space-x-4">
              <span>ESTD: 2026</span>
              <span>INTEGRITY SECURE</span>
            </div>
          </div>
        </footer>

      </div>

      <AiCtoSidebar
        chatHistory={chatHistory}
        onSendChat={handleSendChat}
        isChatLoading={isChatLoading}
        analysisResult={analysisResult}
        selectedModel={selectedModel}
        useThinking={useThinking}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
      />

    </div>
  );
}
