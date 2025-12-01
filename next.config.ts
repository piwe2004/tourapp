import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', 
        'localhost:3001',
        // 아래 주소는 회원님의 Codespaces 주소 패턴입니다.
        'cuddly-system-rrvp5qgvw5qcqpr-3001.app.github.dev', 
        // 혹은 모든 github.dev 서브도메인을 허용하려면 아래처럼 (버전에 따라 다를 수 있음)
        '*.app.github.dev', 
        '*.github.dev'
      ],
    },
  },
};


export default nextConfig;
