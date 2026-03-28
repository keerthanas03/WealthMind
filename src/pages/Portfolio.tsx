import React, { useState } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, Briefcase, Trash2, Edit3, Check, X } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { ChartContainer } from '../components/ChartContainer';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Asset } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PortfolioProps {
  portfolio: Asset[];
  currency: string;
  setCurrency: (c: string) => void;
  formatCurrency: (v: number) => string;
  convert: (v: number) => number;
  addInvestment: () => void;
  newAsset: any;
  setNewAsset: (a: any) => void;
  deleteAsset?: (id: string) => void;
  updateCurrentValue?: (id: string, current: number) => void;
}

const TYPE_COLORS: Record<string, string> = {
  'Stock': 'from-blue-500 to-indigo-400',
  'Mutual Fund': 'from-emerald-500 to-teal-400',
  'Gold': 'from-amber-400 to-orange-400',
  'Bond': 'from-slate-500 to-slate-400',
  'Crypto': 'from-rose-500 to-pink-400',
  'Real Estate': 'from-brown-500 to-stone-400',
  'default': 'from-violet-500 to-fuchsia-400'
};

const COLORS = ['#10b981', '#f43f5e', '#0ea5e9', '#f59e0b', '#8b5cf6', '#14b8a6', '#d946ef'];
const currencySymbol: Record<string, string> = { INR: '₹', USD: '$', EUR: '€' };

export const Portfolio: React.FC<PortfolioProps> = ({
  portfolio, currency, setCurrency, formatCurrency, convert, addInvestment, newAsset, setNewAsset, deleteAsset, updateCurrentValue
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const sym = currencySymbol[currency] || '₹';
  const totalCurrent = portfolio.reduce((acc, p) => acc + p.current, 0);
  const totalInvested = portfolio.reduce((acc, p) => acc + p.invested, 0);
  const totalPnL = totalCurrent - totalInvested;

  const handleEditSave = (asset: Asset) => {
    if (updateCurrentValue && asset.id) {
      updateCurrentValue(asset.id, Number(editValue));
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-7">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">Portfolio Tracker</h2>
          <p className="text-xs text-slate-400 font-medium">Track assets, monitor gains, and rebalance.</p>
        </div>
        <select value={currency} onChange={e => setCurrency(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white/60 border border-slate-200 font-black text-xs text-slate-700 outline-none focus:border-violet-300 transition-colors">
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
        </select>
      </div>

      {/* P&L Summary */}
      {portfolio.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Invested', value: `${sym}${formatCurrency(convert(totalInvested))}`, sub: 'Principal', color: 'text-slate-700' },
            { label: 'Current Value', value: `${sym}${formatCurrency(convert(totalCurrent))}`, sub: 'Market Value', color: 'text-violet-700' },
            { label: 'Profit / Loss', value: `${totalPnL >= 0 ? '+' : ''}${sym}${formatCurrency(convert(Math.abs(totalPnL)))}`, sub: `${totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0}%`, color: totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600' },
          ].map(card => (
            <div key={card.label} className="glass-card p-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{card.label}</p>
              <p className={`text-xl font-black ${card.color} mb-0.5`}>{card.value}</p>
              <p className="text-[10px] font-bold text-slate-400">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Investment Form */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <PlusCircle size={16} />
          </div>
          <h3 className="text-sm font-black text-slate-900">Add New Investment</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <input placeholder="Asset Name" value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} className="p-3 rounded-xl bg-white/50 border border-slate-200 text-[12px] font-bold outline-none focus:border-blue-400 transition-colors placeholder:text-slate-400" />
          <input placeholder="Symbol" value={newAsset.tickerSymbol} onChange={e => setNewAsset({ ...newAsset, tickerSymbol: e.target.value })} className="p-3 rounded-xl bg-white/50 border border-slate-200 text-[12px] font-bold outline-none focus:border-blue-400 transition-colors placeholder:text-slate-400" />
          <select value={newAsset.type} onChange={e => setNewAsset({ ...newAsset, type: e.target.value })} className="p-3 rounded-xl bg-white/50 border border-slate-200 text-[12px] font-bold outline-none focus:border-blue-400 transition-colors text-slate-700">
            <option value="">Asset Type</option>
            <option>Stock</option>
            <option>Mutual Fund</option>
            <option>Gold</option>
            <option>Bond</option>
            <option>Crypto</option>
            <option>Real Estate</option>
          </select>
          <input type="number" placeholder="Qty" value={newAsset.quantity} onChange={e => setNewAsset({ ...newAsset, quantity: e.target.value })} className="p-3 rounded-xl bg-white/50 border border-slate-200 text-[12px] font-bold outline-none focus:border-blue-400 transition-colors placeholder:text-slate-400" />
          <input type="number" placeholder="Buy Price" value={newAsset.pricePerUnit} onChange={e => setNewAsset({ ...newAsset, pricePerUnit: e.target.value })} className="p-3 rounded-xl bg-white/50 border border-slate-200 text-[12px] font-bold outline-none focus:border-blue-400 transition-colors placeholder:text-slate-400" />
          <input type="date" value={newAsset.purchaseDate} onChange={e => setNewAsset({ ...newAsset, purchaseDate: e.target.value })} className="p-3 rounded-xl bg-white/50 border border-slate-200 text-[12px] font-bold outline-none focus:border-blue-400 transition-colors text-slate-700" />
        </div>
        <button onClick={addInvestment} className="w-full mt-4 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200/50 hover:shadow-blue-300/60 transition-all active:scale-[0.98]">
          Confirm Investment
        </button>
      </GlassCard>

      {/* Table + Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
        <div className="xl:col-span-2">
          <GlassCard className="overflow-hidden">
            {portfolio.length === 0 ? (
              <div className="p-16 text-center">
                <Briefcase size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-black text-slate-400">No assets yet. Add your first investment above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Asset', 'Type', 'Qty/Avg', 'Current', 'P&L', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence>
                      {portfolio.map((item, i) => {
                        const pnl = item.current - item.invested;
                        const pnlPct = item.invested > 0 ? ((pnl / item.invested) * 100) : 0;
                        const isEditing = editingId === item.id;
                        return (
                          <motion.tr 
                            key={item.id || i} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0 }} 
                            whileHover={{ scale: 1.005, backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
                            className="group transition-all duration-200 border-b border-slate-50/50 last:border-0"
                          >
                            <td className="px-5 py-5">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.type ? TYPE_COLORS[item.type] || TYPE_COLORS.default : TYPE_COLORS.default} flex items-center justify-center text-white font-black text-sm shadow-md transition-transform group-hover:scale-110`}>
                                  {item.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-black text-slate-900 text-[13px] leading-none mb-1.5">{item.name}</p>
                                  <div className="flex items-center gap-1.5">
                                    {item.tickerSymbol && <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded tracking-widest">{item.tickerSymbol}</span>}
                                    <span className="text-[9px] font-bold text-slate-300">{item.purchaseDate?.split('T')[0]}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-5">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black bg-gradient-to-br ${item.type ? TYPE_COLORS[item.type] || TYPE_COLORS.default : TYPE_COLORS.default} bg-opacity-10 text-slate-600 border border-slate-100`}>
                                {item.type || '—'}
                              </span>
                            </td>
                            <td className="px-5 py-5 text-slate-700">
                               <p className="text-[13px] font-black">{item.quantity || 1}</p>
                               <p className="text-[10px] font-bold opacity-40">{sym}{formatCurrency(convert(item.pricePerUnit || item.invested))}</p>
                            </td>
                            <td className="px-5 py-5">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-24 p-2 rounded-xl border border-blue-400 text-xs font-bold outline-none shadow-sm" autoFocus />
                                  <button onClick={() => handleEditSave(item)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><Check size={14} /></button>
                                  <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100"><X size={14} /></button>
                                </div>
                              ) : (
                                <span className="font-black text-[14px] text-slate-900 tracking-tight">{sym}{formatCurrency(convert(item.current))}</span>
                              )}
                            </td>
                            <td className="px-5 py-5">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[12px] leading-none ${pnl >= 0 ? 'text-emerald-700 bg-emerald-50/60' : 'text-rose-600 bg-rose-50/60'}`}>
                                {pnl >= 0 ? <TrendingUp size={13} strokeWidth={3} /> : <TrendingDown size={13} strokeWidth={3} />}
                                {pnl >= 0 ? '+' : ''}{sym}{formatCurrency(convert(Math.abs(pnl)))}
                                <span className="text-[9px] font-bold opacity-60 ml-0.5">{pnlPct.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-5">
                              <div className="flex items-center gap-1.5">
                                {updateCurrentValue && (
                                  <button onClick={() => { setEditingId(item.id || null); setEditValue(String(item.current)); }} className="p-2 text-slate-400 hover:text-blue-600 transition-all rounded-xl hover:bg-blue-50">
                                    <Edit3 size={14} />
                                  </button>
                                )}
                                {deleteAsset && item.id && (
                                  <button onClick={() => deleteAsset(item.id!)} className="p-2 text-slate-400 hover:text-rose-500 transition-all rounded-xl hover:bg-rose-50">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        <div>
          <ChartContainer title="Asset Mix" height={220}>
            <PieChart>
              <Pie data={portfolio.map(p => ({ name: p.name, value: convert(p.current) }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5}>
                {portfolio.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
              </Pie>
              <Tooltip formatter={(v: any) => `${sym}${Number(v).toLocaleString()}`} />
            </PieChart>
          </ChartContainer>
          <div className="mt-5 space-y-2.5 px-2">
            {portfolio.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[11px] font-bold text-slate-600 truncate max-w-[120px]">{p.name}</span>
                </div>
                <span className="text-[11px] font-black text-slate-900">{totalCurrent > 0 ? ((p.current / totalCurrent) * 100).toFixed(1) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
