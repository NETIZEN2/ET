# Quick Wins

- Add `defer` to local script tags and load Mapbox only after location is needed.
- Introduce a skip link and `<label>` elements for date and manual location inputs.
- Extract itinerary data to `itinerary.json` and fetch it on demand to reduce initial JS size.
- Preload Google Fonts with `rel="preload"` and use `font-display: swap`.
- Implement basic utility classes (e.g., `.stack`, `.cluster`) and remove unused sections to lower CSS specificity.
