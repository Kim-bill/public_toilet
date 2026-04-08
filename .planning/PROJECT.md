# Public Toilet (화장실 비번 공유 앱)

## What This Is

미사신도시 내 건물 화장실의 위치와 비밀번호를 기록하고 공유하는 모바일 웹앱. 부부가 방문한 건물의 화장실 비번을 등록하면, 급할 때 가까운 화장실과 비번을 빠르게 찾을 수 있다. 카카오맵 기반 지도에 화장실 마커가 표시되고, 구글시트를 백엔드로 사용하여 서버 없이 운영한다.

## Core Value

급할 때 가장 가까운 화장실을 찾고, 비밀번호를 바로 확인할 수 있어야 한다.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 카카오맵에 화장실 위치가 마커로 표시된다
- [ ] GPS 기반으로 현재 위치에서 가까운 화장실을 찾을 수 있다
- [ ] 화장실 잠금 여부가 표시된다 (없음 / 있음+비번)
- [ ] 지도 탭으로 새 화장실 위치를 등록할 수 있다
- [ ] 화장실 비밀번호를 등록/수정할 수 있다
- [ ] 건물명, 층, 위치 메모를 입력할 수 있다
- [ ] 구글시트에 데이터가 저장/조회된다
- [ ] 모바일에 최적화된 UI
- [ ] 미사신도시 주요 건물 좌표가 초기 데이터로 포함된다

### Out of Scope

- 사용자 인증/로그인 — 부부만 사용, URL만 알면 접근 가능
- 다른 지역 — v1은 미사신도시 한정 (구조는 확장 가능하게)
- 리뷰/평점 기능 — 비번 공유가 핵심, 평가는 불필요
- 사진 첨부 — v1에서는 텍스트 정보만

## Context

- 사용자: 본인과 와이프 (2명)
- 지역: 미사신도시 (경기도 하남시 미사강변도시)
- 퍼블릭 배포 아님 — 부부 전용이지만 GitHub Pages로 호스팅
- 와이프가 업장 방문 시 화장실 비번을 현장에서 등록하는 흐름
- 나중에 다른 지역으로 확장 가능한 구조 필요
- 초기 데이터: 미사신도시 주요 건물 (스타필드, 홈플러스 등) 좌표 포함

## Constraints

- **지도 API**: 카카오맵 — 한국 지역 정확도 최고, 무료 할당량 충분
- **백엔드**: 구글시트 (Google Apps Script) — 서버리스, 무료, 관리 부담 없음
- **프론트엔드**: 정적 웹앱 (HTML/CSS/JS) — GitHub Pages 배포 가능
- **배포**: GitHub Pages — 무료, HTTPS 자동
- **확장성**: 지역 데이터를 분리할 수 있는 구조로 설계

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 카카오맵 API 사용 | 한국 지역 건물 정보 정확도 최고 | — Pending |
| 구글시트 백엔드 | 서버 없이 운영, 부부 전용이라 트래픽 미미 | — Pending |
| 인증 없음 | 2명만 사용, 복잡도 최소화 | — Pending |
| GitHub Pages 배포 | 무료, 정적 사이트, HTTPS 자동 | — Pending |
| 지역 확장 가능 구조 | v1은 미사신도시, 향후 다른 지역 추가 가능하게 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-08 after initialization*
