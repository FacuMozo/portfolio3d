import { describe, expect, it } from 'vitest'
import es from './es.json'
import en from './en.json'

// Flattens {a: {b: 'x'}} into ['a.b'] (arrays count as leaves, but their length must match).
const keys = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) return [`${path}[${v.length}]`];
    return v && typeof v === 'object' ? keys(v, path) : [path];
  });

describe('i18n dictionaries', () => {
  it('ES and EN define exactly the same keys', () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });

  it('has no empty strings', () => {
    const empty = (obj) => keys(obj).filter((k) => {
      const value = k.replace(/\[\d+\]$/, '').split('.').reduce((acc, p) => acc?.[p], obj);
      return value === '';
    });
    expect(empty(es)).toEqual([]);
    expect(empty(en)).toEqual([]);
  });
});
