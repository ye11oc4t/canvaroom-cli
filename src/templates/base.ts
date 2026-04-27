// Auto-generated template strings for canvaroom init

export const TYPES_TS = `export interface Presenter {
  name: string;
  title: string;
  bio: string;
  linkedin: string;
  github: string;
  twitter: string;
  website: string;
  avatarInitials: string;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
}

export interface Link {
  id: string;
  label: string;
  url: string;
}

export interface PresentationData {
  title: string;
  canvaUrl: string;
  slidoUrl: string;
  presenter: Presenter;
  chapters: Chapter[];
  links: Link[];
}

export const defaultData: PresentationData = {
  title: '',
  canvaUrl: '',
  slidoUrl: '',
  presenter: {
    name: '', title: '', bio: '',
    linkedin: '', github: '', twitter: '', website: '',
    avatarInitials: '',
  },
  chapters: [],
  links: [],
};`;

export const UTILS_TS = `import { PresentationData } from './types';

export function encodeData(data: PresentationData): string {
  const json = JSON.stringify(data);
  const encoded = btoa(encodeURIComponent(json));
  return encoded;
}

export function decodeData(encoded: string): PresentationData | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as PresentationData;
  } catch {
    return null;
  }
}

export function buildViewUrl(data: PresentationData): string {
  const encoded = encodeData(data);
  if (typeof window !== 'undefined') {
    return \`\${window.location.origin}/view?d=\${encoded}\`;
  }
  return \`/view?d=\${encoded}\`;
}

export function toCanvaEmbed(url: string): string {
  if (!url) return '';
  if (url.includes('view?embed')) return url;
  if (url.includes('/view')) return url.split('?')[0] + '?embed';
  const m = url.match(/canva\\.com\\/design\\/([^/]+)\\/([^/]+)/);
  if (m) return \`https://www.canva.com/design/\${m[1]}/\${m[2]}/view?embed\`;
  return url;
}

export function getLinkIcon(url: string): string {
  if (url.includes('github')) return 'GH';
  if (url.includes('notion')) return 'No';
  if (url.includes('figma')) return 'Fi';
  if (url.includes('youtube') || url.includes('youtu.be')) return 'YT';
  if (url.includes('canva')) return 'CV';
  if (url.includes('docs.google')) return 'GD';
  try { return new URL(url).hostname.charAt(0).toUpperCase(); } catch { return '?'; }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}`;

export const GLOBALS_CSS = `@import "tailwindcss";

:root {
  --red: #ea3323;
  --blue: #4285f4;
  --yellow: #fbbc04;
  --green: #34a853;
  --border: #e8e8e8;
  --text: #111111;
  --text-secondary: #777777;
  --text-hint: #aaaaaa;
  --bg: #ffffff;
  --bg-secondary: #f7f7f7;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', sans-serif;
  color: var(--text);
  background: var(--bg);
}

input, textarea {
  font-family: inherit;
  font-size: 13px;
  color: var(--text);
  background: var(--bg);
  border: 0.5px solid var(--border);
  border-radius: 7px;
  padding: 8px 11px;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
}

input:focus, textarea:focus { border-color: var(--blue); }
button { font-family: inherit; cursor: pointer; }`;

export const LAYOUT_TSX = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CanvaRoom',
  description: '발표 허브 — 캔바 슬라이드 + 목차 + 링크 + Slido',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}`;

export const HOME_TSX = `import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', gap: 32, padding: 40, background: '#fff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 8 }}>
          Canva<span style={{ color: '#4285f4' }}>Room</span>
        </h1>
        <p style={{ fontSize: 14, color: '#777' }}>
          캔바 슬라이드 · 목차 · 링크 · Slido를 한 화면에서
        </p>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/admin" style={{
          padding: '10px 24px', background: '#4285f4', color: '#fff',
          borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none'
        }}>
          발표 설정 (Admin)
        </Link>
        <Link href="/view" style={{
          padding: '10px 24px', background: '#fff', color: '#111',
          border: '0.5px solid #ddd', borderRadius: 8, fontSize: 14,
          fontWeight: 500, textDecoration: 'none'
        }}>
          청취자 화면 (View)
        </Link>
      </div>
    </main>
  );
}`;

export const VIEW_LAYOUT_TSX = `export default function ViewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}`;
