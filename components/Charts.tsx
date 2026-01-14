
import React, { useEffect, useRef, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis, LabelList, LineChart, Line, ReferenceLine,
  ComposedChart, Legend
} from 'recharts';
import L from 'leaflet';

const TOOLTIP_STYLE = { 
  borderRadius: '16px', 
  border: '1px solid #F1F5F9', 
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
  fontSize: '12px',
  backgroundColor: '#fff',
  padding: '12px 16px',
  color: '#0F172A',
  fontWeight: 600,
  zIndex: 1000
};

export const BenchmarkGroupedBarChart: React.FC<{ data: any[] }> = ({ data }) => {
  const chartData = Array.isArray(data) && data.length > 0 ? data : [
    { entity: 'Target', engagement: 45, growth: 30, sentiment: 60 },
    { entity: 'Rival A', engagement: 55, growth: 25, sentiment: 40 },
    { entity: 'Rival B', engagement: 35, growth: 45, sentiment: 70 },
    { entity: 'Rival C', engagement: 50, growth: 35, sentiment: 55 }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
        <XAxis 
          dataKey="entity" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#F8FAFC' }} />
        <Legend 
          verticalAlign="top" 
          align="right" 
          iconType="circle" 
          wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '20px' }} 
        />
        <Bar dataKey="engagement" name="Engagement %" fill="#246BFD" radius={[6, 6, 0, 0]} barSize={12} />
        <Bar dataKey="growth" name="Growth %" fill="#94A3B8" radius={[6, 6, 0, 0]} barSize={12} />
        <Bar dataKey="sentiment" name="Sentiment" fill="#0F172A" radius={[6, 6, 0, 0]} barSize={12} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const StockAlphaChart: React.FC<{ data?: any[], sentiment?: 'Bullish' | 'Bearish' | 'Neutral' }> = ({ data, sentiment = 'Neutral' }) => {
  const [hoverData, setHoverData] = useState<any>(null);
  
  const chartData = Array.isArray(data) && data.length > 0 ? data : Array.from({ length: 40 }, (_, i) => ({ 
    m: `${10 + Math.floor(i/6)}:${(i%6)*10}`, 
    v: 150 + Math.random() * 20,
    vol: Math.floor(Math.random() * 1000) + 500
  }));

  const color = sentiment === 'Bullish' ? '#10b981' : sentiment === 'Bearish' ? '#f43f5e' : '#246BFD';
  const baseline = chartData[0]?.v || 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return null; 
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-[#020617] rounded-[24px] overflow-hidden border border-white/5 relative group cursor-crosshair">
      <div className="absolute top-6 left-8 z-10 pointer-events-none space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Price Data</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
        {hoverData ? (
          <div className="flex items-baseline gap-4 animate-fade-in">
             <span className="text-3xl font-mono font-bold text-white tracking-tighter">${hoverData.v.toFixed(2)}</span>
             <span className={`text-xs font-mono font-bold ${hoverData.v >= baseline ? 'text-emerald-400' : 'text-rose-400'}`}>
               {hoverData.v >= baseline ? '+' : ''}{(hoverData.v - baseline).toFixed(2)} ({(((hoverData.v - baseline) / baseline) * 100).toFixed(2)}%)
             </span>
          </div>
        ) : (
          <div className="flex items-baseline gap-4">
             <span className="text-3xl font-mono font-bold text-white tracking-tighter">${chartData[chartData.length-1].v.toFixed(2)}</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
          data={chartData} 
          margin={{ top: 80, right: 0, left: 0, bottom: 20 }}
          onMouseMove={(e: any) => {
            if (e && e.activePayload) {
              setHoverData(e.activePayload[0].payload);
            }
          }}
          onMouseLeave={() => setHoverData(null)}
        >
          <defs>
            <linearGradient id="tradingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2}/>
              <stop offset="100%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="0" 
            vertical={true} 
            horizontal={true} 
            stroke="#ffffff08" 
          />
          
          <XAxis 
            dataKey="m" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fontWeight: 600, fill: '#475569', fontFamily: 'IBM Plex Mono' }}
            minTickGap={40}
            interval="preserveStartEnd"
          />
          
          <YAxis 
            orientation="right"
            domain={['auto', 'auto']}
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fontWeight: 600, fill: '#475569', fontFamily: 'IBM Plex Mono' }} 
            width={60}
          />

          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#ffffff20', strokeWidth: 1 }} 
          />

          <Bar 
            dataKey="vol" 
            fill="#ffffff08" 
            radius={[4, 4, 0, 0]} 
            barSize={6}
          />

          <Area 
            type="monotone" 
            dataKey="v" 
            stroke={color} 
            strokeWidth={2} 
            fill="url(#tradingGrad)" 
            animationDuration={0}
            activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
          />

          <ReferenceLine 
            y={chartData[chartData.length-1].v} 
            stroke={color} 
            strokeDasharray="3 3" 
            label={{ 
              position: 'right', 
              value: chartData[chartData.length-1].v.toFixed(2), 
              fill: '#fff', 
              fontSize: 9, 
              fontWeight: 800,
              backgroundColor: color,
              className: 'price-tag'
            }} 
          />
        </ComposedChart>
      </ResponsiveContainer>

      <style>{`
        .price-tag {
          background-color: ${color};
          padding: 2px 4px;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export const RealMapWidget: React.FC<{ markers?: any[] }> = ({ markers = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, { 
          zoomControl: true, 
          attributionControl: false, 
          center: [20, 0], 
          zoom: 2,
          scrollWheelZoom: false 
        });
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
        mapInstanceRef.current = map;
    }
    return () => { 
      if (mapInstanceRef.current) { 
        mapInstanceRef.current.remove(); 
        mapInstanceRef.current = null; 
      } 
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];
    
    const validMarkers = Array.isArray(markers) ? markers : [];
    
    validMarkers.forEach(m => {
      if (m.lat && m.lng) {
        const icon = L.divIcon({ 
          className: 'custom-pin', 
          html: `<div class="relative w-10 h-10 -ml-5 -mt-5 flex items-center justify-center">
                   <div class="absolute inset-0 bg-brand-blue/20 rounded-full animate-ping"></div>
                   <div class="relative w-4 h-4 bg-slate-950 rounded-full ring-4 ring-white shadow-xl flex items-center justify-center">
                     <div class="w-1.5 h-1.5 bg-brand-blue rounded-full"></div>
                   </div>
                 </div>`, 
          iconSize: [0, 0] 
        });

        const popupContent = `
          <div class="p-4 font-inter min-w-[200px]">
            <p class="text-[9px] font-bold text-brand-blue uppercase tracking-widest mb-1">Sector Target</p>
            <h4 class="text-sm font-bold text-slate-900 mb-1">${m.title}</h4>
            <p class="text-[10px] text-slate-400 font-medium italic mb-3 leading-relaxed">${m.info || 'Auditing...'}</p>
            <div class="pt-3 border-t border-slate-50 flex items-center justify-between">
              <span class="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Surveillance Active</span>
            </div>
          </div>
        `;

        const marker = L.marker([m.lat, m.lng], { icon })
          .addTo(map)
          .bindPopup(popupContent, { className: 'premium-popup', maxWidth: 300 });
          
        layersRef.current.push(marker);
      }
    });

    if (validMarkers.length > 0) {
      const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 6 });
    }
  }, [markers]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      <style>{`
        .leaflet-container { background: #f8fafc; cursor: crosshair; }
        .premium-popup .leaflet-popup-content-wrapper { 
          border-radius: 24px; 
          padding: 0; 
          overflow: hidden; 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          border: 1px solid #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export const PorterFiveForces: React.FC<{ data: any[] }> = ({ data }) => {
  const chartData = Array.isArray(data) && data.length > 0 ? data : [
    { factor: 'Rivalry', score: 85, analysis: 'High consolidation' },
    { factor: 'Entrants', score: 40, analysis: 'Capital intensive' },
    { factor: 'Suppliers', score: 30, analysis: 'Fragmented supply' },
    { factor: 'Buyers', score: 65, analysis: 'High price sensitivity' },
    { factor: 'Substitutes', score: 50, analysis: 'Moderate tech pivot' }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="factor" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} width={80} />
            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={28}>
              {chartData.map((e, i) => <Cell key={i} fill={e.score > 70 ? '#f43f5e' : e.score > 40 ? '#3b82f6' : '#10b981'} />)}
              <LabelList dataKey="score" position="right" style={{ fontSize: 10, fontWeight: 800, fill: '#0f172a' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const MarketBubbleMatrix: React.FC<{ data: any[] }> = ({ data }) => {
  const chartData = Array.isArray(data) && data.length > 0 ? data : [
    { x: 30, y: 70, z: 400, sentiment: 80, label: 'Early Adopters' },
    { x: 60, y: 40, z: 200, sentiment: 30, label: 'Laggards' },
    { x: 80, y: 90, z: 600, sentiment: 90, label: 'Core Market' }
  ];
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 80, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis type="number" dataKey="x" name="Momentum" unit="%" tick={{ fontSize: 10, fill: '#94A3B8' }} />
            <YAxis type="number" dataKey="y" name="Penetration" unit="%" tick={{ fontSize: 10, fill: '#94A3B8' }} />
            <ZAxis type="number" dataKey="z" range={[200, 1500]} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Market Segments" data={chartData}>
              {chartData.map((e, i) => (
                <Cell 
                  key={i} 
                  fill={e.sentiment > 70 ? '#246BFD' : e.sentiment > 40 ? '#94a3b8' : '#F43F5E'} 
                  fillOpacity={0.6} 
                  stroke={e.sentiment > 70 ? '#1B54D8' : '#CBD5E1'} 
                  strokeWidth={1} 
                />
              ))}
              <LabelList 
                dataKey="label" 
                position="right" 
                offset={15} 
                style={{ fontSize: '9px', fontWeight: 'bold', fill: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }} 
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SalesAreaChart: React.FC<{ data?: any[] }> = ({ data }) => {
  const chartData = Array.isArray(data) && data.length > 0 ? data : Array.from({ length: 6 }, (_, i) => ({ m: `P${i}`, v: 10 + Math.random() * 90 }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#246BFD" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#246BFD" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke="#246BFD" strokeWidth={3} fill="url(#grad)" animationDuration={1200} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
      </AreaChart>
    </ResponsiveContainer>
  );
};
