import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Info, Coffee, Moon, Fuel, RefreshCw, CheckCircle2 } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;

const createCustomIcon = (color, symbol) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const icons = {
  current: createCustomIcon('#2563eb', '📍'),
  pickup: createCustomIcon('#d97706', '📦'),
  dropoff: createCustomIcon('#e11d48', '🏁'),
  break: createCustomIcon('#9333ea', '☕'),
  reset: createCustomIcon('#4f46e5', '🛌'),
  fuel: createCustomIcon('#059669', '⛽'),
  restart: createCustomIcon('#db2777', '🔄')
};

function AutoFitBounds({ polyline, stops }) {
  const map = useMap();

  useEffect(() => {
    if (polyline && polyline.length > 0) {
      const bounds = L.latLngBounds(polyline);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (stops && stops.length > 0) {
      const bounds = L.latLngBounds(stops.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [polyline, stops, map]);

  return null;
}

export default function RouteMap({ route, stops }) {
  const [selectedStop, setSelectedStop] = useState(null);

  if (!route || !stops) return null;

  const polyline = route.polyline || [];
  const defaultCenter = polyline.length > 0 ? polyline[0] : [39.8283, -98.5795];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-8">

      {/* Map Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-800">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-sm text-slate-900">Interactive Dispatch Route & Waypoints</span>
          <span className="text-slate-500">({stops.length} Planned Stops)</span>
        </div>

        {/* Map Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
          <div className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span><span className="text-slate-600">Current</span></div>
          <div className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span className="text-slate-600">Pickup</span></div>
          <div className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span><span className="text-slate-600">Dropoff</span></div>
          <div className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span><span className="text-slate-600">30m Break</span></div>
          <div className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span><span className="text-slate-600">10h Reset</span></div>
          <div className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span><span className="text-slate-600">Fuel</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">

        {/* Left Interactive Map (2 cols) */}
        <div className="lg:col-span-2 h-105 relative">
          <MapContainer
            center={defaultCenter}
            zoom={5}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <AutoFitBounds polyline={polyline} stops={stops} />

            {polyline.length > 0 && (
              <Polyline
                positions={polyline}
                color="#2563eb"
                weight={4.5}
                opacity={0.85}
              />
            )}

            {stops.map((stop, index) => {
              const icon = icons[stop.type] || icons.current;
              return (
                <Marker
                  key={index}
                  position={[stop.lat, stop.lng]}
                  icon={icon}
                  eventHandlers={{
                    click: () => setSelectedStop(stop),
                  }}
                >
                  <Popup>
                    <div className="text-slate-900 font-sans p-1">
                      <strong className="text-[11px] font-bold block text-blue-600 uppercase tracking-wider">{stop.type} Stop</strong>
                      <h4 className="font-bold text-xs text-slate-900 mb-0.5">{stop.location_name}</h4>
                      <p className="text-xs text-slate-600">{stop.label}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Right Waypoint Stop Drawer (1 col) */}
        <div className="p-4 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 h-105 overflow-y-auto">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            Route Waypoint Rationale
          </h4>

          <div className="space-y-2.5">
            {stops.map((stop, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedStop(stop)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${selectedStop === stop
                    ? 'bg-blue-50 border-blue-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-blue-200'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 capitalize flex items-center gap-1.5">
                    {stop.type === 'current' && '📍 Current Location'}
                    {stop.type === 'pickup' && '📦 Pickup Location'}
                    {stop.type === 'dropoff' && '🏁 Dropoff Location'}
                    {stop.type === 'break' && '☕ 30-Min Rest Break'}
                    {stop.type === 'reset' && '🛌 10-Hr Reset'}
                    {stop.type === 'fuel' && '⛽ Fuel Stop'}
                    {stop.type === 'restart' && '🔄 34-Hr Restart'}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                    Stop #{idx + 1}
                  </span>
                </div>

                <p className="text-slate-600 font-medium">{stop.location_name}</p>
                {stop.remarks && <p className="text-[11px] text-slate-500 mt-1 italic">{stop.remarks}</p>}
                {stop.time && <p className="text-[10px] text-blue-600 font-mono mt-1 font-semibold">Scheduled: {stop.time}</p>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
