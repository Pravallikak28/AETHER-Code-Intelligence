import React, { useState } from "react";
import { RepositoryMemory, Decision } from "../types";
import { BookOpen, Plus, BadgeCheck, FileText, Code, CheckCircle, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MemoryPanelProps {
  memory?: RepositoryMemory;
  onAddDecision?: (decision: Decision) => void;
}

export default function MemoryPanel({ memory, onAddDecision }: MemoryPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newStatus, setNewStatus] = useState("ACCEPTED");

  if (!memory) {
    return (
      <div className="flex flex-col items-center justify-center h-96 border border-zinc-800 rounded-xl bg-zinc-950 p-6 text-center">
        <BookOpen className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" />
        <p className="text-zinc-400 font-medium">Repository memory bank offline.</p>
        <p className="text-zinc-600 text-xs mt-1">Select a template or parse some files to compile system decisions, conventions, and discussions.</p>
      </div>
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newReason.trim()) return;
    if (onAddDecision) {
      onAddDecision({
        title: newTitle,
        reason: newReason,
        status: newStatus
      });
      setNewTitle("");
      setNewReason("");
      setNewStatus("ACCEPTED");
      setShowAddForm(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACCEPTED":
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "DEPRECATED":
      case "SUPERSEDED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "PROPOSED":
      case "DRAFT":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="memory-panel">
      {/* Left side: Architectural Guidelines / Conventions */}
      <div className="lg:col-span-1 border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-2">
            <Code className="w-4 h-4" />
            <span>Codebase Constraints</span>
          </div>
          <h3 className="text-lg font-sans font-medium text-white">System Conventions</h3>
          <p className="text-xs text-zinc-500 leading-relaxed mt-1">
            Core coding conventions, dependency patterns, and decoupling models detected in this system.
          </p>
        </div>

        <div className="space-y-3">
          {memory.conventions.length === 0 ? (
            <p className="text-xs text-zinc-600 italic">No static conventions identified.</p>
          ) : (
            memory.conventions.map((convention, i) => (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={i}
                className="flex items-start space-x-3 bg-zinc-900/40 border border-zinc-800 p-3 rounded-lg hover:border-zinc-700 transition"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-zinc-300 leading-relaxed">{convention}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Right side: Architectural Decisions Record (ADR) */}
      <div className="lg:col-span-2 border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>Architectural Decisions Record</span>
            </div>
            <h3 className="text-lg font-sans font-medium text-white">Project Memory Bank</h3>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1 text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg transition"
            id="log-decision-btn"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            <span>Log Decision</span>
          </button>
        </div>

        {/* Dynamic decision logger form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleFormSubmit}
              className="overflow-hidden bg-zinc-900/60 border border-indigo-900/40 p-4 rounded-lg space-y-3"
              id="adr-form"
            >
              <h4 className="text-xs font-mono text-indigo-300 uppercase tracking-widest">Register New Architectural Choice</h4>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Decision title... (e.g. Migrate ledger logic to CQRS)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                    id="new-decision-title"
                  />
                </div>
                <div>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-indigo-500"
                    id="new-decision-status"
                  >
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="PROPOSED">PROPOSED</option>
                    <option value="SUPERSEDED">SUPERSEDED</option>
                  </select>
                </div>
              </div>

              <div>
                <textarea
                  required
                  placeholder="Elaborate context and architectural justification..."
                  rows={2}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                  id="new-decision-reason"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs px-2.5 py-1 text-zinc-500 hover:text-zinc-300 transition"
                  id="cancel-decision-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1 rounded transition"
                  id="submit-decision-btn"
                >
                  Save to Memory
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Decision records list */}
        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
          {memory.architectureDecisions.map((decision, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idx}
              className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/20 hover:bg-zinc-950/40 hover:border-zinc-700 transition space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <BadgeCheck className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-semibold text-white leading-snug">{decision.title}</h4>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getStatusColor(decision.status)}`}>
                  {decision.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed pl-6">{decision.reason}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
