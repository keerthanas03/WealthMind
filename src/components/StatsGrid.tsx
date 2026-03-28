import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';

interface Stat {
  label: string;
  value: string;
  change: string;
  color: string;
}

interface StatsGridProps {
  stats: Stat[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 cursor-default"
        >
          {/* Background blob */}
          <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${stat.color} opacity-15 group-hover:opacity-25 transition-opacity`} />
          
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3">{stat.label}</p>
          <p className="text-2xl font-black text-slate-900 leading-none mb-2">{stat.value}</p>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-gradient-to-r ${stat.color} text-white shadow-sm`}>
            {stat.change}
          </span>
        </motion.div>
      ))}
    </div>
  );
};
