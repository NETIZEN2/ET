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
  if (!day) {
    container.textContent = 'No itinerary for today';
    return;
  }
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
  if (freeBlocks.length > 0) {
    freeContainer.innerHTML = '<h3>Free Time</h3><ul>' +
      freeBlocks.map(b => `<li>${b.start} - ${b.end}</li>`).join('') + '</ul>';
  } else {
    freeContainer.textContent = 'No free time today';
  }
}

function fetchSuggestions(lat, lon) {
  const apiKey = typeof window !== 'undefined' ? (window.FSQ_API_KEY || '') : '';
  const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lon}&categories=13000,16000,19014&limit=5`;
  fetch(url, { headers: { 'Authorization': apiKey } })
    .then(res => res.json())
    .then(data => {
      const list = (data.results || []).map(p => {
        const lat = p.geocodes.main.latitude;
        const lon = p.geocodes.main.longitude;
        return `<li>${p.name} <button class="pin-btn" data-name="${p.name}" data-lat="${lat}" data-lon="${lon}">Pin</button></li>`;
      }).join('');
      document.getElementById('suggestions').innerHTML = '<h3>Nearby Activities</h3><ul>' + list + '</ul>';
      document.querySelectorAll('.pin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const { name, lat, lon } = btn.dataset;
          fetch('/api/pins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, lat: parseFloat(lat), lon: parseFloat(lon) })
          });
        });
      });
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

  function displayItinerary(day) {
    const container = document.getElementById('itinerary');
    if (!day) {
      container.textContent = 'No itinerary for today';
      return;
    }
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
    if (freeBlocks.length > 0) {
      freeContainer.innerHTML = '<h3>Free Time</h3><ul>' +
        freeBlocks.map(b => `<li>${b.start} - ${b.end}</li>`).join('') + '</ul>';
    } else {
      freeContainer.textContent = 'No free time today';
    }
  }

  function fetchSuggestions(lat, lon) {
    const apiKey = typeof window !== 'undefined' ? (window.FSQ_API_KEY || '') : '';
    const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lon}&categories=13000,16000,19014&limit=5`;
    fetch(url, { headers: { 'Authorization': apiKey } })
      .then(res => res.json())
      .then(data => {
        const list = (data.results || []).map(p => {
          const lat = p.geocodes.main.latitude;
          const lon = p.geocodes.main.longitude;
          return `<li>${p.name} <button class="pin-btn" data-name="${p.name}" data-lat="${lat}" data-lon="${lon}">Pin</button></li>`;
        }).join('');
        document.getElementById('suggestions').innerHTML = '<h3>Nearby Activities</h3><ul>' + list + '</ul>';
        document.querySelectorAll('.pin-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const { name, lat, lon } = btn.dataset;
            fetch('/api/pins', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, lat: parseFloat(lat), lon: parseFloat(lon) })
            });
          });
        });
      })
      .catch(() => {
        document.getElementById('suggestions').textContent = 'Could not load suggestions';
      });
  }
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initDashboard };
}
