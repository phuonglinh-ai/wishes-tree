import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cây Lời Chúc — Tạm biệt tiểu học, chào hành trình mới',
  description:
    'Mỗi chiếc lá là một lời yêu thương gửi tới các con trong ngày khép lại những năm tháng tiểu học.',
  keywords: ['lời chúc', 'tốt nghiệp tiểu học', 'lưu bút', 'cây lời chúc'],
  openGraph: {
    title: 'Cây Lời Chúc',
    description: 'Tạm biệt tiểu học, chào hành trình mới',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
