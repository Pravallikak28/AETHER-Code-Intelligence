import React, { useState } from "react";
import { Sequence, Step } from "../types";
import { Waypoints, MoveRight, HelpCircle, Activity, Play, ChevronRight, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SequencesPanelProps {
  sequences?: Sequence[];
}

export default function SequencesPanel({ sequences }: SequencesPanelProps) {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [selectedStepIdx, setSelectedStepIdx] = useState<number | null>(0);

  if (!sequences || sequences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 border border-zinc-800 rounded-xl bg-zinc-950 p-6 text-center">
        <Waypoints className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" />
        <p className="text-zinc-400 font-medium">No system execution sequence scenarios configured.</p>
        <p className="text-zinc-600 text-xs mt-1">Select an architecture blueprint template above or supply a custom description of operation threads to construct traces.</p>
      </div>
    );
  }

  const activeSequence = sequences[activeScenarioIdx];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="sequences-panel">
      {/* Left Column: List of scenarios (lg:col-span-4) */}
      <div className="lg:col-span-4 border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 space-y-4 flex flex-col h-[480px]">
        <div>
          <div className="flex items-center space-x-1.5 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Trace Intelligence</span>
          </div>
          <h3 className="text-sm font-medium text-white">System Scenarios</h3>
          <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
            Select a transaction thread below to mapping out exactly how subsystems pass messages, payloads, and tokens.
          </p>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
          {sequences.map((seq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveScenarioIdx(idx);
                setSelectedStepIdx(0);
              }}
              className={`w-full text-left p-3.5 rounded-lg border transition space-y-1 block ${
                activeScenarioIdx === idx
                  ? "bg-zinc-900 border-indigo-500/45 text-white"
                  : "bg-zinc-950/20 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200"
              }`}
              id={`scenario-btn-${idx}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-mono text-indigo-400">THREAD #0{idx + 1}</span>
                <Bookmark className={`w-3.5 h-3.5 ${activeScenarioIdx === idx ? 'text-indigo-400' : 'text-zinc-700'}`} />
              </div>
              <h4 className="text-xs font-semibold leading-relaxed truncate">{seq.scenario}</h4>
              <p className="text-[10px] text-zinc-500 font-mono text-right">{seq.steps.length} Steps</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Interactive Step Walkthrough (lg:col-span-8) */}
      <div className="lg:col-span-8 border border-zinc-800 rounded-xl bg-zinc-950/40 p-5 flex flex-col h-[480px]">
        {/* Sequence Banner */}
        <div className="border-b border-zinc-900 pb-4 mb-4 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">Active Sequence Flow</span>
            <h3 className="text-base font-semibold text-white mt-1 leading-snug">{activeSequence?.scenario}</h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-zinc-500">Execution Timeline</span>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 mr-1">
          {activeSequence?.steps.map((step, idx) => {
            const isSelected = selectedStepIdx === idx;
            return (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={idx}
                onClick={() => setSelectedStepIdx(idx)}
                className={`border p-3.5 rounded-xl cursor-pointer transition flex items-start space-x-4 ${
                  isSelected
                    ? "bg-zinc-900/80 border-indigo-500/30 shadow-md shadow-indigo-950/10"
                    : "bg-zinc-950/35 border-zinc-900/60 hover:bg-zinc-900/20 hover:border-zinc-800"
                }`}
                id={`sequence-step-${idx}`}
              >
                {/* Step indicator */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono font-semibold transition ${
                    isSelected 
                    ? "bg-indigo-600 border-indigo-500 text-white" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400"
                  }`}>
                    {idx + 1}
                  </div>
                  {idx < (activeSequence.steps.length - 1) && (
                    <div className="w-[1.5px] h-10 bg-zinc-800 mt-2"></div>
                  )}
                </div>

                {/* Step details */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                    <div className="flex items-center space-x-1.5 font-mono text-[10px] text-zinc-400">
                      <span className="text-white font-medium bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">{step.from}</span>
                      <MoveRight className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span className="text-white font-medium bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">{step.to}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[9px] font-mono uppercase text-indigo-400 px-1.5 py-0.5 bg-indigo-900/20 border border-indigo-900/30 rounded animate-pulse">
                        Analyzing state payload
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-semibold text-white leading-relaxed">{step.message}</h4>

                  {/* Operational context (revealed on selection) */}
                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950 border border-zinc-900 p-3 rounded-lg mt-2 font-sans">
                          {step.details}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
