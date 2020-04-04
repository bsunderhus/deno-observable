import {
  assertIsCleanUp,
  assertIsObserver,
  assertIsOptionanlFunction,
  hostReportError,
} from "./utils.ts";
import { Observer } from "./Observer.ts";
import { SubscriptionObserver } from "./SubscriptionObserver.ts";

export interface SubscriptionLike {
  readonly closed: boolean;
  unsubscribe(): void;
}

export type CleanUp = (() => void) | SubscriptionLike;

export type SubscriberFunction<Value = unknown> = (
  subscriptionObserver: SubscriptionObserver<Value>,
) => CleanUp | void;

export function normalizeCleanUp(cleanUp: CleanUp) {
  assertIsCleanUp(cleanUp);
  if ("unsubscribe" in cleanUp) return cleanUp.unsubscribe;
  return cleanUp;
}

export interface SubscriptionOptions<Value = unknown> {
  subscriber?: SubscriberFunction<Value>
  errorReporter?(error: unknown): void
}

export class Subscription<Value = unknown> implements SubscriptionLike {
  private _observer: Observer<Value>;
  private _cleanUp?: () => void;
  private _errorReporter: (error: unknown) => void;
  private _closed = false
  public get closed() {
    return this._closed;
  }
  constructor(
    observer: Observer,
    options?: SubscriptionOptions<Value>
  ) {
    assertIsObserver(observer);
    assertIsOptionanlFunction(options?.subscriber)
    assertIsOptionanlFunction(options?.errorReporter)
    this._observer = observer;
    this._errorReporter = options?.errorReporter ?? hostReportError
    try {
      this._observer.start?.(this);
    } catch (error) {
      this._errorReporter(error)
    }
    if (this.closed) return;
    const subscriptionObserver = new SubscriptionObserver(this);
    try {
      const cleanup = options?.subscriber?.(subscriptionObserver);
      if (cleanup != null) this._cleanUp = normalizeCleanUp(cleanup);
    } catch (e) {
      subscriptionObserver.error(e);
    }
    if (this.closed) this._cleanUp?.();
  }
  public unsubscribe() {
    if (!this.closed) {
      this._cleanUp?.();
      this._closed = true
    }
  }
  public static getObserver<Value>(subscription: Subscription<Value>) {
    return subscription._observer;
  }
  public static getErrorReporter<Value>(subscription: Subscription<Value>) {
    return subscription._errorReporter;
  }
}
