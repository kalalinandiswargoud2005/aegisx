import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { getDeviceCoordinates } from '@/utils/geo';
import { ShieldAlert, Server, Smartphone, Laptop } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon
const createCustomIcon = (status: string) => {
  const color = status === 'OFFLINE' ? '#FF2A6D' : '#05D9E8';
  const iconMarkup = renderToStaticMarkup(
    <div style={{ color, filter: `drop-shadow(0 0 5px ${color})` }}>
      <ShieldAlert size={32} />
    </div>
  );
  
  return L.divIcon({
    html: iconMarkup,
    className: 'custom-hacker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

function FlyToMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 18, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

export function RealDeviceMap({ height = 500 }: { height?: number }) {
  const [activeLocation, setActiveLocation] = useState<[number, number] | null>(null);
  const [realLocation, setRealLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setRealLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation denied or error:", error);
        }
      );
    }
  }, []);

  // Fetch devices
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await api.get('/devices');
      return res.data;
    },
    refetchInterval: 10000
  });

  const nodesData = useMemo(() => {
    return devices.map((d: any, index: number) => {
      // If it's a local device and we have HTML5 real location, use it with slight jitter
      // Otherwise use deterministic mock geo
      let lat, lng;
      if (realLocation && (d.ipAddress === '127.0.0.1' || d.ipAddress === '0:0:0:0:0:0:0:1' || !d.ipAddress)) {
        lat = realLocation.lat + (Math.random() - 0.5) * 0.0005; // slight jitter for multiple devices in same house
        lng = realLocation.lng + (Math.random() - 0.5) * 0.0005;
      } else {
        const geo = getDeviceCoordinates(d.id || d.name);
        lat = geo.lat;
        lng = geo.lng;
      }

      return {
        id: d.id,
        name: d.name,
        type: d.type || 'Server',
        ipAddress: d.ipAddress || 'UNKNOWN IP',
        lat,
        lng,
        status: d.status
      };
    });
  }, [devices, realLocation]);

  return (
    <div style={{ height: `${height}px`, width: '100%' }} className="relative rounded-sm overflow-hidden border border-primary/20 shadow-[0_0_25px_rgba(5,217,232,0.1)] z-0 cyber-cut">
      <MapContainer 
        center={realLocation ? [realLocation.lat, realLocation.lng] : [20, 0]} 
        zoom={realLocation ? 12 : 2} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', backgroundColor: '#050505' }}
      >
        {/* Full Color Esri World Imagery (Satellite) */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        
        <FlyToMarker position={activeLocation} />

        {nodesData.map((node: any) => (
          <Marker 
            key={node.id} 
            position={[node.lat, node.lng]}
            icon={createCustomIcon(node.status)}
            eventHandlers={{
              click: () => {
                setActiveLocation([node.lat, node.lng]);
              },
            }}
          >
            <Popup className="hacker-popup">
              <div className="p-2 font-mono text-sm min-w-[200px]">
                <div className="flex items-center gap-2 mb-2 border-b border-primary/30 pb-2">
                  {node.type === 'Server' && <Server size={16} className="text-primary" />}
                  {node.type === 'Laptop' && <Laptop size={16} className="text-primary" />}
                  {node.type === 'Mobile' && <Smartphone size={16} className="text-primary" />}
                  <strong className="text-primary tracking-widest">{node.name}</strong>
                </div>
                <div className="space-y-1 text-white/80">
                  <div className="flex justify-between">
                    <span>IP:</span>
                    <span className="text-primary">{node.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>STATUS:</span>
                    <span className={node.status === 'OFFLINE' ? 'text-danger font-bold animate-pulse' : 'text-success font-bold text-glow'}>
                      {node.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-white/50 mt-2 border-t border-white/10 pt-1">
                    <span>LAT: {node.lat.toFixed(6)}</span>
                    <span>LNG: {node.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
