import { el, clear } from './ui.js';
import { renderMap } from './map.js';
import { renderTimeline } from './timeline.js';
import { renderCities } from './cities.js';
import { loadTrip } from './data.js';

let trip; let currentView = 'map'; let currentDate = new Date();

function show(view){
  currentView = view;
  const main = document.getElementById('main');
  clear(main);
  if(view==='map') renderMap(main, trip, currentDate);
  if(view==='timeline') renderTimeline(main, trip, currentDate);
  if(view==='cities') renderCities(main, trip);
  // update segmented control
  document.querySelectorAll('.segmented button').forEach(btn=>{
    btn.setAttribute('aria-pressed', btn.dataset.view===view);
  });
}

function changeDay(delta){
  currentDate.setDate(currentDate.getDate()+delta);
  show(currentView);
}

export async function initRouter(){
  trip = await loadTrip();
  document.querySelectorAll('.segmented button').forEach(btn=>
    btn.addEventListener('click',()=>show(btn.dataset.view))
  );
  document.getElementById('prev-day').addEventListener('click',()=>changeDay(-1));
  document.getElementById('next-day').addEventListener('click',()=>changeDay(1));
  document.getElementById('today').addEventListener('click',()=>{currentDate=new Date();show(currentView);});
  show('map');
}
