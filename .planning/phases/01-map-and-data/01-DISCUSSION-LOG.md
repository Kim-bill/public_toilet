# Phase 1: Map and Data - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-08
**Phase:** 01-map-and-data
**Areas discussed:** 마커 디자인, 초기 데이터, 데이터 필드, 배포 설정

---

## 마커 디자인

### 마커 색상

| Option | Description | Selected |
|--------|-------------|----------|
| 초록/빨강 | 미잠금=초록(자유 이용), 잠금=빨강(비번 필요) | ✓ |
| 파랑/주황 | 미잠금=파랑, 잠금=주황(주의 필요) | |
| You decide | Claude가 적절한 색상 조합 선택 | |

**User's choice:** 초록/빨강 (Recommended)

### 상세패널

| Option | Description | Selected |
|--------|-------------|----------|
| Bottom Sheet | 화면 하단에서 올라오는 패널 — 모바일 친화적 | ✓ |
| InfoWindow | 마커 위에 뜨는 말풍선 — 전통적 지도 UI | |
| 풀스크린 모달 | 전체 화면 모달로 상세 표시 | |

**User's choice:** Bottom Sheet (Recommended)

---

## 초기 데이터

### 시드 건물

| Option | Description | Selected |
|--------|-------------|----------|
| 대형 상업시설 | 스타필드 미사, 홈플러스, 이마트 등 | ✓ |
| 카페/음식점 밀집지역 | 미사역 상가 밀집 지역 | ✓ |
| 공공시설 | 미사역, 미사강변공원 등 공원/공공화장실 | ✓ |
| 아파트 단지 내 상가 | 미사강변 아파트 단지 내 상가 시설 | |

**User's choice:** 대형 상업시설, 카페/음식점 밀집지역, 공공시설 (3개 선택)

### 비번 초기값

| Option | Description | Selected |
|--------|-------------|----------|
| 빈 상태 | 좌표만 등록, 비번은 방문 후 입력 | ✓ |
| 아는 것만 입력 | 이미 알고 있는 비번만 미리 입력 | |

**User's choice:** 빈 상태 (Recommended)

---

## 데이터 필드

### 시트 컬럼

| Option | Description | Selected |
|--------|-------------|----------|
| 기본 필드 | id, 건물명, 층, 위치메모, 잠금여부, 비밀번호, 위도, 경도 | ✓ |
| 등록일시 추가 | 등록일, 수정일 컬럼 추가 | ✓ |
| 지역 필드 추가 | 지역명 컬럼 추가 (확장 대비) | ✓ |
| 카테고리 추가 | 상업시설/공공시설/카페 등 분류 컬럼 | ✓ |

**User's choice:** 모두 선택 (기본 + 등록일시 + 지역 + 카테고리)

---

## 배포 설정

### 레포 공개

| Option | Description | Selected |
|--------|-------------|----------|
| Private | GAS URL과 API 키가 코드에 노출되지 않음 | ✓ |
| Public | 무료 GitHub Pages 사용 가능, 단 API 키 노출 위험 | |

**User's choice:** Private (Recommended)

### API 키 관리

| Option | Description | Selected |
|--------|-------------|----------|
| 환경변수 | Vite 환경변수로 관리, .env는 git 제외 | |
| 직접 입력 | 코드에 직접 입력 — private repo라면 문제없음 | ✓ |
| You decide | Claude가 적절한 방식 선택 | |

**User's choice:** 직접 입력

---

## Claude's Discretion

- Vite 설정, 프로젝트 구조, CSS 프레임워크 선택 등 기술적 세부사항

## Deferred Ideas

None
