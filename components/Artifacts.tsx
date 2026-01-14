import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { ArtifactData } from '../types';
import { Download, Loader2, Activity, Target, Zap, TrendingUp, PieChart as PieIcon, BarChart as BarIcon, LineChart as LineIcon, Activity as AreaIcon, MoreHorizontal, Maximize2 } from 'lucide-react';

interface ArtifactRendererProps {
  artifact: ArtifactData;
}

const COLORS = ['#246BFD', '#0F172A', '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0'];

const TOOLTIP_STYLE = { 
  borderRadius: '16px', 
  border: '1px solid #F1F5F9', 
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
  fontSize: '12px',
  backgroundColor: '#fff',
  padding: '12px 16px',
  color: '#0F172A',
  fontWeight: 600
};

export const ArtifactRenderer: React.FC<ArtifactRendererProps> = ({ artifact }) => {
  if (!artifact || !artifact.data) return null;

  return (
    <div className="animate-fade-in">
      {(() => {
        switch (artifact.type) {
          case 'chart': return <ChartWidget title={artifact.title} data={artifact.data} />;
          case 'framework': return <FrameworkWidget title={artifact.title} data={artifact.data} />;
          case 'kpi': return <KPIWidget title={artifact.title} data={artifact.data} />;
          case 'image_request': return <ImageLoadingWidget title={artifact.title} />;
          case 'image': return <ImageWidget title={artifact.title} data={artifact.data} />;
          default: return null;
        }
      })()}
    </div>
  );
};

const ImageLoadingWidget: React.FC<{ title: string }> = ({ title }) => (
  <div className="my-6 w-full p-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-premium flex flex-col items-center justify-center relative overflow-hidden group">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-sm animate-pulse">
      <Loader2 className="animate-spin text-brand-blue" size={24} />
    </div>
    <h4 className="text-sm font-inter font-semibold text-slate-900 relative z-10">Synthesizing Visual Intelligence</h4>
    <p className="text-xs text-slate-400 mt-2 relative z-10 tracking-widest uppercase font-bold">{title}</p>
  </div>
);

const ImageWidget: React.FC<{ title: string; data: any }> = ({ title, data }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = data.base64;
    link.download = `consult-ai-${title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="my-6 w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden group animate-reveal hover:shadow-float transition-subtle">
      <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md absolute top-0 left-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-subtle">
        <span className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
          <Zap size={14} className="text-brand-blue"/> {title}
        </span>
        <button onClick={handleDownload} className="p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-brand-blue transition-subtle active:opacity-70">
          <Download size={16} />
        </button>
      </div>
      <div className="aspect-video bg-slate-50 w-full relative overflow-hidden">
        <img src={data.base64} alt={title} className="w-full h-full object-cover" />
      </div>
    </div>
  );
};

const KPIWidget: React.FC<{ title: string; data: any }> = ({ title, data }) => (
  <div className="my-8 animate-reveal">
    <div className="flex items-center justify-between mb-6 px-2">
      <div className="flex items-center gap-3">
         <Target size={18} className="text-brand-blue" />
         <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">{title}</h4>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
      {data.metrics?.map((m: any, i: number) => (
        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium hover:shadow-float transition-subtle group">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 truncate group-hover:text-brand-blue transition-colors">{m.label}</p>
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-mono font-bold text-slate-950 tracking-tighter">{m.value}</span>
            {m.change !== undefined && (
              <div className={`flex items-center gap-2 text-[10px] font-bold ${m.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                <TrendingUp size={12} className={m.change < 0 ? 'rotate-180' : ''} />
                {m.change > 0 ? '+' : ''}{m.change}%
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FrameworkWidget: React.FC<{ title: string; data: any }> = ({ title, data }) => {
  const sections = data.sections || [];
  const isSWOT = title.toLowerCase().includes('swot');
  
  let gridClass = "grid-cols-1 sm:grid-cols-2";
  if (sections.length >= 5) gridClass = "grid-cols-1 sm:grid-cols-3";

  return (
    <div className="my-8 bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden animate-reveal text-left">
      <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Activity size={18} className="text-brand-blue" />
           <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{title}</h4>
        </div>
        <div className="w-2 h-2 rounded-full bg-brand-blue/20"></div>
      </div>
      <div className={`p-8 grid ${gridClass} gap-8`}>
        {sections.map((sec: any, i: number) => (
          <div key={i} className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-premium transition-subtle">
            <h5 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">{sec.title}</h5>
            <ul className="space-y-4">
              {sec.content?.map((item: string, j: number) => (
                <li key={j} className="text-sm text-slate-600 flex items-start gap-4 leading-relaxed font-source-serif italic">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChartWidget: React.FC<{ title: string; data: any }> = ({ title, data }) => {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line' | 'pie'>(data.chartType || 'area');
  const points = data.points || [];

  const renderChart = () => {
    switch(chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={points} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={6} dataKey="value" nameKey="label" stroke="none">
                {points.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
              <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="#246BFD" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
           <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="value" stroke="#246BFD" strokeWidth={3} dot={{r: 4, fill: '#246BFD', strokeWidth: 0}} />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#246BFD" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#246BFD" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.3} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8'}} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="value" stroke="#246BFD" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  }

  return (
    <div className="my-8 bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden animate-reveal transition-subtle hover:shadow-float text-left font-inter">
      <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-4">
           <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{title}</h4>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-100">
           {(['area', 'line', 'bar', 'pie'] as const).map(type => (
              <button key={type} onClick={() => setChartType(type)} className={`p-2 rounded-lg transition-subtle ${chartType === type ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-300 hover:text-slate-600'}`}>
                 {type === 'area' && <AreaIcon size={14} />}
                 {type === 'line' && <LineIcon size={14} />}
                 {type === 'bar' && <BarIcon size={14} />}
                 {type === 'pie' && <PieIcon size={14} />}
              </button>
           ))}
        </div>
      </div>
      <div className="h-[320px] w-full p-8">{renderChart()}</div>
    </div>
  );
};