import React, { useEffect, useRef, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';
import L from 'leaflet';

// --- SHARED CONFIG ---
const TOOLTIP_STYLE = { 
  borderRadius: '12px', 
  border: '1px solid #E3E7EC', 
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)', 
  fontSize: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(8px)',
  padding: '12px',
  color: '#0E1A2B'
};

// --- MAP COMPONENTS ---

interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  info?: string;
}

interface MapCircle {
  lat: number;
  lng: number;
  radius: number; 
  color: string;
  fillOpacity: number;
  title: string;
  info?: string;
}

export const RealMapWidget: React.FC<{ 
  markers?: MapMarker[];
  circles?: MapCircle[];
}> = ({ markers = [], circles = [] }) => {
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

        // High-contrast light map tiles for "clean" look
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;
        
        // Force resize to prevent grey box issue
        setTimeout(() => map.invalidateSize(), 100);
    }

    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []);

  // Update Data
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old layers
    layersRef.current.forEach(layer => map.removeLayer(layer));
    layersRef.current = [];

    const bounds: L.LatLngExpression[] = [];

    // Custom Marker Icon (Premium Dot)
    const createCustomIcon = () => L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="width:12px; height:12px; background:#0E1A2B; border:2px solid white; border-radius:50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });

    // Add Markers
    markers.forEach(m => {
        if (m.lat && m.lng) {
            const marker = L.marker([m.lat, m.lng], { icon: createCustomIcon() }).addTo(map);
            
            const popupContent = `
              <div style="font-family: 'Inter', sans-serif; min-width: 180px; padding: 4px;">
                 <h3 style="font-weight: 700; font-size: 13px; color: #0E1A2B; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid #F1F5F9;">
                    ${m.title}
                 </h3>
                 ${m.info ? `<div style="font-size: 11px; color: #64748B; line-height: 1.5;">${m.info}</div>` : ''}
              </div>
            `;
            
            marker.bindPopup(popupContent);
            marker.on('mouseover', function () { this.openPopup(); });
            
            layersRef.current.push(marker);
            bounds.push([m.lat, m.lng]);
        }
    });

    // Add Circles
    circles.forEach(c => {
        if (c.lat && c.lng) {
            const circle = L.circleMarker([c.lat, c.lng], {
              radius: c.radius,
              color: c.color,
              fillColor: c.color,
              fillOpacity: c.fillOpacity,
              weight: 0
            }).addTo(map);

            const popupContent = `
              <div style="font-family: 'Inter', sans-serif; min-width: 140px;">
                 <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                    <div style="width:6px; height:6px; border-radius:50%; background:${c.color};"></div>
                    <h3 style="font-weight: 700; font-size: 12px; color: #0E1A2B; margin:0;">${c.title}</h3>
                 </div>
                 ${c.info ? `<div style="font-size: 10px; color: #64748B;">${c.info}</div>` : ''}
              </div>
            `;
            
            circle.bindPopup(popupContent);
            circle.on('mouseover', function () { this.openPopup(); });
            
            layersRef.current.push(circle);
            bounds.push([c.lat, c.lng]);
        }
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
    }

  }, [markers, circles]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-xl z-0 bg-zinc-50" style={{ minHeight: '100%' }} />;
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
            <stop offset="5%" stopColor="#296CFF" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#296CFF" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
        <YAxis hide domain={[0, 100]} />
        <Tooltip 
           contentStyle={TOOLTIP_STYLE}
           itemStyle={{ fontSize: '12px' }}
           labelStyle={{ display: 'none' }}
        />
        <Area 
          type="basis" 
          dataKey="market" 
          stroke="#CBD5E1" 
          strokeWidth={2} 
          strokeDasharray="4 4"
          fill="transparent" 
          isAnimationActive={true}
          animationDuration={1000}
        />
        <Area 
          type="basis" 
          dataKey="brand" 
          stroke="#296CFF" 
          strokeWidth={3} 
          fill="url(#colorBrandPulse)" 
          isAnimationActive={true}
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const MarketBubbleMatrix: React.FC<{ data: any[] }> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ ...TOOLTIP_STYLE }}>
          <div className="font-bold mb-1 border-b border-zinc-100 pb-1">{d.name}</div>
          <div className="text-zinc-500 text-xs">Momentum: {d.x}%</div>
          <div className="text-zinc-500 text-xs">Penetration: {d.y}%</div>
          <div className="text-accent font-semibold mt-1">Est. Rev: ${d.z}M</div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis type="number" dataKey="x" name="Momentum" unit="%" tick={{ fontSize: 10, fill: '#94A3B8' }} />
        <YAxis type="number" dataKey="y" name="Penetration" unit="%" tick={{ fontSize: 10, fill: '#94A3B8' }} />
        <ZAxis type="number" dataKey="z" range={[100, 800]} name="Revenue" />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Market Dynamics" data={data}>
          {data.map((entry, index) => (
             <Cell 
               key={`cell-${index}`} 
               fill={entry.sentiment > 70 ? '#10B981' : entry.sentiment > 40 ? '#FBBF24' : '#F43F5E'} 
               fillOpacity={0.6}
               stroke={entry.sentiment > 70 ? '#059669' : entry.sentiment > 40 ? '#D97706' : '#E11D48'}
               strokeWidth={1}
             />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export const CompetitorRadarChart: React.FC<{ data?: any[] }> = ({ data }) => {
  const chartData = data || [
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
        <Radar name="You" dataKey="A" stroke="#296CFF" strokeWidth={2} fill="#296CFF" fillOpacity={0.15} />
        <Radar name="Competitor Avg" dataKey="B" stroke="#0E1A2B" strokeWidth={2} fill="#0E1A2B" fillOpacity={0.05} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export const SalesAreaChart: React.FC<{ data?: any[] }> = ({ data }) => {
  // Graceful fallback for data
  const chartData = data && data.length > 0 ? data : Array.from({ length: 6 }, (_, i) => ({ m: `Month ${i}`, v: 100 + Math.random() * 50 }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#296CFF" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#296CFF" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
        <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: '#CBD5E1', strokeWidth: 1 }} />
        <Area type="monotone" dataKey="v" stroke="#296CFF" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const RevenueBarChart: React.FC<{ data?: any[] }> = ({ data }) => {
  const chartData = data || Array.from({length: 7}, (_, i) => ({ n: i, v: Math.random() * 100 }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} barSize={20}>
         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
         <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={TOOLTIP_STYLE} />
         <Bar dataKey="v" fill="#0E1A2B" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const SalesRingChart: React.FC<{ value?: number }> = ({ value = 75 }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={[{ name: 'Val', value: value }, { name: 'Rem', value: 100-value }]}
        cx="50%" cy="50%" innerRadius={40} outerRadius={55}
        startAngle={90} endAngle={450}
        dataKey="value" stroke="none" paddingAngle={5} cornerRadius={10}
      >
        <Cell fill="#0E1A2B" />
        <Cell fill="#E2E8F0" />
      </Pie>
    </PieChart>
  </ResponsiveContainer>
);