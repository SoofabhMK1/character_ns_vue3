export interface AbortSignalLike {
  aborted: boolean;
}

class SimpleAbortController {
  public signal: AbortSignalLike = { aborted: false };
  abort() {
    this.signal.aborted = true;
  }
}

export type AbortControllerLike = AbortController | SimpleAbortController;

export function createAbortController(): AbortControllerLike {
  if (typeof globalThis !== 'undefined' && (globalThis as any).AbortController) {
    return new (globalThis as any).AbortController();
  }
  return new SimpleAbortController();
}

export function isNativeAbortAvailable(): boolean {
  return typeof globalThis !== 'undefined' && !!(globalThis as any).AbortController;
}