/**
 * @typedef {Object} Leg
 * @property {string} id
 * @property {('flight'|'train'|'car'|'rideshare'|'walk')} mode
 * @property {string} [number]
 * @property {{dt:string,place:string,iata?:string,terminal?:string}} dep
 * @property {{dt:string,place:string,iata?:string,terminal?:string}} arr
 * @property {number} [durationMin]
 * @property {string[]} [notes]
 */

/**
 * @typedef {Object} Stay
 * @property {string} id
 * @property {string} city
 * @property {string} country
 * @property {string} name
 * @property {string} addr
 * @property {number} lat
 * @property {number} lon
 * @property {string} checkin
 * @property {string} checkout
 * @property {string} [tz]
 */

/**
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} date
 * @property {string} title
 * @property {string} [time]
 * @property {string} [note]
 */

/**
 * @typedef {Object} Trip
 * @property {string} tripName
 * @property {Leg[]} legs
 * @property {Stay[]} stays
 * @property {Activity[]} bookedActivities
 */

/**
 * Fetch itinerary and related data.
 * @returns {Promise<Trip>}
 */
export async function loadTrip(){
  const [trip, tzIndex] = await Promise.all([
    fetch('/data/itinerary.json').then(r=>r.json()),
    fetch('/data/tz-index.json').then(r=>r.json())
  ]);
  // attach timezones
  trip.stays.forEach(stay=>{
    stay.tz = tzIndex[stay.city] || 'UTC';
  });
  return trip;
}
