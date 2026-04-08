# Stack Research

**Domain:** Mobile-first map-based web app (toilet finder with Kakao Maps + Google Sheets backend)
**Researched:** 2026-04-08
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | 8.x (current: 8.0.5) | Build tool & dev server | Fastest DX for vanilla JS projects. Native GitHub Pages deployment via Actions. HMR for rapid iteration. Rolldown-based builds are 10-30x faster than Vite 7. |
| Kakao Maps JS SDK | v2 (via `dapi.kakao.com/v2/maps/sdk.js`) | Map rendering, markers, geolocation overlay | Only viable option for Korean address/building accuracy. Free tier is more than sufficient for 2-user app. Not versioned like npm packages -- loaded via CDN script tag. |
| Google Apps Script | N/A (Google-managed runtime) | Serverless backend (doGet/doPost) | Zero-cost, zero-maintenance backend. Handles CRUD to Google Sheets. Perfect for 2-user app with minimal traffic. |
| Google Sheets | N/A | Database | Free, editable via spreadsheet UI for manual data entry. Wife can also edit directly in Sheets if needed. |
| Pico CSS | 2.x | Classless CSS framework | 7.7 KB gzipped. Mobile-first responsive typography out of the box. Dark mode via prefers-color-scheme. No classes needed -- just write semantic HTML. Perfect for a small utility app. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Kakao Maps `services` library | (bundled with SDK) | Address search, geocoding, coordinate conversion | Load via `libraries=services` param. Needed for building name lookups and reverse geocoding tap locations. |
| Kakao Maps `clusterer` library | (bundled with SDK) | Marker clustering | Load via `libraries=clusterer` param. Only needed if marker count exceeds ~50. Can defer to v2. |
| `kakao.maps.d.ts` | latest | TypeScript type definitions for Kakao Maps | Only if migrating to TypeScript later. Skip for vanilla JS v1. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite dev server | Local development with HMR | `npm create vite@latest` with vanilla template. Set `base: '/<REPO>/'` in vite.config.js for GitHub Pages. |
| GitHub Actions | CI/CD to GitHub Pages | Use `actions/deploy-pages` workflow. Source: Settings > Pages > GitHub Actions. |
| Google Apps Script Editor | Backend development | Edit at script.google.com. Deploy as web app with "Anyone" access (no auth needed for 2-user app). |
| VS Code | Code editor | Live Server extension useful for quick testing without Vite build. |

## Installation

```bash
# Initialize project
npm create vite@latest public-toilet -- --template vanilla

# Install Pico CSS
npm install @picocss/pico

# No other npm dependencies needed -- Kakao Maps loads via CDN script tag
# Google Apps Script runs in Google's environment, not locally
```

## Project Structure

```
public_toilet/
  index.html            # Single page app entry
  vite.config.js        # base path for GitHub Pages
  src/
    main.js             # App entry point
    css/
      style.css         # Custom styles (imports Pico)
    js/
      map.js            # Kakao Maps initialization & markers
      api.js            # Google Apps Script fetch wrapper
      geo.js            # Geolocation (navigator.geolocation)
      ui.js             # Modal/panel interactions
    data/
      initial.json      # Seed data for Misa buildings
  .github/
    workflows/
      deploy.yml        # GitHub Pages deployment
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vanilla JS + Vite | React/Vue/Svelte | Only if app grows beyond 5-10 screens with complex state. This app has 1 screen (map + modals). Framework overhead unjustified. |
| Pico CSS | Tailwind CSS | If you need highly customized component designs. Pico is sufficient for form inputs, buttons, modals in a utility app. |
| Pico CSS | Water.css | Water.css is even smaller (2.2 KB) but has fewer form/modal primitives. Pico's dialog/modal support is worth the 5 KB difference. |
| Google Apps Script | Supabase / Firebase | If you need real-time sync, auth, or >100 concurrent users. Massively overkill for 2-user toilet finder. |
| Google Sheets | SQLite (via sql.js) | If you need offline-first with complex queries. Sheets is simpler and editable by non-developers. |
| GitHub Pages | Vercel / Netlify | If you need server-side rendering or edge functions. GitHub Pages is perfect for static sites with external API backends. |
| Kakao Maps | Google Maps | Never for Korean addresses. Kakao has superior building-level data for Korea (official address DB). Google Maps has poor Korean POI coverage. |
| Kakao Maps | Naver Maps | Naver Maps is comparable for Korea but API is more restrictive and docs are worse. Kakao is the community standard. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| React / Vue / Angular | Single-screen map app does not need component framework overhead. Adds build complexity, bundle size, and learning curve for no benefit. | Vanilla JS with ES modules |
| jQuery | Dead ecosystem. Modern vanilla JS (querySelector, fetch, classList) does everything jQuery did. Adds 30 KB for zero value. | Native DOM APIs |
| Leaflet / Mapbox | Cannot render Korean addresses/buildings accurately. No Korean POI data. Kakao Maps is the only serious option for Korean map apps. | Kakao Maps JS SDK |
| Firebase Realtime DB | Overkill. Requires Firebase project setup, auth config, security rules. You have 2 users and ~100 records. | Google Sheets via Apps Script |
| CSS-in-JS | No framework to justify it. Adds runtime overhead. | Plain CSS + Pico |
| TypeScript | Adds build complexity for a ~500-line app used by 2 people. Can migrate later if app grows. | Vanilla JavaScript |
| localStorage as primary DB | Data trapped on single device. Both users need shared access. | Google Sheets (shared, editable, cloud-synced) |

## Critical Implementation Details

### Kakao Maps Setup

```html
<!-- Load in index.html BEFORE your app scripts -->
<script type="text/javascript"
  src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&libraries=services">
</script>
```

- Register domain at [Kakao Developers](https://developers.kakao.com/) > App > Platform > Web
- For GitHub Pages: register `USERNAME.github.io` as allowed domain
- For local dev: register `localhost` as allowed domain
- Use JavaScript key (not REST API key)

### Google Apps Script CORS Fix

Google Apps Script web apps block standard `application/json` POST requests due to CORS preflight. The fix:

```javascript
// Frontend: Use text/plain to avoid CORS preflight
fetch('https://script.google.com/macros/s/DEPLOY_ID/exec', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify(data),
});

// Backend (Apps Script): Parse the text/plain body as JSON
function doPost(e) {
  const input = JSON.parse(e.postData.contents);
  // ... write to sheet ...
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

- Deploy as: Web App > Execute as: Me > Access: Anyone
- Every code change requires new deployment (versioned)
- GET requests (doGet) work without CORS issues

### Geolocation API

```javascript
// HTTPS required (GitHub Pages provides this)
navigator.geolocation.getCurrentPosition(
  (pos) => {
    const { latitude, longitude } = pos.coords;
    // Center map on user location
  },
  (err) => {
    // Fall back to Misa New City center coordinates
    // 37.5607, 127.1802 (approximate center)
  },
  { enableHighAccuracy: true, timeout: 5000 }
);
```

- Works on all modern mobile browsers
- Safari requires explicit user gesture to trigger
- HTTPS mandatory (GitHub Pages handles this)

### Vite Config for GitHub Pages

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/public_toilet/',  // Must match GitHub repo name
  build: {
    outDir: 'dist',
  },
});
```

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Vite 8.x | Node.js 20.19+ or 22.12+ | Rolldown bundler requires these Node versions minimum |
| Pico CSS 2.x | Any modern browser | No JS dependencies. Pure CSS. |
| Kakao Maps SDK v2 | All modern browsers | Loaded via CDN. No npm package needed for vanilla JS. |
| GitHub Actions deploy-pages | Vite 8.x | Official workflow works out of the box |

## Sources

- [Kakao Developers - JavaScript SDK Download](https://developers.kakao.com/docs/latest/en/javascript/download) -- Confirmed SDK v2.8.0 (2026.3.3), HIGH confidence
- [Kakao Maps Web API Guide](https://apis.map.kakao.com/web/guide/) -- Map SDK loading pattern, HIGH confidence
- [Vite Official - Static Deploy Guide](https://vite.dev/guide/static-deploy) -- GitHub Pages deployment config, HIGH confidence
- [Vite 8.0 Announcement](https://vite.dev/blog/announcing-vite8) -- Vite 8.0 with Rolldown, released 2026-03-12, HIGH confidence
- [Pico CSS Official](https://picocss.com/) -- Classless CSS framework details, HIGH confidence
- [Google Apps Script Best Practices](https://developers.google.com/apps-script/guides/support/best-practices) -- Backend patterns, HIGH confidence
- [CORS Fix for Google Apps Script](https://diyavijay.medium.com/struggling-with-cors-in-google-apps-script-heres-the-fix-e3eec09f07dd) -- text/plain workaround, MEDIUM confidence (blog post, but verified pattern)
- [PWA Geolocation Best Practices](https://blog.poespas.me/posts/2025/03/01/handling-geolocation-for-pwa-safari-challenges/) -- Safari geolocation quirks, MEDIUM confidence

---
*Stack research for: Mobile-first toilet finder (Kakao Maps + Google Sheets)*
*Researched: 2026-04-08*
