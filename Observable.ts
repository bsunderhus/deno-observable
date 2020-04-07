import {
  SubscriberFunction,
  Subscription,
  SubscriptionLike
} from "./Subscription.ts";
import { Observer } from "./Observer.ts";
import {
  isAsyncIterable,
  isIterable,
  isObservableLike
} from "./symbol.ts";
import { isObserver, assertIsObserver } from "./utils.ts";

/**
 * Interface that aligns with signatures to an object that is an Observable
 */
export interface ObservableLike<Value = unknown> {
  [Symbol.observable](): Observable<Value>;
}

/**
 * An Observable represents a sequence of values which may be observed.
 */
export class Observable<Value = unknown> implements ObservableLike<Value> {
  private _subscriber: SubscriberFunction<Value>;
  constructor(subscriber: SubscriberFunction<Value>) {
    if (!(this instanceof Observable)) {
      throw new TypeError("Observable cannot be called as a function");
    }
    if (typeof subscriber !== "function") {
      throw new TypeError("Observable initializer must be a function");
    }
    this._subscriber = subscriber;
  }

  /**
   * Subscribes to the sequence with an observer
   * @param observer the observer to be subscribed
   */
  subscribe(observer: Observer<Value>): SubscriptionLike;
  /**
   * Subscribes to the sequence with callbacks
   * @param onNext callback to be invoked on the next value of the sequence
   * @param onError callback to be invoked on the next error of the sequence
   * @param onComplete callback to be invoked when the sequence is completed
   */
  subscribe(
    onNext: (value: Value) => void,
    onError?: (error: unknown) => void,
    onComplete?: () => void,
  ): SubscriptionLike;
  subscribe(
    observerOrOnNext: Observer<Value> | ((value: Value) => void),
    onError?: (error: unknown) => void,
    onComplete?: () => void,
  ): SubscriptionLike {
    const observer = isObserver(observerOrOnNext) ? observerOrOnNext : {
      next: observerOrOnNext,
      error: onError,
      complete: onComplete,
    };
    assertIsObserver(observer);
    return new Subscription(observer, {subscriber: this._subscriber});
  }

  /** Returns itself */
  [Symbol.observable](): Observable<Value> {
    return this;
  }

  /**
   * Converts arguments to an Observable
   * @param items an iterablet
   */
  static of<Value = unknown>(...items: Value[]): Observable<Value> {
    return new Observable<Value>((observer) => {
      for (const iterator of items) observer.next(iterator);
      observer.complete();
    });
  }

  /**
   * Converts an observable  Observable
   * @param observable the observableLike to be converted
   */
  static from<Value = unknown>(
    observable: ObservableLike<Value>,
  ): Observable<Value>;
  /**
   * Converts an iterable to an Observable
   * @param iterable the iterable to be converted
   */
  static from<Value = unknown>(
    iterable: Iterable<Value>,
  ): Observable<Value>;
  /**
   * Converts an async iterable to an Observable
   * @param iterable the iterable to be converted
   */
  static from<Value = unknown>(
    iterable: AsyncIterable<Value>,
  ): Observable<Value>;
  static from<Value = unknown>(
    argument:
      | Iterable<Value>
      | AsyncIterable<Value>
      | ObservableLike<Value>,
  ): Observable<Value> {
    if (isObservableLike(argument)) {
      const observable = argument[Symbol.observable]();
      return new Observable<Value>((observer) =>
        observable.subscribe(observer)
      );
    }
    if (isIterable(argument)) {
      return new Observable<Value>((observer) => {
        for (const value of argument) observer.next(value);
        observer.complete();
      });
    }
    if (isAsyncIterable(argument)) {
      return new Observable<Value>((observe) => {
        (async () => {
          for await (const value of argument) observe.next(value);
        })();
        observe.complete();
      });
    }
    throw new TypeError(
      "Observable.from expects to receive an ObservableLike, Iterable or AsyncIterable",
    );
  }
}