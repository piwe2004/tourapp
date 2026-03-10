const fs = require("fs");
const path = require("path");

const logPath = path.join(__dirname, "AI_WORK_LOG.md");

try {
  let content = fs.readFileSync(logPath, "utf8");

  // Remove lines about 'PlaceDiscovery' added today if any
  const regex =
    /\n### \[2026-02-21\] 장소 검색 화면\(PlaceDiscovery\).*?연동 필요"/gs;
  content = content.replace(regex, "");

  const newLog = `
### [2026-02-21] 장소 검색 페이지 신규 생성
- **작업 내용:** 홈 화면을 변경하지 않고, 장소 검색 화면("어디로 가고 싶으세요?" 리뷰된 레이아웃)을 \`src/app/(pages)/place-search/page.tsx\` 라는 새로운 별도 페이지로 구현함
- **변경 파일:** src/app/(pages)/place-search/page.tsx (신규)
- **다음 계획:** 장소 상세보기 스플릿 뷰(Split View) UI 레이아웃 모달/페이지 설계 및 구현 (node-id: 81-82)
- **비고:** 임의의 Mock 데이터(성산일출봉 등)로 구현, 추후 Firebase 연동 예정`;

  fs.writeFileSync(logPath, content.trim() + "\n" + newLog, "utf8");
} catch (e) {
  console.error("Error writing log:", e);
}
