import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, AnalysisResult } from "../types";
import { 
  Cpu, Sparkles, Send, AlertTriangle, Layers2, Sparkle, 
  ChevronRight, ChevronLeft, User, Clock, Bot, TrendingUp, 
  Calendar, Hammer, Hourglass, HelpCircle, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AiCtoSidebarProps {
  chatHistory: ChatMessage[];
  onSendChat: (msg: string) => void;
  isChatLoading: boolean;
  analysisResult: AnalysisResult | null;
  selectedModel: string;
  useThinking: boolean;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
}

export default function AiCtoSidebar({
  chatHistory,
  onSendChat,
  isChatLoading,
  analysisResult,
  selectedModel,
  useThinking,
  selectedRole,
  setSelectedRole
}: AiCtoSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "estimation">("chat");
  const [sidebarInput, setSidebarInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatLoading]);

  // Handle submission of chat
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sidebarInput.trim() || isChatLoading) return;
    onSendChat(sidebarInput.trim());
    setSidebarInput("");
  };

  // Quick Action Prompt presets
  const handleQuickPrompt = (promptText: string) => {
    if (isChatLoading) return;
    onSendChat(promptText);
  };

  // Sizing Calculations for Dynamic Effort Estimations
  const getEstimationDetails = () => {
    if (!analysisResult) {
      return {
        complexity: "Medium",
        totalHours: 320,
        sprints: 3,
        teamSize: 3,
        breakdown: [
          { phase: "Domain & API Setup", hours: 80, pct: 25 },
          { phase: "State Management & Cache", hours: 64, pct: 20 },
          { phase: "Database Integration", hours: 96, pct: 30 },
          { phase: "SRE Failover & Testing", hours: 80, pct: 25 }
        ],
        confidence: "80%"
      };
    }

    const ratings = analysisResult.architectureRatings;
    const nodeCount = analysisResult.dependencyGraph.nodes.length;
    const linkCount = analysisResult.dependencyGraph.links.length;
    
    // Scale hours based on graph size and complexity scores
    const complexityScore = ratings ? (20 - (ratings.maintainability + ratings.scalability)) : 8;
    const complexityFactor = complexityScore > 10 ? 1.4 : complexityScore > 6 ? 1.0 : 0.7;
    
    // Base estimate: ~18 hours per module node, scaled by relations and complexity
    const calculatedHours = Math.round(nodeCount * 18 * complexityFactor + linkCount * 6);
    const calculatedSprints = Math.max(1, Math.ceil(calculatedHours / 120));
    const calculatedTeamSize = calculatedSprints > 4 ? 4 : calculatedSprints > 2 ? 3 : 2;

    const domainPct = nodeCount > 0 ? Math.round((nodeCount / (nodeCount + 5)) * 30) : 25;
    const dbPct = 30;
    const statePct = 20;
    const testPct = 100 - (domainPct + dbPct + statePct);

    const levels = ["Low", "Medium", "High", "Critical"];
    const complexityLevel = complexityFactor > 1.2 ? "High" : complexityFactor < 0.8 ? "Low" : "Medium";

    return {
      complexity: complexityLevel,
      totalHours: calculatedHours,
      sprints: calculatedSprints,
      teamSize: calculatedTeamSize,
      breakdown: [
        { phase: "Domain Architecture & Specs", hours: Math.round(calculatedHours * (domainPct / 100)), pct: domainPct },
        { phase: "Persistence Clustered Database Layer", hours: Math.round(calculatedHours * (dbPct / 100)), pct: dbPct },
        { phase: "State Verification & Gateway Filters", hours: Math.round(calculatedHours * (statePct / 100)), pct: statePct },
        { phase: "SRE Failover Configuration & Integration Tests", hours: Math.round(calculatedHours * (testPct / 100)), pct: testPct }
      ],
      confidence: ratings ? `${Math.round(ratings.maintainability * 18)}%` : "84%"
    };
  };

  const est = getEstimationDetails();

  // Highlight paragraph helper with basic markdown parsing (bold, code codes inline)
  const renderMessageContent = (text: string) => {
    // Simple blockquote/code mapping
    return text.split("\n").map((line, lIdx) => {
      // Bold syntax mapping **text**
      let elements: React.ReactNode = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        elements = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="text-white font-bold">{part}</strong>;
          }
          return part;
        });
      }

      // Inline code mapping `code`
      const codeRegex = /`(.*?)`/g;
      if (codeRegex.test(line)) {
        // Redo with a map if both bold and code can exist, simple fallback:
        const oldElements = Array.isArray(elements) ? elements : [elements];
        const newElements: React.ReactNode[] = [];
        oldElements.forEach((el, index) => {
          if (typeof el === "string") {
            const parts = el.split(codeRegex);
            parts.forEach((part, pIdx) => {
              if (pIdx % 2 === 1) {
                newElements.push(<code key={`${index}-${pIdx}`} className="bg-zinc-850 px-1 py-0.5 rounded font-mono text-[10.5px] text-indigo-400 border border-white/5">{part}</code>);
              } else {
                newElements.push(part);
              }
            });
          } else {
            newElements.push(el);
          }
        });
        elements = newElements;
      }

      // Bullets check
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={lIdx} className="ml-4 list-disc pl-1 py-0.5 text-zinc-300">
            {Array.isArray(elements) ? elements : (line.trim().substring(2))}
          </li>
        );
      }

      return (
        <p key={lIdx} className="min-h-[1rem] leading-relaxed">
          {elements}
        </p>
      );
    });
  };

  return (
    <div 
      className={`relative h-screen bg-[#02040b]/95 border-l border-white/5 backdrop-blur-xl shrink-0 flex flex-col z-40 transition-all duration-300 ${
        isCollapsed ? "w-[50px]" : "w-full lg:w-[380px]"
      }`}
      id="ai-cto-sidebar"
    >
      {/* Collapse Toggle Handle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-1/2 -left-3.5 transform -translate-y-1/2 w-7 h-7 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:border-indigo-500/40 transition-all shadow-[0_0_15px_rgba(0,0,0,0.8)] z-50"
        title={isCollapsed ? "Expand AI CTO Sidebar" : "Collapse Sidebar"}
        id="sidebar-collapse-trigger"
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* COLLAPSED MINI-VIEW STRIP */}
      {isCollapsed && (
        <div className="flex flex-col items-center py-6 space-y-8 h-full">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg relative overflow-hidden group">
            <Sparkle className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <button 
              onClick={() => { setIsCollapsed(false); setActiveTab("chat"); }} 
              className="p-2 border border-white/5 hover:border-white/20 rounded-xl bg-zinc-950/40 text-zinc-400 hover:text-indigo-400 transition"
              title="AETHER Chat"
            >
              <Cpu className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { setIsCollapsed(false); setActiveTab("estimation"); }} 
              className="p-2 border border-white/5 hover:border-white/20 rounded-xl bg-zinc-950/40 text-zinc-400 hover:text-indigo-400 transition"
              title="Architectural Estimations"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" title="AETHER Active Status" />
        </div>
      )}

      {/* FULLY EXPANDED SIDEBAR CONTENT */}
      {!isCollapsed && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/5 bg-[#010205] flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <Cpu className="w-4 h-4 text-[#8b5cf6]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-semibold text-white">AETHER Architectural Advisor</h3>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <p className="text-[8.5px] font-mono text-zinc-500 tracking-wider mt-0.5 uppercase">REAL-TIME CTO ASSISTANT</p>
              </div>
            </div>
            
            {/* Personality quick-switch indicator dropdown */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-[10px] bg-zinc-950 border border-white/5 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none focus:border-indigo-500 font-mono font-medium"
            >
              <option value="CTO">Pragmatic CTO</option>
              <option value="Security Auditor">Security Specialist</option>
              <option value="Systems Architect">Domain Architect</option>
              <option value="SRE Specialist">SRE Consultant</option>
            </select>
          </div>

          {/* Sub-Tabs Selector */}
          <div className="flex border-b border-white/5 bg-zinc-950/40 shrink-0 text-xs">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2.5 text-center transition-all font-mono uppercase tracking-wider text-[10px] border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === "chat" 
                  ? "border-indigo-500 text-indigo-400 font-bold bg-white/[0.015]" 
                  : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.005]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Architect Chat</span>
            </button>
            <button
              onClick={() => setActiveTab("estimation")}
              className={`flex-1 py-2.5 text-center transition-all font-mono uppercase tracking-wider text-[10px] border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === "estimation" 
                  ? "border-indigo-500 text-indigo-400 font-bold bg-white/[0.015]" 
                  : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.005]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Effort Estimations</span>
            </button>
          </div>

          {/* INTERNAL PANE SCROLLABLE PANELS */}
          <div className="flex-1 overflow-y-auto bg-[#02040a]/20">
            {activeTab === "chat" ? (
              <div className="flex flex-col h-full">
                
                {/* Embedded dynamic brief blueprint stats banner */}
                {analysisResult && (
                  <div className="m-4 mb-2 p-3 bg-indigo-950/10 border border-indigo-500/10 rounded-xl flex items-center justify-between text-[10.5px]">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
                      <span className="text-zinc-300 font-medium">Context: <strong className="text-white">{analysisResult.systemName}</strong></span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-550 border border-white/5 bg-zinc-950 px-1.5 py-0.5 rounded uppercase">
                      {selectedModel === "gemini-3.5-flash" ? "Flash 3.5" : "Pro 3.1"}
                    </span>
                  </div>
                )}

                {/* Chat items scroll viewport */}
                <div className="flex-1 px-4 p-3 overflow-y-auto space-y-4 max-h-[380px] lg:max-h-[calc(100vh-270px)]">
                  {chatHistory.length === 0 ? (
                    <div className="py-8 text-center text-zinc-500 flex flex-col items-center justify-center space-y-3 px-4">
                      <div className="p-3.5 bg-indigo-500/5 rounded-full border border-indigo-500/15">
                        <Bot className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-300 font-sans">Dynamic Architectural Consultation active</h4>
                        <p className="text-[11px] text-zinc-500 mt-1 pb-2">
                          Ask your {selectedRole} specialist for guidance, direct refactor outlines, or structural audits.
                        </p>
                      </div>
                    </div>
                  ) : (
                    chatHistory.map((chat, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[90%] space-y-1.5 ${
                          chat.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 font-mono text-[8.5px] text-zinc-550 leading-none">
                          {chat.role === "user" ? (
                            <>
                              <span>DEVELOPER CLIENT</span>
                              <User className="w-2.5 h-2.5 text-indigo-400" />
                            </>
                          ) : (
                            <>
                              <Bot className="w-2.5 h-2.5 text-[#a5b4fc]" />
                              <span>{selectedRole.toUpperCase()}</span>
                            </>
                          )}
                          <span>• {chat.timestamp}</span>
                        </div>
                        <div className={`px-3 py-2 rounded-xl text-[11.5px] leading-relaxed select-text ${
                          chat.role === "user"
                            ? "bg-indigo-600 text-white rounded-tr-none border border-indigo-500 font-medium"
                            : "bg-zinc-950/60 border border-white/5 text-zinc-300 rounded-tl-none space-y-1.5"
                        }`}>
                          {chat.role === "user" ? chat.content : renderMessageContent(chat.content)}
                        </div>
                      </div>
                    ))
                  )}

                  {isChatLoading && (
                    <div className="flex flex-col space-y-1.5 animate-pulse items-start">
                      <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-widest">Evaluating structural locks...</span>
                      <div className="px-3 py-2 bg-zinc-950/70 border border-white/5 rounded-xl rounded-tl-none flex items-center space-x-1">
                        <span className="inline-block w-1.2 h-1.2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0s]"></span>
                        <span className="inline-block w-1.2 h-1.2 bg-indigo-450 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                        <span className="inline-block w-1.2 h-1.2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick actions prompt matrix footer section */}
                <div className="p-3 border-t border-white/5 bg-zinc-950/40 space-y-2 shrink-0">
                  <span className="text-[8.5px] font-mono text-indigo-450 font-bold tracking-wider uppercase block">Context-Aware Advisory Queries</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleQuickPrompt("What is the development effort breakdown and timeline allocation step-by-step for this ecosystem blueprint?")}
                      className="text-left text-[10px] p-2 bg-zinc-950 border border-white/5 hover:border-indigo-500/20 text-zinc-400 hover:text-white rounded-lg transition-all line-clamp-1 truncate"
                      title="Request Effort Estimation"
                    >
                      ⏱️ Estimate developer effort
                    </button>
                    <button
                      onClick={() => handleQuickPrompt("Expose the major security risks, data validation leaks, or replica vulnerability constraints of this architecture.")}
                      className="text-left text-[10px] p-2 bg-zinc-950 border border-white/5 hover:border-indigo-500/20 text-zinc-400 hover:text-white rounded-lg transition-all line-clamp-1 truncate"
                      title="Request Security Audit"
                    >
                      🔒 Check safety constraints
                    </button>
                    <button
                      onClick={() => handleQuickPrompt("Can you draft a step-by-step deployment and database migration pipeline for this system architecture?")}
                      className="text-left text-[10px] p-2 bg-zinc-950 border border-white/5 hover:border-indigo-500/20 text-zinc-400 hover:text-white rounded-lg transition-all line-clamp-1 truncate"
                      title="Request SRE Migration Path"
                    >
                      🎯 Step-by-step migration blueprint
                    </button>
                    <button
                      onClick={() => handleQuickPrompt("Propose a performance optimization scheme involving distributed cached nodes, Kafka pools, or Redis configurations.")}
                      className="text-left text-[10px] p-2 bg-zinc-950 border border-white/5 hover:border-indigo-500/20 text-zinc-400 hover:text-white rounded-lg transition-all line-clamp-1 truncate"
                      title="Request Performance Blueprint"
                    >
                      ⚡ Performance optimizations
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* TAB: EFFORT ESTIMATORS */
              <div className="p-4 space-y-4">
                
                {/* Interactive gauge card */}
                <div className="border border-white/10 rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-900/60 p-4 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 block uppercase">Complexity Level</span>
                      <span className={`text-sm font-bold tracking-wide flex items-center gap-1.5 mt-0.5 ${
                        est.complexity === "High" ? "text-red-400" : est.complexity === "Medium" ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        <Sparkle className="w-4 h-4" />
                        {est.complexity} Rating
                      </span>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl px-2.5 py-1 text-center font-mono">
                      <span className="text-[8.5px] block text-zinc-500 uppercase leading-none">Confidence</span>
                      <span className="text-xs font-bold text-emerald-400 leading-none mt-1 inline-block">{est.confidence}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-zinc-550 uppercase flex items-center gap-1">
                        <Hourglass className="w-3 h-3 text-indigo-400" />
                        Allocated Sprints
                      </span>
                      <span className="text-lg font-bold font-mono text-white block">
                        {est.sprints} <span className="text-xs text-zinc-500 font-normal">Sprints</span>
                      </span>
                      <span className="text-[9px] text-zinc-500 leading-none block">~{(est.sprints * 2)} calendar weeks</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-zinc-550 uppercase flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        Developer Load
                      </span>
                      <span className="text-lg font-bold font-mono text-white block">
                        {est.teamSize} <span className="text-xs text-zinc-500 font-normal">FTE Devs</span>
                      </span>
                      <span className="text-[9px] text-zinc-500 leading-none block">Full-time allocated roles</span>
                    </div>
                  </div>

                  {/* Gigantic visual total-hours circle */}
                  <div className="border border-white/5 bg-[#010204]/80 rounded-xl p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-zinc-550 uppercase">Total Estimated Effort</span>
                      <h4 className="text-2xl font-bold font-mono text-indigo-400 tracking-tight leading-none">{est.totalHours} <span className="text-xs font-normal text-zinc-500">hours</span></h4>
                      <p className="text-[10px] text-zinc-500 font-sans leading-none">Hours estimated from micro-modules</p>
                    </div>
                    <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>
                </div>

                {/* Breakdown Progress Bars */}
                <div className="border border-white/10 rounded-2xl bg-[#02040a]/40 p-4 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-xs font-semibold text-white uppercase font-mono tracking-wider">Effort Allocation Breakdown</h4>
                    <span className="text-[9px] font-mono text-zinc-500">4 Core Phases</span>
                  </div>

                  <div className="space-y-3">
                    {est.breakdown.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-300 font-medium">{item.phase}</span>
                          <span className="font-mono text-zinc-450">{item.hours} hrs ({item.pct}%)</span>
                        </div>
                        <div className="w-full bg-zinc-950/60 rounded-full h-1.5 border border-white/[0.03] overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              idx === 0 ? "bg-[#3b82f6]" : idx === 1 ? "bg-purple-500" : idx === 2 ? "bg-indigo-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SRE Action items regarding effort */}
                <div className="border border-yellow-500/10 bg-yellow-950/5 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block font-mono">CTO Strategic Insight</span>
                    <p className="text-[10.5px] text-zinc-450 leading-relaxed font-sans">
                      Scale indexes suggest transition locks take ~30% of standard databases timelines. Isolate ledger persistence APIs early in Sprint 1 to prevent downstream blocking dependencies on secondary routes.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Send Input Footer Panel */}
          {activeTab === "chat" && (
            <div className="p-3 border-t border-white/5 bg-[#010204] shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-2 relative">
                <input
                  type="text"
                  required
                  disabled={isChatLoading}
                  placeholder={`Consult: "${selectedRole}" on current code...`}
                  value={sidebarInput}
                  onChange={(e) => setSidebarInput(e.target.value)}
                  className="w-full text-[11.5px] bg-[#050816] border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-white placeholder-zinc-550 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                  id="side-cto-input"
                />
                <button
                  type="submit"
                  disabled={!sidebarInput.trim() || isChatLoading}
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center transition disabled:opacity-40"
                  id="side-cto-send-btn"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
