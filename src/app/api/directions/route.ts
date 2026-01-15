import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const goal = searchParams.get('goal');
  const waypoints = searchParams.get('waypoints');

  if (!start || !goal) {
    return NextResponse.json({ error: 'Missing start or goal parameters' }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // 개발 환경에서 키가 없을 때를 대비한 모의 응답 (선택 사항)
    console.error('Naver Map Client ID or Secret is missing.');
    return NextResponse.json({ error: 'Server configuration error: Missing API keys' }, { status: 500 });
  }

  // Naver Directions 5 API URL
  const baseUrl = 'https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving';
  
  // 쿼리 파라미터 구성
  const queryParams = new URLSearchParams({
    start,
    goal,
    option: 'traoptimal', // 실시간 빠른길
  });

  if (waypoints) {
    queryParams.append('waypoints', waypoints);
  }

  try {
    const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'X-NCP-APIGW-API-KEY-ID': clientId,
        'X-NCP-APIGW-API-KEY': clientSecret,
      },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Naver API Error: ${response.status} - ${errorText}`);
        return NextResponse.json({ error: `Naver API Error: ${response.status}`, details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Failed to fetch directions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
