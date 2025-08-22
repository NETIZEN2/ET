import { el } from './ui.js';

function formatTime(str, tz){
  const d = new Date(str);
  return d.toLocaleTimeString('en-AU',{timeZone:tz,hour:'2-digit',minute:'2-digit'});
}

/** Render timeline for a date */
export function renderTimeline(container, trip, date){
  const day = date.toISOString().slice(0,10);
  const items = [];
  // legs
  trip.legs.forEach(leg=>{
    if(leg.dep.dt.slice(0,10)===day){
      items.push(el('div',{class:'card'},[
        el('h3',{},[`${leg.mode.toUpperCase()} ${leg.number||''}`]),
        el('p',{},[`Depart ${formatTime(leg.dep.dt,trip.stays[0].tz)} ${leg.dep.place}`])
      ]));
    }
  });
  // activities
  trip.bookedActivities.forEach(act=>{
    if(act.date===day){
      items.push(el('div',{class:'card'},[
        el('h3',{},[act.title]),
        act.time?el('p',{},[`Time ${act.time}`]):''
      ]));
    }
  });
  if(items.length===0){
    items.push(el('p',{},['No events']));
  }
  items.forEach(i=>container.appendChild(i));
}
