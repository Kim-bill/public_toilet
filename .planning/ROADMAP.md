# Roadmap: Public Toilet (화장실 비번 공유 앱)

## Overview

Deliver a mobile web app that shows toilet locations on a Kakao Map with passwords from Google Sheets, lets users find the nearest one via GPS, and register/edit toilet info on the spot. Phase 1 validates all external integrations and delivers the core read path (map + markers + data). Phase 2 adds all interactive features (GPS location finding + CRUD operations). Phase 3 polishes the mobile UX for one-handed, on-the-go usage.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Map and Data** - Kakao Map renders with toilet markers loaded from Google Sheets
- [ ] **Phase 2: GPS and CRUD** - Find nearest toilet by location and register/edit toilet info
- [ ] **Phase 3: Mobile UX Polish** - Mobile-optimized touch interface for on-the-go usage

## Phase Details

### Phase 1: Map and Data
**Goal**: Users can open the app and see all registered toilets on a map with building names, floors, passwords, and lock status -- all loaded from Google Sheets
**Depends on**: Nothing (first phase)
**Requirements**: MAP-01, MAP-02, MAP-03, MAP-04, DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. App loads and displays a Kakao Map centered on Misa New Town (미사신도시)
  2. Toilet markers appear on the map, with different colors for locked vs unlocked
  3. Tapping a marker shows building name, floor, lock status, and password
  4. All marker data is read from Google Sheets (not hardcoded) and seed data for major Misa buildings is present
  5. App is deployed and accessible on GitHub Pages
**Plans**: 3 plans
Plans:
- [x] 01-01-PLAN.md — Scaffold Vite project with Kakao Map rendering and GitHub Pages deploy workflow
- [x] 01-02-PLAN.md — Create GAS backend, frontend API layer, and seed data for Google Sheets
- [x] 01-03-PLAN.md — Wire markers, bottom sheet, and data fetching into working toilet finder

**UI hint**: yes

### Phase 2: GPS and CRUD
**Goal**: Users can find the nearest toilet from their current location and register new toilets or edit existing ones on the spot
**Depends on**: Phase 1
**Requirements**: GPS-01, GPS-02, GPS-03, CRUD-01, CRUD-02, CRUD-03, CRUD-04, CRUD-05
**Success Criteria** (what must be TRUE):
  1. User can tap a button to show their current GPS position on the map
  2. User can find the nearest toilet and see distances (in meters) to each toilet
  3. User can tap on the map to register a new toilet with building name, floor, location memo, lock status, and password
  4. User can edit an existing toilet's password and details
  5. User can copy a password to clipboard with one tap
**Plans**: 3 plans
Plans:
- [x] 02-01-PLAN.md — GAS doPost backend, frontend API POST functions, and geo.js distance module
- [x] 02-02-PLAN.md — GPS button with current position display, nearest toilet finding, and distance
- [ ] 02-03-PLAN.md — Map long-press registration, inline editing, and password clipboard copy

**UI hint**: yes

### Phase 3: Mobile UX Polish
**Goal**: The app feels natural and fast on a phone held in one hand while walking
**Depends on**: Phase 2
**Requirements**: UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. UI is responsive and fills the mobile screen without horizontal scrolling
  2. All buttons and input fields are touch-friendly (minimum 44x44px tap targets)
  3. Loading states are visible during data fetch and GPS acquisition
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Map and Data | 3/3 | Complete    |  |
| 2. GPS and CRUD | 2/3 | In Progress|  |
| 3. Mobile UX Polish | 0/TBD | Not started | - |
