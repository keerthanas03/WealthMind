import React from 'react';
import { ResponsiveContainer } from 'recharts';
import { GlassCard } from './GlassCard';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  height?: number;
  extra?: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, height = 300, extra }) => {
  return (
    <GlassCard className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
        {extra}
      </div>
      <div style={{ height: `${height}px` }} className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
