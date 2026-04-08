# Architecture Research

**Domain:** Mobile-first map web app (toilet finder with Kakao Maps + Google Sheets backend)
**Researched:** 2026-04-08
**Confidence:** HIGH

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Pages (Static Host)                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Frontend (HTML/CSS/JS)                   │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │  Map Module  │  │  Data Module │  │   UI Module     │  │  │
│  │  │ (Kakao Maps) │  │ (API Client) │  │ (Forms/Panels) │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘  │  │
│  │         │                 │                    │           │  │
│  │         └─────────┬───────┘────────────────────┘           │  │
│  │                   │                                        │  │
│  │            ┌──────┴───────┐                                │  │
│  │            │  App State   │                                │  │
│  │            │ (In-Memory)  │                                │  │
│  │            └──────────────┘                                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │ fetch (text/plain)                │ <script> SDK
         ▼                                   ▼
┌──────────────────────┐        ┌──────────────────────────┐
│  Google Apps Script   │        │   Kakao Maps SDK (CDN)   │
│  (Web App endpoint)  │        │   - Map rendering         │
│  ┌────────────────┐  │        │   - Markers / Overlays    │
│  │  doGet()       │  │        │   - Geolocation display   │
│  │  doPost()      │  │        └──────────────────────────┘
│  └───────┬────────┘  │
│          │           │
│  ┌───────┴────────┐  │
│  │ Google Sheets   │  │
│  │ (Data store)    │  │
│  └────────────────┘  │
└──────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| **Map Module** | Renders Kakao Map, manages markers, handles map tap events for location picking | Kakao Maps JavaScript SDK v3, loaded via `<script>` tag |
| **Data Module** | Fetches toilet data from GAS, sends create/update requests, caches data locally | Vanilla `fetch()` with `text/plain` content-type to GAS web app URL |
| **UI Module** | Bottom sheet for toilet details, add/edit forms, GPS button, search/filter | Vanilla HTML/CSS with mobile-first responsive layout |
| **App State** | Holds loaded toilet list, current GPS position, selected toilet, UI state | Simple JS object in memory; no framework state management needed |
| **GAS Web App** | REST-like API layer: doGet for reads, doPost for writes | Google Apps Script deployed as web app ("Anyone" access) |
| **Google Sheets** | Persistent data store for all toilet records | Single spreadsheet with one sheet per data type |
| **Kakao Maps SDK** | Map tiles, marker rendering, custom overlays, geocoding | CDN-loaded SDK, requires registered JavaScript key |

## Recommended Project Structure

```
public_toilet/
├── index.html              # Single page entry point
├── css/
│   └── style.css           # All styles (mobile-first)
├── js/
│   ├── app.js              # App initialization, state management
│   ├── map.js              # Kakao Maps wrapper (init, markers, overlays)
│   ├── api.js              # Google Apps Script API client
│   ├── ui.js               # UI interactions (panels, forms, buttons)
│   ├── geo.js              # Geolocation wrapper (GPS position)
│   └── data.js             # Data models, initial seed data
├── assets/
│   ├── icons/              # Marker icons, UI icons
│   └── favicon.ico
├── gas/
│   └── Code.gs             # Google Apps Script source (for reference)
└── .planning/              # Project planning files
```

### Structure Rationale

- **Flat JS modules:** No build step needed. Each file is a focused module loaded via `<script>` tags with `type="module"` or simple IIFE pattern. Keeps GitHub Pages deployment trivial.
- **gas/ folder:** Keep the Apps Script code in the repo for version control, even though it's deployed separately via Google Apps Script editor.
- **No framework:** 2-user app with ~5 screens of interaction. Vanilla JS avoids build complexity and keeps the app under 50KB total.

## Architectural Patterns

### Pattern 1: Service Layer for GAS Communication

**What:** A single `api.js` module encapsulates all communication with Google Apps Script. All other modules call `api.getToilets()`, `api.addToilet(data)`, etc. Never call `fetch()` directly from UI code.

**When to use:** Always -- this is the only way to manage the GAS CORS workaround consistently.

**Trade-offs:** Slight indirection, but essential for testability and the CORS `text/plain` workaround.

**Example:**
```javascript
// api.js
const GAS_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

export async function getToilets() {
  const response = await fetch(`${GAS_URL}?action=getAll`, {
    method: 'GET',
    redirect: 'follow'
  });
  return response.json();
}

export async function addToilet(toiletData) {
  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'add', data: toiletData }),
    redirect: 'follow'
  });
  return response.json();
}
```

### Pattern 2: Map as Event Hub

**What:** The Kakao Map instance is the central interaction surface. User taps on map or markers trigger all data flows. The map module emits custom events that UI and data modules listen to.

**When to use:** For all user interactions that originate from the map (tap to add, tap marker to view).

**Trade-offs:** Simple event-driven flow without framework overhead.

**Example:**
```javascript
// map.js
kakao.maps.event.addListener(marker, 'click', function() {
  const toilet = marker.toiletData;
  document.dispatchEvent(new CustomEvent('toilet-selected', { detail: toilet }));
});

// In map click for adding new toilet
kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
  const latlng = mouseEvent.latLng;
  document.dispatchEvent(new CustomEvent('location-picked', {
    detail: { lat: latlng.getLat(), lng: latlng.getLng() }
  }));
});
```

### Pattern 3: Eager Load, Optimistic UI

**What:** Load all toilet data on app startup (there will be ~20-50 records max). Cache in memory. Show data immediately from cache, then sync with GAS in background.

**When to use:** Always -- the dataset is tiny (couple dozen toilets in one neighborhood).

**Trade-offs:** Stale data possible for a few seconds after someone else edits, but only 2 users so negligible risk.

## Data Flow

### Read Flow (App Launch)

```
[App Starts]
    |
    v
[api.js] --GET--> [GAS doGet()] --> [Google Sheets] --> [JSON response]
    |                                                        |
    v                                                        |
[App State updated] <-------- [toilet list JSON] <-----------+
    |
    v
[map.js creates markers for each toilet]
    |
    v
[User sees map with toilet markers]
```

### Write Flow (Add/Edit Toilet)

```
[User taps map to pick location]
    |
    v
[UI shows add form (building name, floor, password, notes)]
    |
    v
[User submits form]
    |
    v
[api.js] --POST (text/plain)--> [GAS doPost()] --> [Google Sheets append/update]
    |                                                    |
    v                                                    |
[Optimistic: add marker immediately]    [GAS returns {success: true, id: X}]
    |                                                    |
    v                                                    |
[Confirm or rollback based on response] <----------------+
```

### GPS "Find Nearest" Flow

```
[User taps GPS button]
    |
    v
[geo.js] --> navigator.geolocation.getCurrentPosition()
    |
    v
[Got user position (lat, lng)]
    |
    v
[Calculate distance to each toilet in memory cache]
    |
    v
[Sort by distance, highlight nearest on map]
    |
    v
[Pan map to user location, show nearest toilet info]
```

### Key Data Flows

1. **Startup load:** App init -> fetch all toilets from GAS -> populate map markers. This is the critical path; if GAS is slow (~1-3 seconds typical), show a loading indicator.
2. **Add toilet:** Map tap -> form -> POST to GAS -> update local cache + add marker. Optimistic update makes it feel instant.
3. **Find nearest:** GPS -> distance calculation (client-side, Haversine formula) -> sort -> display. No server round-trip needed since all data is in memory.

## Google Sheets Data Schema

### Sheet: "toilets"

| Column | Field | Type | Example |
|--------|-------|------|---------|
| A | id | string (UUID) | "t_abc123" |
| B | buildingName | string | "스타필드 미사" |
| C | floor | string | "B1" |
| D | lat | number | 37.5603 |
| E | lng | number | 127.1801 |
| F | hasPassword | boolean | TRUE |
| G | password | string | "1234#" |
| H | notes | string | "푸드코트 옆 통로" |
| I | createdAt | ISO datetime | "2026-04-08T14:30:00" |
| J | updatedAt | ISO datetime | "2026-04-08T14:30:00" |

### Google Apps Script Structure

```javascript
// Code.gs
function doGet(e) {
  const action = e.parameter.action;
  if (action === 'getAll') return getAllToilets();
  return error('Unknown action');
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.action === 'add') return addToilet(body.data);
  if (body.action === 'update') return updateToilet(body.data);
  return error('Unknown action');
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Integration Points

### External Services

| Service | Integration Pattern | Critical Notes |
|---------|---------------------|----------------|
| **Kakao Maps SDK** | `<script>` tag with app key, loaded before app.js | Must register domain (including `*.github.io`) in Kakao Developer Console. JavaScript key is public (domain-restricted). |
| **Google Apps Script** | HTTP fetch to deployed web app URL | Use `text/plain;charset=utf-8` content-type to avoid CORS preflight. Deploy as "Anyone" access, "Execute as Me". Every code change requires new deployment version. |
| **Geolocation API** | `navigator.geolocation.getCurrentPosition()` | Requires HTTPS (GitHub Pages provides this). User must grant permission. Wrap in Promise for async/await. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| map.js <-> ui.js | Custom DOM events (`toilet-selected`, `location-picked`) | Loose coupling; map doesn't know about UI, UI doesn't know about map internals |
| api.js <-> app.js | Function calls returning Promises | api.js is the only module that knows the GAS URL and CORS workaround |
| geo.js <-> map.js | geo.js returns `{lat, lng}`, map.js pans to it | geo.js is pure geolocation, no map dependency |

## CORS: The Critical Integration Detail

Google Apps Script web apps do NOT support the OPTIONS HTTP method, which means CORS preflight requests fail. The proven workaround:

1. **GET requests:** Work without CORS issues (simple requests). Use URL parameters: `?action=getAll`
2. **POST requests:** Set `Content-Type: text/plain;charset=utf-8` instead of `application/json`. This makes the browser treat it as a "simple request" that skips preflight.
3. **Redirect handling:** GAS web apps return a 302 redirect. Browser `fetch()` follows this automatically with `redirect: 'follow'` (default behavior).
4. **Deploy settings:** "Execute as: Me", "Who has access: Anyone" -- no Google login required for API consumers.

**Confidence: HIGH** -- this pattern is well-documented across multiple sources and is the standard approach for GAS web apps consumed by static frontends.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 2 users, ~50 toilets (current) | Current architecture is perfect. No caching, no pagination, no optimization needed. |
| 10-20 users, ~200 toilets | Still fine. Consider localStorage cache to speed up initial load. |
| 100+ users | GAS has quota limits (~20,000 calls/day free). Would need a real backend. But this is far out of scope. |

### Scaling Priorities

1. **First bottleneck:** GAS cold start latency (~1-3 seconds on first request). Mitigate with loading indicator and localStorage cache of last-known data.
2. **Second bottleneck:** GAS deployment friction (must create new version for each code change). Mitigate by keeping GAS logic minimal -- just CRUD, no business logic.

## Anti-Patterns

### Anti-Pattern 1: Business Logic in Google Apps Script

**What people do:** Put filtering, sorting, distance calculations in GAS.
**Why it's wrong:** Every GAS code change requires a new deployment (version bump). GAS is slow to execute. Debugging is painful.
**Do this instead:** Keep GAS as a dumb CRUD layer. All logic (distance calc, filtering, sorting) stays in frontend JavaScript.

### Anti-Pattern 2: Using `application/json` Content-Type with GAS

**What people do:** Set `Content-Type: application/json` in fetch requests to GAS.
**Why it's wrong:** Triggers CORS preflight OPTIONS request. GAS doesn't handle OPTIONS. Request fails silently or with cryptic errors.
**Do this instead:** Use `Content-Type: text/plain;charset=utf-8`. Parse JSON manually in GAS via `JSON.parse(e.postData.contents)`.

### Anti-Pattern 3: Using a Framework for This Scale

**What people do:** Reach for React/Vue/Svelte for a 2-user app.
**Why it's wrong:** Adds build step, npm dependencies, bundle size, deployment complexity. Kills the "just push HTML to GitHub Pages" simplicity.
**Do this instead:** Vanilla JS with ES modules. The app has ~5 interactions. A framework is overhead, not help.

### Anti-Pattern 4: Storing Kakao API Key in GAS

**What people do:** Try to proxy Kakao Maps through GAS to hide the API key.
**Why it's wrong:** Kakao Maps JavaScript SDK must load directly in the browser. The JavaScript key is designed to be public (restricted by registered domains).
**Do this instead:** Register your GitHub Pages domain in Kakao Developer Console. The key is safe to expose in HTML.

## Build Order (Dependencies)

The following order reflects technical dependencies between components:

```
Phase 1: Foundation
  ├── Set up GitHub Pages repo + basic index.html
  ├── Register Kakao Developer app + get JavaScript key
  ├── Create Google Sheet + write GAS CRUD endpoints
  └── Verify GAS endpoint works (test with curl/browser)

Phase 2: Map + Data
  ├── map.js: Initialize Kakao Map centered on Misa (미사신도시)
  ├── api.js: Fetch toilet data from GAS
  ├── data.js: Seed initial toilet data (스타필드, 홈플러스, etc.)
  └── Display markers on map from fetched data

Phase 3: Core Interactions
  ├── geo.js: GPS location + "find nearest" logic
  ├── ui.js: Toilet detail panel (bottom sheet)
  ├── Tap marker -> show details (name, floor, password)
  └── Distance-sorted list of nearby toilets

Phase 4: CRUD
  ├── Add toilet: tap map -> pick location -> fill form -> POST to GAS
  ├── Edit toilet: tap marker -> edit button -> update form -> POST to GAS
  └── Optimistic UI updates

Phase 5: Polish
  ├── Mobile UX refinements (touch targets, loading states)
  ├── localStorage cache for offline-ish startup
  ├── Custom marker icons (locked/unlocked toilet)
  └── PWA basics (manifest, icon) for home screen install
```

**Phase ordering rationale:**
- Phase 1 must come first: all other work depends on having Kakao Maps SDK, GAS endpoints, and a deployable repo.
- Phase 2 before Phase 3: can't interact with markers that don't exist yet.
- Phase 3 before Phase 4: reading is simpler than writing; validates the data flow before adding mutations.
- Phase 5 is polish: everything works without it.

## Sources

- [Kakao Maps Web API Documentation](https://apis.map.kakao.com/web/documentation/) -- marker events, custom overlays, map initialization
- [Kakao Maps Sample: Marker Click Events](https://apis.map.kakao.com/web/sample/addMarkerClickEvent/) -- event listener patterns
- [Google Apps Script Web Apps](https://developers.google.com/apps-script/guides/web) -- doGet/doPost patterns
- [CORS Fix for Google Apps Script](https://diyavijay.medium.com/struggling-with-cors-in-google-apps-script-heres-the-fix-e3eec09f07dd) -- text/plain workaround (HIGH confidence, verified across multiple sources)
- [CORS in GAS - IITH](https://iith.dev/blog/app-script-cors/) -- additional CORS guidance
- [GAS Web App Request Flow](https://gist.github.com/tanaikech/a72aab0242012362c46ec69031c720d5) -- redirect behavior documentation
- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) -- getCurrentPosition best practices

---
*Architecture research for: Public Toilet Finder (mobile map web app)*
*Researched: 2026-04-08*
