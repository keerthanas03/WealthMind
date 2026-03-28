import React from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { Brain, TrendingUp, AlertTriangle, RefreshCw, Activity, BarChart2 } from 'lucide-react';

interface Bias {
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  recommendation?: string;
}

interface Sentiment {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  score: number;
  summary: string;
  keyFactors: string[];
  _isFallback?: boolean;
}

const SEVERITY_CONFIG = {
  High: { color: 'from-rose-500 to-orange-400', bg: 'bg-rose-50', badge: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200' },
  Medium: { color: 'from-amber-500 to-yellow-400', bg: 'bg-amber-50', badge: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200' },
  Low: { color: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-50', badge: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const BIAS_RECOMMENDATIONS: Record<string, string> = {
  'Home Bias': 'Consider adding 1-2 international ETFs or mutual funds to diversify beyond domestic markets.',
  'Loss Aversion': 'Review your stop-loss settings. Use SIPs to automate investing and reduce emotional decisions.',
  'Overconfidence': 'Compare your picks with a benchmark index. Consider rebalancing to index funds for part of your portfolio.',
  'Recency Bias': 'Avoid over-reacting to recent market events. Maintain your long-term allocation strategy.',
  'Herding Bias': 'Research independently before following popular investment trends. Check fundamentals.',
  'Anchoring Bias': 'Use current valuations rather than purchase prices for decision making.',
  'Default': 'Review your investment thesis regularly and stick to your original financial plan.',
};

const getRecommendation = (title: string) => {
  for (const [key, val] of Object.entries(BIAS_RECOMMENDATIONS)) {
    if (title.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return BIAS_RECOMMENDATIONS['Default'];
};

// --- BIAS ALERTS ---
export const BiasAlerts: React.FC<{ biases: Bias[], onAnalyze: () => void, loading: boolean, error?: string }> = ({ biases, onAnalyze, loading, error }) => {
  const highCount = biases.filter(b => b.severity === 'High').length;
  const medCount = biases.filter(b => b.severity === 'Medium').length;

  return (
    <div className="space-y-7">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">Behavioral Insights</h2>
          <p className="text-xs text-slate-400 font-medium">AI analysis of your psychological investment patterns.</p>
        </div>
        <button onClick={onAnalyze} disabled={loading} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-xl font-black text-xs shadow-lg hover:shadow-violet-300/50 transition-all active:scale-95 disabled:opacity-50">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analyzing...' : 'Run AI Analysis'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle size={14} className="text-amber-500 shrink-0" />
          <p className="text-xs font-bold text-amber-700">
            {error.toLowerCase().includes('quota') ? 'AI quota reached — showing last cached analysis.' : error}
          </p>
        </div>
      )}

      {/* Summary chips when biases found */}
      {biases.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis Summary:</span>
          {highCount > 0 && <span className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black">{highCount} High Risk</span>}
          {medCount > 0 && <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black">{medCount} Medium Risk</span>}
          {biases.filter(b => b.severity === 'Low').length > 0 && (
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">
              {biases.filter(b => b.severity === 'Low').length} Low Risk
            </span>
          )}
        </div>
      )}

      <div className="space-y-4">
        {biases.length > 0 ? biases.map((bias, i) => {
          const cfg = SEVERITY_CONFIG[bias.severity] || SEVERITY_CONFIG.Low;
          const rec = bias.recommendation || getRecommendation(bias.title);
          return (
            <motion.div key={bias.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <GlassCard className="p-6 overflow-hidden">
                <div className="flex items-start gap-5">
                  {/* Severity bar */}
                  <div className={`w-1.5 self-stretch rounded-full bg-gradient-to-b ${cfg.color} shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-black text-slate-900 text-sm">{bias.title}</span>
                      <span className={`px-2.5 py-1 ${cfg.badge} text-white text-[9px] font-black uppercase rounded-lg`}>{bias.severity} Risk</span>
                    </div>
                    <p className="text-[12px] text-slate-500 font-medium mb-4 leading-relaxed">{bias.description}</p>
                    {/* Recommendation */}
                    <div className={`p-3.5 rounded-xl ${cfg.bg} border ${cfg.border} flex items-start gap-2.5`}>
                      <Brain size={13} className={`${cfg.text} shrink-0 mt-0.5`} />
                      <div>
                        <p className={`text-[9px] font-black ${cfg.text} uppercase tracking-widest mb-0.5`}>AI Recommendation</p>
                        <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{rec}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        }) : (
          <GlassCard className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-violet-50 flex items-center justify-center">
              <Brain size={28} className="text-violet-300" />
            </div>
            <p className="text-sm font-black text-slate-400 mb-1">{loading ? 'AI is scanning your portfolio...' : 'No analysis yet'}</p>
            <p className="text-xs text-slate-300 font-medium">Add investments to your portfolio, then run the analysis to detect cognitive biases.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

// --- MARKET SENTIMENT ---
const sentimentConfig = {
  Bullish: { label: 'Bullish', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: TrendingUp },
  Bearish: { label: 'Bearish', color: 'from-rose-500 to-orange-400', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: Activity },
  Neutral: { label: 'Neutral', color: 'from-amber-400 to-yellow-400', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: BarChart2 },
};

export const MarketSentiment: React.FC<{ sentiment: Sentiment | null, error?: string, onRefresh?: () => void }> = ({ sentiment, error, onRefresh }) => {
  const cfg = sentiment ? sentimentConfig[sentiment.sentiment] || sentimentConfig.Neutral : sentimentConfig.Neutral;
  const score = sentiment?.score || 50;
  const SentIcon = cfg.icon;

  // Fear vs Greed label
  const moodLabel = score >= 70 ? 'Extreme Greed' : score >= 55 ? 'Greed' : score >= 45 ? 'Neutral' : score >= 30 ? 'Fear' : 'Extreme Fear';

  return (
    <div className="space-y-7 max-w-3xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">Market Sentiment</h2>
          <p className="text-xs text-slate-400 font-medium">AI-powered global market mood analysis.</p>
        </div>
        {onRefresh && (
          <button onClick={onRefresh} className="flex items-center gap-2 px-5 py-3 bg-white/60 border border-slate-200 text-slate-600 rounded-xl font-black text-xs hover:border-violet-300 transition-all active:scale-95">
            <RefreshCw size={12} /> Refresh
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-amber-700 text-center">
          {error.toLowerCase().includes('quota') ? '⏳ Using last available market data (quota reached)' : error}
        </div>
      )}

      {!sentiment && !error && (
        <div className="glass-card p-16 text-center">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-black text-slate-400">Gathering market intelligence...</p>
        </div>
      )}

      {sentiment && (
        <>
          {/* Main gauge card */}
          <GlassCard className="p-10 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${cfg.color} opacity-5`} />
            
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${cfg.bg} border ${cfg.border} mb-6`}>
              <SentIcon size={14} className={cfg.text} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.text}`}>{cfg.label} Market</span>
            </div>

            {/* Score ring */}
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <motion.circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="url(#gaugeGrad)" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - score / 100) }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                <span className="text-3xl font-black text-slate-900">{score}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">/ 100</span>
              </div>
            </div>

            {/* Mood label */}
            <p className="text-2xl font-black text-slate-900 mb-2">{moodLabel}</p>
            <p className="text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed">{sentiment.summary}</p>

            {/* Fear/Greed scale */}
            <div className="mt-8 mb-3">
              <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)' }}>
                <motion.div
                  className="absolute top-0 w-4 h-4 bg-white border-2 border-slate-800 rounded-full -translate-y-0.5 shadow-lg"
                  initial={{ left: '50%' }}
                  animate={{ left: `${score}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                {['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'].map(l => (
                  <span key={l} className="text-[8px] font-black text-slate-400 uppercase">{l}</span>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Key factors */}
          {sentiment.keyFactors?.length > 0 && (
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Key Market Drivers</p>
              <div className="grid grid-cols-2 gap-3">
                {sentiment.keyFactors.map((factor, i) => (
                  <motion.div key={factor} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 p-4 glass-card">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-700">{factor}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {sentiment._isFallback && (
            <p className="text-center text-[10px] font-bold text-slate-400 italic mt-2">* Showing demo data — AI quota limit reached</p>
          )}
        </>
      )}
    </div>
  );
};
