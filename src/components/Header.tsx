import React from 'react';
import { Sparkles, Download, FileText, Layers, Archive, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'studio' | 'ai-generator' | 'techpack';
  setActiveTab: (tab: 'studio' | 'ai-generator' | 'techpack') => void;
  onOpenExport: () => void;
  onExportZip: () => void;
  onOpenTrendRadar: () => void;
  isExportingZip: boolean;
  zipProgress: { percent: number; status: string } | null;
  dpiRating: { dpi: number; label: string; status: 'good' | 'acceptable' | 'low' };
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  onExportZip,
  onOpenTrendRadar,
  isExportingZip,
  zipProgress,
  dpiRating,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                MerchCraft
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Studio AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              On-Demand Merch Mockups & Print-Ready Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Trend Radar */}
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'studio'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-generator')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'ai-generator'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Scene Shots</span>
            </button>

            <button
              onClick={() => setActiveTab('techpack')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'techpack'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tech Pack</span>
            </button>
          </div>

          {/* Trend Radar Button with Google Search Badge */}
          <button
            onClick={onOpenTrendRadar}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition shadow-sm"
            title="Explore live 2026 apparel trends grounded with Google Search"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden md:inline">Trend Radar</span>
            <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1 py-0.2 rounded font-mono border border-amber-400/30">
              Live
            </span>
          </button>
        </div>

        {/* Actions & Print DPI Indicator */}
        <div className="flex items-center space-x-2.5">
          {/* Print Resolution Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                dpiRating.status === 'good'
                  ? 'text-emerald-400'
                  : dpiRating.status === 'acceptable'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            />
            <span className="text-[11px] font-mono text-slate-300">
              {dpiRating.dpi} DPI
            </span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                dpiRating.status === 'good'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : dpiRating.status === 'acceptable'
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {dpiRating.label}
            </span>
          </div>

          {/* Export Bundle ZIP Button */}
          <button
            onClick={onExportZip}
            disabled={isExportingZip}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-50"
            title="Download ZIP with all product mockups for Shopify / Etsy"
          >
            <Archive className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isExportingZip ? 'Packaging...' : 'Export ZIP'}</span>
          </button>

          {/* Export Print-Ready Master Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition hover:shadow-indigo-600/50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Print Files</span>
          </button>
        </div>
      </div>

      {/* Zip Export Progress Bar if Active */}
      {isExportingZip && zipProgress && (
        <div className="bg-indigo-950/80 border-t border-indigo-800/50 px-4 py-1.5 text-xs text-indigo-200 flex items-center justify-between">
          <span className="flex items-center space-x-2 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>{zipProgress.status}</span>
          </span>
          <span className="font-mono font-bold">{zipProgress.percent}%</span>
        </div>
      )}
    </header>
  );
};
