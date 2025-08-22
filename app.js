document.addEventListener('DOMContentLoaded', () => {
  const password = 'eurotrip';
  const loginSection = document.getElementById('login');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('password').value;
    if (input === password) {
      loginSection.style.display = 'none';
      dashboard.classList.add('active');
      initDashboard();
    } else {
      alert('Incorrect password');
    }
  });

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
});
