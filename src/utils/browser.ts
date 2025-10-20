/**
 * Modern browser/runtime feature detection inspired by legacy helpers/browser.js
 * Safe for SSR (guards window/document usage).
 */

type Maybe<T> = T | undefined;

type VendorPrefix = "Webkit" | "Moz" | "O" | "ms";
const PREFIXES: VendorPrefix[] = ["Webkit", "Moz", "O", "ms"];

export type BrowserInfo = {
  // media support
  videoFormat?: "mp4" | "webm" | "ogg";
  audioFormat?: "mp3" | "ogg";
  videoFormatTestOrders: string[];
  audioFormatTestOrders: string[];

  // environment
  isIFrame: boolean;
  isPhantom: boolean;
  isRetina: boolean;
  isSupportOpacity: boolean;

  // ua flags
  isChrome: boolean;
  isStandalone?: boolean;
  isIOS: boolean;
  isSafari: boolean;
  isIOSWebView: boolean;

  // css properties (resolved vendor-prefixed name or false)
  transitionStyle: false | string;
  transformStyle: false | string;
  transform3dStyle: false | string;
  transformPerspectiveStyle: false | string;
  transformOriginStyle: false | string;
  webkitFilter: false | "webkitFilter";
  isSupportPreserve3d: boolean;
};

let cached: BrowserInfo | null = null;

function getDummyStyle(): CSSStyleDeclaration | null {
  if (typeof document === "undefined") return null;
  const el = document.createElement("div");
  return el.style;
}

function getPropIndex(style: CSSStyleDeclaration, prop: string): number {
  const ucProp = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (let i = 0; i < PREFIXES.length; i++) {
    const key = (PREFIXES[i] + ucProp) as keyof CSSStyleDeclaration;
    if ((style as any)[key] !== undefined) return i + 2; // vendor
  }
  if ((style as any)[prop] !== undefined) return 1; // standard
  return 0; // unsupported
}

function getPropFromIndex(
  style: CSSStyleDeclaration,
  prop: string,
  index: number,
  testCase?: string
): false | string {
  const resolved =
    index > 1
      ? PREFIXES[index - 2] + prop.charAt(0).toUpperCase() + prop.slice(1)
      : index === 1
        ? prop
        : false;
  if (!resolved) return false;
  if (testCase) {
    (style as any)[resolved] = testCase;
    if ((style as any)[resolved] !== testCase) return false;
  }
  return resolved;
}

function detectMediaFormat(
  kind: "video" | "audio",
  orders: string[]
): Maybe<"mp4" | "webm" | "ogg" | "mp3"> {
  if (
    (globalThis as any).window === undefined ||
    (globalThis as any).document === undefined
  )
    return undefined;
  let el: HTMLMediaElement | null = null;
  try {
    const g: any = globalThis as any;
    el =
      kind === "video"
        ? (new g.Video() as HTMLVideoElement)
        : (new g.Audio() as HTMLAudioElement);
  } catch {
    el = document.createElement(kind);
  }
  for (const mime of orders) {
    if (typeof (el as any).canPlayType === "function" && el.canPlayType(mime)) {
      return mime.substring(mime.indexOf("/") + 1) as any;
    }
  }
  return undefined;
}

export function getBrowserInfo(): BrowserInfo {
  if (cached) return cached;
  const hasWindow = (globalThis as any).window !== undefined;
  const hasDocument = typeof document !== "undefined";
  const style = getDummyStyle();
  const body = hasDocument ? document.body : null;
  const ua = hasWindow ? globalThis.navigator.userAgent.toLowerCase() : "";

  const videoFormatTestOrders = ["video/mp4", "video/webm", "video/ogg"];
  const audioFormatTestOrders = ["audio/mp3", "audio/ogg"];

  const info: BrowserInfo = {
    videoFormatTestOrders,
    audioFormatTestOrders,
    videoFormat: detectMediaFormat("video", videoFormatTestOrders) as any,
    audioFormat: detectMediaFormat("audio", audioFormatTestOrders) as any,

    isIFrame: hasWindow ? globalThis.self !== globalThis.top : false,
    isPhantom: hasWindow ? Boolean((globalThis as any).callPhantom) : false,
    isRetina: hasWindow
      ? !!(globalThis as any).devicePixelRatio &&
        (globalThis as any).devicePixelRatio >= 1.5
      : false,
    isSupportOpacity: hasDocument
      ? (document.documentElement.style as any).opacity !== undefined
      : false,

    isChrome: /chrome/.test(ua),
    isStandalone: hasWindow
      ? ((globalThis.navigator as any).standalone as boolean | undefined)
      : undefined,
    isIOS: /iphone|ipod|ipad/.test(ua),
    isSafari: /safari/.test(ua),
    isIOSWebView: false, // set below

    transitionStyle: false,
    transformStyle: false,
    transform3dStyle: false,
    transformPerspectiveStyle: false,
    transformOriginStyle: false,
    webkitFilter: false,
    isSupportPreserve3d: false,
  };

  info.isIOSWebView = info.isIOS && !info.isStandalone && !info.isSafari;

  if (style) {
    const transitionIdx = getPropIndex(style, "transition");
    const transformIdx = getPropIndex(style, "transform");
    const perspectiveIdx = getPropIndex(style, "perspective");
    const originIdx = getPropIndex(style, "transformOrigin");

    info.transitionStyle = getPropFromIndex(
      style,
      "transition",
      transitionIdx
    ) as any;
    info.transformStyle = getPropFromIndex(
      style,
      "transform",
      transformIdx
    ) as any;
    info.transform3dStyle = getPropFromIndex(
      style,
      "transform",
      perspectiveIdx
    ) as any; // truthy if perspective supported
    info.transformPerspectiveStyle = getPropFromIndex(
      style,
      "perspective",
      perspectiveIdx
    ) as any;
    info.transformOriginStyle = getPropFromIndex(
      style,
      "transformOrigin",
      originIdx
    ) as any;
    info.webkitFilter =
      body && (body.style as any).webkitFilter !== undefined
        ? "webkitFilter"
        : false;
    info.isSupportPreserve3d = !!getPropFromIndex(
      style,
      "transformStyle",
      getPropIndex(style, "transformStyle"),
      "preserve-3d"
    );
  }

  cached = info;
  return info;
}

// Convenience default export (lazy)
const browserInfo: BrowserInfo = getBrowserInfo();
export default browserInfo;
