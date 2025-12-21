
import React, { useEffect, useRef, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis, LabelList
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
  fontWeight: 600
};

export const RealMapWidget: React.FC<{ markers?: any[] }> = ({ markers = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false, center: [20, 0], zoom: 2 });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
        mapInstanceRef.current = map;
    }
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];
    const icon = L.divIcon({ className: 'custom-pin', html: `<div class="w-3 h-3 bg-blue-600 rounded-full ring-4 ring-blue-500/20 border border-white"></div>`, iconSize: [12, 12] });
    markers.forEach(m => {
      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map).bindPopup(`<div class="text-xs font-bold p-1">${m.title}</div>`);
      layersRef.current.push(marker);
    });
    if (markers.length > 0) map.fitBounds(markers.map(m => [m.lat, m.lng]), { padding: [40, 40], maxZoom: 6 });
  }, [markers]);

  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export const PorterFiveForces: React.FC<{ data: any[] }> = ({ data }) => {
  const chartData = data && data.length > 0 ? data : [
    { factor: 'Rivalry', score: 85 },
    { factor: 'Entrants', score: 40 },
    { factor: 'Suppliers', score: 30 },
    { factor: 'Buyers', score: 65 },
    { factor: 'Substitutes', score: 50 }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis dataKey="factor" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} width={80} />
        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={24}>
           {chartData.map((e, i) => <Cell key={i} fill={e.score > 70 ? '#f43f5e' : e.score > 40 ? '#3b82f6' : '#10b981'} />)}
           <LabelList dataKey="score" position="right" style={{ fontSize: 10, fontWeight: 800, fill: '#0f172a' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const MarketBubbleMatrix: React.FC<{ data: any[] }> = ({ data }) => {
  const chartData = data || [];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis type="number" dataKey="x" name="Momentum" unit="%" tick={{ fontSize: 10, fill: '#94A3B8' }} />
        <YAxis type="number" dataKey="y" name="Penetration" unit="%" tick={{ fontSize: 10, fill: '#94A3B8' }} />
        <ZAxis type="number" dataKey="z" range={[100, 1000]} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter data={chartData}>
          {chartData.map((e, i) => <Cell key={i} fill={e.sentiment > 70 ? '#3b82f6' : e.sentiment > 40 ? '#94a3b8' : '#f59e0b'} fillOpacity={0.8} />)}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export const SalesAreaChart: React.FC<{ data?: any[] }> = ({ data }) => {
  const chartData = data && data.length > 0 ? data : Array.from({ length: 6 }, (_, i) => ({ m: `P${i}`, v: 10 + Math.random() * 90 }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#246BFD" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#246BFD" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke="#246BFD" strokeWidth={3} fill="url(#grad)" animationDuration={1000} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
      </AreaChart>
    </ResponsiveContainer>
  );
};
