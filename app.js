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

function displayPinned(date) {
  const key = `pinned-${date}`;
  const items = JSON.parse(localStorage.getItem(key) || '[]');
  const container = document.getElementById('pinned');
  if (items.length) {
    container.innerHTML = '<h3>Pinned</h3><ul>' + items.map(t => `<li>${t}</li>`).join('') + '</ul>';
  } else {
    container.innerHTML = '';
  }
}

function pinItem(title) {
  if (!currentDate) return;
  const key = `pinned-${currentDate}`;
  const items = JSON.parse(localStorage.getItem(key) || '[]');
  if (!items.includes(title)) {
    items.push(title);
    localStorage.setItem(key, JSON.stringify(items));
    displayPinned(currentDate);
  }
}

function fetchSuggestions(lat, lon) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}%7C${lon}&gsradius=10000&gslimit=5&format=json&origin=*`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const list = data.query.geosearch.map(p => `<li><button class="pin" data-title="${p.title}">Pin</button> ${p.title}</li>`).join('');
      document.getElementById('suggestions').innerHTML = '<h3>Nearby Activities</h3><ul>' + list + '</ul>';
      document.querySelectorAll('#suggestions .pin').forEach(btn => {
        btn.addEventListener('click', () => pinItem(btn.getAttribute('data-title')));
      });
    })
    .catch(() => {
      document.getElementById('suggestions').textContent = 'Could not load suggestions';
    });
}

let currentDay;
let currentDate;
let manualContainer;
let manualInput;
let setLocationBtn;
let datePicker;

function applyLocation(lat, lon) {
  document.getElementById('location').textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  if (currentDay && currentDay.accommodation) {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentDay.accommodation.address)}&origin=${lat},${lon}`;
    document.getElementById('maps-link').href = mapsUrl;
  }
  fetchSuggestions(lat, lon);
}

function initDashboard(selectedDate) {
  currentDate = selectedDate || localStorage.getItem('lastDate') || TripLogic.getLocalDateString();
  localStorage.setItem('lastDate', currentDate);
  if (datePicker) datePicker.value = currentDate;
  currentDay = TripLogic.getItineraryForDate(currentDate);
  displayItinerary(currentDay);
  displayPinned(currentDate);
  const stored = localStorage.getItem('manualLocation');

  function handleNoGeo() {
    if (manualContainer) manualContainer.style.display = 'block';
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

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  manualContainer = document.getElementById('manual-location-container');
  manualInput = document.getElementById('manual-location');
  setLocationBtn = document.getElementById('set-location');
  datePicker = document.getElementById('date-picker');
  const prevBtn = document.getElementById('prev-date');
  const nextBtn = document.getElementById('next-date');

  setLocationBtn.addEventListener('click', () => {
    const [lat, lon] = manualInput.value.split(',').map(s => parseFloat(s.trim()));
    if (isFinite(lat) && isFinite(lon)) {
      localStorage.setItem('manualLocation', `${lat},${lon}`);
      applyLocation(lat, lon);
    } else {
      alert('Please enter valid coordinates in "lat,lon" format');
    }
  });

  datePicker.addEventListener('change', (e) => initDashboard(e.target.value));
  prevBtn.addEventListener('click', () => {
    const d = new Date(datePicker.value);
    d.setDate(d.getDate() - 1);
    initDashboard(d.toISOString().split('T')[0]);
  });
  nextBtn.addEventListener('click', () => {
    const d = new Date(datePicker.value);
    d.setDate(d.getDate() + 1);
    initDashboard(d.toISOString().split('T')[0]);
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
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initDashboard, pinItem, displayPinned };
}
