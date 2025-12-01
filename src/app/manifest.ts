import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Planni - 고민 없이 떠나는 우리만의 여행',
    short_name: 'Planni',
    description: '여행 갈 때마다 계획 짜느라 머리 아프셨죠? 이제 "플래니"한테 맡겨주세요. 날씨부터 맛집, 숙소 동선까지 알아서 척척 정리해 드릴게요. 지도 보며 헤매지 말고, 맘 편히 떠나기만 하세요!',
    start_url: '/',
    display: 'standalone', // 브라우저 주소창 제거 (앱처럼 보임)
    background_color: '#ffffff',
    theme_color: '#4f46e5', // Indigo-600 색상
    icons: [
      {
        src: '/icon.jpg', // public 폴더에 이미지 필요
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.jpg',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
