import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { StatsGrid } from '../components/StatsGrid';
import { ChartContainer } from '../components/ChartContainer';
import { Asset, Goal } from '../types';
import { TrendingUp, TrendingDown, Target, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  portfolio: Asset[];
  portfolioHistory: any[];
  goals: Goal[];
  userName?: string;
}

const COLORS = ['#10b981', '#f43f5e', '#0ea5e9', '#f59e0b', '#8b5cf6', '#14b8a6', '#d946ef'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-white/90 border border-slate-200 rounded-2xl shadow-xl backdrop-blur-xl">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.label}</p>
        <p className="text-lg font-black text-slate-900">₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<DashboardProps> = ({ portfolio, portfolioHistory, goals, userName }) => {
  const totalInvested = portfolio.reduce((acc, curr) => acc + curr.invested, 0);
  const totalCurrent = portfolio.reduce((acc, curr) => acc + curr.current, 0);
  const totalPnL = totalCurrent - totalInvested;
  const pnlPct = totalInvested > 0 ? ((totalPnL / totalInvested) * 100) : 0;
  const isProfit = totalPnL >= 0;
  const avgProgress = goals.length > 0 ? (goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0;

  // Real historical data with fallback to synthetic data if history is empty or too short
  const chartData = useMemo(() => {
    if (totalInvested === 0) return [];
    
    // Use actual database history if there are at least 2 data points (to draw a line)
    if (portfolioHistory && portfolioHistory.length >= 2) {
      return portfolioHistory.map((entry) => {
        const date = new Date(entry.created_at);
        const label = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        return {
          label,
          Invested: totalInvested, // Simplification: assume invested is roughly current tracking, can be expanded later
          Current: entry.total_value,
        };
      });
    }

    // Fallback: Use dynamic synthetic data for new accounts with 0 or 1 historical entries
    const months = ['6M ago', '5M ago', '4M ago', '3M ago', '2M ago', 'Last M', 'Today'];
    return months.map((label, i) => {
      const progress = i / (months.length - 1);
      const volatility = Math.sin(i * 1.5) * 0.02 * totalInvested; 
      const currentHist = Math.round(totalInvested + (totalPnL * progress) + (i === months.length - 1 ? 0 : volatility));

      return {
        label,
        Invested: totalInvested,
        Current: currentHist,
      };
    });
  }, [totalInvested, totalPnL, portfolioHistory]);

  const allocationData = portfolio.reduce((acc: any[], curr) => {
    const existing = acc.find(d => d.name === (curr.type || 'Other'));
    if (existing) existing.value += curr.current;
    else acc.push({ name: curr.type || 'Other', value: curr.current });
    return acc;
  }, []);

  const stats = [
    {
      label: 'Net Worth',
      value: `₹${totalCurrent.toLocaleString('en-IN')}`,
      change: isProfit ? `+${pnlPct.toFixed(1)}%` : `${pnlPct.toFixed(1)}%`,
      color: isProfit ? 'from-emerald-500 to-teal-400' : 'from-rose-500 to-orange-400',
    },
    {
      label: 'Total P&L',
      value: `${isProfit ? '+' : ''}₹${Math.abs(totalPnL).toLocaleString('en-IN')}`,
      change: isProfit ? 'Profit' : 'Loss',
      color: isProfit ? 'from-violet-500 to-fuchsia-500' : 'from-rose-500 to-pink-400',
    },
    {
      label: 'Goal Progress',
      value: `${avgProgress.toFixed(0)}%`,
      change: `${goals.length} Goal${goals.length !== 1 ? 's' : ''}`,
      color: 'from-blue-500 to-cyan-400',
    },
    {
      label: 'Assets Tracked',
      value: portfolio.length.toString(),
      change: `${allocationData.length} types`,
      color: 'from-slate-600 to-slate-800',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">{getGreeting()}, {userName}! 👋</h2>
          <p className="text-xs text-slate-400 font-medium">Here's your financial health at a glance.</p>

        </div>
        {portfolio.length > 0 && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${isProfit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'} border ${isProfit ? 'border-emerald-200' : 'border-rose-200'}`}>
            {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="font-black text-xs">Overall {isProfit ? 'Profit' : 'Loss'}: {isProfit ? '+' : ''}₹{Math.abs(totalPnL).toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      <StatsGrid stats={stats} />

      {portfolio.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-violet-50 flex items-center justify-center">
            <Award size={36} className="text-violet-300" />
          </div>
          <p className="text-sm font-black text-slate-400 mb-2">Your dashboard is empty</p>
          <p className="text-xs text-slate-300 font-medium">Head to Portfolio to add your first investment and start tracking wealth here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Growth Chart */}
          <div className="lg:col-span-2">
            <ChartContainer title="Wealth Journey">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} dx={-10} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Invested" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#gradInvested)" />
                <Area type="monotone" dataKey="Current" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#gradCurrent)" />
              </AreaChart>
            </ChartContainer>
            {/* Legend */}
            <div className="flex gap-6 px-4 mt-3">
              {[{ label: 'Invested', color: '#cbd5e1', dashed: true }, { label: 'Current Value', color: '#7c3aed', dashed: false }].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: l.color, borderStyle: l.dashed ? 'dashed' : 'solid' }} />
                  <span className="text-[10px] font-bold text-slate-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Allocation Donut */}
          <div className="space-y-4">
            <ChartContainer title="Asset Allocation" height={180}>
              <PieChart>
                <Pie data={allocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={6}>
                  {allocationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
              </PieChart>
            </ChartContainer>
            <div className="space-y-2.5 px-2">
              {allocationData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[11px] font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-slate-900">
                    {totalCurrent > 0 ? ((item.value / totalCurrent) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              ))}
            </div>

            {/* Goals progress summary */}
            {goals.length > 0 && (
              <div className="glass-card p-5 mt-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Goal Milestones</p>
                <div className="space-y-3">
                  {goals.slice(0, 3).map((goal, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{goal.name}</span>
                        <span className="text-[10px] font-black text-violet-600">{goal.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
