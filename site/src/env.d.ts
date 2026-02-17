/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  chooraiTrack?: (eventName: string, params?: Record<string, unknown>) => void;
  gtag?: (...args: unknown[]) => void;
}
