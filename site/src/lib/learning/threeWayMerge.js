const owns = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key);

/** @param {unknown} left @param {unknown} right */
export function sameStoredValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function copyField(target, source, key) {
  if (owns(source, key)) target[key] = source[key];
  else delete target[key];
}

/** Merge explicitly selected record fields while keeping unresolved local edits out of storage. */
/**
 * @template T
 * @param {T} base
 * @param {T} local
 * @param {T} remote
 * @param {string[]} fields
 * @param {boolean} [acknowledgeLocal]
 * @returns {{value: T, baseline: T, conflicts: string[]}}
 */
export function mergeThreeWayFields(base, local, remote, fields, acknowledgeLocal = true) {
  const value = { ...remote };
  const baseline = { ...remote };
  const conflicts = [];

  for (const field of fields) {
    const baseValue = base?.[field];
    const localValue = local?.[field];
    const remoteValue = remote?.[field];
    const localChanged = !sameStoredValue(localValue, baseValue) || owns(local, field) !== owns(base, field);
    const remoteChanged = !sameStoredValue(remoteValue, baseValue) || owns(remote, field) !== owns(base, field);
    if (!localChanged) continue;
    if (!remoteChanged || sameStoredValue(localValue, remoteValue)) {
      copyField(value, local, field);
      if (acknowledgeLocal) copyField(baseline, local, field);
      continue;
    }
    // The caller may keep showing localValue, but value remains remote until a user chooses.
    conflicts.push(field);
    copyField(baseline, base, field);
  }

  return { value, baseline, conflicts };
}

/** Merge maps whose keys are independent user-editable records (for example SQL question IDs). */
/**
 * @template T
 * @param {Record<string, T>} base
 * @param {Record<string, T>} local
 * @param {Record<string, T>} remote
 * @param {boolean} [acknowledgeLocal]
 * @returns {{value: Record<string, T>, baseline: Record<string, T>, conflicts: string[]}}
 */
export function mergeThreeWayMap(base = {}, local = {}, remote = {}, acknowledgeLocal = true) {
  const value = { ...remote };
  const baseline = { ...remote };
  const conflicts = [];
  const keys = new Set([...Object.keys(base || {}), ...Object.keys(local || {}), ...Object.keys(remote || {})]);

  for (const key of keys) {
    const baseValue = base?.[key];
    const localValue = local?.[key];
    const remoteValue = remote?.[key];
    const baseHas = owns(base, key);
    const localHas = owns(local, key);
    const remoteHas = owns(remote, key);
    const localChanged = !sameStoredValue(localValue, baseValue) || localHas !== baseHas;
    const remoteChanged = !sameStoredValue(remoteValue, baseValue) || remoteHas !== baseHas;
    if (!localChanged) continue;
    if (!remoteChanged || sameStoredValue(localValue, remoteValue) && localHas === remoteHas) {
      copyField(value, local, key);
      if (acknowledgeLocal) copyField(baseline, local, key);
      continue;
    }
    conflicts.push(key);
    copyField(baseline, base, key);
  }

  return { value, baseline, conflicts };
}
