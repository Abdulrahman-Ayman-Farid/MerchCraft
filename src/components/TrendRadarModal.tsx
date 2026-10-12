import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  ExternalLink,
  Flame,
  ArrowRight,
  RefreshCw,
  X,
  Compass,
  CheckCircle2,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { TrendTopic, Product, LogoConfig } from '../types/merch';

interface TrendRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onApplyTrend: (trend: TrendTopic) => void;
}

export const TrendRadarModal: React.FC<TrendRadarModalProps> = ({
  isOpen,
  onClose,
  products,
  onApplyTrend,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(
    'current 2026 apparel merchandise trends streetwear colorways placements'
  );
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [trends, setTrends] = useState<TrendTopic[]>([]);
  const [marketInsight, setMarketInsight] = useState<string>('');
  const [sources, setSources] = useState<{ title: string; url: string }[]>([]);
  const [appliedTitle, setAppliedTitle] = useState<string | null>(null);

  const fetchTrends = async (queryToSearch: string) => {
    try {
      setIsSearching(true);
      const res = await fetch('/api/search-merch-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToSearch }),
      });
      const data = await res.json();
      if (data.trends) {
        setTrends(data.trends);
        setMarketInsight(data.marketInsight || '');
        setSources(data.sources || []);
      }
    } catch (err) {
      console.error('Trend search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (isOpen && trends.length === 0) {
      fetchTrends(searchQuery);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectTrend = (t: TrendTopic) => {
    onApplyTrend(t);
    setAppliedTitle(t.title);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-white">Live Merch Trend Radar</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Google Search Grounded • gemini-3.5-flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live web-grounded market intelligence on 2026 apparel trends, viral colorways, and
                placement styles.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Query Input */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchTrends(searchQuery);
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search live trends (e.g. heavyweight streetwear tees, coffee merch, vintage wash hoodies)..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching Web...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Search Trends</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {[
              '2026 streetwear oversized graphic tee placements',
              'Trending coffee shop branded merchandise',
              'Vintage wash French Terry hoodies aesthetics',
              'Minimalist sustainable organic cotton tote bags',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setSearchQuery(chip);
                  fetchTrends(chip);
                }}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-400 hover:text-slate-200 transition"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Trends Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Market Insight Banner */}
          {marketInsight && (
            <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-2xl p-4 text-xs text-indigo-200 flex items-start space-x-3">
              <Compass className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white uppercase text-[10px] tracking-wider block mb-0.5">
                  Real-Time Market Insight
                </span>
                <p className="leading-relaxed">{marketInsight}</p>
              </div>
            </div>
          )}

          {/* Trend Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trends.map((t, idx) => {
              const isApplied = appliedTitle === t.title;
              return (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition group hover:shadow-xl"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-slate-800 flex items-center space-x-1">
                        <Flame className="w-2.5 h-2.5 text-amber-400" />
                        <span>{t.category}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {t.printMethodRecommendation}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition">
                      {t.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{t.summary}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 space-y-3">
                    {/* Colorway & Placement details */}
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm"
                          style={{ backgroundColor: t.recommendedColorHex }}
                        />
                        <span className="text-slate-300">{t.recommendedColorName}</span>
                      </div>
                      <span className="text-slate-400 font-mono capitalize">
                        {t.recommendedPlacement.replace('-', ' ')}
                      </span>
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={() => handleSelectTrend(t)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                        isApplied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Applied to Studio!</span>
                        </>
                      ) : (
                        <>
                          <span>Apply Trend to Mockup</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grounding Web Sources Citations */}
          {sources.length > 0 && (
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                <span>Google Search Verified Sources</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 hover:text-indigo-300 transition"
                  >
                    <span className="truncate max-w-[200px]">{s.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
