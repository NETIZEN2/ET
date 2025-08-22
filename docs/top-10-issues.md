# Top 10 Issues (Impact × Effort)

1. **Blocking Mapbox and scripts** – External Mapbox CSS/JS and local scripts load synchronously, delaying first paint. *(High impact, Medium effort)*
2. **Monolithic JavaScript with globals** – `app.js` handles map, itinerary, suggestions, and pins with shared state, making maintenance hard. *(High impact, High effort)*
3. **Embedded itinerary data** – Trip data lives in `itinerary.js`, inflating bundle size and requiring code changes for content updates. *(High impact, Medium effort)*
4. **Single global stylesheet** – `styles.css` mixes layout and component rules with ID selectors, limiting reuse and increasing specificity. *(Medium impact, Medium effort)*
5. **Accessibility gaps** – No skip link; inputs lack labels; map lacks alternative text; focus styles inconsistent. *(High impact, Low effort)*
6. **No design system or components** – UI elements are ad‑hoc, causing inconsistent spacing, colors, and interactions. *(Medium impact, High effort)*
7. **Rigid layout** – Sections rely on a grid for all breakpoints; no utilities for stacking/cluster/sidebar layouts. *(Medium impact, Medium effort)*
8. **Performance optimisations missing** – Fonts not preloaded; images/scripts not lazy‑loaded or minified; no critical CSS inlining. *(Medium impact, Medium effort)*
9. **Lack of internationalisation/theming** – All strings hard‑coded in English; no light/dark switch beyond media query. *(Low impact, Medium effort)*
10. **Minimal testing and CI** – Tests exist but no automated linting, accessibility, or performance checks in CI. *(Medium impact, Medium effort)*
