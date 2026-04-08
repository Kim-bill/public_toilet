# Phase 1: Map and Data - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

카카오맵에 구글시트(Google Apps Script) 데이터로 미사신도시 화장실 마커를 표시하고, 마커 탭 시 상세정보(건물명, 층, 잠금여부, 비번)를 Bottom Sheet로 보여주는 읽기 전용 화면. GitHub Pages에 배포하여 모바일에서 접근 가능하게 한다.

</domain>

<decisions>
## Implementation Decisions

### 마커 디자인
- **D-01:** 잠금 없음 = 초록색 마커, 잠금 있음 = 빨간색 마커
- **D-02:** 마커 탭 시 Bottom Sheet로 상세정보 표시 (InfoWindow 아님)
- **D-03:** Bottom Sheet에 건물명, 층, 위치메모, 잠금여부, 비밀번호 표시

### 초기 데이터
- **D-04:** 시드 건물 범위: 대형 상업시설(스타필드 미사, 홈플러스, 이마트 등), 카페/음식점 밀집지역(미사역 상가), 공공시설(미사역, 미사강변공원 등)
- **D-05:** 시드 데이터의 비밀번호는 빈 상태 — 좌표와 건물명만 등록, 비번은 방문 후 입력

### 데이터 필드
- **D-06:** 구글시트 컬럼 구조:
  - id (고유 ID)
  - buildingName (건물명)
  - floor (층)
  - locationMemo (위치 메모 — "지하1층 푸드코트 옆" 등)
  - hasLock (잠금 여부 — true/false)
  - password (비밀번호)
  - latitude (위도)
  - longitude (경도)
  - region (지역명 — 확장 대비, 기본값 "미사신도시")
  - category (카테고리 — 상업시설/공공시설/카페 등)
  - createdAt (등록일시)
  - updatedAt (수정일시)

### 배포 설정
- **D-07:** GitHub 레포는 Private — GAS URL과 API 키 보안
- **D-08:** 카카오 API 키와 GAS URL은 코드에 직접 입력 (Private repo이므로 문제없음)
- **D-09:** GitHub Pages 배포 (Private repo에서도 GitHub Pages 사용 가능)

### Claude's Discretion
- Vite 설정, 프로젝트 구조, CSS 프레임워크 선택 등 기술적 세부사항은 Claude 재량

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Research
- `.planning/research/STACK.md` — 기술 스택 권장사항 (Vite 8, Pico CSS, Kakao Maps SDK v2)
- `.planning/research/ARCHITECTURE.md` — 시스템 아키텍처 (프론트엔드 ↔ GAS ↔ Google Sheets)
- `.planning/research/PITFALLS.md` — GAS CORS, 카카오 도메인 등록, iOS GPS 등 주요 주의사항
- `.planning/research/FEATURES.md` — 기능 분류 및 우선순위

### Project
- `.planning/PROJECT.md` — 프로젝트 비전 및 제약조건
- `.planning/REQUIREMENTS.md` — v1 요구사항 (MAP-01~04, DATA-01~03)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 없음 (greenfield project)

### Established Patterns
- 없음 (첫 번째 phase)

### Integration Points
- Kakao Maps JS SDK v2 (CDN script tag)
- Google Apps Script Web App (REST endpoint)
- GitHub Pages (정적 배포)

</code_context>

<specifics>
## Specific Ideas

- 미사신도시 중심 좌표: 약 37.5600, 127.1800 (미사역 인근)
- 시드 건물은 실제 좌표로 정확히 등록해야 함
- GAS CORS 해결: POST 시 Content-Type: text/plain 필수
- 카카오 개발자 콘솔에 GitHub Pages 도메인 등록 필요

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-map-and-data*
*Context gathered: 2026-04-08*
