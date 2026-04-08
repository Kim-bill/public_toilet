# Pitfalls Research

**Domain:** Map-based toilet finder mobile web app (Kakao Maps + Google Sheets backend)
**Researched:** 2026-04-08
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Kakao Maps API Key Domain Mismatch on GitHub Pages

**What goes wrong:**
The Kakao Maps JavaScript SDK refuses to load or returns 403/CORS errors because the JavaScript API key is not registered for the correct domain. Developers register `localhost` during development but forget to add the GitHub Pages domain (`username.github.io`), or register with the wrong protocol (HTTP vs HTTPS).

**Why it happens:**
Kakao enforces strict domain matching for JavaScript API keys. The key only works on domains explicitly registered in the Kakao Developer Console under "JavaScript SDK domain." GitHub Pages uses HTTPS by default, and the domain format (`username.github.io/repo-name`) must match exactly. After a December 2024 platform change, domains are now registered under each app key's settings rather than at the app level.

**How to avoid:**
1. Register both `http://localhost:5500` (or whatever local dev port) AND `https://username.github.io` in Kakao Developer Console from day one.
2. If using a project-level GitHub Pages URL (e.g., `https://user.github.io/public_toilet`), register that exact origin.
3. Test deployment to GitHub Pages early in Phase 1, not after building the entire app.
4. After December 2024 changes, ensure the "Kakao Map" feature is explicitly activated in app settings.

**Warning signs:**
- Map container renders as empty gray box
- Console shows 403 errors or CORS errors on `dapi.kakao.com`
- `sdk.js` loads but `kakao.js` fails with CORS
- Works on localhost but breaks on deployed site

**Phase to address:**
Phase 1 (Foundation) - Register domains and verify map loads on both localhost and GitHub Pages before writing any feature code.

---

### Pitfall 2: Google Apps Script CORS Blocking on POST Requests

**What goes wrong:**
Frontend `fetch()` calls to the Google Apps Script Web App URL fail with CORS errors. The browser sends a preflight OPTIONS request, but Google Apps Script only supports GET and POST -- it cannot respond to OPTIONS. This means any `fetch()` with `Content-Type: application/json` triggers a preflight and fails silently.

**Why it happens:**
Google Apps Script Web Apps do not support CORS preflight (OPTIONS method). When the frontend sends a POST with `Content-Type: application/json`, the browser automatically sends a preflight OPTIONS request first, which GAS cannot handle. Developers assume standard REST API patterns work, but GAS is not a standard REST server.

**How to avoid:**
1. For POST requests: use `Content-Type: text/plain;charset=utf-8` instead of `application/json` to avoid triggering a preflight request. Parse JSON manually in the GAS `doPost(e)` function via `JSON.parse(e.postData.contents)`.
2. For GET requests: pass data as URL query parameters. GAS `doGet(e)` handles these without CORS issues.
3. Always deploy the Web App with access set to "Anyone" (not "Anyone with Google account").
4. Return `ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)` from both `doGet` and `doPost`.
5. After every script change, create a NEW deployment version -- editing the script without redeploying serves stale code.

**Warning signs:**
- Browser console shows "Access-Control-Allow-Origin" errors
- GET requests work but POST fails
- Data saves in development (using GAS editor) but not from the deployed frontend
- Requests hang with no response

**Phase to address:**
Phase 1 (Foundation) - Establish the GAS communication pattern early and validate both read (GET) and write (POST) operations before building features on top.

---

### Pitfall 3: Mobile Geolocation Fails Silently or Returns Stale Position

**What goes wrong:**
`navigator.geolocation.getCurrentPosition()` either never fires its callback (no success, no error), returns a cached/stale position from minutes ago, or returns a very inaccurate position (hundreds of meters off). On iOS Safari specifically, refreshing the page re-prompts for permission, and if the user previously denied permission, re-enabling it requires navigating to Settings > Safari > Location, which most users will not do.

**Why it happens:**
- Geolocation API requires HTTPS (GitHub Pages provides this, but local dev on HTTP will fail).
- GPS signal indoors is weak; the API may fall back to WiFi/cell tower positioning with 100m+ accuracy.
- `getCurrentPosition()` with no timeout option can hang indefinitely on some devices.
- iOS Safari resets geolocation permission on every page refresh for web apps (not bookmarked to home screen).
- If the user taps "Don't Allow" once, iOS blocks future prompts silently -- `navigator.permissions.query({name: "geolocation"})` returns "prompt" even when it's actually denied.

**How to avoid:**
1. Always set a timeout: `getCurrentPosition(success, error, { timeout: 10000, enableHighAccuracy: true, maximumAge: 30000 })`.
2. Always implement the error callback -- never assume success.
3. Show a manual "center on my location" button rather than auto-requesting on page load (avoids browser "quiet blocking" of automatic requests).
4. Display accuracy radius to the user so they know if the position is approximate.
5. Fall back to a default center (미사신도시 center coordinates) if geolocation fails.
6. For iOS: detect permission state and show a help message guiding users to Settings if geolocation is blocked.

**Warning signs:**
- Loading spinner that never resolves on mobile
- Users report "map shows wrong location" or "can't find my location"
- Works on desktop Chrome but fails on mobile Safari
- Works first time but fails on page refresh (iOS)

**Phase to address:**
Phase 2 (GPS/Location) - After the map renders correctly, implement geolocation with full error handling and fallback behavior.

---

### Pitfall 4: Google Apps Script Response Latency (400ms-1500ms per call)

**What goes wrong:**
Every data fetch from Google Sheets via Apps Script takes 400-1500ms, making the app feel sluggish. When the user opens the app and needs to see all toilet markers, a single GAS call to read the sheet can take 1-2 seconds. Writing data (registering a new toilet) feels even slower.

**Why it happens:**
Google Apps Script runs on Google's serverless infrastructure with cold start overhead. Each `google.script.run` or `fetch()` to the web app URL involves: DNS resolution to `script.google.com`, TLS handshake, potential cold start of the GAS runtime, reading from Sheets API, serialization, and response. There is no connection pooling or keep-alive.

**How to avoid:**
1. Load all toilet data in a single GET request on app startup and cache it in the client (localStorage or a JS variable). For 2 users and <100 toilets, the full dataset is tiny.
2. Use optimistic UI for writes: show the new marker immediately, send the POST to GAS in the background, and only show an error if it fails.
3. Batch reads: fetch all columns/rows in one call rather than making multiple calls.
4. In GAS, read the entire sheet range once with `getDataRange().getValues()` rather than cell-by-cell access.
5. Consider a loading skeleton or spinner specifically for the initial data fetch.

**Warning signs:**
- App takes 2-3 seconds to show markers after map loads
- "Save" button feels unresponsive -- user taps multiple times
- Multiple sequential GAS calls creating a waterfall of latency

**Phase to address:**
Phase 1 (Foundation) - Design the data fetch pattern as a single bulk-load from the start. Do not build a pattern of per-marker GAS calls that needs refactoring later.

---

### Pitfall 5: GAS Web App URL Changes on Every New Deployment

**What goes wrong:**
The Google Apps Script web app URL changes every time you create a new deployment. The frontend hardcodes a URL, then the developer updates the script and creates a new deployment, but forgets to update the URL in the frontend code. The old URL continues serving the old version of the script.

**Why it happens:**
Google Apps Script has two URL patterns: the `/dev` URL (always runs latest code, only accessible to the script owner) and versioned deployment URLs. Each "New deployment" generates a new URL. Developers test with `/dev` and forget that the production URL is different.

**How to avoid:**
1. Use "Manage deployments" to update the existing deployment instead of creating new ones, OR
2. Store the GAS web app URL as a single constant at the top of your JavaScript file so it only needs to change in one place.
3. After every GAS code change: update deployment, copy new URL, update frontend, redeploy to GitHub Pages.
4. Consider using the `/exec` URL from a managed deployment that you update in-place rather than creating new deployments each time.

**Warning signs:**
- "I changed the script but nothing changed in the app"
- Data writes succeed in GAS editor testing but not from the frontend
- App suddenly stops working after a GAS update

**Phase to address:**
Phase 1 (Foundation) - Establish the deployment workflow and document it. Single source of truth for the GAS URL.

---

### Pitfall 6: Kakao Maps API Key Exposed in Public GitHub Repository

**What goes wrong:**
The Kakao JavaScript API key is visible in the HTML source code of the public GitHub repository. While the key is domain-restricted (only works on registered domains), someone could register the same key on their own Kakao app or abuse the associated REST API key if both are exposed.

**Why it happens:**
For a client-side web app, the JavaScript API key must be in the HTML/JS code -- there is no way to hide it completely. If the repository is public, the key is visible. Developers sometimes also accidentally commit the REST API key or Admin key alongside the JavaScript key.

**How to avoid:**
1. The JavaScript API key is designed to be public and is protected by domain restriction. This is acceptable for this use case.
2. NEVER commit the REST API key or Admin key -- these are server-side keys.
3. Keep the GitHub repository private if possible, or accept that the JS key is visible (it is domain-locked).
4. Set strict quota limits in the Kakao Developer Console to prevent abuse.
5. If the repo must be public, use a build step or environment variable to inject the key, though for a simple HTML/JS app this adds unnecessary complexity.

**Warning signs:**
- `grep` for "appkey" or "apikey" in the repo shows REST/Admin keys
- Kakao Developer Console shows unexpected API usage from unknown domains

**Phase to address:**
Phase 1 (Foundation) - Decide on repo visibility. If public, ensure only the JavaScript key (domain-restricted) is in the code.

---

### Pitfall 7: Google Sheets Data Exposed via Apps Script Web App URL

**What goes wrong:**
The Google Apps Script web app is deployed with access "Anyone" and exposes a `doGet` endpoint that returns all toilet data. Anyone who discovers the GAS URL can read all data. For this project (toilet locations and passwords), this means building passwords are publicly accessible if the URL leaks.

**Why it happens:**
GAS web apps deployed as "Anyone" have no authentication. The URL is the only secret. If it appears in browser history, network logs, or the public GitHub repo, anyone can access the data.

**How to avoid:**
1. Accept the risk for v1: this is a 2-person app with building toilet passwords (low sensitivity data). The GAS URL acts as a "shared secret."
2. Do NOT commit the GAS web app URL to the public GitHub repo. Store it in a separate config file that is `.gitignore`d, or use a build step.
3. If the repo is private, this is less of a concern.
4. For additional security, add a simple shared secret parameter: `doGet(e)` checks `e.parameter.key === 'your-secret'` before returning data.
5. Consider that building toilet passwords are not truly sensitive -- they are shared publicly within buildings anyway.

**Warning signs:**
- GAS URL visible in committed JavaScript files
- Unexpected data in Google Sheets (someone else writing to it)

**Phase to address:**
Phase 1 (Foundation) - Decide on the security model. Even a simple shared secret parameter adds meaningful protection.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding initial toilet coordinates in JS | Fast to build, no GAS dependency for initial data | Must update code and redeploy for every new pre-loaded location | MVP only -- move to sheet-based seed data in Phase 2 |
| No data validation in GAS | Simpler GAS code | Corrupt data in sheets (empty rows, duplicate entries, wrong format) | Never -- add basic validation from day one |
| Inline CSS/JS in single HTML file | Fast prototyping, single file deployment | Unmaintainable past ~500 lines, hard to debug | Phase 1 only -- split into files before adding features |
| Using `alert()` for user feedback | Zero effort UI feedback | Blocks UI thread, ugly, no i18n | Phase 1 only -- replace with toast/modal in Phase 2 |
| No offline handling | Simpler code | App shows blank map or errors without connection | Acceptable for v1 (2 users, always have mobile data) |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Kakao Maps SDK loading | Loading SDK synchronously in `<head>`, blocking page render | Load with `async` attribute or dynamically; use `kakao.maps.load()` callback to ensure SDK is ready |
| Kakao Maps + Geolocation | Calling `map.setCenter()` before map is fully initialized | Use `kakao.maps.event.addListener(map, 'tilesloaded', callback)` for first-load operations |
| GAS doPost | Sending `application/json` Content-Type | Use `text/plain` Content-Type and parse JSON manually in GAS |
| GAS deployment | Testing with `/dev` URL and deploying with same URL | `/dev` is only for the owner; create a proper deployment and use the `/exec` URL for production |
| GAS response | Returning raw text without proper MIME type | Always use `ContentService.createTextOutput().setMimeType(ContentService.MimeType.JSON)` |
| GitHub Pages | Pushing to `main` and expecting immediate deployment | GitHub Pages has a build delay (30s-2min); check Actions tab for deployment status |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Fetching data from GAS on every map interaction | Slow marker updates, visible lag when panning | Fetch once on load, cache in memory, only call GAS for writes | Even at 2 users -- GAS latency is per-call, not per-user |
| Creating new Kakao Map marker objects on every data refresh | Memory leaks, map slows down over time | Maintain a marker array, update existing markers, remove old ones properly with `marker.setMap(null)` | ~50+ markers with repeated refreshes |
| Not using `enableHighAccuracy: false` for initial position | GPS lock takes 5-10 seconds indoors | Use `enableHighAccuracy: false` first for quick WiFi-based position, then refine with `enableHighAccuracy: true` | Always on mobile indoors |
| Loading full Kakao Maps SDK when only basic map is needed | Larger download, slower initial load | Only load the `services` library if using search/geocoding features | Matters on slow 3G connections |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Committing Kakao REST API key or Admin key to public repo | Key abuse, quota exhaustion, potential billing | Only use JavaScript key (domain-restricted) in frontend; keep REST/Admin keys server-side only |
| GAS Web App URL in public repo without access control | Anyone can read/write toilet data | `.gitignore` the config file containing the URL, or add a simple shared secret parameter |
| No input sanitization on toilet registration | XSS if someone injects HTML/JS in building name or memo fields | Sanitize all user input before displaying; use `textContent` instead of `innerHTML` |
| Storing actual sensitive passwords (not just toilet codes) | Data breach via exposed GAS URL | Clearly scope the app: building toilet codes only, never personal passwords |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Auto-requesting geolocation on page load without explanation | Browser shows permission prompt with no context; user denies | Show a "Find my location" button; request permission only on tap with a brief explanation |
| No feedback during GAS data loading (1-2 second delay) | User thinks app is broken, taps repeatedly | Show a loading indicator; disable submit button during save operations |
| Tiny tap targets for map markers on mobile | Hard to tap the right toilet marker with fingers | Use larger custom marker icons (min 44x44px); show a list view alternative |
| Password displayed permanently on screen | Shoulder surfing risk in public buildings | Show password on tap/hold, auto-hide after 5 seconds |
| Map fills entire viewport with no way to access other functions | User cannot register new toilets or see list | Use a bottom sheet pattern (common in Korean map apps like Kakao Map, Naver Map) |
| Korean-only interface assumed | Potential future expansion blocked | Use Korean for v1 but structure text as constants for easy i18n later |

## "Looks Done But Isn't" Checklist

- [ ] **Geolocation:** Often missing error handling -- verify timeout, permission denied, and position unavailable callbacks all work
- [ ] **GAS Write:** Often missing confirmation -- verify data actually appears in the Google Sheet after save, not just that the request returned 200
- [ ] **Map Markers:** Often missing cleanup -- verify markers are removed from map when data is refreshed, not just piled on top
- [ ] **Mobile Viewport:** Often missing `<meta name="viewport">` tag -- verify no horizontal scroll on mobile, map fills correctly
- [ ] **iOS Safari:** Often missing testing -- verify geolocation works after page refresh, not just on first load
- [ ] **GAS Redeployment:** Often missing URL update -- verify frontend points to the latest GAS deployment URL after script changes
- [ ] **Kakao Map resize:** Often missing `map.relayout()` call -- verify map renders correctly when container size changes (bottom sheet open/close)
- [ ] **Offline state:** Often missing handling -- verify app shows a meaningful message when offline instead of a broken map

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Kakao API key domain mismatch | LOW | Add correct domain in Kakao Console, redeploy; takes 5 minutes |
| GAS CORS errors | MEDIUM | Refactor all fetch calls to use `text/plain` Content-Type; 1-2 hours |
| Geolocation silently failing | MEDIUM | Add error callbacks, timeout, fallback to default center; 2-3 hours |
| GAS URL hardcoded in multiple places | LOW | Extract to constant, update; 30 minutes |
| API key committed to public repo | MEDIUM | Regenerate key in Kakao Console, update frontend, force-push to remove from git history; 1-2 hours |
| GAS data exposed | LOW | Add shared secret parameter to GAS, update frontend; 30 minutes |
| Markers piling up without cleanup | MEDIUM | Refactor to marker management array with proper cleanup; 1-2 hours |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Kakao API key domain mismatch | Phase 1 (Foundation) | Map renders on both localhost and GitHub Pages |
| GAS CORS on POST | Phase 1 (Foundation) | Can write data from deployed frontend to Google Sheet |
| GAS response latency | Phase 1 (Foundation) | Bulk data load pattern established; single fetch on startup |
| GAS deployment URL management | Phase 1 (Foundation) | URL stored as single constant; documented update workflow |
| API key exposure | Phase 1 (Foundation) | Only JS key in code; REST/Admin keys not in repo |
| GAS data exposure | Phase 1 (Foundation) | GAS URL not committed to repo; shared secret parameter added |
| Geolocation failure handling | Phase 2 (GPS/Location) | App works with geolocation denied; shows default center |
| iOS Safari permission quirks | Phase 2 (GPS/Location) | Tested on iOS Safari: refresh, deny, re-enable scenarios |
| Mobile UX (tap targets, viewport) | Phase 3 (UI Polish) | All interactive elements meet 44x44px minimum; no horizontal scroll |
| Input sanitization | Phase 3 (UI Polish) | User input displayed via textContent, not innerHTML |
| Marker cleanup on refresh | Phase 2 (Data Features) | Markers properly removed and recreated on data refresh |

## Sources

- [Kakao Developers - Security Guidelines](https://developers.kakao.com/docs/latest/en/getting-started/security-guideline)
- [Kakao Developers - Getting Started (Maps)](https://developers.kakao.com/docs/latest/en/kakaomap/common)
- [Kakao Developers - Quota](https://developers.kakao.com/docs/latest/ko/getting-started/quota)
- [카카오 데브톡 - 도메인 등록 문의](https://devtalk.kakao.com/t/topic/148508)
- [카카오 데브톡 - CORS 문제](https://devtalk.kakao.com/t/cors/130028)
- [Google Apps Script - Best Practices](https://developers.google.com/apps-script/guides/support/best-practices)
- [GAS CORS Fix - Medium](https://diyavijay.medium.com/struggling-with-cors-in-google-apps-script-heres-the-fix-e3eec09f07dd)
- [GAS CORS Fix - Lambda IITH](https://iith.dev/blog/app-script-cors/)
- [Taking Advantage of Web Apps with GAS](https://github.com/tanaikech/taking-advantage-of-Web-Apps-with-google-apps-script)
- [Google Sheets Limitations 2025](https://thodigitals.com/limitations-of-google-sheets/)
- [GPS Accuracy Problems](https://thisisglance.com/blog/gps-accuracy-problems-why-your-app-shows-wrong-locations)
- [Geolocation API Best Practices 2026](https://copyprogramming.com/howto/navigator-geolocation-getcurrentposition-success-error-options)
- [Browser Geolocation Troubleshooting](https://differ.blog/p/troubleshooting-common-issues-with-browser-geolocation-apis-38a2a7)
- [Apple Developer Forums - Geolocation Issues](https://developer.apple.com/forums/thread/751189)
- [GitHub Pages SPA Limitations](https://github.com/orgs/community/discussions/64096)
- [GAS Web Apps Guide](https://tanaikech.github.io/2020/07/01/updated-taking-advantage-of-web-apps-with-google-apps-script/)

---
*Pitfalls research for: Map-based toilet finder (Kakao Maps + Google Sheets + GitHub Pages)*
*Researched: 2026-04-08*
