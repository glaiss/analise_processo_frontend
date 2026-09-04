function createMockMQL(query: string) {
  const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener(cb: (...args: unknown[]) => void) { (listeners['change'] ||= []).push(cb); },
    removeListener(cb: (...args: unknown[]) => void) { if (listeners['change']) listeners['change'] = listeners['change'].filter((f) => f !== cb); },
    addEventListener(event: string, cb: (...args: unknown[]) => void) { (listeners[event] ||= []).push(cb); },
    removeEventListener(event: string, cb: (...args: unknown[]) => void) { if (listeners[event]) listeners[event] = listeners[event].filter((f) => f !== cb); },
    dispatchEvent() { return false; },
  };
}

(window as any).matchMedia = (query: string) => createMockMQL(query);
