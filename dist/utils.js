export function encode(data) {
    const json = JSON.stringify(data);
    return btoa(encodeURIComponent(json));
}
export function decode(encoded) {
    try {
        const json = decodeURIComponent(atob(encoded));
        return JSON.parse(json);
    }
    catch {
        return null;
    }
}
export function toCanvaEmbed(url) {
    if (!url)
        return '';
    try {
        const u = new URL(url);
        if (u.searchParams.get('embed') !== null)
            return url;
        if (u.pathname.includes('/view')) {
            u.search = '?embed';
            return u.toString();
        }
        if (u.pathname.startsWith('/design/')) {
            return `https://www.canva.com${u.pathname}/view?embed`;
        }
        return url;
    }
    catch {
        return url;
    }
}
export function uid() {
    return Math.random().toString(36).slice(2, 9);
}
