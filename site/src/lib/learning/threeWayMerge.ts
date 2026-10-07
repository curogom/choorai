const owns = (value: object | null | undefined, key: string) =>
  Object.prototype.hasOwnProperty.call(value || {}, key);

export function sameStoredValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function copyField(target: object, source: object | null | undefined, key: string): void {
  const output = target as Record<string, unknown>;
  const input = source as Record<string, unknown> | null | undefined;
  if (owns(source, key)) output[key] = input?.[key];
  else delete output[key];
}

/** Merge selected fields while keeping unresolved local edits out of storage. */
export function mergeThreeWayFields<T extends object>(
  base: T,
  local: T,
  remote: T,
  fields: readonly string[],
  acknowledgeLocal = true,
): { value: T; baseline: T; conflicts: string[] } {
  const value = { ...remote } as T;
  const baseline = { ...remote } as T;
  const conflicts: string[] = [];
  const baseRecord = base as Record<string, unknown>;
  const localRecord = local as Record<string, unknown>;
  const remoteRecord = remote as Record<string, unknown>;

  for (const field of fields) {
    const localChanged = !sameStoredValue(localRecord[field], baseRecord[field]) || owns(local, field) !== owns(base, field);
    const remoteChanged = !sameStoredValue(remoteRecord[field], baseRecord[field]) || owns(remote, field) !== owns(base, field);
    if (!localChanged) continue;
    if (!remoteChanged || sameStoredValue(localRecord[field], remoteRecord[field])) {
      copyField(value, local, field);
      if (acknowledgeLocal) copyField(baseline, local, field);
      continue;
    }
    conflicts.push(field);
    copyField(baseline, base, field);
  }
  return { value, baseline, conflicts };
}

/** Merge maps whose keys are independent editable records, such as SQL question IDs. */
export function mergeThreeWayMap<T>(
  base: Record<string, T> = {},
  local: Record<string, T> = {},
  remote: Record<string, T> = {},
  acknowledgeLocal = true,
): { value: Record<string, T>; baseline: Record<string, T>; conflicts: string[] } {
  const value = { ...remote };
  const baseline = { ...remote };
  const conflicts: string[] = [];
  const keys = new Set([...Object.keys(base), ...Object.keys(local), ...Object.keys(remote)]);

  for (const key of keys) {
    const localChanged = !sameStoredValue(local[key], base[key]) || owns(local, key) !== owns(base, key);
    const remoteChanged = !sameStoredValue(remote[key], base[key]) || owns(remote, key) !== owns(base, key);
    if (!localChanged) continue;
    if (!remoteChanged || sameStoredValue(local[key], remote[key]) && owns(local, key) === owns(remote, key)) {
      copyField(value, local, key);
      if (acknowledgeLocal) copyField(baseline, local, key);
      continue;
    }
    conflicts.push(key);
    copyField(baseline, base, key);
  }
  return { value, baseline, conflicts };
}
