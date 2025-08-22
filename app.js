// Cleaned and consolidated dashboard logic
let map, userMarker, accommodationMarker;
let currentDate, currentDay;

function getEnv(name) {
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }
  if (typeof window !== 'undefined' && window[name]) {
    return window[name];
  }
  return '';
}

function updateMap(lat, lon, day) {
  if (typeof mapboxgl === 'undefined') return;
  const token = getEnv('MAPBOX_TOKEN') || getEnv('FSQ_API_KEY');
  if (!map) {
    if (token && typeof mapboxgl.accessToken !== 'undefined') {
      mapboxgl.accessToken = token;
    }
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lon, lat],
      zoom: 12
    });
  } else {
    map.setCenter([lon, lat]);
  }
  if (userMarker) {
    userMarker.setLngLat([lon, lat]);
  } else {
    userMarker = new mapboxgl.Marker({ color: 'blue' }).setLngLat([lon, lat]).addTo(map);
  }
  if (day && day.accommodation && isFinite(day.accommodation.lat) && isFinite(day.accommodation.lon)) {
    const coords = [day.accommodation.lon, day.accommodation.lat];
    if (accommodationMarker) {
      accommodationMarker.setLngLat(coords);
    } else {
      accommodationMarker = new mapboxgl.Marker({ color: 'red' }).setLngLat(coords).addTo(map);
    }
  }
}

function displayItinerary(day) {
  const container = document.getElementById('itinerary');
  if (!container) return;
  container.innerHTML = '';
  if (!day) {
    container.textContent = 'No itinerary for today';
    return;
  }
  if (typeof document.createElement !== 'function') {
    let html = '';
    if (day.accommodation) {
      html += `<h3>Accommodation</h3><p>${day.accommodation.name}<br>${day.accommodation.address}</p>`;
    }
    if (day.travel) {
      html += `<h3>Travel</h3><p>${day.travel}</p>`;
    }
    if (day.activities && day.activities.length) {
      html += '<h3>Activities</h3><ul>' +
        day.activities.map(a => `<li>${a.start ? a.start + ' - ' : ''}${a.end ? a.end + ': ' : ''}${a.title}</li>`).join('') + '</ul>';
    }
    container.innerHTML = html;
    const freeBlocks = TripLogic.getFreeTimeBlocks(day);
    const freeContainer = document.getElementById('free-time');
    if (freeContainer) {
      if (freeBlocks.length > 0) {
        freeContainer.innerHTML = '<h3>Free Time</h3><ul>' +
          freeBlocks.map(b => `<li>${b.start} - ${b.end}</li>`).join('') + '</ul>';
      } else {
        freeContainer.textContent = 'No free time today';
      }
    }
    return;
  }
  if (day.accommodation) {
    const acc = day.accommodation;
    const h3 = document.createElement('h3');
    h3.textContent = 'Accommodation';
    container.appendChild(h3);
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(acc.name));
    p.appendChild(document.createElement('br'));
    const addr = document.createElement('a');
    addr.href = '#';
    addr.setAttribute('id', 'acc-address');
    addr.textContent = acc.address;
    addr.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof highlightMarker === 'function') {
        highlightMarker(acc.address);
      }
    });
    p.appendChild(addr);
    if (acc.checkIn) {
      p.appendChild(document.createElement('br'));
      p.appendChild(document.createTextNode(`Check-in: ${acc.checkIn}`));
    }
    if (acc.checkOut) {
      p.appendChild(document.createElement('br'));
      p.appendChild(document.createTextNode(`Check-out: ${acc.checkOut}`));
    }
    if (acc.bookingRef) {
      p.appendChild(document.createElement('br'));
      p.appendChild(document.createTextNode(`Booking ref: ${acc.bookingRef}`));
    }
    container.appendChild(p);
  }
  if (day.travel) {
    const h3 = document.createElement('h3');
    h3.textContent = 'Travel';
    container.appendChild(h3);
    const p = document.createElement('p');
    p.textContent = day.travel;
    container.appendChild(p);
  }
  if (day.activities && day.activities.length) {
    const h3 = document.createElement('h3');
    h3.textContent = 'Activities';
    container.appendChild(h3);
    const ul = document.createElement('ul');
    day.activities.forEach((a, i) => {
      const li = document.createElement('li');
      const times = [];
      if (a.start) times.push(a.start);
      if (a.end) times.push(a.end);
      if (times.length) {
        li.appendChild(document.createTextNode(times.join(' - ') + ': '));
      }
      li.appendChild(document.createTextNode(a.title));
      if (a.description) {
        li.appendChild(document.createElement('br'));
        li.appendChild(document.createTextNode(a.description));
      }
      const ta = document.createElement('textarea');
      ta.className = 'activity-note';
      if (typeof localStorage !== 'undefined') {
        const key = `note-${i}`;
        ta.value = localStorage.getItem(key) || '';
        ta.addEventListener('input', () => localStorage.setItem(key, ta.value));
      }
      li.appendChild(document.createElement('br'));
      li.appendChild(ta);
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }
  const freeBlocks = TripLogic.getFreeTimeBlocks(day);
  const freeContainer = document.getElementById('free-time');
  if (freeContainer) {
    freeContainer.innerHTML = '';
    if (freeBlocks.length > 0) {
      const h3 = document.createElement('h3');
      h3.textContent = 'Free Time';
      freeContainer.appendChild(h3);
      const ul = document.createElement('ul');
      freeBlocks.forEach(b => {
        const li = document.createElement('li');
        li.textContent = `${b.start} - ${b.end}`;
        ul.appendChild(li);
      });
      freeContainer.appendChild(ul);
    } else {
      freeContainer.textContent = 'No free time today';
    }
  }
}

function renderItineraryList(entries) {
  const container = document.getElementById('itinerary-list');
  if (!container) return;
  container.innerHTML = '';
  (entries || []).forEach(item => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = `${item.date} - ${item.location}`;
    details.appendChild(summary);
    if (item.notes) {
      const p = document.createElement('p');
      p.textContent = item.notes;
      details.appendChild(p);
    }
    container.appendChild(details);
  });
}

function displayPinned(date) {
  const key = `pinned-${date}`;
  const items = JSON.parse((typeof localStorage !== 'undefined' && localStorage.getItem(key)) || '[]');
  const container = document.getElementById('pinned');
  if (!container) return;
  if (items.length) {
    container.innerHTML = '<h3>Pinned</h3><ul>' + items.map(t => `<li>${t}</li>`).join('') + '</ul>';
  } else {
    container.innerHTML = '';
  }
}

function pinItem(title) {
  if (!currentDate || typeof localStorage === 'undefined') return;
  const key = `pinned-${currentDate}`;
  const items = JSON.parse(localStorage.getItem(key) || '[]');
  if (!items.includes(title)) {
    items.push(title);
    localStorage.setItem(key, JSON.stringify(items));
    displayPinned(currentDate);
  }
}

function fetchSuggestions(lat, lon) {
  const apiKey = getEnv('FSQ_API_KEY');
  const container = typeof document !== 'undefined' ? document.getElementById('suggestions') : null;
  const headers = apiKey ? { Authorization: apiKey } : {};
  const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lon}&categories=13000,16000,19014&limit=5`;
  fetch(url, { headers })
    .then(res => res.json())
    .then(data => {
      const places = data.results || (data.query && data.query.geosearch) || [];
      const list = places.map(p => {
        const name = p.name || p.title;
        const plat = p.geocodes && p.geocodes.main ? p.geocodes.main.latitude : '';
        const plon = p.geocodes && p.geocodes.main ? p.geocodes.main.longitude : '';
        return `<li>${name} <button class="pin-btn" data-name="${name}" data-lat="${plat}" data-lon="${plon}">Pin</button></li>`;
      }).join('');
      if (container) {
        container.innerHTML = '<h3>Nearby Activities</h3><ul>' + list + '</ul>';
        if (typeof container.querySelectorAll === 'function') {
          container.querySelectorAll('.pin-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              const { name, lat, lon } = btn.dataset;
              fetch('/api/pins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, lat: parseFloat(lat), lon: parseFloat(lon) })
              });
              pinItem(name);
            });
          });
        }
      }
    })
    .catch(() => {
      if (container) container.textContent = 'Could not load suggestions';
    });
}

async function loadRoutes(lat, lon, destination) {
  const container = document.getElementById('routes');
  if (!container || !destination) return;
  const modes = [
    { mode: 'transit', label: 'Transit', link: `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${encodeURIComponent(destination)}&travelmode=transit` },
    { mode: 'walking', label: 'Walking', link: `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${encodeURIComponent(destination)}&travelmode=walking` },
    { mode: 'driving', label: 'Taxi/Ride-share', link: `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${lat}&pickup[longitude]=${lon}&dropoff[formatted_address]=${encodeURIComponent(destination)}` }
  ];
  try {
    const base = `https://maps.googleapis.com/maps/api/directions/json?origin=${lat},${lon}&destination=${encodeURIComponent(destination)}`;
    const results = await Promise.all(modes.map(async m => {
      const res = await fetch(`${base}&mode=${m.mode}`);
      const json = await res.json();
      const duration = json.routes && json.routes[0] && json.routes[0].legs && json.routes[0].legs[0] && json.routes[0].legs[0].duration && json.routes[0].legs[0].duration.text ? json.routes[0].legs[0].duration.text : 'N/A';
      return { label: m.label, duration, link: m.link };
    }));
    container.innerHTML = '<h3>Routes</h3><ul>' +
      results.map(r => `<li>${r.label}: ${r.duration} - <a href="${r.link}" target="_blank">Open in ${r.label === 'Taxi/Ride-share' ? 'Uber' : 'Maps'}</a></li>`).join('') +
      '</ul>';
  } catch (e) {
    container.textContent = 'Could not load route information';
  }
}

function initDashboard(selectedDate) {
  currentDate = selectedDate || (typeof localStorage !== 'undefined' && (localStorage.getItem('lastDate') || TripLogic.getLocalDateString()));
  if (typeof localStorage !== 'undefined') localStorage.setItem('lastDate', currentDate);
  const datePicker = document.getElementById('date-picker');
  if (datePicker) datePicker.value = currentDate;
  currentDay = TripLogic.getItineraryForDate(currentDate);
  displayItinerary(currentDay);
  displayPinned(currentDate);

  const manualContainer = document.getElementById('manual-location-container');
  const manualInput = document.getElementById('manual-location');
  const setLocationBtn = document.getElementById('set-location');

  function applyLocation(lat, lon) {
    document.getElementById('location').textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    if (currentDay && currentDay.accommodation) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentDay.accommodation.address)}&origin=${lat},${lon}`;
      document.getElementById('maps-link').href = mapsUrl;
    }
    updateMap(lat, lon, currentDay);
    fetchSuggestions(lat, lon);
    if (currentDay && currentDay.accommodation) {
      loadRoutes(lat, lon, currentDay.accommodation.address);
    }
  }

  setLocationBtn && setLocationBtn.addEventListener('click', () => {
    const [lat, lon] = manualInput.value.split(',').map(s => parseFloat(s.trim()));
    if (isFinite(lat) && isFinite(lon)) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('manualLocation', `${lat},${lon}`);
      }
      applyLocation(lat, lon);
    } else {
      if (typeof alert !== 'undefined') alert('Please enter valid coordinates in "lat,lon" format');
    }
  });

  function handleNoGeo() {
    if (manualContainer) manualContainer.style.display = 'block';
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('manualLocation') : null;
    if (stored) {
      const [lat, lon] = stored.split(',').map(Number);
      if (isFinite(lat) && isFinite(lon)) {
        applyLocation(lat, lon);
        return;
      }
    }
    const locEl = document.getElementById('location');
    if (locEl) locEl.textContent = 'Location unavailable';
  }

  if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
    navigator.geolocation.getCurrentPosition((pos) => {
      applyLocation(pos.coords.latitude, pos.coords.longitude);
    }, handleNoGeo);
  } else {
    handleNoGeo();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const datePicker = document.getElementById('date-picker');
  const prevBtn = document.getElementById('prev-date');
  const nextBtn = document.getElementById('next-date');
  if (datePicker) {
    datePicker.addEventListener('change', (e) => initDashboard(e.target.value));
  }
  prevBtn && prevBtn.addEventListener('click', () => {
    const d = new Date(datePicker.value);
    d.setDate(d.getDate() - 1);
    initDashboard(d.toISOString().split('T')[0]);
  });
  nextBtn && nextBtn.addEventListener('click', () => {
    const d = new Date(datePicker.value);
    d.setDate(d.getDate() + 1);
    initDashboard(d.toISOString().split('T')[0]);
  });
  fetch('/api/itinerary')
    .then(res => res.json())
    .then(data => renderItineraryList(data))
    .catch(() => {
      const c = document.getElementById('itinerary-list');
      if (c) c.textContent = 'Could not load itinerary';
    });
  initDashboard();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initDashboard, displayItinerary, loadRoutes, renderItineraryList };
}

