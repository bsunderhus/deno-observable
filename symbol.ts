import { ObservableLike } from "./Observable.ts";

/* Note: This will add Symbol.observable globally for all TypeScript users,
  however, we are no longer polyfilling Symbol.observable */
declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}

if (typeof Symbol.observable === "undefined") {
  Reflect.set(Symbol, "observable", "@@observable");
}

/**
 * checks if a value is following the ObservableLike interface
 * @param observableLike value to be tested as ObservableLike
 */
export function isObservableLike<T = unknown>(
  observableLike: any,
): observableLike is ObservableLike<T> {
  return typeof observableLike === "object" && observableLike !== null &&
    Symbol.observable in observableLike &&
    typeof observableLike[Symbol.observable] === "function";
}

/**
 * checks if a value is folowing the IterableIterator interface
 * @param iterable value to be tested as IterableIterator
 */
export function isIterable<T = unknown>(
  iterable: any,
): iterable is Iterable<T> {
  return typeof iterable === "object" && iterable !== null &&
    Symbol.iterator in iterable &&
    typeof iterable[Symbol.iterator] === "function";
}

/**
 * checks if a value is folowing the AsyncIterableIterator interface
 * @param iterable value to be tested as AsyncIterableIterator
 */
export function isAsyncIterable<T = unknown>(
  iterable: any,
): iterable is AsyncIterable<T> {
  return typeof iterable === "object" && iterable !== null &&
    Symbol.asyncIterator in iterable &&
    typeof iterable[Symbol.asyncIterator] === "function";
}
