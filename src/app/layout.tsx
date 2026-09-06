import type { Metadata } from 'next';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-mono/400.css';
import './globals.css';
import './education.css';
export const metadata: Metadata = {
  title: 'BEE - Honey Bee Collective Intelligence Laboratory',
  description: 'Run reproducible honey bee foraging experiments. Observe local discovery, waggle-dance recruitment and collective resource allocation. TR / EN.',
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="tr"><body>{children}</body></html>; }
