function initDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const day = TripLogic.getItineraryForDate(today);
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
    }, () => {
      document.getElementById('location').textContent = 'Location unavailable';
    });
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

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const manualContainer = document.getElementById('manual-location-container');
  const manualInput = document.getElementById('manual-location');
  const setLocationBtn = document.getElementById('set-location');
  let currentDay;

  function applyLocation(lat, lon) {
    document.getElementById('location').textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    if (currentDay && currentDay.accommodation) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentDay.accommodation.address)}&origin=${lat},${lon}`;
      document.getElementById('maps-link').href = mapsUrl;
    }
    fetchSuggestions(lat, lon);
  }

  setLocationBtn.addEventListener('click', () => {
    const [lat, lon] = manualInput.value.split(',').map(s => parseFloat(s.trim()));
    if (isFinite(lat) && isFinite(lon)) {
      localStorage.setItem('manualLocation', `${lat},${lon}`);
      applyLocation(lat, lon);
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
    const stored = localStorage.getItem('manualLocation');

    function handleNoGeo() {
      manualContainer.style.display = 'block';
      if (stored) {
        const [lat, lon] = stored.split(',').map(Number);
        applyLocation(lat, lon);
      } else {
        document.getElementById('location').textContent = 'Location unavailable';
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        applyLocation(pos.coords.latitude, pos.coords.longitude);
      }, handleNoGeo);
    } else {
      handleNoGeo();
    }
  }

  // use global displayItinerary and fetchSuggestions
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initDashboard, displayItinerary };
}
