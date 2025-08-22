import { CONFIG } from './config.js';

/** Render map view */
export async function renderMap(container, trip, date){
  const mapEl = document.createElement('div');
  mapEl.id = 'map';
  mapEl.style.height = 'calc(100vh - 56px)';
  container.appendChild(mapEl);
  const L = await import('https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js');
  const map = L.map(mapEl).setView([48.8566,2.3522],5);
  L.tileLayer(CONFIG.MAP_TILE_URL,{attribution:CONFIG.TILE_ATTRIBUTION}).addTo(map);
  // markers for stays
  trip.stays.forEach(stay=>{
    L.marker([stay.lat, stay.lon]).addTo(map).bindPopup(`<strong>${stay.city}</strong><br>${stay.name}`);
  });
  // polylines for legs
  const points = trip.legs.map(leg=>[leg.dep, leg.arr]);
  points.forEach(([dep,arr])=>{
    if(dep.lat && arr.lat){
      L.polyline([[dep.lat,dep.lon],[arr.lat,arr.lon]],{color:'var(--primary)'}).addTo(map);
    }
  });
}
