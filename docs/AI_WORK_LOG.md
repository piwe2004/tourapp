# AI 협업 기록 (AI Work Log)

이 파일은 기기 간 작업 문맥 공유 및 주요 의사결정 사항을 기록하는 공간입니다.

## 2026-01-05

### 📝 작업 요약 (Work Summary)

- **문서 고도화**: `process_definition.md`의 기술적 깊이 보강 (Input Sanitization, Hybrid Query, Gemini Persona, Streaming UI 등 상세화).
- **데이터 명세**: Firebase Document 및 Gemini JSON I/O 스키마 정의 (`docs/process_definition.md` 6. 데이터 인터페이스 명세).
- **시스템 로깅**: `actions.ts`, `placeService.ts` 등에 `[Firebase Debug]` 로그 삽입하여 디버깅 가시성 확보.
- **협업 환경**: Git 기반 문맥 공유를 위한 `AI_WORK_LOG.md` 생성.

## 2026-01-06

### 🗣️ 기술/아키텍처 Q&A (Technical Q&A)

사용자와 나눈 핵심 아키텍처 논의 내용입니다.

**Q1. "우리가 기획한 건 AI가 Firebase에서 장소를 가져오는 건데, 지금 AI가 Firebase에 접근 불가능한 거잖아?"**

> **A1.** 네, 맞습니다. AI(Gemini)는 외부 데이터베이스에 직접 접속할 수 있는 권한이나 기능이 없습니다.
>
> 그래서 우리는 **RAG (검색 증강 생성)** 패턴을 사용합니다.
>
> 1.  **서버(Server)**가 먼저 Firebase에서 사용자 조건에 맞는 장소들을 조회(Fetch)합니다.
> 2.  서버가 이 데이터를 **JSON 텍스트 포맷**으로 변환하여, 프롬프트에 '참고 자료'로 넣어줍니다 (**Context Injection**).
> 3.  AI는 이 텍스트로 된 후보군 목록 안에서만 최적의 경로를 선택(Selection)하여 반환합니다.
>
> 즉, **"서버가 중간 다리 역할을 하여 DB 데이터를 텍스트로 변환해 AI에게 먹여주는 구조"**입니다. 이렇게 하면 AI가 없는 장소를 지어내는 환각(Hallucination) 현상도 막을 수 있습니다.

**Q2. "그럼 AI가 접근 가능한 방법이 뭐가 있어? JSON으로 전부 만들면 좋아? 아니면 스프레드시트? 엑셀?"**

> **A2.** AI는 오직 **'텍스트(글자)'**만 이해할 수 있습니다. Firebase든 엑셀이든 결국 텍스트로 변환해서 AI에게 보여줘야 합니다.
>
> **방식 비교:**
>
> - **Firebase (Current)**: 서버가 필요한 정보만 쏙 뽑아서 컴팩트한 JSON 텍스트로 변환합니다. **(실시간 앱 서비스에 최적 ⭐⭐⭐⭐⭐)**
> - **JSON 파일/엑셀**: 파일 전체 내용을 텍스트로 변환해야 합니다. 데이터가 수천 개만 넘어가도 용량이 너무 커져서 AI에게 전송 자체가 불가능하거나 비용이 폭발합니다. (소규모 분석용)
>
> **결론**: 앱 서비스를 위해서는, **데이터는 Firebase에 체계적으로 저장하고, 서버가 그때그때 필요한 만큼만 텍스트로 변환해서 AI에게 전달하는 방식**이 가장 효율적이고 확장성 있는 방법입니다.

**Q3. "만약 우리 프로젝트 폴더 안에 엑셀(.xlsx)이나 CSV 파일이 있다면 AI가 읽을 수 있어?"**

> **A3.** 파일이 프로젝트 안에 있어도 AI가 저절로 읽지는 못합니다. **여전히 '서버'가 파일을 열어서 텍스트로 바꿔줘야 합니다.**
>
> **처리 과정:**
>
> 1.  서버 코드(Next.js)가 `fs`(파일 시스템) 모듈로 엑셀 파일을 읽습니다.
> 2.  라이브러리(csv-parser 등)를 써서 데이터를 JSON 데이터로 바꿉니다.
> 3.  이 데이터를 텍스트로 바꿔서 AI에게 보냅니다. (결국 Firebase 방식과 2, 3번은 똑같습니다)
>
> **언제 쓰는가? (추천 전략)**
>
> - **서비스용 ❌**: 매번 파일을 읽고 파싱하면 속도가 느리고, 데이터 수정 시마다 재배포해야 해서 비효율적입니다.
> - **초기 데이터 구축용(Seeding) ✅**: 가지고 계신 엑셀 데이터를 **"한 번에 Firebase에 업로드할 때"** 사용하는 것이 가장 좋습니다. **(Excel ➡ Server ➡ Firebase 저장)**

**Q4. "그럼 우리가 필요한 정보는 지역, 누구랑 여행인지, 테마.. 이 정도야?"**

> **A4.** 말씀하신 3가지도 필수적이지만, **하나가 더 반드시 필요합니다.** 바로 **'일정(언제, 며칠간)'** 입니다.
>
> **필수 입력 4요소 (Input Context):**
>
> 1.  **Where (지역)**: "제주", "부산" (DB 검색의 기준)
> 2.  **Who (동행)**: "아이와 함께", "부모님과", "커플" (장소 필터링 및 숙소 추천 기준)
> 3.  **What (테마)**: "힐링", "맛집", "액티비티" (키워드 매핑 및 우선순위 기준)
> 4.  **When (일정)**: "1박 2일", "3박 4일" (몇 개의 장소를 뽑고, 숙소를 몇 개 잡을지 결정하는 핵심 기준)
>
> 이 4가지가 모여야 완벽한 **`TravelContext`**가 완성되고, AI가 알맞은 코스를 짤 수 있습니다.

**Q5. "그런데 중요한 한 가지 더, 우리는 날씨도 보잖아? 그건 어쩌지?"**

> **A5.** 날씨는 입력값(Input)이라기보다 **조건(Condition)이자 제약사항**으로 작용합니다.
>
> **처리 메커니즘:**
>
> 1.  **조회**: 사용자가 입력한 **'When(일정)'** 정보를 바탕으로 서버가 기상청 API를 조회합니다.
> 2.  **주입 (Injection)**: 만약 비 소식이 있다면, 프롬프트에 `[Weather Condition: Day 2 - RAIN]` 같은 꼬리표를 붙여서 보냅니다.
> 3.  **반영**: AI는 "비가 오면 실내(Indoor) 장소를 우선하라"는 지침에 따라, Day 2 후보군에서 박물관이나 카페 비중을 높여서 경로를 짭니다.
>
> 즉, 날씨는 장소를 검색하는 기준은 아니지만, **선택된 장소를 걸러내거나 우선순위를 바꾸는 '필터(Filter)' 역할**을 합니다.

**Q6. "그럼 Firebase에 어떤 필드가 있으면 좋아? 우리가 검색해서 가져오는 용도로."**

> **A6.** 검색 속도와 정확도를 위해 다음 필드들은 **반드시** 구분해서 가지고 있는 것이 좋습니다.
>
> **① 검색/필터링용 (Indexing Field)**
>
> - `ADDRESS` (String): "제주", "서귀포" 지역 필터링의 핵심.
> - `CATEGORY` (Map): `{ main: "카페", sub: "오션뷰" }` 기본 분류.
> - `KEYWORDS` (Array): `["#힐링", "#아이와", "#실내"]` 검색용 태그 모음. (여기에 매핑된 키워드가 들어갑니다)
> - `IS_INDOOR` (Boolean): 날씨 대응을 위한 **실내/실외 여부** (필수 권장).
> - `RATING` (Number): 1차 정렬 기준.
>
> **② AI 판단용 (Context Field)**
>
> - `STAY_TIME` (Number): 체류 시간(분). AI가 동선 짤 때 시간 계산용.
> - `OPEN_TIME` / `CLOSE_TIME`: 영업 시간. AI가 아침/밤 일정을 배치할 때 참고.
>
> **핵심 팁**: 특히 `KEYWORDS` 배열에 "아이와가기좋은", "부모님과" 같은 **대상(Target)** 키워드와, "비오는날" 같은 **상황(Situation)** 키워드를 미리 넣어두면 검색 구현이 100배 쉬워집니다.

**Q7. "그럼 내가 검색용 필드를 하나 만들어 놓을게 'ONLY_SEARCH'. 이걸로 Firebase에서 가져올 수 있겠지? 동반자도 배열로 해서 줄게. 근데 이건 순위가 아니야."**

```javascript
ONLY_SEARCH: {
  area: "지역명",
  member: ["아이", "부모님"], // 순서 무관 (단순 포함 여부)
  type: ["힐링", "맛집", ...] // 순서 중요! (0번 인덱스 = 가장 잘 어울리는 메인 테마)
}
```

> **A7.** **아주 훌륭한 전략입니다! (Strongly Recommended)** 👍
>
> Firestore에서는 `ONLY_SEARCH.area` 처럼 **점(.) 표기법**으로 객체 내부 필드를 검색할 수 있습니다.
>
> **필드별 특징:**
>
> - **member (동반자)**: 순서가 중요하지 않은 배열입니다. `array-contains`로 "아이"가 있는지만 확인하면 됩니다.
> - **type (테마)**: **'적합도 순위'**로 활용합니다. 0번 인덱스가 메인 테마이므로 AI가 가중치를 둘 수 있습니다.
>
> **활용 방법:**
>
> 1.  **검색(Filtering)**: `array-contains`로 "힐링"이 포함된 모든 장소를 찾습니다.
> 2.  **가중치(Weighting)**: AI에게 데이터를 줄 때, `type[0]`(1순위 테마)이 "힐링"인 장소에 더 높은 점수를 주라고 할 수 있습니다.
>
> **코드 적용 예시:**
>
> ```typescript
> where("ONLY_SEARCH.area", "==", "제주");
> where("ONLY_SEARCH.type", "array-contains", "힐링");
> ```
>
> 이렇게 하면 관리도 쉽고, 나중에 "이 장소의 메인 테마가 뭐야?"라고 물었을 때 `type[0]`만 보면 되니 아주 효율적입니다.

### 다음 목표 (Next Steps)

- [ ] `process_definition.md`의 다이어그램에 "Server feeds Data to AI" 흐름 보강.
- [ ] `placeService.ts`에 키워드 매핑(Theme -> Keywords) 상세 로직 구현.

## 2026-01-14

### 🚀 기능 구현: 고급 AI 검색 및 경로 최적화 (Advanced AI Search & Routing)

자연어 쿼리를 정밀하게 분석하여 사용자 의도에 맞는 장소를 검색하고, 현실적인 여행 경로를 생성하는 핵심 로직을 완성했습니다.

#### 1. 5-Priority Search Logic 구현

사용자 입력(예: "제주도 아이와 힐링 여행")을 Gemini가 5가지 요소로 파싱하고 우선순위별로 데이터를 필터링합니다.

- **[1순위] Region**: `ADDRESS` 기반 1차 필터링 (DB Query).
- **[2순위] District**: AI가 여행 컨셉에 맞는 **세부 지역(구/군)을 2~3개 추천**하여 가산점(+50) 부여.
- **[3순위] People**: `MEMBER` 필드 매칭 (예: 아이, 부모님) -> 가산점(+30).
- **[4순위] Purpose**: `STYLES` 필드 매칭 (예: 힐링, 맛집) -> 가산점(+20).
- **[5순위] Schedule**: 일정에 맞춰 상위 장소 선별.

#### 2. 카테고리별 쿼터제 (Category Quotas)

특정 카테고리에 편중되지 않도록 후보군을 골고루 수집합니다.

- **식당**: Top 30
- **숙소**: Top 20
- **관광지**: Top 20
- **카페**: Top 20
- **Total**: 약 90개의 고품질 후보군을 AI에게 전달.

#### 3. 경로 생성 로직 고도화 (Routing Constraints)

- **체크인 앵커링**: 숙소는 하루의 마지막이 아닌, **오후 3~4시(15:00~16:00)** 체크인 및 휴식 시간으로 배치.
- **지리적 최적화**:
  - **관광 도시(제주/부산 등)**: 숙소 주변의 장소를 우선 선택 (동선 최소화).
  - **일반 도시**: 거리가 멀어도 평점이 높은 '인기 명소' 우선 선택.

**변경 파일:**

- `src/lib/actions.ts`: `extractTravelContext` 완전 개편.
- `src/types/places.ts`: `MEMBER`, `STYLES` 필드 추가.

## 2026-01-15

### 🧠 여행 의도 분석 로직 강화 (Travel Intent Anlaysis)

사용자의 다양한 입력 패턴(단순 장소 검색 vs 전체 일정 요청)을 정교하게 구분하고, 이에 맞춰 데이터를 다르게 수집하도록 로직을 개선했습니다.

**작업 내용:**

1.  **Trip Type 구분 로직 추가**:
    - `FULL_COURSE`: "1박2일", "3일간", "당일치기" 등 **기간(Duration)**과 관련된 표현이 있으면 무조건 전체 코스 생성 모드로 진입합니다. (숙소, 식당 필수 포함)
    - `SPOT_SEARCH`: 기간 언급 없이 "제주도 카페", "맛집 추천" 등의 쿼리는 단순 장소 검색 모드로 진입합니다.

2.  **동적 쿼터(Dynamic Quota) 시스템**:
    - `SPOT_SEARCH` 모드에서는 사용자가 요청한 메인 카테고리(예: 카페)의 후보군을 **30~50개**까지 대폭 늘려 다양성을 확보합니다. (기존엔 20개 고정)

**변경 파일:**

- `src/lib/actions.ts`: `extractTravelContext` 프롬프트 및 할당 로직 전면 수정.

**비고:**

- "3일 여행" 처럼 "박" 표현이 없어도 AI가 문맥을 파악하여 2박3일 코스로 변환하도록 개선됨.

### 🎨 장소 리스트 UI (Spot Search UI) 구현

일정 생성 없이 단순 장소 추천을 원할 때 보여줄 전용 UI(`PlannerPlaceList`)를 구현하고, 백엔드 로직과 연동했습니다.

**작업 내용:**

1.  **Spot Search 로직 연결**: `src/lib/actions.ts`에서 `SPOT_SEARCH` 모드일 경우 Gemini 경로 생성을 건너뛰고, 키워드 매칭된 후보 장소(Candidates)를 즉시 반환하도록 변경 (응답 속도 2배 이상 향상).
2.  **PlannerPlaceList 컴포넌트 신설**:
    - Timeline 대신 좌측 패널에 표시되는 장소 리스트 뷰.
    - [전체 | 맛집 | 카페 | 숙소 | 관광] 탭 필터링 제공.
3.  **Map 연동 최적화**:
    - Spot Search 모드에서는 경로 연결선(Polyline)을 숨기고(`showPath=false`), 마커만 표시하여 산만함 제거.
    - 리스트 아이템 클릭 시 지도 하이라이트/이동 연동.
4.  **Planner 페이지 구조 개편**:
    - `PlannerView`에서 `travelContext.tripType`에 따라 본문 UI 조건부 렌더링.

**변경 파일:**

- `src/app/(pages)/planner/page.tsx`: UI 분기 처리 및 컴포넌트 통합.
- `src/components/planner/PlannerPlaceList.tsx`: 신규 생성.
- `src/components/planner/Map.tsx` / `PlannerMapPanel.tsx`: `showPath` prop 추가.
- `src/lib/actions.ts`: `SPOT_SEARCH` Early Return 로직 추가.

### 🚗 실시간 경로 안내 (Directions 5 Integration)

장소 간 단순 직선 연결이 아닌, **실제 도로 기준의 주행 경로(Driving Route)**를 네이버 지도에 시각화했습니다.

**작업 내용:**

1.  **API Proxy 구축**:
    - `src/app/api/directions/route.ts` API Route 생성.
    - 서버 사이드에서 `X-NCP-APIGW-API-KEY-ID` 등의 보안 헤더를 처리하여 브라우저 CORS 문제 및 키 노출 방지.
2.  **Frontend Service**:
    - `directionService.ts`: `traoptimal`(실시간 빠른길) 옵션으로 경로 데이터를 받아와 `naver.maps.LatLng` 배열로 변환.
3.  **Map 컴포넌트 고도화**:
    - `Map.tsx`: `showPath`가 켜져 있고 장소가 2개 이상일 때, 비동기로 경로를 조회하여 Polyline 렌더링.
    - API 쿼터 보호 및 성능을 위해 7개 이하 장소일 때만 호출 (초과 시 직선 Fallback).

**변경 파일:**

- `src/app/api/directions/route.ts`: API Proxy [New].
- `src/services/directionService.ts`: Fetcher Service [New].
- `src/components/planner/Map.tsx`: Polyline 로직 전면 수정.

## 2026-02-16

### 태블릿 홈 디자인 통합 (Tablet Home Design Integration)

사용자가 제공한 태블릿 디자인을 홈 페이지에 직접 통합했습니다. 별도 컴포넌트 파일로 분리하지 않고 단일 페이지 파일에 모든 UI 로직을 작성하여 코드 구조를 단순화했습니다.

**작업 내용:**

1. **페이지 구조 전면 개편**:
   - 기존의 HeroSection, TravelCategories, PopularDestinations 컴포넌트 제거
   - 태블릿 전용 전체 화면 레이아웃으로 교체

2. **UI 구성 요소** (모두 page.tsx 내부에 직접 작성):
   - **Sidebar Navigation**: 왼쪽 고정 사이드바, 로고 + 네비게이션 메뉴(홈/저장/여행) + 프로필 이미지
   - **Hero Section**: 배경 이미지 + 그라데이션 오버레이, AI Discovery 배지, 메인 타이틀 ("당신의 취향에 딱 맞는 최적의 장소를 찾아보세요")
   - **Search Hub**: AI 검색 입력창, 트렌딩 검색어 칩(데이트 맛집, 감성 카페 등), 동행자 선택 카드(혼자/연인과/친구와/가족과), 추천 장소 리스트
   - **PlaceCard**: 내부 함수 컴포넌트로 정의하여 장소 카드 렌더링 (이미지, 평점, 제목, 위치, 태그)

3. **상태 관리**:
   - `activePage`: 현재 선택된 네비게이션 메뉴
   - `searchQuery`: 검색어 입력값
   - `selectedCompanion`: 선택된 동행자 타입

4. **반응형 대응**:
   - Hero Section은 lg 브레이크포인트 이상에서만 표시 (`hidden lg:flex`)
   - 모바일에서는 Search Hub만 전체 화면으로 표시

**변경 파일:**

- `src/app/(pages)/(home)/page.tsx`: 전체 코드 재작성 (487B → 약 25KB)

**다음 계획:**

- 잘못 생성된 `tablet-home` 디렉토리 정리 필요 (src/app/(pages)/tablet-home, src/app/tablet-home)
- 실제 Firebase 데이터와 연동하여 추천 장소 동적으로 표시
- 검색 기능 구현 (현재는 console.log만 출력)

**비고:**

- Material Icons Round 폰트가 이미 로드되어 있어 별도 설정 불필요
- Tailwind 커스텀 색상(primary-tablet, background-tablet-light)이 이미 설정되어 있음
