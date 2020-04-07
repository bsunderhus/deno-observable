import { Subscription, SubscriptionLike, CleanUp } from "./Subscription.ts";
import { Observer } from "./Observer.ts";

export function isSubscriptionLike(
  subscription: any,
): subscription is SubscriptionLike {
  return typeof subscription === "object" && subscription !== null &&
    typeof subscription.unsubscribe === "function" &&
    typeof subscription.closed === "boolean";
}

export function isSubscription(
  subscription: any,
): subscription is Subscription {
  return subscription instanceof Subscription;
}

export function iscleanUp(
  cleanUp: any,
): cleanUp is CleanUp {
  return isSubscriptionLike(cleanUp) ||
    typeof cleanUp === "function";
}

export function isObserver<V = unknown>(
  observer: any,
): observer is Observer<V> {
  const isFunctonOrUndefined = (fn?: Function) =>
    typeof fn === "undefined" || typeof fn === "function";
  return typeof observer === "object" &&
    observer !== null &&
    isFunctonOrUndefined(observer.complete) &&
    isFunctonOrUndefined(observer.error) &&
    isFunctonOrUndefined(observer.next) &&
    isFunctonOrUndefined(observer.start);
}

export function assertIsSubscription(
  subscription: any,
  msg: string = "value doesn't follow Subscription interface",
): asserts subscription is Subscription {
  if (!isSubscriptionLike(subscription)) throw new TypeError(msg);
}

export function assertIsSubscriptionLike(
  subscription: any,
  msg: string = "value doesn't follow SubscriptionLike interface",
): asserts subscription is SubscriptionLike {
  if (!isSubscriptionLike(subscription)) throw new TypeError(msg);
}

export function assertIsCleanUp(
  cleanUp: any,
  msg: string = "value doesn't follow CleanUp type",
): asserts cleanUp is CleanUp {
  if (!iscleanUp(cleanUp)) throw new TypeError(msg);
}

export function assertIsObserver<V = unknown>(
  observer: any,
  msg: string = "value doesn't follow Observer interface",
): asserts observer is Observer<V> {
  if (!isObserver(observer)) {
    throw new TypeError(msg);
  }
}

export function assertIsOptionanlFunction(
  fn: any,
  msg: string = "value is not an optional function",
): asserts fn is (Function | undefined) {
  if (typeof fn !== "function" && typeof fn !== "undefined") {
    throw new TypeError(msg);
  }
}

export function hostReportError(error: unknown) {
  setTimeout(() => {
    throw error;
  }, 0);
}
