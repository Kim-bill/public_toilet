# Feature Research

**Domain:** Toilet finder / password sharing (private, couple-only, single neighborhood)
**Researched:** 2026-04-08
**Confidence:** HIGH

## Context

This is NOT a public community app. It is a private tool for 2 users (a couple) to record and recall toilet passwords in Misa New Town (미사신도시), Korea. The feature landscape is informed by existing toilet finder apps (Flush, Toilet Finder, 내주변화장실, PooPee, Toilet Password) but heavily scoped down. The core value is: **when you're in a hurry, find the nearest toilet and see its password instantly.**

## Feature Landscape

### Table Stakes (Users Expect These)

Features that must exist for the app to fulfill its core promise.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Map with toilet markers | Users need spatial awareness of where toilets are relative to their position | MEDIUM | Kakao Maps API. Markers with color/icon coding for locked vs unlocked |
| GPS-based current location | "What's nearest to me RIGHT NOW" is the core use case | LOW | Browser Geolocation API, center map on user |
| Nearest toilet identification | Urgency means distance sorting matters most | LOW | Calculate distance from GPS to all markers, highlight closest |
| Password display on marker tap | The entire point of the app -- see password without extra steps | LOW | Bottom sheet or popup showing password, building name, floor |
| Add new toilet location | Wife registers passwords on-site when visiting buildings | MEDIUM | Tap map to drop pin, fill form (building, floor, password) |
| Edit existing toilet info | Passwords change, info needs correction | LOW | Edit form pre-filled with existing data |
| Building name + floor + location memo | Knowing "3rd floor, left side" is critical in large buildings like Starfield | LOW | Free-text fields in add/edit form |
| Lock status indicator | Distinguish "no password needed" from "password required" at a glance | LOW | Toggle or select in form, reflected in marker style |
| Mobile-optimized UI | Used on phone while walking/rushing | MEDIUM | Touch targets, readable text, fast load, one-hand operation |
| Data persistence (Google Sheets) | Data must survive between sessions | MEDIUM | Google Apps Script as REST API, Sheets as DB |

### Differentiators (Unique Value for This App)

These are not expected in generic toilet finders but are what make THIS app specifically useful.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Password as first-class data | No toilet finder app shows building passwords -- this is the core differentiator | LOW | Password field prominently displayed, copyable |
| Pre-loaded Misa New Town data | App is useful from day one with known building coordinates | LOW | Seed data in Google Sheet with Starfield, Homeplus, etc. |
| Quick-copy password | When rushing, tap to copy password to clipboard | LOW | Copy button next to password display |
| Instant load / no auth | No login screen, no splash, no onboarding. Open URL = see map | LOW | Static site, no auth, bookmark to home screen |
| Distance display | Show "120m" or "5 min walk" next to each toilet | LOW | Haversine distance from current GPS position |

### Anti-Features (Deliberately NOT Building)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| User authentication / login | Security for password data | Only 2 users, URL-only access is simpler. Auth adds complexity with zero benefit for this scale | Keep URL private, optionally add simple PIN later if worried |
| Reviews / ratings / cleanliness scores | Common in Flush, SitOrSquat | 2 users reviewing for each other is pointless overhead | Use the memo field for notes like "clean" or "avoid" |
| Photo attachments | Flush and Toilet Finder support photos | Adds storage complexity (Google Sheets can't store images easily), and for 2 users a text memo suffices | Text memo for location hints ("past the elevator, blue door") |
| Offline mode / local DB sync | Flush stores DB locally for offline use | Google Sheets backend means online-only, but in Misa New Town mobile data is reliable. Offline sync adds massive complexity | Accept online-only for v1; Misa has excellent LTE/5G coverage |
| Directions / navigation integration | Flush and Google Maps offer turn-by-turn | Within a single neighborhood, distances are short. Users know the area. Opening Kakao Navi is one tap away | Show distance + address, let user open Kakao Map natively if needed |
| Multi-region support (v1) | Future expansion desire | Scope creep for v1. Build data structure that supports regions but don't build UI for region switching yet | Design sheet schema with region column for future use |
| Public community contributions | Core feature of Flush, Toilet Finder | This is a private app. Public contributions mean moderation, spam, vandalism | Keep it private. 2 users only |
| Push notifications | "Alert me when near a saved toilet" | Requires service worker complexity, and the use case is pull-based (user opens app when needed) | User opens app when they need it |
| Accessibility filters (wheelchair, baby changing) | Standard in public toilet finders | 2 users know their own needs, filtering adds UI clutter | Use memo field if needed |
| Fee / payment info | Some public toilets charge | Korean building toilets don't charge, they just have passwords | Not applicable to this domain |

## Feature Dependencies

```
[GPS / Current Location]
    └──required by──> [Nearest Toilet Identification]
    └──required by──> [Distance Display]

[Kakao Map Rendering]
    └──required by──> [Toilet Markers on Map]
    └──required by──> [Tap to Add New Location]

[Google Sheets Backend (CRUD API)]
    └──required by──> [Add New Toilet]
    └──required by──> [Edit Toilet Info]
    └──required by──> [Load Toilet Data on Map]

[Toilet Markers on Map]
    └──enhanced by──> [Lock Status Indicator (marker styling)]
    └──enhanced by──> [Distance Display]

[Tap Marker to View]
    └──enhanced by──> [Quick-Copy Password]
```

### Dependency Notes

- **GPS requires HTTPS:** GitHub Pages provides HTTPS automatically, which is required for Geolocation API. This is already planned.
- **Google Sheets API requires Apps Script deployment:** The CRUD backend must be deployed as a web app before any data features work.
- **Kakao Map API requires key registration:** Must register app on Kakao Developers before map renders.
- **Marker tap requires data loaded:** Map markers depend on Sheets data being fetched first.

## MVP Definition

### Launch With (v1)

Minimum viable product -- validate that this actually helps when rushing to find a toilet.

- [x] Kakao Map centered on Misa New Town -- map is the landing page
- [x] GPS-based current location marker -- know where you are
- [x] Toilet markers from Google Sheets data -- see all saved toilets
- [x] Tap marker to see: building name, floor, password, memo -- the core info
- [x] Lock status visual indicator (locked with password / unlocked / no info)
- [x] Add new toilet: tap map + fill form (building, floor, password, memo)
- [x] Edit existing toilet info
- [x] Pre-seeded data for major Misa buildings (Starfield, Homeplus, etc.)
- [x] Mobile-first responsive layout

### Add After Validation (v1.x)

Features to add once the couple actually uses it and confirms the core flow works.

- [ ] Quick-copy password button -- add when confirmed that copying passwords is a real friction point
- [ ] Distance display on marker/list -- add when they want to compare "which is closer"
- [ ] List view (sorted by distance) -- add if map-only view proves hard to scan quickly
- [ ] Search by building name -- add when data grows beyond ~20 entries
- [ ] "Last updated" timestamp per entry -- add when password staleness becomes a problem

### Future Consideration (v2+)

- [ ] Region expansion (other neighborhoods) -- defer until v1 proves useful daily
- [ ] PWA install (Add to Home Screen prompt) -- defer, bookmark works fine initially
- [ ] Simple PIN protection for URL -- defer unless privacy concern arises
- [ ] Kakao Map road view link -- defer, low priority

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Map with markers | HIGH | MEDIUM | P1 |
| GPS current location | HIGH | LOW | P1 |
| Password display on tap | HIGH | LOW | P1 |
| Add new toilet | HIGH | MEDIUM | P1 |
| Lock status indicator | MEDIUM | LOW | P1 |
| Edit toilet info | MEDIUM | LOW | P1 |
| Pre-seeded data | HIGH | LOW | P1 |
| Mobile-optimized UI | HIGH | MEDIUM | P1 |
| Quick-copy password | MEDIUM | LOW | P2 |
| Distance display | MEDIUM | LOW | P2 |
| List view by distance | MEDIUM | MEDIUM | P2 |
| Search by building name | LOW | LOW | P3 |
| PWA install prompt | LOW | MEDIUM | P3 |
| Region expansion | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when friction is observed
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Flush (Global) | Toilet Password (KR) | 내주변화장실 (KR) | Our App |
|---------|---------------|----------------------|------------------|---------|
| Map view | Yes (200K+ toilets) | Limited | Yes (public data) | Yes (private data, Misa only) |
| Password/code info | No | Yes (core feature) | No | Yes (core feature) |
| Offline mode | Yes (local DB) | Unknown | No | No (online only, acceptable) |
| Add new location | Yes (community) | Yes | No (public data only) | Yes (couple only) |
| Directions | Yes (Google Maps) | No | Yes | No (show distance only) |
| Accessibility filters | Yes | No | Yes | No (unnecessary for 2 users) |
| Reviews/ratings | Yes | No | No | No (unnecessary) |
| Photos | Yes | No | No | No (text memo instead) |
| Auth/login | No | No | No | No |
| Korea building coverage | Poor | Good (community) | Good (public only) | Excellent (curated, private) |

## Sources

- [Flush Toilet Finder](https://www.jrustonapps.com/apps/flush-toilet-finder) - Feature reference for global toilet finder apps
- [Toilet Finder by BeTomorrow](https://play.google.com/store/apps/details?id=com.bto.toilet&hl=en_US) - Community-contributed toilet data model
- [Toilet Password app (KR)](https://play.google.com/store/apps/details?id=com.youngki_home.toilet_password&hl=en_US) - Korean toilet password sharing concept
- [NAFC Bathroom Locator Apps](https://nafc.org/bhealth-blog/the-best-bathroom-locator-apps/) - Feature comparison across toilet finder apps
- [내주변화장실 App](https://apps.apple.com/kr/app/%EB%82%B4%EC%A3%BC%EB%B3%80%ED%99%94%EC%9E%A5%EC%8B%A4/id1401988056) - Korean public toilet locator features
- [홍대 화장실 비번 논란 (전자신문)](https://www.etnews.com/20251003000076) - Context on toilet password sharing sensitivity in Korea

---
*Feature research for: toilet finder / password sharing (private couple app)*
*Researched: 2026-04-08*
