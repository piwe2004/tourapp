{ pkgs, ... }: {
  # IDX 환경 설정
  idx = {
    # VS Code 확장 프로그램 목록
    extensions = [
      "bradlc.vscode-tailwindcss" # Tailwind CSS 인텔리센스 및 구문 강조
      "esbenp.prettier-vscode"    # 코드 포맷팅을 위한 Prettier
    ];
  };
}
