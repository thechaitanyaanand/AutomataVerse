// Pure utility functions — NO React imports

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function setUnion(a, b) {
  return new Set([...a, ...b]);
}

export function setIntersection(a, b) {
  return new Set([...a].filter(x => b.has(x)));
}

export function setDifference(a, b) {
  return new Set([...a].filter(x => !b.has(x)));
}

export function setEquals(a, b) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

export function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function throttle(fn, ms) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function formatSet(set) {
  return `{${[...set].join(', ')}}`;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
