const KEY = 'eu-trip-state';
let cache = null;

/** Load state from localStorage */
export function loadState(){
  if(cache) return cache;
  try{cache = JSON.parse(localStorage.getItem(KEY)) || {};}catch{cache={}};
  return cache;
}

/** Save state to localStorage */
export function saveState(){
  if(!cache) return;
  localStorage.setItem(KEY, JSON.stringify(cache));
}

/** Get or set a value */
export function state(path, value){
  const s = loadState();
  if(value === undefined) return s[path];
  s[path] = value;
  saveState();
  return value;
}
