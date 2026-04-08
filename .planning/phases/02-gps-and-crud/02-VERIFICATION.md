---
phase: 02-gps-and-crud
verified: 2026-04-08T12:00:00Z
status: passed
score: 9/9 must-haves verified
re_verification: false
gaps: []
human_verification:
  - test: "Tap GPS button on mobile device"
    expected: "Blue dot appears at current location, map pans to nearest toilet, Bottom Sheet opens showing nearest toilet with distance"
    why_human: "Requires real device GPS hardware and Kakao Maps rendering — cannot verify geolocation flow programmatically without running the app"
  - test: "Long-press on map for 700ms on mobile device"
    expected: "Registration form Bottom Sheet slides up with lat/lng pre-filled in hidden fields"
    why_human: "Requires touch events on a real device; touchstart timer behavior cannot be verified without a running browser"
  - test: "Fill registration form and tap 등록 (submit)"
    expected: "New toilet marker appears immediately on map; toast shows '화장실이 등록되었습니다'; data saved to Google Sheets"
    why_human: "Requires live GAS deployment — the URL is present in api.js but a real network call to Google Sheets cannot be tested statically"
  - test: "Tap 수정 (edit) on existing toilet bottom sheet, change password, tap 저장 (save)"
    expected: "Fields become editable (blue border), save writes to GAS, toast shows '수정되었습니다'"
    why_human: "Requires live GAS round-trip and visual contentEditable UI"
  - test: "Tap 복사 (copy) button when password exists"
    expected: "Password copied to clipboard, toast shows '복사됨'"
    why_human: "Clipboard API requires user gesture in a real browser context"
---

# Phase 2: GPS and CRUD Verification Report

**Phase Goal:** Users can find the nearest toilet from their current location and register new toilets or edit existing ones on the spot
**Verified:** 2026-04-08T12:00:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | GAS doPost accepts add and update actions and writes to Google Sheets | VERIFIED | `gas/Code.gs` lines 83-95: `doPost` parses `e.postData.contents`, routes `action==='add'` to `addToilet()` and `action==='update'` to `updateToilet()` |
| 2 | Frontend can call addToilet() and updateToilet() via text/plain POST | VERIFIED | `src/js/api.js` lines 37-73: both functions POST to GAS_URL with `'Content-Type': 'text/plain;charset=utf-8'` |
| 3 | Haversine distance calculation returns meters between two coordinates | VERIFIED | `src/js/geo.js` lines 49-65: standard Haversine formula, Earth radius R=6371000, returns `Math.round(R * c)` |
| 4 | getCurrentPosition() returns lat/lng from browser Geolocation API | VERIFIED | `src/js/geo.js` lines 13-38: Promise wrapper with `enableHighAccuracy: true, timeout: 10000, maximumAge: 30000`, resolves `{lat, lng, accuracy}` |
| 5 | findNearest() returns the closest toilet from an array | VERIFIED | `src/js/geo.js` lines 89-108: iterates toilets, attaches `_distance`, tracks minimum, returns nearest or null for empty array |
| 6 | User can tap GPS button to show current position on map and pan to nearest toilet | VERIFIED | `src/main.js` lines 58-87: GPS button click handler calls `getCurrentPosition`, `showUserPosition`, `findNearest`, `panTo`, dispatches `toilet-selected` |
| 7 | Distance in meters/km is visible for nearest toilet in Bottom Sheet | VERIFIED | `src/js/ui.js` lines 40-49: `showBottomSheet` reads `toilet._distance`, calls `formatDistance`, sets `bs-distance` textContent; shown only when `_distance` is non-null |
| 8 | User can long-press map to register new toilet (registration form opens with coordinates) | VERIFIED | `src/js/map.js` lines 88-115: `setupLongPress` attaches touchstart/touchend/touchmove, fires `map-longpress` CustomEvent with lat/lng after 700ms; `src/main.js` line 36-38 listens and calls `showRegisterSheet` |
| 9 | User can edit existing toilet inline and copy password to clipboard | VERIFIED | `src/js/ui.js` lines 155-217: edit button sets contentEditable, save-edit calls `updateToilet()`, copy button calls `navigator.clipboard.writeText` with execCommand fallback |

**Score:** 9/9 truths verified

---

## Required Artifacts

### Plan 02-01 Artifacts

| Artifact | Expected | Exists | Substantive | Wired | Status |
|----------|----------|--------|-------------|-------|--------|
| `gas/Code.gs` | doPost with add/update actions | Yes | Yes — `doPost`, `addToilet`, `updateToilet` all present and complete (163 lines) | Yes — called by GAS runtime | VERIFIED |
| `src/js/api.js` | addToilet and updateToilet POST functions | Yes | Yes — two exported async functions with full fetch implementation | Yes — imported by `src/js/ui.js` line 2 | VERIFIED |
| `src/js/geo.js` | Geolocation wrapper and distance calculations | Yes | Yes — 4 exported functions, 109 lines, complete implementations | Yes — imported by `src/main.js` line 3 and `src/js/ui.js` line 1 | VERIFIED |

### Plan 02-02 Artifacts

| Artifact | Expected | Exists | Substantive | Wired | Status |
|----------|----------|--------|-------------|-------|--------|
| `index.html` | GPS floating button DOM element (`id="gps-btn"`) | Yes | Yes — button with SVG crosshair icon and `aria-label="내 위치 찾기"` (line 22-27) | Yes — event listener attached in `src/main.js` line 58 | VERIFIED |
| `src/js/map.js` | GPS marker display and panTo functions (`showUserPosition`) | Yes | Yes — `showUserPosition` creates blue circle marker (#4285F4, 24x24), reuses via `gpsMarker` module var; `panTo` calls `map.panTo()` | Yes — imported and called in `src/main.js` line 1, 64, 69 | VERIFIED |
| `src/js/ui.js` | Distance display in bottom sheet (`bs-distance`) | Yes | Yes — `showBottomSheet` conditionally renders `formatDistance(toilet._distance)` to `#bs-distance` | Yes — called by `toilet-selected` event listener at line 225-227 | VERIFIED |
| `src/main.js` | GPS button click wiring and toilet state (`gps-btn`) | Yes | Yes — GPS handler at lines 58-87 wires `getCurrentPosition`, `showUserPosition`, `findNearest`, `panTo`, `toilet-selected` dispatch | Yes — `let toilets = []` populated at line 16, updated in `loadToilets()` | VERIFIED |
| `src/css/style.css` | GPS button floating styles (`#gps-btn`) | Yes | Yes — `#gps-btn` with `position: fixed`, `bottom: 24px`, `right: 16px`, `border-radius: 50%`, `width: 48px`, `height: 48px` (lines 167-191) | Yes — applied to DOM element via CSS | VERIFIED |

### Plan 02-03 Artifacts

| Artifact | Expected | Exists | Substantive | Wired | Status |
|----------|----------|--------|-------------|-------|--------|
| `index.html` | Registration form DOM and edit/copy buttons (`register-form`) | Yes | Yes — `#register-sheet` with `#register-form`, all required fields (reg-building required, reg-floor, reg-memo, reg-category, reg-haslock checkbox, reg-password, reg-lat/lng hidden), edit/copy buttons, toast element | Yes — used by `ui.js` DOM queries at module load | VERIFIED |
| `src/js/map.js` | Long-press handler dispatching `map-longpress` event | Yes | Yes — `setupLongPress` exported, 700ms timer on touchstart, getBoundingClientRect for coordinates, touchmove cancels timer | Yes — called in `src/main.js` line 32; event dispatched to `document` | VERIFIED |
| `src/js/ui.js` | Bottom sheet register/edit/view modes and clipboard copy (`showBottomSheetRegister`) | Yes | Yes — `showRegisterSheet` exported, form submit calls `addToilet`, edit button sets `contentEditable`, save calls `updateToilet`, copy calls `navigator.clipboard.writeText` with fallback, `showToast` with 1500ms hide | Yes — imported in `src/main.js` line 4 and called at line 37 | VERIFIED |
| `src/main.js` | Long-press and form submission wiring (`map-longpress`) | Yes | Yes — `setupLongPress(map)` called after map init (line 32), `map-longpress` listener at lines 36-38, `toilet-added` listener lines 41-45, `toilet-updated` listener lines 48-50 | Yes — event listeners attached at module load | VERIFIED |

---

## Key Link Verification

### Plan 02-01 Key Links

| From | To | Via | Status | Evidence |
|------|----|-----|--------|---------|
| `src/js/api.js` | `gas/Code.gs doPost` | fetch POST with text/plain content-type | WIRED | `api.js` line 40: `headers: { 'Content-Type': 'text/plain;charset=utf-8' }` — matches CORS workaround pattern required by GAS |

### Plan 02-02 Key Links

| From | To | Via | Status | Evidence |
|------|----|-----|--------|---------|
| `src/main.js` GPS button click | `src/js/geo.js getCurrentPosition()` | import and call on click | WIRED | `main.js` line 3: `import { getCurrentPosition, findNearest } from './js/geo.js'`; called at line 63 |
| `src/main.js` | `src/js/geo.js findNearest()` | find nearest after GPS position acquired | WIRED | `main.js` line 67: `var nearest = findNearest(pos.lat, pos.lng, toilets)` |
| `src/main.js` | `src/js/map.js showUserPosition()` | display blue dot on map | WIRED | `main.js` line 1: `import { ..., showUserPosition, ... } from './js/map.js'`; called at line 64 |

### Plan 02-03 Key Links

| From | To | Via | Status | Evidence |
|------|----|-----|--------|---------|
| `src/js/map.js` touchstart/touchend | `main.js` map-longpress listener | CustomEvent dispatch | WIRED | `map.js` line 102: `document.dispatchEvent(new CustomEvent('map-longpress', ...))` → `main.js` line 36: `document.addEventListener('map-longpress', ...)` |
| `src/js/ui.js` form submit | `src/js/api.js addToilet()` | import and call on save button click | WIRED | `ui.js` line 2: `import { addToilet, updateToilet } from './api.js'`; `addToilet(toiletData)` called at line 135 |
| `src/js/ui.js` edit save | `src/js/api.js updateToilet()` | import and call on save button click | WIRED | `ui.js` line 179: `var result = await updateToilet(updateData)` |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `src/js/ui.js showBottomSheet` | `toilet._distance` | Set by `findNearest()` in `geo.js` which computes Haversine distance | Yes — computed from real GPS coords vs toilet lat/lng | FLOWING |
| `src/js/ui.js register form` | `lat`, `lng` hidden fields | Set by `showRegisterSheet(lat, lng)` called from `map-longpress` event detail | Yes — coordinates come from Kakao Maps projection of actual touch point | FLOWING |
| `src/main.js toilet-added` | `toilets` array | Pushed from `toilet-added` event detail which contains form data + GAS-returned id | Yes — GAS id is server-assigned; immediately rendered as new marker | FLOWING |
| `src/js/api.js addToilet` | POST body | `toiletData` from form `FormData` + hidden lat/lng | Yes — real user input + real GPS coordinates | FLOWING |

---

## Behavioral Spot-Checks

Step 7b: SKIPPED — no runnable entry points testable without a browser. The app is a browser-only SPA using Kakao Maps CDN and Google Apps Script. All behaviors require either device GPS hardware, Kakao Maps rendering, or live GAS network calls.

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| GPS-01 | 02-02-PLAN.md | GPS로 현재 위치가 지도에 표시된다 | SATISFIED | `map.js` `showUserPosition` creates blue dot marker (#4285F4); called from GPS button click handler in `main.js` |
| GPS-02 | 02-02-PLAN.md | 현재 위치에서 가장 가까운 화장실을 찾을 수 있다 | SATISFIED | `geo.js` `findNearest` + GPS button calls `panTo` and dispatches `toilet-selected` to open Bottom Sheet |
| GPS-03 | 02-01-PLAN.md, 02-02-PLAN.md | 각 화장실까지의 거리(m)가 표시된다 | SATISFIED | `geo.js` `formatDistance` + `ui.js` `showBottomSheet` renders distance in `#bs-distance` when `_distance` present |
| CRUD-01 | 02-01-PLAN.md, 02-03-PLAN.md | 지도 탭으로 새 화장실 위치를 등록할 수 있다 | SATISFIED (with note) | Long-press (700ms) triggers registration — implemented as long-press not single-tap. REQUIREMENTS.md says "탭" but design docs specify long-press (D-04). Implementation matches design intent. |
| CRUD-02 | 02-03-PLAN.md | 건물명, 층, 위치 메모를 입력할 수 있다 | SATISFIED | Registration form has `reg-building` (required), `reg-floor`, `reg-memo` inputs |
| CRUD-03 | 02-03-PLAN.md | 잠금 여부를 선택하고 비밀번호를 입력할 수 있다 | SATISFIED | `reg-haslock` checkbox with `role="switch"`, conditional `reg-password-group` shown when checked |
| CRUD-04 | 02-01-PLAN.md, 02-03-PLAN.md | 기존 화장실의 비밀번호를 수정할 수 있다 | SATISFIED | Edit button enables `contentEditable` on bottom sheet fields; save-edit calls `updateToilet()` which writes to GAS |
| CRUD-05 | 02-03-PLAN.md | 비밀번호를 클립보드에 복사할 수 있다 | SATISFIED | Copy button calls `navigator.clipboard.writeText(password)` with `execCommand('copy')` fallback; shows "복사됨" toast |

**All 8 required phase IDs (GPS-01, GPS-02, GPS-03, CRUD-01, CRUD-02, CRUD-03, CRUD-04, CRUD-05) are accounted for.**

### Orphaned Requirements Check

Requirements.md shows the following also mapped to Phase 2 in the traceability table: none beyond the 8 listed. No orphaned requirements found.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `gas/Code.gs` | 76-82 | Orphaned JSDoc comment block (comment for `jsonResponse` appears separated from its function definition at line 159 by `doPost` and helpers) | Info | No functional impact — cosmetic code organization issue only |
| `index.html` | 7-8 | CSS loaded via `<link>` with absolute path `/src/css/style.css` | Info | Works in Vite dev server; Vite build resolves this correctly. No functional issue in production. |

No blockers or warnings found. No TODO/FIXME/placeholder patterns. No hardcoded empty arrays passed to renderers. No stub implementations detected.

---

## Human Verification Required

### 1. GPS Location Display

**Test:** On a mobile device (or desktop with location enabled), tap the GPS button (crosshair icon, bottom-right)
**Expected:** Blue dot appears at current position on the Kakao Map; map pans to the nearest toilet marker; Bottom Sheet slides up showing nearest toilet details with distance (e.g., "350m")
**Why human:** Requires real device GPS, live Kakao Maps rendering, and loaded toilet data from Google Sheets

### 2. Map Long-Press Registration

**Test:** On a mobile device, press and hold the map for approximately 700ms without moving
**Expected:** Registration form Bottom Sheet slides up; hidden latitude and longitude fields are pre-filled with the tapped coordinates
**Why human:** Requires touch events on a real mobile browser; long-press timer behavior cannot be verified without a running browser

### 3. Toilet Registration Form Submission

**Test:** Long-press map, fill in building name (required), optionally toggle lock and enter password, tap 등록
**Expected:** Toast shows "화장실이 등록되었습니다"; new toilet marker appears immediately on map at the tapped location; data persists in Google Sheets on refresh
**Why human:** Requires live GAS POST round-trip to Google Sheets

### 4. Inline Edit and Save

**Test:** Tap a toilet marker, tap 수정 (edit), change the password field, tap 저장 (save)
**Expected:** Fields gain blue border (editable state), save button writes to GAS, "수정되었습니다" toast appears, data refreshes
**Why human:** Requires live GAS round-trip and visual confirmation of contentEditable behavior

### 5. Password Clipboard Copy

**Test:** Tap a toilet marker that has a password, tap 복사 (copy)
**Expected:** Toast shows "복사됨"; pasting elsewhere confirms the password was copied
**Why human:** Clipboard API requires user gesture in a real browser context; cannot test clipboard state programmatically

---

## Gaps Summary

No gaps. All 9 observable truths are VERIFIED. All 12 artifacts pass all three levels (exists, substantive, wired). All 3 key link groups are WIRED. All 8 phase requirement IDs are accounted for and SATISFIED.

One design note for information only: REQUIREMENTS.md CRUD-01 says "지도 탭" (map tap) but the implementation uses long-press (700ms). This matches the design specification in the phase plan (D-04: "long-press to register") and is the correct behavior — single-tap is reserved for marker selection. The requirement text is slightly imprecise but the implementation is correct per design intent.

---

_Verified: 2026-04-08T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
