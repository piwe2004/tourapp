# Planni Design System Guide

이 문서는 `Planni` 프로젝트의 디자인 시스템 가이드입니다. `Design System Guide/src` 폴더 내의 소스 코드(`FigmaGuide`, `InteractionStates`, `ComponentSpecs`)를 분석하여 작성되었습니다.

## 1. Color Palette (색상 시스템)

**Primary & Secondary**

- **Primary (Indigo)**: 스마트함과 신뢰를 상징
  - Main: `#4338CA` ($primary, indigo-700) - CTA 버튼, 브랜드 컬러
  - Hover: `#3730A3` ($primary-hover, indigo-800) - 버튼 호버 상태
  - Tint: `#E0E7FF` ($primary-tint, indigo-100) - 배경 강조, 하이라이트
- **Secondary (Orange)**: 친근함과 활력을 상징
  - Main: `#FF5722` ($secondary) - 포인트, 알림 뱃지, 강조 아이콘
  - Hover: `#F4511E`

**Neutrals (Slate Scale)**

- Title: `#0F172A` ($slate-900) - 제목, 강조 텍스트
- Body: `#334155` ($slate-700) - 본문 텍스트
- Icon/Caption: `#64748B` ($slate-500) - 아이콘, 설명 텍스트
- Border: `#E2E8F0` ($slate-200) - 테두리, 구분선
- Page BG: `#F8FAFC` ($slate-50) - 페이지 배경
- Surface: `#FFFFFF` ($white) - 카드, 모달 배경

**Semantic (Alert)**

- Text: `#D32F2F` ($alert) - 경고 문구
- Background: `#FFEBEE` ($alert-bg) - 에러 메시지 배경

---

## 2. Typography (타이포그래피)

**Font Family**: Pretendard ("Pretendard", "Noto Sans KR", sans-serif)

| Style Name  | Size (px) |    Weight     | Line Height | Usage                     |
| :---------: | :-------: | :-----------: | :---------: | :------------------------ |
| **Display** |   48~60   |  Black (900)  |    110%     | 메인 슬로건, Hero Section |
|   **H1**    |    24     |  Bold (700)   |    130%     | 페이지 제목               |
|   **H2**    |    20     |  Bold (700)   |    140%     | 섹션 타이틀               |
|   **H3**    |    18     |  Bold (700)   |    140%     | 카드 제목, 장소명         |
| **Body 1**  |    16     | Medium (500)  |    150%     | 본문, 버튼, Input         |
| **Body 2**  |    14     | Regular (400) |    150%     | 설명글, 메타 정보         |
| **Caption** |    12     | Medium (500)  |    120%     | 태그, 날짜, 라벨          |

---

## 3. Spacing & Radius (간격 및 곡률)

**Spacing Scale**

- Base Unit: **4px (0.25rem)**
- 모든 간격은 **8px** 배수를 권장합니다. (8, 16, 24, 32, 40, 48...)
- Mobile Margin: 좌우 **24px**

**Corner Radius**

- **Large (32px)**: 메인 비주얼, 큰 컨테이너
- **Medium (24px)**: 장소 카드, 바텀 시트, 모달
- **Small (12px)**: 일반 버튼, Input 필드(Box형)
- **Pill (9999px)**: 검색창, 태그, 뱃지, FAB

**Shadows**

- Card Shadow: `0 4px 20px rgba(0, 0, 0, 0.06)`
- Drop Shadow (Large): `0 8px 30px rgba(0, 0, 0, 0.08)`

---

## 4. Components (컴포넌트 스펙)

### Buttons

- **Height**: 48px ~ 56px (모바일 터치 타겟 고려)
- **Padding**: Horizontal 32px, Vertical 16px
- **Gap**: 8px (Icon + Text)
- **Primary**: Background `#4338CA`, Text `#FFFFFF`, Radius 12px/Pill
- **Secondary**: Background `#FF5722`, Text `#FFFFFF`

### Input Fields

- **Height**: 56px (Search), 48px (General)
- **Border**:
  - Default: `2px solid #E2E8F0`
  - Focus: `2px solid #4338CA` + Ring (`rgba(67, 56, 202, 0.25)`)
- **Radius**: Pill Shape (9999px) 권장 (특히 검색창)

### Cards (Place Card)

- **Background**: `#FFFFFF`
- **Radius**: 24px
- **Padding**: 20px
- **Thumbnail**: 4:3 비율 권장
- **Shadow**: `0 4px 20px rgba(0, 0, 0, 0.06)`

---

## 5. Interaction States (상호작용)

### Loading State

- **Skeleton UI**:
  - Color: `#F1F5F9` (Slate-100)
  - Animation: Pulse (2s Infinite)
  - Opacity: 40% ↔ 100%
- **Spinner**:
  - Icon: `Loader2` (Lucide React)
  - Color: Primary (`#4338CA`)
  - Animation: Spin (1s Linear)

### Empty / Error State

- **Illustration**: 부드러운 라인 일러스트 (파스텔 톤)
- **Message Tone**: 친근하고 격려하는 말투 ("~해보세요", "~할 수 있어요")
- **Action**: "다시 시도" (Primary Button), "홈으로" (Outline Button)
