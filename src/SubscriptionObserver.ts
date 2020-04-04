import { Observer } from "./Observer.ts";
import { Subscription } from "./Subscription.ts";
import { assertIsSubscription, assertIsObserver } from "./utils.ts";
/**
 * A SubscriptionObserver is a normalized Observer which wraps the
 * observer object supplied to subscribe.
 */
export class SubscriptionObserver<Value = unknown>
  implements Required<Omit<Observer<Value>, "start">> {
  private _subscription: Subscription<Value>;
  constructor(subscription: Subscription<Value>) {
    assertIsSubscription(subscription);
    this._subscription = subscription;
  }
  next(value: Value): void {
    if (this.closed) return;
    try {
      Subscription.getObserver(this._subscription).next?.(value);
    } catch (error) {
      Subscription.getErrorReporter(this._subscription)(error);
    }
  }
  error(error: unknown): void {
    if (this.closed) return;
    try {
      Subscription.getObserver(this._subscription).error?.(error);
    } catch (error) {
      Subscription.getErrorReporter(this._subscription)(error);
    }
  }
  complete(): void {
    if (this.closed) return;
    try {
      Subscription.getObserver(this._subscription).complete?.();
      this._subscription.unsubscribe();
    } catch (error) {
      Subscription.getErrorReporter(this._subscription)(error);
    }
  }
  /**
   * A boolean value indicating whether the subscription is closed
   */
  get closed(): boolean {
    return this._subscription.closed;
  }
}
