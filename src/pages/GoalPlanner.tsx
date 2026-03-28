import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { Goal } from '../types';
import { Target, X, Trophy, Trash2, ChevronUp, ChevronDown, Home, Car, Plane, GraduationCap, Briefcase } from 'lucide-react';

interface GoalPlannerProps {
  goals: Goal[];
  onAddGoal: (goal: Partial<Goal>) => void;
  onDeleteGoal?: (id: string) => void;
  onUpdateProgress?: (id: string, progress: number) => void;
}

const GOAL_COLORS = [
  'from-violet-500 to-fuchsia-500',
  'from-rose-500 to-orange-400',
  'from-emerald-500 to-teal-400',
  'from-blue-500 to-cyan-400',
  'from-pink-500 to-rose-400',
];

const GOAL_ICONS = [Target, Home, GraduationCap, Plane, Car, Briefcase];

export const GoalPlanner: React.FC<GoalPlannerProps> = ({ goals, onAddGoal, onDeleteGoal, onUpdateProgress }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    name: '', target: 0, year: new Date().getFullYear() + 5, progress: 0, color: GOAL_COLORS[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGoal({ ...newGoal, icon: Target });
    setIsModalOpen(false);
    setNewGoal({ name: '', target: 0, year: new Date().getFullYear() + 5, progress: 0, color: GOAL_COLORS[0] });
  };

  const adjustProgress = (goal: Goal, delta: number) => {
    const next = Math.min(100, Math.max(0, goal.progress + delta));
    if (onUpdateProgress && goal.id) onUpdateProgress(goal.id, next);
  };

  const yearsLeft = (year?: number) => {
    if (!year) return null;
    const diff = year - new Date().getFullYear();
    return diff > 0 ? `${diff}y left` : diff === 0 ? 'This year!' : 'Overdue';
  };

  const saved = (goal: Goal) => goal.target * (goal.progress / 100);

  return (
    <div className="space-y-7 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">Goal Planner</h2>
          <p className="text-xs text-slate-400 font-medium">Define your future, track your milestones.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-xl font-black text-xs shadow-lg hover:shadow-violet-300/50 transition-all active:scale-95">
          <span className="text-lg leading-none">+</span> New Goal
        </button>
      </div>

      {goals.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Goals', value: goals.length },
            { label: 'Completed', value: goals.filter(g => g.progress >= 100).length },
            { label: 'In Progress', value: goals.filter(g => g.progress > 0 && g.progress < 100).length },
            { label: 'Avg Progress', value: `${(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length).toFixed(0)}%` },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-black text-violet-700">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-violet-50 flex items-center justify-center">
            <Trophy size={36} className="text-violet-300" />
          </div>
          <p className="text-sm font-black text-slate-400 mb-1">No goals yet</p>
          <p className="text-xs text-slate-300 font-medium">Set your first financial goal to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, idx) => {
          // Force unique colors and icons based on the display index to make every card pop!
          const color = GOAL_COLORS[idx % GOAL_COLORS.length];
          const Icon = GOAL_ICONS[idx % GOAL_ICONS.length];
          const savedAmt = saved(goal);
          const yl = yearsLeft(goal.year);
          const isComplete = goal.progress >= 100;

          return (
            <motion.div key={goal.id || idx} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card p-6 relative overflow-hidden group">
              {isComplete && (
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full">Complete ✓</span>
                </div>
              )}
              <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${color} opacity-10 rounded-bl-[100px]`} />
              
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-lg shrink-0`}>
                  <Icon size={20} />
                </div>
                {onDeleteGoal && goal.id && (
                  <button onClick={() => onDeleteGoal(goal.id!)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <h3 className="text-sm font-black text-slate-900 mb-1 truncate pr-8">{goal.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 mb-4">
                Target: <span className="text-slate-700">₹{goal.target?.toLocaleString()}</span>
                {yl && <> · <span className={yl === 'Overdue' ? 'text-rose-500' : 'text-violet-500'}>{yl}</span></>}
              </p>

              {/* Saved so far */}
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Saved</p>
                  <p className="text-sm font-black text-slate-800">₹{savedAmt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
                {/* Progress controls */}
                {onUpdateProgress && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => adjustProgress(goal, -5)} className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                      <ChevronDown size={12} className="text-slate-600" />
                    </button>
                    <span className="text-xs font-black text-violet-700 w-8 text-center">{goal.progress}%</span>
                    <button onClick={() => adjustProgress(goal, 5)} className="w-6 h-6 rounded-lg bg-violet-100 hover:bg-violet-200 flex items-center justify-center transition-colors">
                      <ChevronUp size={12} className="text-violet-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${color} rounded-full`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card bg-white/95 p-8 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"><X size={18} /></button>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Target size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Create New Goal</h3>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Goal Name</label>
                  <input required value={newGoal.name} onChange={e => setNewGoal({ ...newGoal, name: e.target.value })} placeholder="e.g. Dream Home, Retirement, Car" className="w-full p-3.5 rounded-xl bg-white/50 border border-slate-200 font-bold text-xs outline-none focus:border-violet-400 transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Target (₹)</label>
                    <input required type="number" value={newGoal.target || ''} onChange={e => setNewGoal({ ...newGoal, target: Number(e.target.value) })} placeholder="5000000" className="w-full p-3.5 rounded-xl bg-white/50 border border-slate-200 font-bold text-xs outline-none focus:border-violet-400 transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Target Year</label>
                    <input required type="number" value={newGoal.year || ''} onChange={e => setNewGoal({ ...newGoal, year: Number(e.target.value) })} placeholder="2030" className="w-full p-3.5 rounded-xl bg-white/50 border border-slate-200 font-bold text-xs outline-none focus:border-violet-400 transition-colors" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Current Progress (%)</label>
                  <input type="number" min={0} max={100} value={newGoal.progress || 0} onChange={e => setNewGoal({ ...newGoal, progress: Number(e.target.value) })} className="w-full p-3.5 rounded-xl bg-white/50 border border-slate-200 font-bold text-xs outline-none focus:border-violet-400 transition-colors" />
                </div>
                <button type="submit" className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-xl font-black text-sm shadow-lg hover:shadow-violet-300/50 transition-all active:scale-[0.98] mt-2">Save Goal</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
