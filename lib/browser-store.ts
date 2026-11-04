"use client";

import { useSyncExternalStore } from "react";

const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

function readCached<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value = fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw != null) value = JSON.parse(raw) as T;
  } catch {
    value = fallback;
  }
  cache.set(key, value);
  return value;
}

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return readCached(key, fallback);
}

export function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  cache.set(key, value);
  listeners.get(key)?.forEach((listener) => listener());
}

export function useLocal<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    (onChange) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(onChange);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key) {
          cache.delete(key);
          onChange();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        set?.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    () => readCached(key, fallback),
    () => fallback,
  );
}

export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
