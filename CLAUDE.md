<!-- GSD:project-start source:PROJECT.md -->
## Project

**Public Toilet (화장실 비번 공유 앱)**

미사신도시 내 건물 화장실의 위치와 비밀번호를 기록하고 공유하는 모바일 웹앱. 부부가 방문한 건물의 화장실 비번을 등록하면, 급할 때 가까운 화장실과 비번을 빠르게 찾을 수 있다. 카카오맵 기반 지도에 화장실 마커가 표시되고, 구글시트를 백엔드로 사용하여 서버 없이 운영한다.

**Core Value:** 급할 때 가장 가까운 화장실을 찾고, 비밀번호를 바로 확인할 수 있어야 한다.

### Constraints

- **지도 API**: 카카오맵 — 한국 지역 정확도 최고, 무료 할당량 충분
- **백엔드**: 구글시트 (Google Apps Script) — 서버리스, 무료, 관리 부담 없음
- **프론트엔드**: 정적 웹앱 (HTML/CSS/JS) — GitHub Pages 배포 가능
- **배포**: GitHub Pages — 무료, HTTPS 자동
- **확장성**: 지역 데이터를 분리할 수 있는 구조로 설계
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
# Initialize project
# Install Pico CSS
# No other npm dependencies needed -- Kakao Maps loads via CDN script tag
# Google Apps Script runs in Google's environment, not locally
## Project Structure
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
- Register domain at [Kakao Developers](https://developers.kakao.com/) > App > Platform > Web
- For GitHub Pages: register `USERNAME.github.io` as allowed domain
- For local dev: register `localhost` as allowed domain
- Use JavaScript key (not REST API key)
### Google Apps Script CORS Fix
- Deploy as: Web App > Execute as: Me > Access: Anyone
- Every code change requires new deployment (versioned)
- GET requests (doGet) work without CORS issues
### Geolocation API
- Works on all modern mobile browsers
- Safari requires explicit user gesture to trigger
- HTTPS mandatory (GitHub Pages handles this)
### Vite Config for GitHub Pages
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
