import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template:'%s | Planni',
    default:'Planni - 고민 없이 떠나는 우리만의 여행'
  },
  description: "여행 갈 때마다 계획 짜느라 머리 아프셨죠? 이제 '플래니'한테 맡겨주세요. 날씨부터 맛집, 숙소 동선까지 알아서 척척 정리해 드릴게요. 지도 보며 헤매지 말고, 맘 편히 떠나기만 하세요!",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 핀치 줌 방지 (앱 느낌)
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100">
          {/* Header */}
          <Header />
          {/* Main Content */}
          {children}
          {/* Footer */}
          <Footer />
        </div>
      </body>
    </html>
  );
}
