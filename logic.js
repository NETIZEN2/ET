(function(global){
  const itinerary = global.itinerary || require('./itinerary.js');

  function getItineraryForDate(dateStr) {
    return itinerary[dateStr];
  }

  function getLocalDateString(date = new Date(), timeZone) {
    return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date);
  }

  function parseTime(str) {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
  }

  function getFreeTimeBlocks(day) {
    if (!day || !day.activities) return [{ start: '00:00', end: '24:00' }];
    const events = day.activities.filter(a => a.start && a.end)
      .map(a => ({ start: parseTime(a.start), end: parseTime(a.end) }))
      .sort((a, b) => a.start - b.start);
    const blocks = [];
    let cursor = 0;
    for (const e of events) {
      if (e.start > cursor) {
        blocks.push({ start: minutesToStr(cursor), end: minutesToStr(e.start) });
      }
      if (e.end > cursor) cursor = e.end;
    }
    if (cursor < 24 * 60) {
      blocks.push({ start: minutesToStr(cursor), end: '24:00' });
    }
    return blocks;
  }

  function minutesToStr(min) {
    const h = String(Math.floor(min / 60)).padStart(2, '0');
    const m = String(min % 60).padStart(2, '0');
    return `${h}:${m}`;
  }

  function haversineDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getItineraryForDate, getLocalDateString, getFreeTimeBlocks, haversineDistance };
  } else {
    global.TripLogic = { getItineraryForDate, getLocalDateString, getFreeTimeBlocks, haversineDistance };
  }
})(this);
