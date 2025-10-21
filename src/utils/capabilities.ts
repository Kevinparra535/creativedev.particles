import * as THREE from "three";
import browser from "./browser";

export function hasWebGL2(gl?: THREE.WebGLRenderer): boolean {
  if (gl) return gl.capabilities.isWebGL2;
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  return !!canvas.getContext("webgl2");
}

export function shouldUseFallback(gl?: THREE.WebGLRenderer): boolean {
  const webgl2 = hasWebGL2(gl);
  // Prefer fallback on iOS webview or very old browsers even if webgl2 exists
  const riskyUA = browser.isIOSWebView || (!browser.isChrome && browser.isSafari && !webgl2);
  return !webgl2 || riskyUA;
}
