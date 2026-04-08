# Requirements: Public Toilet (화장실 비번 공유 앱)

**Defined:** 2026-04-08
**Core Value:** 급할 때 가장 가까운 화장실을 찾고, 비밀번호를 바로 확인할 수 있어야 한다.

## v1 Requirements

### Map (지도)

- [ ] **MAP-01**: 카카오맵이 미사신도시 중심으로 렌더링된다
- [ ] **MAP-02**: 등록된 화장실 위치에 마커가 표시된다
- [ ] **MAP-03**: 마커 탭 시 건물명, 층, 잠금여부, 비밀번호가 표시된다
- [ ] **MAP-04**: 잠금 없음/있음에 따라 마커 색상이 구분된다

### GPS (위치)

- [ ] **GPS-01**: GPS로 현재 위치가 지도에 표시된다
- [ ] **GPS-02**: 현재 위치에서 가장 가까운 화장실을 찾을 수 있다
- [ ] **GPS-03**: 각 화장실까지의 거리(m)가 표시된다

### CRUD (등록/수정)

- [ ] **CRUD-01**: 지도 탭으로 새 화장실 위치를 등록할 수 있다
- [ ] **CRUD-02**: 건물명, 층, 위치 메모를 입력할 수 있다
- [ ] **CRUD-03**: 잠금 여부를 선택하고 비밀번호를 입력할 수 있다
- [ ] **CRUD-04**: 기존 화장실의 비밀번호를 수정할 수 있다
- [ ] **CRUD-05**: 비밀번호를 클립보드에 복사할 수 있다

### Data (데이터)

- [ ] **DATA-01**: 구글시트에 화장실 데이터가 저장된다
- [ ] **DATA-02**: 구글시트에서 화장실 데이터를 조회할 수 있다
- [ ] **DATA-03**: 미사신도시 주요 건물 좌표가 초기 데이터로 포함된다

### UI (인터페이스)

- [ ] **UI-01**: 모바일 화면에 최적화된 반응형 UI
- [ ] **UI-02**: 터치 친화적인 버튼과 입력 필드 크기

## v2 Requirements

### Expansion (확장)

- **EXP-01**: 지역 추가 기능 (미사신도시 외 다른 지역)
- **EXP-02**: 지역별 데이터 필터링

### UX Enhancement

- **UXE-01**: 오프라인 모드 (이전 조회 데이터 캐싱)
- **UXE-02**: PWA 설치 (홈화면 추가)
- **UXE-03**: 화장실 삭제 기능

## Out of Scope

| Feature | Reason |
|---------|--------|
| 사용자 인증/로그인 | 부부 2명만 사용, URL 접근으로 충분 |
| 리뷰/평점 | 비번 공유가 핵심, 평가 불필요 |
| 사진 첨부 | v1은 텍스트 정보만으로 충분 |
| 길찾기/내비게이션 | 카카오맵 앱으로 대체 가능 |
| 푸시 알림 | 2명 사용, 알림 불필요 |
| 공개 기여 | 프라이빗 앱, 외부 기여 불필요 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MAP-01 | Phase 1 | Pending |
| MAP-02 | Phase 1 | Pending |
| MAP-03 | Phase 1 | Pending |
| MAP-04 | Phase 1 | Pending |
| GPS-01 | Phase 2 | Pending |
| GPS-02 | Phase 2 | Pending |
| GPS-03 | Phase 2 | Pending |
| CRUD-01 | Phase 2 | Pending |
| CRUD-02 | Phase 2 | Pending |
| CRUD-03 | Phase 2 | Pending |
| CRUD-04 | Phase 2 | Pending |
| CRUD-05 | Phase 2 | Pending |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0

---
*Requirements defined: 2026-04-08*
*Last updated: 2026-04-08 after roadmap creation*
