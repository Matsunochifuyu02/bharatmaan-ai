'use client';

import { useMemo, DependencyList } from 'react';

/**
 * A utility hook to stabilize Firebase references and queries.
 * Since Firebase query and collection functions return new object references on every call,
 * using them directly in hook dependency arrays causes infinite render loops.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
