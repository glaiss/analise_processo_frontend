/* eslint-disable @typescript-eslint/no-explicit-any */
function createMockMQL(query: string): any {
  const listeners: Record<string, Function[]> = {};
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener(cb: Function) { (listeners['change'] = listeners['change'] || []).push(cb); },
    removeListener(cb: Function) { if (listeners['change']) listeners['change'] = listeners['change'].filter((f: Function) => f !== cb); },
    addEventListener(event: string, cb: Function) { (listeners[event] = listeners[event] || []).push(cb); },
    removeEventListener(event: string, cb: Function) { if (listeners[event]) listeners[event] = listeners[event].filter((f: Function) => f !== cb); },
    dispatchEvent() { return false; },
  };
}

(window as any).matchMedia = (query: string) => createMockMQL(query);
