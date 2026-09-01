import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Old Age Home Enrollment Form | Merabetta (Vision55 Megacare Pvt Ltd)',
  description: 'Official partner and facility enrollment form for Old Age Homes & Assisted Living Facilities on Merabetta.',
  icons: {
    icon: '/merabetta_logo.svg',
    shortcut: '/merabetta_logo.svg',
    apple: '/merabetta_logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FFF8F3] text-slate-900 selection:bg-[#E86A33] selection:text-white">
        {children}
      </body>
    </html>
  );
}
