import React, { useEffect, useState, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { getDeviceCoordinates } from '@/utils/geo';
import * as THREE from 'three';

interface DeviceNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  size: number;
  color: string;
  status: string;
}

export function LiveDeviceGlobe({ 
  height = 400, 
  autoRotate = true,
  showRings = true 
}: { 
  height?: number,
  autoRotate?: boolean,
  showRings?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });
  
  // Fetch devices
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await api.get('/devices');
      return res.data;
    },
    refetchInterval: 10000
  });

  const nodesData: DeviceNode[] = useMemo(() => {
    return devices.map((d: any) => {
      const geo = getDeviceCoordinates(d.id || d.name);
      return {
        id: d.id,
        name: d.name,
        lat: geo.lat,
        lng: geo.lng,
        size: 0.5, // Relative size of point
        color: d.status === 'OFFLINE' ? '#ff003c' : '#00ff41',
        status: d.status
      };
    });
  }, [devices]);

  // Handle Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: height || entries[0].contentRect.height || 400
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [height]);

  // Setup Globe visual settings
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 1.0;
      controls.enableZoom = true;
      
      // Point camera to a good starting angle (e.g. Europe/US)
      globeRef.current.pointOfView({ lat: 39.6, lng: -98.5, altitude: 2 });
    }
  }, [autoRotate]);

  // Create ring data out of active nodes
  const ringsData = useMemo(() => {
    if (!showRings) return [];
    return nodesData.filter(n => n.status !== 'OFFLINE').map(n => ({
      lat: n.lat,
      lng: n.lng,
      maxR: 3 + Math.random() * 5,
      propagationSpeed: 1 + Math.random() * 2,
      repeatPeriod: 700 + Math.random() * 800,
      color: n.color
    }));
  }, [nodesData, showRings]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: `${height}px` }} className="relative rounded-md overflow-hidden bg-transparent">
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          
          pointsData={nodesData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude={0.01}
          pointRadius="size"
          pointsMerge={false}
          
          ringsData={ringsData}
          ringColor="color"
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"

          htmlElementsData={nodesData}
          htmlElement={(d: any) => {
            const el = document.createElement('div');
            el.innerHTML = `<div style="color: ${d.color}; font-size: 10px; font-family: monospace; white-space: nowrap; pointer-events: none; margin-left: 10px;">
              [NODE: ${d.name.substring(0, 8)}]
            </div>`;
            return el;
          }}
        />
      )}
      
      {/* Vignette Overlay for Cyber Feel */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.8)_100%)]" />
    </div>
  );
}
