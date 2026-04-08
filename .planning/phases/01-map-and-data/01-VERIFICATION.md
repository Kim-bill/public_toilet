---
phase: 01-map-and-data
verified: 2026-04-08T10:00:00Z
status: human_needed
score: 4/5 must-haves verified (1 requires human confirmation)
human_verification:
  - test: "Open the app on GitHub Pages and verify all markers and bottom sheet work"
    expected: "App loads at https://USERNAME.github.io/public_toilet/, Kakao Map renders centered on Misa New Town, colored markers appear, tapping a marker shows the bottom sheet with building name/floor/memo/lock status/password"
    why_human: "Cannot programmatically verify a live CDN-loaded Kakao Map, GAS network call, and rendered marker UI in a static verification pass"
---

# Phase 1: Map and Data Verification Report

**Phase Goal:** Users can open the app and see all registered toilets on a map with building names, floors, passwords, and lock status -- all loaded from Google Sheets
**Verified:** 2026-04-08T10:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | App loads and displays a Kakao Map centered on Misa New Town | VERIFIED | `src/js/map.js` exports `initMap` with `LatLng(37.5600, 127.1800), level: 5`. `index.html` loads Kakao SDK dynamically via `window._kakaoReady` promise. `main.js` calls `initMap('map')` after SDK resolves. |
| 2 | Toilet markers appear on the map, with different colors for locked vs unlocked | VERIFIED | `src/js/map.js` exports `createMarkers()` using `#2ecc71` (green, unlocked) and `#e74c3c` (red, locked) SVG marker images via `ensureMarkerImages()` lazy init. `main.js` calls `createMarkers(map, toilets)` after successful GAS fetch. |
| 3 | Tapping a marker shows building name, floor, lock status, and password | VERIFIED | `map.js` dispatches `CustomEvent('toilet-selected', { detail: toilet })` on marker click. `ui.js` listens for `toilet-selected` and calls `showBottomSheet(e.detail)`, populating `#bs-building`, `#bs-floor`, `#bs-memo`, `#bs-lock`, `#bs-password` via `textContent` (no innerHTML). Bottom sheet CSS (`#bottom-sheet.open { transform: translateY(0) }`) slides it into view. |
| 4 | All marker data is read from Google Sheets (not hardcoded) and seed data for major Misa buildings is present | VERIFIED | `src/js/api.js` fetches from a real deployed GAS URL (`script.google.com/macros/s/AKfycbx...`). `gas/Code.gs` reads from `SpreadsheetApp.getActiveSpreadsheet().getSheetByName('toilets')` and maps all 12 columns. Seed data for 8 buildings (스타필드, 홈플러스, 이마트, 미사역, 미사강변공원, 상가 A/B) is documented in `gas/Code.gs` comments. No hardcoded data in frontend JS. |
| 5 | App is deployed and accessible on GitHub Pages | HUMAN NEEDED | `.github/workflows/deploy.yml` exists with correct `deploy-pages@v5` action, `npm run build`, and `path: './dist'`. `vite.config.js` sets `base: '/public_toilet/'`. `vite build` succeeds. Whether the live URL is actually accessible requires human confirmation. |

**Score:** 4/5 truths verified automatically (1 requires human)

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `index.html` | Entry point with Kakao SDK and all UI shell elements | VERIFIED | Contains real Kakao appkey (`e7de810a...`), `#map`, `#bottom-sheet`, `#backdrop`, `#loading-overlay`, `#error-state`, `#bs-building`, `#bs-floor`, `#bs-memo`, `#bs-lock`, `#bs-password`, `lang="ko"`, `type="module"` script tag |
| `src/js/map.js` | Kakao Maps init + colored markers + clear | VERIFIED | Exports `initMap`, `createMarkers`, `clearMarkers`. Contains `createMarkerImage` (private), `ensureMarkerImages` lazy init, `#2ecc71`, `#e74c3c`, `toilet-selected` CustomEvent dispatch, `clickable: true`. Uses `window.kakao.maps` for Vite ES module compatibility. |
| `src/js/api.js` | GAS fetch wrapper | VERIFIED | Exports single `getToilets()`. Contains real GAS URL (not placeholder), `redirect: 'follow'`, `action=getAll`, `response.json()`, dual error checking (`response.ok` + `result.status`). |
| `src/js/ui.js` | Bottom sheet + loading + error UI | VERIFIED | Exports `showBottomSheet`, `hideBottomSheet`, `showLoading`, `hideLoading`, `showError`, `hideError`. Uses `textContent` (no innerHTML). Contains Korean copy: `층 정보 없음`, `메모 없음`, `비밀번호 없음`, `잠금 있음`, `잠금 없음`. Lock badge classes: `lock-badge locked` / `lock-badge unlocked`. Listens for `toilet-selected`. Dispatches `retry-fetch`. Swipe-down on `.drag-handle` closes sheet. |
| `src/css/style.css` | Full-screen map + bottom sheet + overlay CSS | VERIFIED | `@import '@picocss/pico'`. `#map { height: 100vh }`. `#bottom-sheet` with `translateY(100%)` / `.open { translateY(0) }`. `#loading-overlay`, `#error-state`, `.lock-badge.locked`, `.lock-badge.unlocked`, `#bs-password` monospace. 480px breakpoint. Reduced-motion media query. |
| `vite.config.js` | GitHub Pages base path | VERIFIED | `base: '/public_toilet/'`, `outDir: 'dist'` |
| `.github/workflows/deploy.yml` | GitHub Pages deploy workflow | VERIFIED | `deploy-pages@v5`, `npm run build`, `path: './dist'`, push-to-main trigger, `workflow_dispatch` |
| `gas/Code.gs` | GAS backend for Sheets read | VERIFIED | `function doGet(e)`, `function getAllToilets()`, `function jsonResponse(data)`, `getSheetByName('toilets')`, `ContentService.createTextOutput`, `setMimeType(ContentService.MimeType.JSON)`, all 12 columns mapped, 8 seed data entries in comments |
| `package.json` | Vite project with scripts | VERIFIED | `vite@^8.0.7` in devDependencies, `@picocss/pico@^2.1.1` in dependencies, `dev`/`build`/`preview` scripts |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `index.html` | `src/main.js` | `<script type="module">` | WIRED | Line 51: `<script type="module" src="/src/main.js"></script>` |
| `index.html` | Kakao SDK | Dynamic script injection (`window._kakaoReady`) | WIRED | Inline script creates `<script>` tag loading SDK with `autoload=false`, resolves promise via `kakao.maps.load(resolve)` |
| `src/main.js` | `src/js/map.js` | ES module import | WIRED | `import { initMap, createMarkers, clearMarkers } from './js/map.js'` |
| `src/main.js` | `src/js/api.js` | ES module import | WIRED | `import { getToilets } from './js/api.js'` |
| `src/main.js` | `src/js/ui.js` | ES module import | WIRED | `import { showLoading, hideLoading, showError, hideError } from './js/ui.js'` |
| `src/main.js` | `src/js/map.js` | `createMarkers` call | WIRED | `markers = createMarkers(map, toilets)` inside `loadToilets()` after successful fetch |
| `src/js/map.js` | `src/js/ui.js` | `toilet-selected` CustomEvent | WIRED | `map.js` dispatches; `ui.js` listens on document |
| `src/js/ui.js` | DOM `#bottom-sheet` et al. | `getElementById` | WIRED | Sheet, backdrop, loadingOverlay, errorState all wired at module top. BS fields populated via `getElementById('bs-building')` etc. |
| `src/js/api.js` | GAS Web App | `fetch` with `redirect: 'follow'` | WIRED | Real GAS URL set (not placeholder) |
| `gas/Code.gs` | Google Sheets `toilets` tab | `getSheetByName('toilets')` | WIRED | Reads `getDataRange().getValues()`, maps rows to objects, returns `{status:'ok', data:toilets}` |
| Error retry button | `loadToilets()` | `retry-fetch` CustomEvent | WIRED | `ui.js` retry-btn click → dispatches `retry-fetch`; `main.js` listens and calls `loadToilets()` |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `src/js/ui.js showBottomSheet` | `toilet` object | `CustomEvent('toilet-selected').detail` dispatched from `map.js` marker click listener | Yes — data comes from `getToilets()` → GAS → Google Sheets | FLOWING |
| `src/main.js` marker render | `toilets` array | `await getToilets()` in `loadToilets()` | Yes — fetches from live GAS deployment URL, not hardcoded | FLOWING |
| `gas/Code.gs getAllToilets` | row data | `SpreadsheetApp.getActiveSpreadsheet().getSheetByName('toilets').getDataRange().getValues()` | Yes — reads from real Google Sheets, returns array; no static return | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Vite build compiles all modules | `npx vite build` | `built in 313ms`, 3 output files, no errors | PASS |
| `index.html` wires module entry point | grep `type="module"` | Found at line 51: `<script type="module" src="/src/main.js">` | PASS |
| Real Kakao API key configured | grep appkey in index.html | `e7de810a316c3feeb7d1843e6dbddd4e` (not placeholder) | PASS |
| Real GAS URL configured | grep GAS_URL in api.js | `https://script.google.com/macros/s/AKfycbx...` (not placeholder) | PASS |
| No innerHTML usage (XSS prevention) | grep innerHTML in src/ | No matches | PASS |
| No TODO/FIXME/placeholder comments | grep in src/ | No matches | PASS |
| GitHub Pages workflow exists | check deploy.yml | `deploy-pages@v5` present, `npm run build`, `path: './dist'` correct | PASS |
| App accessible on GitHub Pages | Requires browser visit | Cannot test programmatically | SKIP — human needed |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| MAP-01 | 01-01-PLAN.md | 카카오맵이 미사신도시 중심으로 렌더링된다 | SATISFIED | `map.js`: `new window.kakao.maps.LatLng(37.5600, 127.1800)`, level 5. SDK loaded via `window._kakaoReady`. |
| MAP-02 | 01-03-PLAN.md | 등록된 화장실 위치에 마커가 표시된다 | SATISFIED | `createMarkers()` creates `kakao.maps.Marker` at `toilet.latitude/longitude`, sets on map. Called in `main.js` after `getToilets()` resolves. |
| MAP-03 | 01-03-PLAN.md | 마커 탭 시 건물명, 층, 잠금여부, 비밀번호가 표시된다 | SATISFIED | Marker click → `toilet-selected` event → `showBottomSheet(toilet)` → populates `#bs-building`, `#bs-floor`, `#bs-memo`, `#bs-lock`, `#bs-password` with `textContent`. |
| MAP-04 | 01-03-PLAN.md | 잠금 없음/있음에 따라 마커 색상이 구분된다 | SATISFIED | `toilet.hasLock ? MARKER_LOCKED : MARKER_UNLOCKED`. `MARKER_LOCKED` is `#e74c3c` (red), `MARKER_UNLOCKED` is `#2ecc71` (green). |
| DATA-01 | 01-02-PLAN.md | 구글시트에 화장실 데이터가 저장된다 | SATISFIED | `gas/Code.gs` reads from `getSheetByName('toilets')`. Seed data documented in comments for 8 buildings. (Requires user to have entered data per user_setup.) |
| DATA-02 | 01-02-PLAN.md | 구글시트에서 화장실 데이터를 조회할 수 있다 | SATISFIED | `getAllToilets()` reads sheet data, maps 12 columns, returns JSON. `api.js` fetches from deployed GAS endpoint with proper redirect handling. |
| DATA-03 | 01-02-PLAN.md | 미사신도시 주요 건물 좌표가 초기 데이터로 포함된다 | SATISFIED | `gas/Code.gs` contains seed data comments for 8 Misa New Town buildings across 3 categories (commercial: 스타필드/홈플러스/이마트, public: 미사역/미사강변공원, cafe: 상가 A/B동). |

All 7 required requirements (MAP-01 through MAP-04, DATA-01 through DATA-03) are satisfied in the codebase.

No orphaned requirements: REQUIREMENTS.md traceability table lists MAP-02, MAP-03, MAP-04 as "Pending" (not "Complete") — this appears to be a tracking inconsistency in REQUIREMENTS.md. The implementations are complete; the file's checkboxes and traceability status were not updated after Plan 03 executed.

---

## Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| None found | — | — | — |

No `innerHTML`, no `TODO/FIXME`, no placeholder strings, no stub `return []` / `return {}`, no hardcoded empty data in production code paths.

**Note:** `.claude/worktrees/` directories contain older versions of files with placeholder strings (`YOUR_KAKAO_JS_KEY`, `YOUR_GAS_DEPLOYMENT_URL`). These are agent worktree artifacts, not production code — they do not affect the build or runtime.

---

## Notable Deviation from Plan (Documented, Non-Breaking)

The 01-03-PLAN.md specified `DOMContentLoaded` as the startup trigger for `main.js`. The actual implementation uses `window._kakaoReady.then()` — a Promise-based Kakao SDK loading pattern with `autoload=false`. This deviation is:
- Documented in 01-03-SUMMARY.md under "Deviations"
- Functionally superior (prevents race condition between Vite ES module execution and CDN script loading)
- Correctly implemented: `map.js` and `ui.js` use `window.kakao.maps` instead of `kakao.maps`, and marker images are lazy-initialized via `ensureMarkerImages()`

---

## Human Verification Required

### 1. Live App on GitHub Pages

**Test:** Navigate to `https://USERNAME.github.io/public_toilet/` on a mobile browser (or Chrome DevTools mobile view)
**Expected:**
1. Kakao Map loads centered on Misa New Town area (no blank map, no API key error)
2. Loading overlay appears briefly ("화장실 정보를 불러오는 중...") then disappears
3. Colored markers appear — green circles for unlocked toilets, red circles for locked
4. Tapping a marker opens the bottom sheet from the bottom of the screen
5. Bottom sheet shows: building name (h2), lock badge (green "잠금 없음" / red "잠금 있음"), floor, location memo, password in monospace
6. Tapping the backdrop dismisses the bottom sheet
7. Swipe down on the drag handle dismisses the bottom sheet
8. All 8 seed data toilets are represented by markers (스타필드 미사 x2, 홈플러스, 이마트, 미사역, 미사강변공원, 상가 A/B동)
**Why human:** Live CDN map rendering, cross-origin GAS API call, and touch interaction cannot be verified programmatically in a static code check.

---

## Gaps Summary

No blocking gaps. All code is implemented, wired, and building cleanly. The single human-needed item is runtime verification of the live deployment — the code infrastructure for GitHub Pages deploy is fully in place.

One minor tracking issue: `REQUIREMENTS.md` traceability table still shows MAP-02, MAP-03, MAP-04 as "Pending" rather than "Complete". This does not indicate missing code — the implementations are verified above — but the requirements tracking file should be updated to reflect completion.

---

_Verified: 2026-04-08T10:00:00Z_
_Verifier: Claude (gsd-verifier)_
