/** Bangun objek patch bersarang untuk `patchDeep`, mis. path `faq.items` + nilai array mengganti seluruh array. */
export function nestValueAtPath(path: string, value: unknown): Record<string, unknown> {
  const keys = path.split(".").filter(Boolean);
  if (keys.length === 0) return {};
  let obj: Record<string, unknown> = { [keys[keys.length - 1]]: value };
  for (let i = keys.length - 2; i >= 0; i--) {
    obj = { [keys[i]]: obj };
  }
  return obj;
}
