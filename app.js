let map, userMarker, accommodationMarker;

function updateMap(lat, lon, day) {
  if (typeof mapboxgl === 'undefined') return;
  if (!map) {
    mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
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

function initDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const day = TripLogic.getItineraryForDate(today);
  const manualContainer = document.getElementById('manual-location-container');
  const manualInput = document.getElementById('manual-location');
  const setLocationBtn = document.getElementById('set-location');

  function applyLocation(lat, lon) {
    document.getElementById('location').textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    if (day && day.accommodation) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(day.accommodation.address)}&origin=${lat},${lon}`;
      document.getElementById('maps-link').href = mapsUrl;
    }
    updateMap(lat, lon, day);
    fetchSuggestions(lat, lon);
  }

  setLocationBtn.addEventListener('click', () => {
    const [lat, lon] = manualInput.value.split(',').map(s => parseFloat(s.trim()));
    if (isFinite(lat) && isFinite(lon)) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('manualLocation', `${lat},${lon}`);
      }
      applyLocation(lat, lon);
    } else {
      alert('Please enter valid coordinates in "lat,lon" format');
    }
  });

  function handleNoGeo() {
    manualContainer.style.display = 'block';
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('manualLocation') : null;
    if (stored) {
      const [lat, lon] = stored.split(',').map(Number);
      if (isFinite(lat) && isFinite(lon)) {
        applyLocation(lat, lon);
        return;
      }
    }
    document.getElementById('location').textContent = 'Location unavailable';
  }

  displayItinerary(day);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      document.getElementById('location').textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
      if (day && day.accommodation) {
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(day.accommodation.address)}&origin=${lat},${lon}`;
      document.getElementById('maps-link').href = mapsUrl;
      }
      fetchSuggestions(lat, lon);
      if (day && day.accommodation) {
        loadRoutes(lat, lon, day.accommodation.address);
      }
    }, () => {
      document.getElementById('location').textContent = 'Location unavailable';
    });
      applyLocation(pos.coords.latitude, pos.coords.longitude);
    }, handleNoGeo);
  } else {
    handleNoGeo();
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
  if (!freeContainer) return;
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

function fetchSuggestions(lat, lon) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}%7C${lon}&gsradius=10000&gslimit=5&format=json&origin=*`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const list = data.query.geosearch.map(p => `<li>${p.title}</li>`).join('');
      document.getElementById('suggestions').innerHTML = '<h3>Nearby Activities</h3><ul>' + list + '</ul>';
    })
    .catch(() => {
      document.getElementById('suggestions').textContent = 'Could not load suggestions';
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

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const manualContainer = document.getElementById('manual-location-container');
  const manualInput = document.getElementById('manual-location');
  const setLocationBtn = document.getElementById('set-location');
  let currentDay;
  let clockInterval;

  function startClock(timeZone) {
    const header = document.querySelector('#dashboard header');
    let clockEl = document.getElementById('clock');
    if (!clockEl) {
      clockEl = document.createElement('span');
      clockEl.id = 'clock';
      header.appendChild(clockEl);
    }
    const formatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone
    });
    function update() {
      clockEl.textContent = formatter.format(new Date());
    }
    update();
    clearInterval(clockInterval);
    clockInterval = setInterval(update, 60 * 1000);
  }

  function fetchTimezone(lat, lon) {
    const url = `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`;
    return fetch(url).then(res => res.json()).then(data => data.timeZone);
  }

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

  setLocationBtn.addEventListener('click', () => {
    const [lat, lon] = manualInput.value.split(',').map(s => parseFloat(s.trim()));
    if (isFinite(lat) && isFinite(lon)) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('manualLocation', `${lat},${lon}`);
      }
      applyLocation(lat, lon);
      fetchTimezone(lat, lon).then(startClock).catch(() => {
        startClock(Intl.DateTimeFormat().resolvedOptions().timeZone);
      });
    } else {
      alert('Please enter valid coordinates in "lat,lon" format');
    }
  });

  async function attemptAutoLogin() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/validate', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      loginSection.style.display = 'none';
      dashboard.style.display = 'block';
      initDashboard();
    } else {
      localStorage.removeItem('token');
    }
  }

  attemptAutoLogin();

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('password').value;
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: input })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      loginSection.style.display = 'none';
      dashboard.classList.add('active');
      initDashboard();
    } else {
      alert('Incorrect password');
    }
  });

  function initDashboard() {
    const today = TripLogic.getLocalDateString();
    const day = TripLogic.getItineraryForDate(today);
    currentDay = day;
    displayItinerary(day);
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('manualLocation') : null;

    function handleNoGeo() {
      manualContainer.style.display = 'block';
      if (stored) {
        const [lat, lon] = stored.split(',').map(Number);
        applyLocation(lat, lon);
        fetchTimezone(lat, lon).then(startClock).catch(() => {
          startClock(Intl.DateTimeFormat().resolvedOptions().timeZone);
        });
      } else {
        document.getElementById('location').textContent = 'Location unavailable';
        startClock(Intl.DateTimeFormat().resolvedOptions().timeZone);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        applyLocation(latitude, longitude);
        fetchTimezone(latitude, longitude).then(startClock).catch(() => {
          startClock(Intl.DateTimeFormat().resolvedOptions().timeZone);
        });
      }, handleNoGeo);
    } else {
      handleNoGeo();
    }
  }

  // use global displayItinerary and fetchSuggestions
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initDashboard, displayItinerary };
  module.exports = { initDashboard, loadRoutes };
  module.exports = {};
}
