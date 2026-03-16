export type UnixTimeSecondsProvider = () => number;

export function resolveSeed(
  seed?: number,
  getUnixTimeSeconds: UnixTimeSecondsProvider = () => Math.floor(Date.now() / 1000),
): number {
  return seed ?? getUnixTimeSeconds();
}

export function createRng(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;

    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
