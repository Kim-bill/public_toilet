# Project Research Summary

**Project:** Public Toilet
**Domain:** Mobile-first map-based utility web app (private, 2-user, single neighborhood)
**Researched:** 2026-04-08
**Confidence:** HIGH

## Executive Summary

This is a private mobile web app for a couple to record and recall toilet passwords in Misa New Town, Korea. The proven approach for this class of app -- a lightweight map utility with a tiny user base -- is a static frontend on GitHub Pages using Kakao Maps for Korean map accuracy, Google Sheets via Apps Script as a zero-cost serverless backend, and vanilla JavaScript with no framework overhead. The entire app is a single screen (map + modals), serving fewer than 100 data records for 2 users. This simplicity is a feature, not a limitation.

The recommended stack is deliberately minimal: Vite 8 for build tooling, Kakao Maps JS SDK for map rendering, Google Apps Script for CRUD operations against Google Sheets, and Pico CSS for classless mobile-first styling. No framework (React/Vue/Svelte) is justified for a single-screen app. No authentication is needed for 2 private users. The total bundle should stay under 50KB excluding the map SDK.

The primary risks are integration-related rather than architectural: Kakao Maps API key domain registration must be correct for GitHub Pages, Google Apps Script POST requests require a non-obvious CORS workaround (text/plain content type), and mobile geolocation on iOS Safari has permission quirks that cause silent failures. All three risks are well-documented with known solutions and should be addressed in the first development phase before any feature work begins.

## Key Findings

### Recommended Stack

The stack is optimized for zero operational cost and minimal complexity. Every technology choice was made to avoid unnecessary infrastructure for a 2-user app.

**Core technologies:**
- **Vite 8.x**: Build tool and dev server -- Rolldown-based builds are 10-30x faster than Vite 7, native GitHub Pages deployment via Actions
- **Kakao Maps JS SDK v2**: Map rendering and markers -- the only viable option for Korean building-level address accuracy; loaded via CDN script tag
- **Google Apps Script**: Serverless backend (doGet/doPost) -- zero-cost CRUD layer to Google Sheets; deploy as web app with Anyone access
- **Google Sheets**: Database -- free, editable via spreadsheet UI, wife can also edit directly
- **Pico CSS 2.x**: Classless CSS framework -- 7.7KB gzipped, mobile-first responsive typography, dark mode support, no classes needed

**What NOT to use:** React/Vue/Angular (unnecessary for 1 screen), jQuery (dead), Leaflet/Mapbox (no Korean data), Firebase (overkill), TypeScript (overhead for ~500-line app), localStorage as primary DB (data trapped on single device).

### Expected Features

**Must have (table stakes):**
- Map with toilet markers (color-coded for locked/unlocked)
- GPS-based current location and nearest toilet identification
- Password display on marker tap (building name, floor, password, memo)
- Add new toilet by tapping map + filling form
- Edit existing toilet info
- Lock status visual indicator
- Mobile-optimized UI (one-hand operation)
- Data persistence via Google Sheets
- Pre-seeded data for major Misa buildings (Starfield, Homeplus, etc.)

**Should have (differentiators):**
- Quick-copy password to clipboard
- Distance display (120m or 5 min walk)
- List view sorted by distance

**Defer (v2+):**
- Region expansion beyond Misa
- PWA install prompt (bookmark works fine)
- PIN protection for URL
- Search by building name (only needed past ~20 entries)
- Marker clustering (only needed past ~50 markers)
### Architecture Approach

The architecture is a static single-page app with three frontend modules (Map, Data, UI) communicating through custom DOM events, backed by a Google Apps Script web app that acts as a dumb CRUD proxy to Google Sheets. All data (~20-50 records) is loaded in a single GET request on startup and cached in memory. The map serves as the central interaction surface -- all user flows originate from map taps or marker clicks. Writes use optimistic UI (show the marker immediately, sync to GAS in background).

**Major components:**
1. **Map Module (map.js)** -- Kakao Maps initialization, marker management, map tap events; emits custom events for loose coupling
2. **Data Module (api.js)** -- Single service layer encapsulating all GAS communication; enforces the text/plain CORS workaround consistently
3. **UI Module (ui.js)** -- Bottom sheet for toilet details, add/edit forms, GPS button; listens to map events
4. **App State (app.js)** -- In-memory cache of toilet list, current GPS position, selected toilet; simple JS object, no state management library
5. **GAS Backend (Code.gs)** -- Minimal doGet/doPost handlers; all logic stays in the frontend, GAS is just a data pipe

### Critical Pitfalls

1. **Kakao Maps API key domain mismatch** -- Register both localhost AND username.github.io in Kakao Developer Console from day one. Test deployment to GitHub Pages early in Phase 1, not after building the entire app. Gray map box = wrong domain.
2. **Google Apps Script CORS on POST** -- Use Content-Type text/plain;charset=utf-8 instead of application/json to skip browser preflight. This is non-obvious and will silently fail if missed. Validate POST from deployed frontend in Phase 1.
3. **Mobile geolocation silent failures** -- Always set timeout (10s), always implement error callback, use a manual find-my-location button instead of auto-requesting on load. iOS Safari resets permission on page refresh for non-PWA web apps.
4. **GAS response latency (400ms-1500ms)** -- Load all data in a single bulk GET on startup. Never fetch per-marker. Use optimistic UI for writes. Show loading indicator during initial fetch.
5. **GAS deployment URL changes** -- Store the web app URL as a single constant. Each new deployment generates a new URL. Use Manage deployments to update in-place rather than creating new deployments.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation and Integration Validation

**Rationale:** Six of seven critical pitfalls must be addressed in this phase. All subsequent work depends on three external integrations working correctly: Kakao Maps rendering, GAS read/write, and GitHub Pages deployment. Validating these integrations before writing feature code prevents costly rework.
**Delivers:** A deployed page on GitHub Pages showing a Kakao Map centered on Misa New Town, with a verified round-trip to Google Sheets (read seed data, write a test record).
**Addresses features:** Kakao Map rendering, Google Sheets data persistence
**Avoids pitfalls:** API key domain mismatch, GAS CORS errors, GAS URL management, API key exposure, data exposure

### Phase 2: Map Data and Markers

**Rationale:** With integrations validated, the next step is displaying real data on the map. This is the core read path -- the most common user interaction is opening the app and seeing toilet markers.
**Delivers:** Map populated with toilet markers from Google Sheets, marker tap shows toilet details (building, floor, password, memo), lock status visual indicator on markers.
**Addresses features:** Map with toilet markers, password display on tap, lock status indicator, pre-seeded data
**Avoids pitfalls:** GAS latency (bulk load pattern), marker cleanup on refresh

### Phase 3: GPS and Location

**Rationale:** GPS is the second core interaction after viewing markers. It requires careful error handling and iOS-specific testing. Separating it from Phase 2 keeps each phase focused and testable.
**Delivers:** Find-my-location button, map centers on user position, nearest toilet highlighted, distance display on markers.
**Addresses features:** GPS current location, nearest toilet identification, distance display
**Avoids pitfalls:** Geolocation silent failures, iOS Safari permission quirks

### Phase 4: CRUD Operations

**Rationale:** Reading must work before writing. This phase adds the ability to register new toilets and edit existing ones. The primary workflow (registering passwords on-site) lives here.
**Delivers:** Tap map to add new toilet (form with building name, floor, password, memo), edit existing toilet info, optimistic UI updates.
**Addresses features:** Add new toilet, edit toilet info, building name + floor + location memo
**Avoids pitfalls:** GAS CORS on POST (already validated in Phase 1), input sanitization (XSS prevention)

### Phase 5: Polish and UX

**Rationale:** Core functionality is complete. This phase refines the mobile experience and adds quality-of-life features based on actual usage feedback.
**Delivers:** Quick-copy password button, improved tap targets (44x44px minimum), loading states, bottom sheet UI pattern, custom marker icons, offline state handling.
**Addresses features:** Quick-copy password, mobile-optimized UI refinements
**Avoids pitfalls:** Tiny tap targets, no feedback during loading, password shoulder surfing
### Phase Ordering Rationale

- **Phase 1 before everything:** All features depend on Kakao Maps, GAS, and GitHub Pages working. Validating integrations first prevents building on broken foundations.
- **Phase 2 before Phase 3:** Cannot test find-nearest without markers on the map. The read path must work before adding location-aware features.
- **Phase 3 before Phase 4:** Reading is simpler than writing. Validates the full data flow before adding mutations.
- **Phase 4 before Phase 5:** Core CRUD must exist before polishing. Polish without functionality is meaningless.
- **Phase 5 last:** Everything works without polish. These are refinements driven by real usage.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** GAS deployment workflow details, Kakao Developer Console setup steps -- these are procedural and benefit from step-by-step task breakdown
- **Phase 3:** iOS Safari geolocation edge cases -- test matrix needed for permission states across browsers

Phases with standard patterns (skip research-phase):
- **Phase 2:** Standard Kakao Maps marker rendering -- well-documented with official samples
- **Phase 4:** Standard HTML form + fetch POST -- established patterns from Phase 1 CORS work
- **Phase 5:** Standard mobile UX improvements -- CSS and UI patterns, no API complexity

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies are well-documented. Vite 8, Kakao Maps SDK, GAS, Pico CSS all have official docs and active communities. No experimental choices. |
| Features | HIGH | Feature scope is clear and deliberately minimal. Anti-features are well-justified. MVP is tightly defined. |
| Architecture | HIGH | Simple 3-module frontend + GAS backend. Patterns are established (service layer, custom events, eager load). No novel architecture. |
| Pitfalls | HIGH | All pitfalls have documented solutions with known recovery costs. GAS CORS workaround is well-verified across multiple sources. |

**Overall confidence:** HIGH

### Gaps to Address

- **Kakao Developer Console UX:** The console UI changed in late 2024 (domain registration moved to per-key settings). Current documentation may not reflect the latest UI. Validate during Phase 1 setup.
- **GAS cold start latency in practice:** Documented as 400-1500ms, but actual latency from Korea to Google servers should be measured during Phase 1. May need localStorage caching sooner than expected.
- **iOS Safari geolocation on page refresh:** Known issue but behavior may vary across iOS versions. Need to test on actual devices during Phase 3, not just simulators.
- **Google Sheets row limits at scale:** Not a v1 concern (50 records), but if expanding to multiple regions, Sheets has a 10M cell limit. Design schema with a region column now to support future partitioning.

## Sources

### Primary (HIGH confidence)
- [Kakao Developers - JavaScript SDK](https://developers.kakao.com/docs/latest/en/javascript/download) -- SDK v2.8.0, loading patterns
- [Kakao Maps Web API Guide](https://apis.map.kakao.com/web/guide/) -- Map initialization, markers, events
- [Kakao Maps Web API Documentation](https://apis.map.kakao.com/web/documentation/) -- Custom overlays, marker click events
- [Vite Official - Static Deploy Guide](https://vite.dev/guide/static-deploy) -- GitHub Pages deployment config
- [Vite 8.0 Announcement](https://vite.dev/blog/announcing-vite8) -- Rolldown bundler, Node.js requirements
- [Pico CSS Official](https://picocss.com/) -- Classless CSS framework
- [Google Apps Script - Web Apps Guide](https://developers.google.com/apps-script/guides/web) -- doGet/doPost patterns
- [Google Apps Script - Best Practices](https://developers.google.com/apps-script/guides/support/best-practices) -- Backend patterns
- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) -- getCurrentPosition best practices

### Secondary (MEDIUM confidence)
- [CORS Fix for Google Apps Script](https://diyavijay.medium.com/struggling-with-cors-in-google-apps-script-heres-the-fix-e3eec09f07dd) -- text/plain workaround (verified across multiple sources)
- [GAS Web App Request Flow](https://gist.github.com/tanaikech/a72aab0242012362c46ec69031c720d5) -- Redirect behavior
- [PWA Geolocation Best Practices](https://blog.poespas.me/posts/2025/03/01/handling-geolocation-for-pwa-safari-challenges/) -- Safari geolocation quirks
- [Flush Toilet Finder](https://www.jrustonapps.com/apps/flush-toilet-finder) -- Feature reference
- [Toilet Password app (KR)](https://play.google.com/store/apps/details?id=com.youngki_home.toilet_password) -- Korean toilet password sharing concept

### Tertiary (LOW confidence)
- None -- all research areas had multiple corroborating sources

---
*Research completed: 2026-04-08*
*Ready for roadmap: yes*
