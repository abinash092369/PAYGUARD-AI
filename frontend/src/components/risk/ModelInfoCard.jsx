import React from 'react'
import { Cpu, ShieldCheck, Database, BarChart3, CheckCircle2 } from 'lucide-react'

export function ModelInfoCard() {
  const metadata = {
    model_name: "Random Forest Classifier",
    dataset_size: "50,000 synthetic transactions",
    num_features: 38,
    fraud_rate: "4.26%",
    metrics: {
      precision: 0.9715,
      recall: 0.9601,
      f1_score: 0.9658,
      roc_auc: 0.9994,
      pr_auc: 0.9915
    }
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-left space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100">PayGuard AI Model Transparency</h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          CACHED INFERENCE ENGINE
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Selected Model</p>
          <p className="font-bold text-slate-100 mt-1">{metadata.model_name}</p>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Training Baseline</p>
          <p className="font-bold text-slate-100 mt-1">{metadata.dataset_size}</p>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Feature Vectors</p>
          <p className="font-bold text-slate-100 mt-1">{metadata.num_features} Model Signals</p>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Dataset Fraud Rate</p>
          <p className="font-bold text-emerald-400 mt-1">{metadata.fraud_rate}</p>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="pt-1">
        <p className="text-[11px] font-semibold text-slate-400 mb-2">Evaluated Synthetic Test Split Metrics:</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 font-bold">PRECISION</p>
            <p className="text-sm font-black text-cyan-400 mt-0.5">{(metadata.metrics.precision * 100).toFixed(2)}%</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 font-bold">RECALL</p>
            <p className="text-sm font-black text-cyan-400 mt-0.5">{(metadata.metrics.recall * 100).toFixed(2)}%</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 font-bold">F1-SCORE</p>
            <p className="text-sm font-black text-emerald-400 mt-0.5">{(metadata.metrics.f1_score * 100).toFixed(2)}%</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 font-bold">ROC-AUC</p>
            <p className="text-sm font-black text-cyan-400 mt-0.5">{(metadata.metrics.roc_auc * 100).toFixed(2)}%</p>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 font-bold">PR-AUC</p>
            <p className="text-sm font-black text-emerald-400 mt-0.5">{(metadata.metrics.pr_auc * 100).toFixed(2)}%</p>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 italic">
        Note: Metrics represent model evaluation on the project's synthetic dataset and test split.
      </p>
    </div>
  )
}
