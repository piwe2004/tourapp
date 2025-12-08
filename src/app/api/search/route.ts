
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ items: [] });
  }

  const clientId = process.env.NAVER_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET || process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET;

  // API 키가 없는 경우 빈 결과 반환 (또는 에러 처리)
  if (!clientId || !clientSecret) {
    console.warn('Naver API credentials not found.');
    return NextResponse.json({ items: [], error: 'Configuration missing' });
  }

  try {
    const apiURL = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&start=1&sort=random`;
    
    const response = await fetch(apiURL, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
        if (response.status === 403) {
             console.error('Naver API 403 Forbidden');
        }
        return NextResponse.json({ items: [], error: `API Error: ${response.status}` });
    }

    const data = await response.json();
    
    // HTML 태그 제거 처리
    const cleanedItems = data.items.map((item: any) => ({
      ...item,
      title: item.title.replace(/<[^>]+>/g, ''), // <b> 태그 등 제거
    }));

    return NextResponse.json({ items: cleanedItems });

  } catch (error) {
    console.error('Naver Search API Error:', error);
    return NextResponse.json({ items: [], error: 'Internal Server Error' });
  }
}
