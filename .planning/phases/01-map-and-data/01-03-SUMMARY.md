# Plan 01-03: Wire Markers + Bottom Sheet — Summary

## Status: COMPLETE

## What was built

Wired colored markers (green=unlocked, red=locked), bottom sheet detail panel, and data fetching into a working read-only toilet finder app.

## Tasks completed

| Task | Name | Commit |
|------|------|--------|
| 1 | Implement colored markers and bottom sheet UI module | 532a4fa |
| 2 | Wire main.js orchestration | 24a13fc |
| 3 | Verify map with markers and bottom sheet | 26bad8e (fixes applied) |

## Key files

### Created
- `src/js/ui.js` — Bottom sheet, loading, error state UI module
- `src/js/map.js` — Updated with colored SVG markers and lazy initialization

### Modified
- `src/main.js` — Orchestration with Kakao SDK Promise-based loading
- `index.html` — Dynamic Kakao SDK script loading with autoload=false
- `src/js/api.js` — GAS deployment URL set

## Deviations

- **Kakao SDK loading:** Changed from static `<script>` tag to dynamic Promise-based loading (`window._kakaoReady`) because Vite's module system executes before external scripts are ready
- **Global reference:** All `kakao.maps` references changed to `window.kakao.maps` for Vite ES module compatibility
- **Lazy marker images:** `MARKER_UNLOCKED` and `MARKER_LOCKED` changed from module-level constants to lazy-initialized via `ensureMarkerImages()` to avoid using SDK before it's loaded

## Self-Check: PASSED

- [x] Map loads centered on Misa New Town area
- [x] Green markers for unlocked, red for locked toilets
- [x] Tapping marker opens bottom sheet with building info
- [x] Bottom sheet shows building name, floor, memo, lock status, password
- [x] Backdrop tap closes bottom sheet
- [x] Loading overlay appears during data fetch
- [x] Error state with retry button works
- [x] All 8 seed data toilets displayed

## Duration

~15 min (including user setup and debugging)
