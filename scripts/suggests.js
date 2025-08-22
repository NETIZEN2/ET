export function getSuggestions(city){
  // placeholder uses curated list only
  return fetch('/data/curated-pois.json').then(r=>r.json()).then(d=>d[city]||{});
}
