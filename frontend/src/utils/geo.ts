// Simple seeded PRNG to get deterministic values from strings
function sfc32(a: number, b: number, c: number, d: number) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}

function cyrb128(str: string) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

// Major data center regions for realistic placement
const MAJOR_REGIONS = [
  { lat: 37.7749, lng: -122.4194, name: 'San Francisco' },
  { lat: 40.7128, lng: -74.0060, name: 'New York' },
  { lat: 51.5074, lng: -0.1278, name: 'London' },
  { lat: 50.1109, lng: 8.6821, name: 'Frankfurt' },
  { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
  { lat: 1.3521, lng: 103.8198, name: 'Singapore' },
  { lat: -33.8688, lng: 151.2093, name: 'Sydney' },
  { lat: -23.5505, lng: -46.6333, name: 'Sao Paulo' },
  { lat: 25.2048, lng: 55.2708, name: 'Dubai' },
  { lat: 19.0760, lng: 72.8777, name: 'Mumbai' }
];

export function getDeviceCoordinates(deviceIdOrIp: string) {
    if (!deviceIdOrIp) return MAJOR_REGIONS[0];
    
    const seed = cyrb128(deviceIdOrIp);
    const rand = sfc32(seed[0], seed[1], seed[2], seed[3]);
    
    // Pick a primary region
    const regionIdx = Math.floor(rand() * MAJOR_REGIONS.length);
    const baseRegion = MAJOR_REGIONS[regionIdx];

    // Add some realistic jitter (within ~100-200 miles)
    const latJitter = (rand() - 0.5) * 2.0; 
    const lngJitter = (rand() - 0.5) * 2.0;

    return {
        lat: baseRegion.lat + latJitter,
        lng: baseRegion.lng + lngJitter,
        name: baseRegion.name
    };
}
