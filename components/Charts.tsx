import React, { useEffect, useRef, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis
} from 'recharts';
import L from 'leaflet';

// --- SHARED CONFIG ---
const TOOLTIP_STYLE = { 
  borderRadius: '12px', 
  border: '1px solid #E2E8F0', 
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
  fontSize: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: '10px 14px',
  color: '#1E293B',
  fontWeight: 500,
  backdropFilter: 'blur(4px)'
};

// Professional Blue Monochromatic Scale
const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE', '#1E40AF'];

// --- MAP COMPONENTS ---
interface MapMarker { lat: number; lng: number; title: string; info?: string; }
interface MapCircle { lat: number; lng: number; radius: number; color: string; fillOpacity: number; title: string; info?: string; }

export const RealMapWidget: React.FC<{ 
  markers?: MapMarker[];
  circles?: MapCircle[];
  centerOn?: { lat: number; lng: number; zoom?: number } | null;
}> = ({ markers = [], circles = [], centerOn }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false,
            center: [20, 0],
            zoom: 2,
            minZoom: 2
        });

        // Use a light, desaturated basemap for data visualization
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 100);
    }

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []);

  useEffect(() => {
    if (centerOn && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([centerOn.lat, centerOn.lng], centerOn.zoom || 6, { animate: true, duration: 1.5 });
    }
  }, [centerOn]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];
    const bounds: L.LatLngExpression[] = [];

    const createCustomIcon = () => L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="relative w-4 h-4 rounded-full bg-brand-600 border-2 border-white shadow-lg shadow-brand-500/30 ring-4 ring-brand-500/10"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    if (markers && markers.length > 0) {
      markers.forEach(m => {
          if (m.lat && m.lng) {
              const marker = L.marker([m.lat, m.lng], { icon: createCustomIcon() }).addTo(map);
              const popupContent = `<div style="font-family:'Inter',sans-serif;padding:6px 2px;"><h3 style="font-weight:600;font-size:12px;color:#1e293b;">${m.title}</h3>${m.info ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">${m.info}</div>` : ''}</div>`;
              marker.bindPopup(popupContent);
              marker.on('mouseover', function () { this.openPopup(); });
              layersRef.current.push(marker);
              bounds.push([m.lat, m.lng]);
          }
      });
    }

    if (circles && circles.length > 0) {
      circles.forEach(c => {
          if (c.lat && c.lng) {
              const circle = L.circleMarker([c.lat, c.lng], {
                radius: c.radius || 10,
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.15,
                weight: 1
              }).addTo(map);
              layersRef.current.push(circle);
              bounds.push([c.lat, c.lng]);
          }
      });
    }

    if (!centerOn && bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    }

  }, [markers, circles, centerOn]);

  return <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-50" style={{ minHeight: '100%' }} />;
};

// --- CHART COMPONENTS ---

export const PerformancePulseChart: React.FC = () => {
  const [data, setData] = useState(() => 
    Array.from({ length: 30 }, (_, i) => ({
      time: i,
      brand: 60 + Math.random() * 20,
      market: 50 + Math.random() * 10
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        next.push({
          time: last.time + 1,
          brand: Math.max(30, Math.min(95, last.brand + (Math.random() - 0.5) * 10)),
          market: Math.max(30, Math.min(80, last.market + (Math.random() - 0.5) * 5))
        });
        return next;
      });
    }, 1500); 
    return () => clearInterval(interval);
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorBrandPulse" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
        <YAxis hide domain={[0, 100]} />
        <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ fontSize: '12px' }} labelStyle={{ display: 'none' }} cursor={{ stroke: '#94A3B8', strokeWidth: 1 }} />
        <Area type="basis" dataKey="market" stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 4" fill="transparent" isAnimationActive={true} animationDuration={1000} />
        <Area type="basis" dataKey="brand" stroke="#3B82F6" strokeWidth={2.5} fill="url(#colorBrandPulse)" isAnimationActive={true} animationDuration={1000} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const MarketBubbleMatrix: React.FC<{ data: any[] }> = ({ data }) => {
  const chartData = data || [];
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={TOOLTIP_STYLE}>
          <div className="font-bold mb-1 border-b border-slate-100 pb-2 text-sm text-slate-800">{d.name}</div>
          <div className="text-slate-500 text-xs mt-2">Momentum: <span className="text-slate-900 font-semibold">{d.x}%</span></div>
          <div className="text-slate-500 text-xs mt-1">Penetration: <span className="text-slate-900 font-semibold">{d.y}%</span></div>
          <div className="text-brand-600 font-bold mt-2 text-xs">Est. Rev: ${d.z}M</div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis type="number" dataKey="x" name="Momentum" unit="%" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis type="number" dataKey="y" name="Penetration" unit="%" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <ZAxis type="number" dataKey="z" range={[100, 800]} name="Revenue" />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Market Dynamics" data={chartData}>
          {chartData.map((entry, index) => (
             <Cell key={`cell-${index}`} fill={entry.sentiment > 70 ? '#3B82F6' : entry.sentiment > 40 ? '#94A3B8' : '#F59E0B'} fillOpacity={0.7} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export const CompetitorRadarChart: React.FC<{ data?: any[] }> = ({ data }) => {
  const chartData = (data && data.length > 0) ? data : [
    { subject: 'Market Share', A: 80, B: 110, fullMark: 150 },
    { subject: 'Brand', A: 98, B: 130, fullMark: 150 },
    { subject: 'Tech', A: 86, B: 130, fullMark: 150 },
    { subject: 'Price', A: 99, B: 100, fullMark: 150 },
    { subject: 'Loyalty', A: 85, B: 90, fullMark: 150 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }} />
        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
        <Radar name="You" dataKey="A" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" fillOpacity={0.2} />
        <Radar name="Competitor Avg" dataKey="B" stroke="#94A3B8" strokeWidth={2} fill="#94A3B8" fillOpacity={0.1} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export const SalesAreaChart: React.FC<{ data?: any[] }> = ({ data }) => {
  const chartData = data && data.length > 0 ? data : Array.from({ length: 6 }, (_, i) => ({ m: `Month ${i}`, v: 100 + Math.random() * 50 }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
        <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }} />
        <Area type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};