export function diff<T extends Record<string, any>>(a: T, b: T): Partial<T> {
  const o: Partial<T> = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const norm = (v: any) => (v === "" ? null : v);
  for (const k of keys) {
    if (JSON.stringify(norm(a[k])) !== JSON.stringify(norm(b[k]))) {
      (o as any)[k] = norm(b[k]);
    }
  }
  delete (o as any).id;
  return o;
}