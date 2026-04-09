# Phase 3: Mobile UX Polish - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

기존 Phase 1+2 코드의 모바일 UX를 폴리시한다. 터치 타겟 크기 보장, 반응형 레이아웃 확인, 로딩 상태 개선. 새 기능 추가 없이 기존 코드 품질 개선만 수행.

</domain>

<decisions>
## Implementation Decisions

### 터치 타겟
- **D-01:** 모든 버튼/입력 필드는 최소 44x44px 터치 타겟 보장
- **D-02:** 버튼 간 여백 충분히 확보 (오탭 방지)

### 로딩 상태
- **D-03:** 기존 데이터 로딩 오버레이 유지
- **D-04:** GPS 버튼에 로딩 스피너 표시 (위치 획득 중)
- **D-05:** 등록/수정 저장 시 로딩 상태 표시

### 반응형
- **D-06:** 모바일 화면 가로 스크롤 없이 100% 채움
- **D-07:** Bottom Sheet / Register Sheet가 화면 너비에 맞게 조정

### Claude's Discretion
- 구체적인 CSS 값 (padding, margin, font-size 조정)
- viewport meta 설정 확인
- 스크롤 동작 최적화
- 기존 코드 중 터치 타겟 미달인 요소 식별 및 수정

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 현재 코드 (Phase 1+2 결과물)
- `index.html` — DOM 구조, 버튼, 폼 요소
- `src/css/style.css` — 현재 스타일 (터치 타겟 크기 확인 필요)
- `src/js/ui.js` — Bottom Sheet, 등록폼, 편집 모드
- `src/js/map.js` — GPS 마커, 롱프레스
- `src/main.js` — GPS 버튼 핸들러

### Design System
- `.planning/phases/01-map-and-data/01-UI-SPEC.md` — 스페이싱, 타이포그래피, 색상 규칙

### Project
- `.planning/REQUIREMENTS.md` — UI-01, UI-02 요구사항

</canonical_refs>

<code_context>
## Existing Code Insights

### 확인 필요 요소
- GPS 버튼 (`#gps-btn`) — 현재 크기 확인
- Bottom Sheet 내 수정/복사 버튼 — 터치 타겟 크기
- 등록 폼 입력 필드 — 높이/패딩
- 드래그 핸들 — 터치 영역
- 토스트 메시지 — 모바일 표시

### Established Patterns
- Pico CSS 2.x 기반 (classless)
- CSS custom properties 미사용 (직접 값)
- 모바일 viewport 100vh 맵

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-mobile-ux-polish*
*Context gathered: 2026-04-09*
