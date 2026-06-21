import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata = {
  title: 'Maria Kasycheva — AI Automation Specialist',
  description: 'Creating AI-powered workflows and business automation. Operations, process optimization, and intelligent systems.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${mono.variable}`}>
      <body className="antialiased bg-[#0a0a0a] text-[#f5f5f0]">
        <Script id="reset-hero-scroll" strategy="beforeInteractive">
          {`history.scrollRestoration = 'manual'; window.scrollTo(0, 0);`}
        </Script>
        {children}
      </body>
    </html>
  );
}
