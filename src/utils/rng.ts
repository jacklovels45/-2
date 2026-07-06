// 简易确定性伪随机数生成器（Mulberry32）
// 保证相同种子产生相同序列，便于刷新数据一致
export function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function intIn(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function floatIn(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min;
}

// 生成确定性 ID
let idCounter = 0;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter.toString().padStart(5, "0")}`;
}

export function resetIdCounter() {
  idCounter = 0;
}
