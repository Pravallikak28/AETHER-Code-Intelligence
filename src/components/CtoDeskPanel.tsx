import React, { useState, useRef, useEffect } from "react";
import { CtoOverview, ChatMessage } from "../types";
import { 
  AlertCircle, ArrowUpRight, Send, User, Sparkles, MessageSquare, 
  ShieldAlert, CheckCircle2, Cpu, Zap, HelpCircle, Shield, Network, Database
} from "lucide-react";

interface CtoDeskPanelProps {
  overview?: CtoOverview;
  chatHistory: ChatMessage[];
  onSendMessage: (msg: string, model: string, useThinking: boolean, role: string) => Promise<void>;
  isChatLoading: boolean;
  onAskCtoAboutItem: (itemTitle: string, itemType: string) => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  selectedRole: string;
  setSelectedRole: (r: string) => void;
  useThinking: boolean;
  setUseThinking: (t: boolean) => void;
}

export default function CtoDeskPanel({
  overview,
  chatHistory,
  onSendMessage,
  isChatLoading,
  onAskCtoAboutItem,
  selectedModel,
  setSelectedModel,
  selectedRole,
  setSelectedRole,
  useThinking,
  setUseThinking
}: CtoDeskPanelProps) {
  const [userInput, setUserInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isChatLoading) return;
    onSendMessage(userInput.trim(), selectedModel, useThinking, selectedRole);
    setUserInput("");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "text-red-400 bg-red-950/40 border-red-900/30";
      case "high":
        return "text-orange-400 bg-orange-950/20 border-orange-900/20";
      case "medium":
        return "text-amber-400 bg-amber-950/20 border-amber-900/20";
      default:
        return "text-cyan-400 bg-zinc-900 border-zinc-800";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="cto-desk-panel">
      
      {/* Left Column: Actionable Alerts, Risks & Configuration */}
      <div className="lg:col-span-5 flex flex-col space-y-6">
        
        {/* Core AI Cognitive Configuration Console */}
        <div className="border border-zinc-800/80 rounded-xl bg-zinc-950/40 p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-zinc-900 pb-3">
            <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
            <div>
              <h3 className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Cognitive Core Config</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">Determine which AI model powers active audits</p>
            </div>
          </div>

          {/* Model Engine Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase block">Cognitive Engine Model</label>
            <div className="grid grid-cols-3 gap-1.5 font-sans">
              <button
                type="button"
                onClick={() => {
                  setSelectedModel("gemini-3.1-flash-lite");
                  setUseThinking(false);
                }}
                className={`text-[10px] font-mono py-2 px-1 rounded-lg border text-center transition ${
                  selectedModel === "gemini-3.1-flash-lite"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold animate-pulse"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
                id="engine-flash-lite"
              >
                Lite (Fast)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedModel("gemini-3.5-flash");
                  setUseThinking(false);
                }}
                className={`text-[10px] font-mono py-2 px-1 rounded-lg border text-center transition ${
                  selectedModel === "gemini-3.5-flash"
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-bold"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
                id="engine-flash-standard"
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedModel("gemini-3.1-pro-preview");
                }}
                className={`text-[10px] font-mono py-2 px-1 rounded-lg border text-center transition ${
                  selectedModel === "gemini-3.1-pro-preview"
                    ? "bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
                id="engine-pro"
              >
                Pro (Deep)
              </button>
            </div>
          </div>

          {/* Thinking Mode Toggle (only for gemini-3.1-pro-preview) */}
          <div className={`transition-all duration-300 p-3 rounded-lg border ${
            selectedModel === "gemini-3.1-pro-preview" 
              ? "bg-[#110e1a]/85 border-purple-900/30 opacity-100" 
              : "bg-zinc-900/10 border-transparent opacity-40 pointer-events-none"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  Enable High Thinking Mode
                </span>
                <p className="text-[9px] text-zinc-500 mt-1 leading-snug">
                  Uses deep reasoning chains to solve highly complex architecture anomalies.
                </p>
              </div>
              <button
                type="button"
                disabled={selectedModel !== "gemini-3.1-pro-preview"}
                onClick={() => setUseThinking(!useThinking)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none shrink-0 ${
                  useThinking ? "bg-purple-600" : "bg-zinc-850"
                }`}
                id="thinking-toggle"
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                  useThinking ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>
            {useThinking && selectedModel === "gemini-3.1-pro-preview" && (
              <div className="mt-2 text-[9px] font-mono text-purple-400/80 animate-pulse flex items-center gap-1">
                <span>● THINKING_LEVEL: HIGH ACTIVE</span>
              </div>
            )}
          </div>

          {/* Architect Role Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase block">Consultant Personality Specialty</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "CTO", label: "Pragmatic CTO", icon: Cpu },
                { id: "Security Auditor", label: "Security Auditor", icon: Shield },
                { id: "Systems Architect", label: "Systems Architect", icon: Network },
                { id: "SRE Specialist", label: "SRE Specialist", icon: Database }
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`text-[10px] text-left p-2 rounded-lg border flex items-center space-x-1.5 transition ${
                    selectedRole === role.id
                      ? "bg-indigo-600/15 border-indigo-500/30 text-white font-medium"
                      : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900"
                  }`}
                  id={`role-btn-${role.id.toLowerCase().replace(" ", "-")}`}
                >
                  <role.icon className={`w-3.5 h-3.5 shrink-0 ${selectedRole === role.id ? 'text-indigo-400' : 'text-zinc-600'}`} />
                  <span className="truncate">{role.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Risks card */}
        <div className="border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 flex flex-col h-[280px] overflow-hidden">
          <div className="flex items-center space-x-2 border-b border-zinc-900 pb-3 mb-4 shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <div>
              <h3 className="text-sm font-medium text-white">Critical Risk Posture</h3>
              <p className="text-[10px] text-zinc-500 font-mono">MITIGATION_STATUS: ACTIVE</p>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            {!overview || overview.risks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/70 mb-2" />
                <p className="text-xs text-zinc-500 italic">No critical risks captured.</p>
              </div>
            ) : (
              overview.risks.map((risk, idx) => (
                <div
                  key={idx}
                  className={`border p-3 rounded-lg space-y-2 transition hover:bg-zinc-900/20 ${getSeverityColor(
                    risk.severity
                  )}`}
                >
                  <div className="flex items-start justify-between space-x-2">
                    <div>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-current">
                        {risk.severity} Risk
                      </span>
                      <h4 className="text-xs font-semibold text-white mt-1.5 leading-snug">{risk.title}</h4>
                    </div>
                    <button
                      onClick={() => onAskCtoAboutItem(risk.title, "Risk")}
                      className="text-[10px] font-mono flex items-center space-x-0.5 text-zinc-300 hover:text-white transition mt-0.5 shrink-0"
                    >
                      <span>Mitigate</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{risk.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Right Column: Dynamic Interactive AI CTO Chat */}
      <div className="lg:col-span-7 flex flex-col border border-zinc-800 rounded-xl bg-zinc-950/40 overflow-hidden h-[660px]">
        {/* Chat Header */}
        <div className="bg-zinc-950 px-5 py-4 border-b border-zinc-850 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              isChatLoading ? "bg-purple-500 animate-ping" : "bg-emerald-500"
            }`}></div>
            <div>
              <h3 className="text-sm font-semibold text-white leading-none">AETHER Architectural Desk</h3>
              <p className="text-[9px] font-mono text-zinc-505 mt-1 uppercase">
                {selectedModel} • {selectedRole}
              </p>
            </div>
          </div>
          {useThinking && selectedModel === "gemini-3.1-pro-preview" && (
            <span className="text-[9px] font-mono text-purple-400 px-2.5 py-1 bg-purple-950/30 border border-purple-900/40 rounded-full animate-pulse font-medium">
              HIGH_REASONING
            </span>
          )}
        </div>

        {/* Chat History Flow */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-zinc-950/20">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
              <MessageSquare className="w-10 h-10 text-zinc-850" />
              <div className="space-y-1">
                <p className="text-zinc-500 text-sm font-medium">Draft dynamic queries or trigger audit steps</p>
                <p className="text-zinc-600 text-xs max-w-sm mx-auto leading-relaxed">
                  Query design models, request specialized patterns (CQRS, bi-temporal triggers), or click a mitigation choice on the left to begin consultation.
                </p>
              </div>
            </div>
          ) : (
            chatHistory.map((chat, idx) => (
              <div
                key={idx}
                className={`flex max-w-[85%] flex-col space-y-1.5 ${
                  chat.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-zinc-500">
                  {chat.role === "user" ? (
                    <>
                      <span>DEVELOPER</span>
                      <User className="w-3 h-3 text-cyan-450" />
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>{selectedRole.toUpperCase()}</span>
                    </>
                  )}
                  <span>• {chat.timestamp}</span>
                </div>
                <div
                  className={`px-4 py-3 rounded-xl text-xs leading-relaxed ${
                    chat.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none border border-indigo-500 font-medium"
                      : "bg-zinc-900 border border-zinc-810 text-zinc-300 rounded-tl-none whitespace-pre-wrap font-sans"
                  }`}
                >
                  {chat.content}
                </div>
              </div>
            ))
          )}

          {isChatLoading && (
            <div className="flex flex-col space-y-1 mr-auto items-start max-w-[80%] animate-pulse">
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-indigo-400">
                <Sparkles className="w-3 h-3" />
                <span>
                  {useThinking && selectedModel === "gemini-3.1-pro-preview" 
                    ? "Analyzing dependencies & formulating solution vectors..." 
                    : "Expert is reviewing dynamic specifications..."}
                </span>
              </div>
              <div className="bg-zinc-900/90 border border-zinc-800/80 h-10 w-24 rounded-xl rounded-tl-none flex items-center justify-center text-zinc-500">
                <span className="inline-block w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce mx-0.5"></span>
                <span className="inline-block w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce mx-0.5 [animation-delay:0.2s]"></span>
                <span className="inline-block w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce mx-0.5 [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 bg-zinc-950 flex space-x-2 shrink-0">
          <input
            type="text"
            required
            disabled={isChatLoading}
            placeholder={`Ask Aether's ${selectedRole}... Using ${selectedModel}`}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1 text-xs bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            id="chat-input"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || isChatLoading}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition disabled:opacity-50"
            id="send-message-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
