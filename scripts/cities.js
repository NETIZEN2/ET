import { el } from './ui.js';

export function renderCities(container, trip){
  trip.stays.forEach(stay=>{
    container.appendChild(el('section',{class:'card'},[
      el('h2',{},[stay.city]),
      el('p',{},[stay.name]),
      el('p',{},[stay.addr])
    ]));
  });
}
