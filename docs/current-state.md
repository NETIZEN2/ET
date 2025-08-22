# Current State Summary

## Information Architecture & Routes
- Single page `index.html` served at root; no client-side routing.
- Dashboard contains sections: Current Location, Routes, Itinerary, Itinerary Overview, Free Time, Suggestions, Pinned.

## Key User Flows
1. View current day's itinerary and free time.
2. Navigate dates via previous/next buttons or date picker.
3. Determine location (geolocation or manual entry), view map, fetch nearby suggestions and routes.
4. Pin suggestions for quick access.

## Navigation Model
- Header bar with site title and date navigation.
- No global navigation or breadcrumbs; sections are accessed by scrolling.

## Component Inventory
- Basic components: buttons, date input, text inputs, lists (`<ul>`, `<details>`), map container, sections with headings.
- Scripts: `app.js`, `logic.js`, `itinerary.js`.
- Styles: single stylesheet `styles.css` with minimal custom properties.

## CSS Audit
- One global file using ID selectors for layout (`#dashboard`, `#date-nav`); limited class reuse.
- Responsive rules via two media queries; dark mode handled with `prefers-color-scheme`.
- No separation between utilities and components; potential dead sections (`#routes`, `#suggestions`, `#pinned`) styled but often empty.

## JS Audit
- Large monolithic `app.js` (≈14 kB) managing map, itinerary rendering, suggestions, and pins.
- `itinerary.js` embeds all trip data in the bundle (≈12 kB).
- Functions and state (`map`, `currentDate`) live in global scope; modules rely on script loading order.
- Scripts load synchronously without `defer`, blocking HTML parsing.

## Accessibility Audit
- Landmarks present (`role="main"`, `section` with `role="region"`), but no skip link.
- Date picker and manual location input lack `<label>` elements; placeholders used instead.
- Map and dynamic sections lack alternative descriptions or focus management.
- Focus styles rely on browser defaults; keyboard order follows DOM but some controls <44 px on small screens.

## Performance Scan
- Local assets: `styles.css` (≈2.8 kB), `app.js` (≈14 kB), `itinerary.js` (≈12 kB), `logic.js` (≈1.9 kB).
- External blocking resources: Google Fonts and Mapbox CSS/JS load on first paint.
- No image optimisation or lazy loading; scripts not minified or bundled.
