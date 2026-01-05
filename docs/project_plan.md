# TourApp Service Master Plan (전문가용 기획서)

## 1. 서비스 개요 (Executive Summary)

**TourApp(Planni)**은 현대 여행자들이 겪는 '정보의 과부하(Information Overload)'와 '결정 피로(Decision Fatigue)' 문제를 **Generative AI(Gemini)** 기술로 해결하는 **Intelligent Travel Concierge** 플랫폼입니다.

기존 OTA(Online Travel Agency)가 단순 예약 중개에 집중하는 것과 달리, Planni는 여행의 가장 앞단인 **'탐색 및 계획(Pre-trip Phase)'** 단계를 기술적으로 혁신합니다. 사용자의 모호한 자연어 요구사항("힐링하지만 힙한 느낌")을 **Context-Aware Engine**이 심층 분석하여, 단 3초 만에 **초개인화된 여행 코스(Hyper-personalized Itinerary)**를 제안합니다.

우리의 핵심 경쟁력은 단순한 장소 추천을 넘어, 사용자의 취향, 예산, 이동 효율성을 종합적으로 고려한 **Zero-Effort Planning** 경험을 제공하는 데 있습니다. 이를 통해 사용자는 번거로운 검색과 동선 고민에서 해방되어, 오직 '여행의 즐거움'에만 집중할 수 있습니다.

---

## 2. 문제 정의 및 해결 방안 (Problem & Solution)

### 2.1. 시장의 문제점 (Market Pain Points)

국내 여행 시장은 폭발적으로 성장하고 있지만, 여행자들의 계획 수립 경험(Pre-trip Experience)은 여전히 아날로그 방식과 파편화된 정보 속에 머물러 있습니다.

1.  **정보 비대칭과 채널 파편화의 심화 (Information Overload & Fragmentation)**

    - **채널의 파편화 (Channel Fragmentation)**: 현대의 여행자는 단 하나의 일정을 완성하기 위해 **평균 10개 이상의 이종 채널**(Instagram, Youtube, Naver Blog, OTA, Google Maps 등)을 산발적으로 탐색하며, 교차 검증에만 일주일 평균 **10시간 이상**을 소요하는 비효율을 겪습니다.
    - **신뢰 결핍 (Trust Deficit)**: 플랫폼 내 만연한 뒷광고와 정제되지 않은 바이럴 정보로 인해, 사용자는 정보 습득보다 진위 여부를 판별하는 데 더 막대한 **인지적 비용(Cognitive Cost)**을 지불하고 있습니다.
    - **맥락의 단절 (Context Disconnect)**: 개별 장소에 대한 정보는 넘쳐나지만, "A 카페에서 B 식당으로 이동하는 동선이 효율적인가?"와 같은 **'장소 간의 맥락(Context)'**을 연결해주는 솔루션은 부재합니다.

2.  **선택의 역설 (Decision Paralysis in the Era of Choice)**

    - "맛집을 찾고 싶다"는 니즈는 명확하지만, 수천 개의 검색 결과 앞에서 오히려 선택을 주저하게 되는 **'분석 마비(Analysis Paralysis)'** 현상이 심화되고 있습니다.
    - 사용자의 취향(Vibe)과 상황(Context)을 고려하지 않는 단순 랭킹 순 나열 방식의 추천은 사용자에게 피로감을 가중시킵니다.

3.  **정적 계획의 한계 (The Rigidity of Static Planning)**
    - 기존 여행 앱들은 장소를 '저장'하는 기능에 그칠 뿐, 실제 이동 거리, 영업 시간, 브레이크 타임 등을 고려한 **유기적인 시공간 설계**를 제공하지 못합니다.
    - 날씨 악화나 임시 휴무 등 현지에서의 돌발 변수에 유연하게 대응할 수 있는 **동적 수정(Dynamic Re-planning)** 기능의 부재로 인해, 계획과 현실 사이의 괴리가 발생합니다.

### 2.2. 해결 솔루션: 생성형 AI 여행 컨시어지

Planni는 생성형 AI를 통해 여행 계획의 패러다임을 '검색(Search)'에서 **'제안(Suggestion)'**으로 전환합니다.

1.  **맥락 기반 의도 분석 (Context-Aware Intent Parsing)**

    - LLM(Large Language Model) 기반의 **Zero-Effort Planning**을 구현합니다. "부모님과 함께 가기 좋은, 조용하지만 뷰가 좋은 강릉 카페"와 같은 복합적이고 감성적인 요구사항을 100% 이해하고 구조화된 데이터로 변환합니다.
    - 사용자의 숨겨진 니즈까지 파악하여 단순 검색으로는 찾기 힘든 **Long-tail Travel Spot**을 발굴해 제안합니다.

2.  **초개인화 경로 최적화 (TSP-Based Hyper-Personalized Routing)**

    - 선택된 장소들의 위경도 데이터와 예상 소요 시간을 바탕으로, **TSP(Traveling Salesman Problem)** 알고리즘을 변형 적용하여 최적의 이동 동선을 실시간으로 계산합니다.
    - **Smart Anchoring System**: 사용자가 예약한 숙소를 중심으로 동선을 최적화(Hub & Spoke)하거나, 일몰 시간과 같은 시간적 제약을 고려한 정교한 스케줄링을 제공합니다.

3.  **유동적 일정 관리 (Adaptive 'Liquid' Itinerary)**
    - 확정된 일정은 고정된 것이 아니라, 상황에 따라 물 흐르듯 변화하는 **Liquid Itinerary**입니다.
    - 현지 날씨 데이터를 실시간 API로 수신하여, 우천 시 실내 액티비티를 우선 추천하는 **Contextual Plan-B**를 즉시 제안함으로써 여행의 연속성을 보장합니다.

---

## 3. 서비스 아키텍처 및 기술 스택 (Service Architecture & Tech Stack)

### 3.1. 논리 아키텍처 흐름 (Logical Architecture Flow)

Planni는 별도의 백엔드 인프라 구축 없이 **Next.js Server Actions**와 **Firebase**를 결합한 Serverless 구조로 설계되어, 유지보수 비용을 최소화하면서도 높은 확장성(Scalability)을 보장합니다.

```mermaid
graph TD
    subgraph Client [Client Side]
        UI[User Interface] -->|Prompt Input| Action[Server Action Trigger]
        UI <--|Streaming Response| Action
    end

    subgraph Server [Server Side (Next.js)]
        Action -->|1. Context Analysis| Gemini[Gemini 2.5 AI]
        Action -->|2. Geo-Spatial Query| DB[Firestore]
        Action -->|3. Route Optimization| Algorithm[TSP Logic]
    end

    subgraph Data [Data Layer]
        DB -->|Candidate Places| Action
        Gemini -->|Intent & JSON| Action
    end
```

### 3.2. 핵심 기술 스택 선정 전략

1.  **프론트엔드 및 엣지 컴퓨팅 (Frontend & Edge Computing): Next.js 15 (App Router)**

    - **선정 기준 (Selection Criteria)**: 초기 로딩 속도(FCP) 최적화 및 SEO 성능 극대화.
    - **역할 (Role)**: React Server Components(RSC)를 활용하여 클라이언트 번들 사이즈를 40% 이상 감축, 모바일 환경에서의 사용자 이탈률 방지.

2.  **서버리스 데이터베이스 (Serverless Database): Firebase Firestore**

    - **선정 기준 (Selection Criteria)**: 유연한 NoSQL 스키마 및 실시간 데이터 동기화 기능.
    - **역할 (Role)**: 비정형 여행 데이터(이미지, 리뷰, 태그 등)의 효율적 조회 및 지리적(Geo-hashing) 쿼리 처리를 통한 위치 기반 검색 최적화.

3.  **생성형 AI 코어 (Generative AI Core): Google Gemini 2.5 Flash**

    - **선정 기준 (Selection Criteria)**: 긴 컨텍스트 윈도우(Long Context Window) 처리 능력과 빠른 추론 속도.
    - **역할 (Role)**: 복잡한 자연어 프롬프트를 해석하고, 수십 개의 장소 후보군 중 최적의 경로를 0.5초 이내에 선별하는 **'Route Sorter'** 역할 수행.

4.  **UX 엔지니어링 (UX Engineering): Framer Motion & Tailwind CSS**
    - **선정 기준 (Selection Criteria)**: 개발 생산성(DX)과 사용자 경험(UX)의 균형.
    - **역할 (Role)**: 복잡한 애니메이션 로직을 선언적으로 구현하여, '앱 같은 웹(App-like Web)' 경험을 제공하는 **Glassmorphism Design System** 구축.

---

## 4. 핵심 기능 및 UX 전략 (Key Features & UX Strategy)

### 4.1. 초개인화 AI 큐레이션 (Context-Aware AI Curation)

단순한 데이터 매칭을 넘어, LLM의 추론 능력을 활용해 사용자의 **Latent Needs(잠재적 욕구)**까지 충족하는 심층적 큐레이션을 제공합니다.

- **심층 의미 분석 (Deep Semantic Analysis)**
  - "힙하지만 너무 시끄럽지 않은"과 같은 복합적인 Nuance를 이해합니다. Vector Similarity Search(벡터 유사도 검색)를 통해단순 태그 매칭으로는 불가능한 **'감성적 정확도(Emotional Accuracy)'** 높은 장소를 추천합니다.
- **거점 중심 경로 설계 (Hub & Spoke Routing Logic)**
  - 사용자의 숙소(Basecamp)를 중심으로 일정을 방사형으로 설계하거나, 이동 경로상의 최적 동선(Linearly Optimized)을 구성하여 길 위에서 버리는 시간(Dead Time)을 최소화합니다.

### 4.2. 몰입형 수직 타임라인 (Immersive Vertical Timeline)

정보 전달 중심의 딱딱한 UI에서 벗어나, 여행의 설렘을 시각적으로 극대화하는 **Narrative-driven Interface**를 지향합니다.

- **모바일 최적화 수직 흐름 (Mobile-First Vertical Flow)**
  - 모바일 사용자의 스크롤 습관에 최적화된 수직형 타임라인을 채택하여, 시간의 흐름에 따라 여행 시나리오를 한 편의 영화처럼 감상할 수 있습니다.
- **게이미피케이션 의사결정 (Gamified Decision Making - Tinder Style)**
  - 스와이프(Swipe) 제스처를 도입하여 호불호(Like/Dislike)를 직관적으로 표현하게 함으로써, 계획 수정 과정을 지루한 '노동'이 아닌 즐거운 '게임'으로 승화시켰습니다.
- **감성적 시각 몰입 (Atmospheric Visual Immersion)**
  - High-Resolution 이미지와 Glassmorphism 디자인, 미세한 Parallax Effect를 결합하여 사용자가 앱을 켜는 순간 여행지에 도착한 듯한 **시각적 몰입감**을 선사합니다.

### 4.3. 유연한 일정 관리 시스템 (Agile Schedule Management)

계획의 '완벽함'보다 상황 변화에 대한 '대응력'에 초점을 맞춘 **Resilient Planning System**입니다.

- **문맥 기반 대체 추천 (Contextual Alternatives Recommendation)**
  - 단순히 '가까운 장소'를 추천하는 것이 아니라, 사용자가 원래 가려던 장소의 카테고리, 가격대, 분위기(Vibe)를 분석하여 가장 유사한 경험을 제공하는 **'동급의 대체재'**를 제안합니다.
- **반응형 상태 동기화 (Reactive State Synchronization)**
  - 사용자가 일정 아이템을 드래그 앤 드롭으로 재배치(Reorder)하는 즉시, 백그라운드에서 전체 이동 시간과 거리, 예상 도착 시간이 실시간으로 재계산(Re-calculation)되어 UI에 반영됩니다.

---

## 5. 비즈니스 모델 및 로드맵 (Business Model & Roadmap)

### 5.1. 타겟 오디언스 및 페르소나 전략

단순한 인구통계학적 정의를 넘어, 여행 성향(Travel Psychographics)에 기반한 정밀 타겟팅을 실시합니다.

- **Primary Persona: 시간 빈곤형 완벽주의자 (The Time-Poor Perfectionist)**
  - **인구통계 (Demographics)**: 25~39세 직장인, 수도권 거주.
  - **페인 포인트 (Pain Point)**: 검색할 시간은 없지만, 남들에게 자랑할 만한 '실패 없는 여행'을 원함.
  - **가치 제안 (Value Prop)**: "점심시간 10분 투자로 완벽한 주말 여행 계획 확보."
- **Secondary Persona: 로컬 지향 탐험가 (The Hyper-Local Seeker)**
  - **인구통계 (Demographics)**: Z세대 대학생 및 사회초년생.
  - **페인 포인트 (Pain Point)**: 뻔한 관광지는 거부하며, 현지인만 아는 '숨겨진 보석(Hidden Gem)'을 찾고 싶어함.
  - **가치 제안 (Value Prop)**: Gemini의 Long-tail 데이터 분석을 통한 희소성 있는 장소 큐레이션.

### 5.2. 단계별 로드맵 및 시장 진입 전략 (GTM)

- **Phase 1: MVP 출시 및 시장 적합성 검증 (Product-Market Fit)**

  - **핵심 기능 (Core Feature)**: AI 코스 생성 엔진(v1.0), 지도 연동 타임라인, 기본 일정 편집.
  - **핵심 지표 (Key Metrics - KPI)**: 초기 사용자 유지율(Retention Rate D-7) 20% 달성, 코스 생성 완료율(Completion Rate).
  - **전략 (Strategy)**: 여행 커뮤니티(네이버 카페, 오픈카톡) 중심의 바이럴 마케팅 및 얼라인 어답터 확보.

- **Phase 2: 소셜 확장 및 데이터 선순환 (Social Expansion & Data Flywheel)**

  - **핵심 기능 (Core Feature)**: 유저 간 코스 공유(Social Sharing), '함께 짜기' 기능, 인스타그램 스토리 연동.
  - **핵심 지표 (Key Metrics - KPI)**: MAU(월간 활성 사용자) 1만 명, 유저 생성 코스(UGC) 데이터 5,000건 확보.
  - **전략 (Strategy)**: 유저 큐레이션 콘테스트 개최 및 '여행 성향 테스트'와 같은 인게이지먼트형 콘텐츠 배포.

- **Phase 3: 수익화 및 생태계 구축 (Monetization & Ecosystem)**
  - **핵심 기능 (Core Feature)**: 숙소/액티비티 실시간 가격 비교 및 예약(OTA Integration), 로컬 비즈니스 광고 플랫폼.
  - **수익 모델 (Revenue Model)**:
    1.  **중개 수수료 (Affiliate Commission)**: 호텔/액티비티 예약 건당 수수료(5~10%).
    2.  **추천 광고 (Sponsored Places)**: 사용자 맥락에 맞는 자연스러운 '추천 광고(Native Ad)'.
  - **전략 (Strategy)**: 야놀자, 여기어때 등 주요 OTA와의 API 파트너십 체결.
