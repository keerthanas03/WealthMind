import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const SIPCalculator: React.FC = () => {
  const [investment, setInvestment] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const { invested, returns, total } = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    // SIP Formula: M = P × ({[1 + i]^n - 1} / i) × (1 + i)
    const futureValue = investment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const totalInvested = investment * months;
    const estReturns = futureValue - totalInvested;

    return {
      invested: totalInvested,
      returns: estReturns,
      total: futureValue
    };
  }, [investment, rate, years]);

  const data = [
    { name: 'Invested Amount', value: invested, color: '#94a3b8' }, 
    { name: 'Est. Returns', value: returns, color: '#10b981' }   
  ];

  return (
    <div className="space-y-7">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shrink-0">
          <Calculator size={20} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">SIP Calculator</h2>
          <p className="text-xs text-slate-400 font-medium">Estimate your mutual fund returns through Systematic Investment Plans.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Monthly Investment</label>
                <div className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">₹{investment.toLocaleString('en-IN')}</div>
              </div>
              <input 
                type="range" min="500" max="100000" step="500" value={investment} 
                onChange={(e) => setInvestment(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Expected Return Rate (p.a)</label>
                <div className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{rate}%</div>
              </div>
              <input 
                type="range" min="1" max="30" step="0.5" value={rate} 
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="mb-2">
              <div className="flex justify-between mb-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Time Period</label>
                <div className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{years} Yr</div>
              </div>
              <input 
                type="range" min="1" max="40" step="1" value={years} 
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5 border-l-4 border-l-slate-400">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Invested Amount</p>
              <p className="text-xl font-black text-slate-700">₹{invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="glass-card p-5 border-l-4 border-l-emerald-500 bg-emerald-50/30">
              <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-1">Est. Returns</p>
              <p className="text-xl font-black text-emerald-600">₹{returns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <GlassCard className="p-8 flex flex-col items-center justify-center relative overflow-hidden text-center min-h-[400px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400 opacity-5 rounded-bl-[100px] pointer-events-none" />
          
          <div className="w-full h-64 relative mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none"
                >
                  {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ fontWeight: 800 }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <TrendingUp size={24} className="text-emerald-500 mb-1" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</p>
            </div>
          </div>
          
          <h3 className="text-3xl font-black text-slate-900 mb-2">
            ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h3>
          <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Total Wealth Created
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
