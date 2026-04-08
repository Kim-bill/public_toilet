# Phase 2: GPS and CRUD - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

GPS로 현재 위치를 표시하고 가장 가까운 화장실을 찾는 기능 + 지도에서 새 화장실을 등록하고 기존 화장실 정보를 수정하는 CRUD 기능. Phase 1의 읽기 전용 앱에 쓰기 기능을 추가한다.

</domain>

<decisions>
## Implementation Decisions

### GPS 동작 방식
- **D-01:** GPS 버튼은 지도 우측 하단에 플로팅 원형 버튼으로 배치
- **D-02:** GPS 버튼 탭 시: 현재 위치 표시 + 가장 가까운 화장실로 지도 자동 이동 + Bottom Sheet 열기
- **D-03:** 각 화장실까지의 거리(m)를 마커 또는 Bottom Sheet에 표시

### 등록 플로우
- **D-04:** 지도 롱프레스로 등록 시작 — 해당 위치에 등록 폼 열기
- **D-05:** 등록 폼은 Bottom Sheet로 표시 (Phase 1과 동일한 UI 패턴)
- **D-06:** 등록 폼 필드: 건물명(필수), 층, 위치메모, 잠금여부(토글), 비밀번호, 카테고리
- **D-07:** 위도/경도, 지역("미사신도시"), 등록일시는 자동 입력

### 수정 플로우
- **D-08:** 마커 탭 → Bottom Sheet → '수정' 버튼 탭 → 편집 모드로 전환
- **D-09:** 편집 모드에서는 동일 Bottom Sheet 내에서 필드가 입력 가능 상태로 변경
- **D-10:** 저장 버튼으로 수정 완료, 취소 버튼으로 편집 모드 나가기

### 비밀번호 표시/복사
- **D-11:** 비밀번호를 중간 크기 글씨로 표시 (기본 body size 유지)
- **D-12:** 비밀번호 옆에 복사 버튼 — 탭 시 클립보드 복사 + "복사됨" 피드백
- **D-13:** 복사 기능은 카톡 공유 등 용도 (물리 키패드에는 직접 입력)

### Claude's Discretion
- GAS doPost 구현 방식 (CORS text/plain 처리)
- GPS 권한 요청 UX (iOS Safari 대응)
- 거리 계산 알고리즘 (Haversine 등)
- 폼 유효성 검사 방식

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 (기존 코드)
- `src/js/map.js` — 카카오맵 초기화, 마커 생성 패턴
- `src/js/api.js` — GAS fetch 패턴, URL 구조
- `src/js/ui.js` — Bottom Sheet, 로딩/에러 상태 패턴
- `src/main.js` — 앱 초기화, 카카오 SDK 로딩 패턴
- `src/css/style.css` — 기존 스타일 패턴
- `gas/Code.gs` — GAS doGet 패턴, 시트 컬럼 구조
- `index.html` — DOM 구조

### Research
- `.planning/research/STACK.md` — 기술 스택
- `.planning/research/PITFALLS.md` — GAS POST CORS (text/plain 필수), iOS Safari GPS 주의사항
- `.planning/research/ARCHITECTURE.md` — 시스템 아키텍처

### Project
- `.planning/PROJECT.md` — 프로젝트 비전
- `.planning/REQUIREMENTS.md` — GPS-01~03, CRUD-01~05 요구사항
- `.planning/phases/01-map-and-data/01-CONTEXT.md` — Phase 1 결정사항 (D-06 컬럼 구조)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `showBottomSheet(toilet)` / `hideBottomSheet()` — 상세 패널 표시/숨김
- `createMarkers(map, toilets)` — 마커 생성 패턴 (확장 가능)
- `getToilets()` — GAS GET fetch 패턴 (POST 추가 필요)
- CustomEvent `toilet-selected` — 마커→UI 디커플링 패턴

### Established Patterns
- Bottom Sheet: CSS transition 기반 slide-up
- 데이터 흐름: GAS → api.js → main.js → map.js/ui.js
- 카카오맵: window.kakao.maps 글로벌 참조
- 이벤트: CustomEvent로 컴포넌트 간 통신

### Integration Points
- `gas/Code.gs` — doPost 함수 추가 필요 (등록/수정)
- `src/js/api.js` — POST 함수 추가 (text/plain CORS)
- `src/js/map.js` — 롱프레스 이벤트, GPS 위치 표시 추가
- `src/js/ui.js` — 등록/수정 폼, 복사 버튼 추가
- `index.html` — GPS 버튼, 등록 폼 DOM 추가

</code_context>

<specifics>
## Specific Ideas

- GAS POST 시 Content-Type: text/plain 필수 (CORS preflight 회피)
- iOS Safari에서 GPS 권한은 "내 위치 찾기" 버튼 탭 시에만 요청 (자동 요청 금지)
- 거리 표시: m 단위 (1km 미만), km 단위 (1km 이상)
- 등록 후 마커가 즉시 지도에 표시되어야 함 (새로고침 없이)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-gps-and-crud*
*Context gathered: 2026-04-08*
