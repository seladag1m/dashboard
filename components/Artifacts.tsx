
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

// Professional Monochrome Scale (Navy -> Teal -> Slate)
const COLORS = ['#0F172A', '#1E293B', '#334155', '#475569', '#64748B', '#94A3B8'];

export const ArtifactRenderer: React.FC<ArtifactRendererProps> = ({ artifact }) => {
  if (!artifact || !artifact.data) return null;

  switch (artifact.type) {
    case 'chart': return <ChartWidget title={artifact.title} data={artifact.data} />;
    case 'framework': return <FrameworkWidget title={artifact.title} data={artifact.data} />;
    case 'kpi': return <KPIWidget title={artifact.title} data={artifact.data} />;
    case 'image_request': return <ImageLoadingWidget title={artifact.title} />;
    case 'image': return <ImageWidget title={artifact.title} data={artifact.data} />;
    default: return null;
  }
};

const ImageLoadingWidget: React.FC<{ title: string }> = ({ title }) => (
  <div className="my-6 w-full p-8 bg-white rounded-3xl border border-zinc-100 shadow-glass flex flex-col items-center justify-center relative overflow-hidden animate-fade-in group">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent animate-shimmer opacity-30"></div>
    <div className="w-14 h-14 bg-white ring-1 ring-zinc-100 rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-sm">
      <Loader2 className="animate-spin text-primary" size={24} />
    </div>
    <h4 className="text-sm font-semibold text-zinc-900 relative z-10">Visualizing Strategy</h4>
    <p className="text-xs text-zinc-400 mt-1 relative z-10 tracking-wide">{title}</p>
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
    <div className="my-6 w-full bg-white rounded-3xl border border-zinc-100 shadow-glass overflow-hidden group animate-fade-in hover:shadow-float transition-all duration-500">
      <div className="px-6 py-4 border-b border-zinc-50 flex justify-between items-center bg-white/80 backdrop-blur-sm absolute top-0 left-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
          <Zap size={14} className="text-amber-500"/> {title}
        </span>
        <button onClick={handleDownload} className="p-2 bg-white rounded-full shadow-sm text-zinc-400 hover:text-primary transition-colors cursor-pointer" title="Download Image">
          <Download size={16} />
        </button>
      </div>
      <div className="aspect-video bg-zinc-50 w-full relative overflow-hidden">
        <img src={data.base64} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
    </div>
  );
};

const KPIWidget: React.FC<{ title: string; data: any }> = ({ title, data }) => (
  <div className="my-8 animate-fade-in">
    <div className="flex items-center justify-between mb-4 pl-1">
      <div className="flex items-center gap-2">
         <Target size={16} className="text-primary" />
         <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{title}</h4>
      </div>
      <MoreHorizontal size={16} className="text-zinc-300" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {data.metrics?.map((m: any, i: number) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-float hover:border-blue-100 transition-all duration-300 group">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 truncate group-hover:text-primary transition-colors">{m.label}</p>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-zinc-900 font-serif tracking-tight">{m.value}</span>
            {m.change !== undefined && (
              <span className={`text-xs font-bold flex items-center gap-1 ${m.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                <TrendingUp size={12} className={m.change < 0 ? 'rotate-180' : ''} />
                {m.change > 0 ? '+' : ''}{m.change}%
              </span>
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

  // Language-agnostic styling based on position for SWOT (Strength, Weakness, Opp, Threat)
  const getSectionStyle = (index: number) => {
    // 0: Green (Strength/Positive)
    // 1: Amber (Weakness/Warning)
    // 2: Blue (Opportunity/External Pos)
    // 3: Red (Threat/External Neg)
    const styles = [
      { color: "text-emerald-600", border: "border-l-emerald-500" },
      { color: "text-amber-600", border: "border-l-amber-500" },
      { color: "text-blue-600", border: "border-l-blue-500" },
      { color: "text-rose-600", border: "border-l-rose-500" }
    ];
    return styles[index % 4];
  };

  return (
    <div className="my-8 bg-white rounded-3xl border border-zinc-100 shadow-glass overflow-hidden animate-fade-in">
      <div className="px-6 py-5 border-b border-zinc-50 bg-zinc-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <Activity size={18} className="text-primary" />
           <h4 className="font-serif font-bold text-zinc-800 text-sm tracking-wide">{title}</h4>
        </div>
      </div>
      <div className={`p-6 grid ${gridClass} gap-6`}>
        {sections.map((sec: any, i: number) => {
          // Use index-based styling if SWOT, otherwise neutral
          const style = isSWOT 
            ? getSectionStyle(i) 
            : { color: "text-zinc-600", border: "border-l-zinc-300" };

          return (
            <div key={i} className={`p-5 rounded-xl bg-zinc-50/50 border-l-4 ${style.border} hover:bg-white hover:shadow-sm transition-all h-full`}>
              <h5 className={`font-bold text-xs uppercase tracking-widest mb-3 ${style.color}`}>{sec.title}</h5>
              <ul className="space-y-2.5">
                {sec.content?.map((item: string, j: number) => (
                  <li key={j} className="text-sm text-zinc-600 flex items-start gap-2.5 leading-relaxed">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-400 shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-zinc-100 shadow-xl text-xs">
        <p className="font-bold text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill || payload[0].stroke }}></div>
           <p className="text-sm font-semibold text-zinc-900">{payload[0].value}</p>
        </div>
      </div>
    );
  }
  return null;
};

const ChartWidget: React.FC<{ title: string; data: any }> = ({ title, data }) => {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line' | 'pie'>(data.chartType || 'area');
  const points = data.points || [];

  const handleExportData = () => {
    if (!points || points.length === 0) return;
    
    // Create CSV content
    const headers = ['Label', 'Value'];
    const rows = points.map((p: any) => [p.label, p.value]);
    const csvContent = [
      headers.join(','),
      ...rows.map((r: any[]) => r.join(','))
    ].join('\n');

    // Create Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ChartIcon = () => {
     switch(chartType) {
        case 'bar': return <BarIcon size={16} />;
        case 'pie': return <PieIcon size={16} />;
        case 'line': return <LineIcon size={16} />;
        default: return <AreaIcon size={16} />;
     }
  };

  const renderChart = () => {
    switch(chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={points}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                cornerRadius={6}
                stroke="none"
              >
                {points.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(val) => <span className="text-xs text-zinc-500 font-medium ml-1">{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} />
              <Tooltip cursor={{fill: '#F1F5F9', opacity: 0.5}} content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#0F172A" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500}>
                 {points.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
           <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} />
              <Tooltip content={<CustomTooltip />} cursor={{stroke: '#CBD5E1', strokeWidth: 1}} />
              <Line type="monotone" dataKey="value" stroke="#0F172A" strokeWidth={3} dot={{r: 4, fill: '#0F172A', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6, stroke: '#0F172A', strokeWidth: 0}} animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        );
      default: // Area
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748B'}} />
              <Tooltip content={<CustomTooltip />} cursor={{stroke: '#CBD5E1', strokeWidth: 1}} />
              <Area type="monotone" dataKey="value" stroke="#0F172A" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  }

  return (
    <div className="my-8 bg-white rounded-3xl border border-zinc-100 shadow-glass overflow-hidden animate-fade-in transition-all hover:shadow-float group">
      <div className="px-6 py-4 border-b border-zinc-50 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-50/50 gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
              <ChartIcon />
           </div>
           <div>
              <h4 className="font-serif font-bold text-zinc-900 text-sm tracking-wide">{title}</h4>
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mt-0.5">Live Data Visualization</p>
           </div>
        </div>
        
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-zinc-100 shadow-sm">
           {(['area', 'line', 'bar', 'pie'] as const).map(type => (
              <button 
                 key={type}
                 onClick={() => setChartType(type)}
                 className={`p-2 rounded-lg transition-all ${chartType === type ? 'bg-primary text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}`}
                 title={`View as ${type}`}
              >
                 {type === 'area' && <AreaIcon size={14} />}
                 {type === 'line' && <LineIcon size={14} />}
                 {type === 'bar' && <BarIcon size={14} />}
                 {type === 'pie' && <PieIcon size={14} />}
              </button>
           ))}
        </div>
      </div>
      
      <div className="h-[340px] w-full p-6 pt-8 bg-gradient-to-b from-white to-zinc-50/30">
        {renderChart()}
      </div>
      
      <div className="px-6 py-3 border-t border-zinc-50 bg-zinc-50/30 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-medium text-zinc-400">AI Generated Analysis</span>
         </div>
         <button 
           onClick={handleExportData}
           className="text-zinc-400 hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform"
         >
            Export Data <Download size={12} />
         </button>
      </div>
    </div>
  );
};
