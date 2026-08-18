'use client';

import { Inter, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useStore } from '@/hooks/useStore';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-ibm-plex-mono' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useStore();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} font-sans bg-background text-foreground`}>
        <Sidebar />
        <Header />
        <main className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}>
          {children}
        </main>
      </body>
    </html>
  );
}
