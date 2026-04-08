# Phase 1: Map and Data - Research

**Researched:** 2026-04-08
**Domain:** Kakao Maps integration + Google Sheets backend (GAS) + GitHub Pages deployment
**Confidence:** HIGH

## Summary

Phase 1 is a greenfield build that must validate three integrations simultaneously: Kakao Maps SDK rendering on GitHub Pages, Google Apps Script (GAS) as a REST-like backend for reading toilet data from Google Sheets, and GitHub Pages deployment via GitHub Actions with Vite. The core deliverable is a full-screen map showing colored markers (green = unlocked, red = locked) for toilets in Misa New Town (미사신도시), with a bottom sheet displaying toilet details when a marker is tapped.

The technical risk is concentrated in three areas: (1) Kakao Developer Console domain registration must include the GitHub Pages domain before the map will render, (2) GAS GET requests work without CORS issues but the fetch must handle GAS's 302 redirect transparently, and (3) custom colored markers require either SVG data URIs or pre-made PNG assets passed to `kakao.maps.MarkerImage`. All three are well-documented and verified patterns.

**Primary recommendation:** Build foundation first (Vite project + Kakao Map rendering + GAS read endpoint), verify all three integrations work on deployed GitHub Pages, then layer in markers, data fetching, and bottom sheet UI.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 잠금 없음 = 초록색 마커, 잠금 있음 = 빨간색 마커
- **D-02:** 마커 탭 시 Bottom Sheet로 상세정보 표시 (InfoWindow 아님)
- **D-03:** Bottom Sheet에 건물명, 층, 위치메모, 잠금여부, 비밀번호 표시
- **D-04:** 시드 건물 범위: 대형 상업시설(스타필드 미사, 홈플러스, 이마트 등), 카페/음식점 밀집지역(미사역 상가), 공공시설(미사역, 미사강변공원 등)
- **D-05:** 시드 데이터의 비밀번호는 빈 상태 -- 좌표와 건물명만 등록, 비번은 방문 후 입력
- **D-06:** 구글시트 컬럼 구조: id, buildingName, floor, locationMemo, hasLock, password, latitude, longitude, region, category, createdAt, updatedAt
- **D-07:** GitHub 레포는 Private -- GAS URL과 API 키 보안
- **D-08:** 카카오 API 키와 GAS URL은 코드에 직접 입력 (Private repo이므로 문제없음)
- **D-09:** GitHub Pages 배포 (Private repo에서도 GitHub Pages 사용 가능)

### Claude's Discretion
- Vite 설정, 프로젝트 구조, CSS 프레임워크 선택 등 기술적 세부사항은 Claude 재량

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MAP-01 | 카카오맵이 미사신도시 중심으로 렌더링된다 | Kakao Maps SDK v2 CDN loading pattern verified; center coordinates ~37.5600, 127.1800; zoom level 15 recommended |
| MAP-02 | 등록된 화장실 위치에 마커가 표시된다 | `kakao.maps.Marker` with custom `MarkerImage` (SVG data URI or PNG); bulk creation from fetched data array |
| MAP-03 | 마커 탭 시 건물명, 층, 잠금여부, 비밀번호가 표시된다 | `kakao.maps.event.addListener(marker, 'click', ...)` with `clickable: true`; custom DOM bottom sheet (not InfoWindow per D-02) |
| MAP-04 | 잠금 없음/있음에 따라 마커 색상이 구분된다 | Two MarkerImage instances (green/red SVG circles) assigned based on `hasLock` field |
| DATA-01 | 구글시트에 화장실 데이터가 저장된다 | Google Sheets with column structure per D-06; GAS `doGet()` reads via `getDataRange().getValues()` |
| DATA-02 | 구글시트에서 화장실 데이터를 조회할 수 있다 | GAS web app GET endpoint returns JSON; `fetch()` with `redirect: 'follow'`; no CORS issues for GET |
| DATA-03 | 미사신도시 주요 건물 좌표가 초기 데이터로 포함된다 | Seed data with real coordinates for major Misa buildings; entered directly into Google Sheets |

</phase_requirements>

## Project Constraints (from CLAUDE.md)

- GSD Workflow Enforcement: Must use `/gsd:quick`, `/gsd:debug`, or `/gsd:execute-phase` entry points -- no direct repo edits outside GSD workflow
- Technology stack: Vite 8.x, Kakao Maps JS SDK v2, Google Apps Script, Google Sheets, Pico CSS 2.x
- Architecture: Vanilla JS with ES modules, no framework
- Deployment: GitHub Pages via GitHub Actions

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 8.0.7 | Build tool & dev server | Fastest vanilla JS DX; native GitHub Pages deployment; Rolldown bundler |
| Kakao Maps JS SDK | v2 (CDN: `dapi.kakao.com/v2/maps/sdk.js`) | Map rendering, markers, events | Only viable option for Korean address/building accuracy |
| Google Apps Script | N/A (Google-managed) | Serverless backend (doGet) | Zero-cost, zero-maintenance; reads from Google Sheets |
| Google Sheets | N/A | Data store | Free, editable via spreadsheet UI |
| Pico CSS | 2.1.1 | Classless CSS framework | 7.7 KB gzipped; mobile-first; semantic HTML styling |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Kakao Maps `services` | bundled with SDK | Geocoding, address search | Load via `libraries=services` if reverse geocoding is needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SVG data URI markers | Pre-made PNG marker images | PNG requires hosting image files; SVG is self-contained and resolution-independent |
| Custom DOM bottom sheet | Kakao Maps InfoWindow | InfoWindow is locked decision D-02 NOT to use; bottom sheet provides better mobile UX |
| Pico CSS | Raw CSS | Pico provides mobile typography and dialog styling for free |

**Installation:**
```bash
npm create vite@latest public-toilet -- --template vanilla
cd public-toilet
npm install @picocss/pico
```

## Architecture Patterns

### Recommended Project Structure
```
public_toilet/
  index.html              # Single page entry; loads Kakao SDK via <script>
  vite.config.js           # base: '/public_toilet/' for GitHub Pages
  src/
    main.js                # App entry: init map, fetch data, render markers
    css/
      style.css            # Imports Pico CSS; custom bottom sheet styles
    js/
      map.js               # Kakao Maps init, marker creation/management
      api.js               # GAS fetch wrapper (single URL constant)
      ui.js                # Bottom sheet show/hide/populate
    data/
      seed.js              # Seed data structure reference (actual data in Google Sheets)
  gas/
    Code.gs                # GAS source (deployed separately via script.google.com)
  .github/
    workflows/
      deploy.yml           # GitHub Pages deployment workflow
```

### Pattern 1: Service Layer for GAS Communication
**What:** Single `api.js` module wraps all GAS fetch calls. Exports `getToilets()`. All other modules call this, never `fetch()` directly.
**When to use:** Always -- encapsulates the GAS URL and response handling.
**Example:**
```javascript
// api.js
// Source: .planning/research/ARCHITECTURE.md (verified pattern)
const GAS_URL = 'https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec';

export async function getToilets() {
  const response = await fetch(`${GAS_URL}?action=getAll`, {
    method: 'GET',
    redirect: 'follow'
  });
  if (!response.ok) throw new Error(`GAS fetch failed: ${response.status}`);
  return response.json();
}
```

### Pattern 2: Colored SVG Markers via Data URI
**What:** Generate colored circle markers using inline SVG passed as data URI to `kakao.maps.MarkerImage`. No external image files needed.
**When to use:** For the green/red marker distinction (MAP-04, D-01).
**Example:**
```javascript
// map.js
// Source: Kakao Maps MarkerImage docs + SVG data URI pattern
function createMarkerImage(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="3"/>
  </svg>`;
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const size = new kakao.maps.Size(32, 32);
  const option = { offset: new kakao.maps.Point(16, 16) };
  return new kakao.maps.MarkerImage(src, size, option);
}

const MARKER_UNLOCKED = createMarkerImage('#2ecc71'); // green
const MARKER_LOCKED = createMarkerImage('#e74c3c');   // red
```

### Pattern 3: Map Event Hub with Custom DOM Events
**What:** Marker click fires a custom DOM event (`toilet-selected`) that the UI module listens to. Keeps map.js and ui.js decoupled.
**When to use:** For marker tap -> bottom sheet flow (MAP-03, D-02).
**Example:**
```javascript
// map.js
// Source: https://apis.map.kakao.com/web/sample/addMarkerClickEvent/
function addToiletMarker(map, toilet, markerImage) {
  const marker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(toilet.latitude, toilet.longitude),
    image: markerImage,
    clickable: true
  });
  marker.setMap(map);

  kakao.maps.event.addListener(marker, 'click', function() {
    document.dispatchEvent(new CustomEvent('toilet-selected', { detail: toilet }));
  });
  return marker;
}

// ui.js
document.addEventListener('toilet-selected', (e) => {
  showBottomSheet(e.detail);
});
```

### Pattern 4: Bottom Sheet as Pure DOM
**What:** Bottom sheet is a fixed-position `<div>` at viewport bottom, toggled via CSS class. No library needed.
**When to use:** For toilet detail display (D-02, D-03).
**Example:**
```javascript
// ui.js (simplified)
const sheet = document.getElementById('bottom-sheet');
const backdrop = document.getElementById('backdrop');

export function showBottomSheet(toilet) {
  document.getElementById('bs-building').textContent = toilet.buildingName;
  document.getElementById('bs-floor').textContent = toilet.floor || '층 정보 없음';
  document.getElementById('bs-memo').textContent = toilet.locationMemo || '메모 없음';
  document.getElementById('bs-lock').textContent = toilet.hasLock ? '잠금 있음' : '잠금 없음';
  document.getElementById('bs-password').textContent = toilet.password || '비밀번호 없음';
  
  sheet.classList.add('open');
  backdrop.classList.add('visible');
}

export function hideBottomSheet() {
  sheet.classList.remove('open');
  backdrop.classList.remove('visible');
}
```

### Anti-Patterns to Avoid
- **Using InfoWindow for detail display:** Locked decision D-02 explicitly requires bottom sheet, not InfoWindow. InfoWindow is small and hard to tap on mobile.
- **Business logic in GAS:** Keep GAS as dumb CRUD. All filtering, sorting, distance calculations stay in frontend JS.
- **Multiple GAS calls on startup:** Fetch ALL toilet data in one GET request. Never fetch per-marker.
- **Using `innerHTML` for user data:** Always use `textContent` to prevent XSS from toilet names/memos.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Map rendering | Custom map tiles/rendering | Kakao Maps JS SDK v2 | Korean address/building accuracy impossible to replicate |
| Mobile-first CSS reset | Custom media queries + reset | Pico CSS 2.x | Typography, spacing, form styling out of the box |
| Build + HMR + GitHub Pages deploy | Custom webpack/rollup config | Vite 8.x + official deploy workflow | Zero-config vanilla JS support |
| Serverless CRUD backend | Custom server / Firebase | Google Apps Script + Sheets | Zero cost, zero ops for 2 users |
| Colored map markers | Canvas rendering pipeline | SVG data URI + kakao.maps.MarkerImage | 5 lines of SVG, resolution-independent |

**Key insight:** This is a 2-user utility app. Every "build it myself" decision adds maintenance burden with zero user benefit. Use the platform defaults.

## Common Pitfalls

### Pitfall 1: Kakao API Key Domain Mismatch
**What goes wrong:** Map renders as empty gray box on GitHub Pages because the JavaScript key is not registered for `username.github.io`.
**Why it happens:** Kakao enforces strict domain matching. Developers register `localhost` for dev but forget the production domain.
**How to avoid:** Register BOTH `localhost` AND `username.github.io` in Kakao Developer Console from day one. Test deployment early.
**Warning signs:** Empty gray map container, 403 errors on `dapi.kakao.com` in console.

### Pitfall 2: GAS Response Latency (1-3 seconds)
**What goes wrong:** App shows empty map for 1-3 seconds while waiting for GAS to return toilet data.
**Why it happens:** GAS cold start + Google Sheets read latency. No connection pooling.
**How to avoid:** Show a loading overlay (per UI-SPEC) while fetching. Fetch all data in one bulk GET. Never make per-marker GAS calls.
**Warning signs:** Users tap repeatedly thinking app is broken; multiple redundant fetch calls in network tab.

### Pitfall 3: GAS Web App URL Management
**What goes wrong:** Frontend uses stale GAS URL after backend code update. Old URL serves old code.
**Why it happens:** Each "New Deployment" creates a new URL. Developers test with `/dev` URL (owner-only) and forget to update the `/exec` URL.
**How to avoid:** Store GAS URL as single constant in `api.js`. Use "Manage Deployments" to update existing deployment in-place. Document the update workflow.
**Warning signs:** "I changed the GAS script but nothing changed in the app."

### Pitfall 4: Kakao Maps SDK Loading Race Condition
**What goes wrong:** JavaScript calls `kakao.maps.Map()` before the SDK script has finished loading. Results in `kakao is not defined` error.
**Why it happens:** SDK loaded via `<script>` tag may not be ready when app.js executes.
**How to avoid:** Use `kakao.maps.load()` callback to ensure SDK is ready, OR load SDK script before app scripts with no `async`/`defer` attribute.
**Warning signs:** Intermittent `kakao is not defined` errors, especially on slow connections.

### Pitfall 5: GitHub Pages Base Path Mismatch
**What goes wrong:** Assets (CSS, JS) return 404 on GitHub Pages because paths don't include the repo name prefix.
**Why it happens:** GitHub Pages serves from `username.github.io/repo-name/` but Vite defaults to `/` as base.
**How to avoid:** Set `base: '/public_toilet/'` in `vite.config.js`. Must match the exact GitHub repo name.
**Warning signs:** Blank page on GitHub Pages; 404s for JS/CSS in browser network tab; works on localhost.

## Code Examples

### Kakao Maps Initialization
```javascript
// Source: https://apis.map.kakao.com/web/guide/
// index.html -- load SDK BEFORE app scripts
// <script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_JS_KEY"></script>

// map.js
export function initMap(containerId) {
  const container = document.getElementById(containerId);
  const options = {
    center: new kakao.maps.LatLng(37.5600, 127.1800), // 미사신도시 center
    level: 5 // zoom level (1=closest, higher=farther)
  };
  return new kakao.maps.Map(container, options);
}
```

### GAS Backend (Code.gs)
```javascript
// Source: .planning/research/ARCHITECTURE.md
function doGet(e) {
  var action = e.parameter.action;
  if (action === 'getAll') {
    return getAllToilets();
  }
  return jsonResponse({ error: 'Unknown action' });
}

function getAllToilets() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('toilets');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var toilets = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue; // skip empty rows
    toilets.push({
      id: row[0],
      buildingName: row[1],
      floor: row[2],
      locationMemo: row[3],
      hasLock: row[4] === true || row[4] === 'TRUE',
      password: row[5],
      latitude: parseFloat(row[6]),
      longitude: parseFloat(row[7]),
      region: row[8],
      category: row[9],
      createdAt: row[10],
      updatedAt: row[11]
    });
  }
  
  return jsonResponse({ status: 'ok', data: toilets });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### GitHub Actions Deploy Workflow
```yaml
# Source: https://vite.dev/guide/static-deploy (verified 2026-04-08)
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v4
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v5
```

### Vite Configuration
```javascript
// vite.config.js
// Source: https://vite.dev/guide/static-deploy
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/public_toilet/',  // Must match GitHub repo name exactly
  build: {
    outDir: 'dist',
  },
});
```

### Bottom Sheet CSS
```css
/* style.css -- bottom sheet pattern per UI-SPEC */
#backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease-in;
}
#backdrop.visible {
  opacity: 1;
  pointer-events: auto;
}

#bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 50vh;
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 0 16px 32px;
  transform: translateY(100%);
  transition: transform 200ms ease-out;
}
#bottom-sheet.open {
  transform: translateY(0);
}

.drag-handle {
  width: 40px;
  height: 4px;
  background: #ccc;
  border-radius: 2px;
  margin: 12px auto;
}

@media (prefers-reduced-motion: reduce) {
  #bottom-sheet, #backdrop {
    transition: none;
  }
}

@media (min-width: 480px) {
  #bottom-sheet {
    max-width: 480px;
    margin: 0 auto;
    left: 50%;
    transform: translateX(-50%) translateY(100%);
  }
  #bottom-sheet.open {
    transform: translateX(-50%) translateY(0);
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vite 7 (esbuild/Rollup) | Vite 8 (Rolldown) | 2026-03-12 | 10-30x faster builds; same config API |
| Pico CSS 1.x | Pico CSS 2.x | 2024 | Better dialog/modal support, dark mode |
| Kakao Maps SDK loading via callback | Still the standard pattern | N/A | `kakao.maps.load()` or synchronous `<script>` |

**Deprecated/outdated:**
- Vite 7.x: Still works but Vite 8 is current and uses Rolldown for faster builds
- GAS "Deploy as API executable": Use "Deploy as Web App" instead for browser fetch access

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite build | Yes | 22.14.0 | -- |
| npm | Package install | Yes | 10.9.2 | -- |
| Kakao Maps SDK | Map rendering | Yes (CDN) | v2 | -- |
| Google Apps Script | Backend | Yes (Google) | N/A | -- |
| GitHub Pages | Deployment | Yes (GitHub) | N/A | -- |

**Missing dependencies with no fallback:** None

**Missing dependencies with fallback:** None

## Open Questions

1. **Exact Misa New Town center coordinates**
   - What we know: Approximate center is 37.5600, 127.1800 (near 미사역)
   - What's unclear: Optimal zoom level to show all major commercial areas
   - Recommendation: Use zoom level 5 (shows ~2km radius); adjust after seeing seed data spread

2. **Seed data building coordinates**
   - What we know: Need real lat/lng for 스타필드 미사, 홈플러스, 이마트, 미사역, etc.
   - What's unclear: Exact coordinates not yet gathered
   - Recommendation: Use Kakao Maps search or Google Maps to look up exact coordinates during implementation; enter directly into Google Sheets

3. **SVG data URI browser compatibility with Kakao MarkerImage**
   - What we know: `kakao.maps.MarkerImage` accepts any image URL including data URIs
   - What's unclear: Whether all target browsers (iOS Safari, Android Chrome) render SVG data URIs correctly in Kakao markers
   - Recommendation: Test early; fallback to small PNG files if SVG data URIs fail

## Sources

### Primary (HIGH confidence)
- [Kakao Maps Web API Documentation](https://apis.map.kakao.com/web/documentation/) -- MarkerImage, Marker, event listeners
- [Kakao Maps Sample: Custom Marker Image](https://apis.map.kakao.com/web/sample/basicMarkerImage/) -- MarkerImage constructor usage
- [Kakao Maps Sample: Marker Click Event](https://apis.map.kakao.com/web/sample/addMarkerClickEvent/) -- click event with `clickable: true`
- [Vite Official: Static Deploy Guide](https://vite.dev/guide/static-deploy) -- GitHub Pages workflow (verified 2026-04-08)
- [Google Apps Script Web Apps Guide](https://developers.google.com/apps-script/guides/web) -- doGet/doPost patterns
- `.planning/research/STACK.md` -- verified stack recommendations
- `.planning/research/ARCHITECTURE.md` -- system architecture and data flow
- `.planning/research/PITFALLS.md` -- integration pitfalls and recovery strategies
- `.planning/phases/01-map-and-data/01-UI-SPEC.md` -- UI design contract for bottom sheet, markers, loading state

### Secondary (MEDIUM confidence)
- [CORS Fix for Google Apps Script](https://diyavijay.medium.com/struggling-with-cors-in-google-apps-script-heres-the-fix-e3eec09f07dd) -- text/plain workaround (verified across multiple sources)
- npm registry: Vite 8.0.7, @picocss/pico 2.1.1 (verified via `npm view` 2026-04-08)

### Tertiary (LOW confidence)
- SVG data URI as Kakao MarkerImage source -- pattern works for Google Maps; needs verification for Kakao Maps specifically

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against npm registry and official docs
- Architecture: HIGH -- patterns from project research docs, verified against Kakao Maps samples
- Pitfalls: HIGH -- comprehensive pitfalls doc exists; cross-verified with official docs and community sources
- Colored markers (SVG data URI): MEDIUM -- pattern is standard but not verified specifically with Kakao Maps

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (stable stack, no fast-moving dependencies)
