import { PresentationData } from './types.js';

export function encode(data: PresentationData): string {
  const json = JSON.stringify(data);
  return btoa(encodeURIComponent(json));
}

export function decode(encoded: string): PresentationData | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as PresentationData;
  } catch {
    return null;
  }
}

export function toCanvaEmbed(url: string): string {
  if (!url) return '';

  try {
    const u = new URL(url);

    if (u.searchParams.get('embed') !== null) return url;

    if (u.pathname.includes('/view')) {
      u.search = '?embed';
      return u.toString();
    }

    if (u.pathname.startsWith('/design/')) {
      return `https://www.canva.com${u.pathname}/view?embed`;
    }

    return url;
  } catch {
    return url;
  }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}