const fs = require("fs");
const path = require("path");

const logPath = path.join(__dirname, "AI_WORK_LOG.md");

try {
  let content = fs.readFileSync(logPath, "utf8");

  const newLog = `
### [2026-02-21] 장소 상세보기 스플릿 뷰 화면 전환
- **작업 내용:** 장소 상세보기 디자인(Figma)을 바탕으로 좌측 이미지 슬라이더, 우측 장소 상세 정보(AI 분석 포함) 영역을 나눈 스플릿 뷰 형태의 신규 페이지(\`src/app/(pages)/place-detail/page.tsx\`) 추가.
- **변경 파일:** src/app/(pages)/place-detail/page.tsx (신규)
- **다음 계획:** 실제 Firebase 데이터 구조를 각각의 UI 컴포넌트(검색 화면 \& 상세 화면)와 매핑하는 실데이터 연동 작업.
- **비고:** TailwindCSS 기반 고정 하단 액션바 설계 적용 및 아이콘 최적화.`;

  fs.writeFileSync(logPath, content.trim() + "\n" + newLog, "utf8");
} catch (e) {
  console.error("Error writing log:", e);
}
