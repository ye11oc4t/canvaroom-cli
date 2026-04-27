import { PresentationData } from './types.js';
export declare function encode(data: PresentationData): string;
export declare function decode(encoded: string): PresentationData | null;
export declare function toCanvaEmbed(url: string): string;
export declare function uid(): string;
