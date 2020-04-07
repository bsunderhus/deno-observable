import {
  Subscription
} from "./Subscription.ts";

/**
 * An Observer is used to receive data from an Observable,
 * and is supplied as an argument to subscribe.
 */
export interface Observer<Value = unknown> {
  /**
   * Receives the subscription object when `subscribe` is called
   * @param subscription the subscription object
   */
  start?(subscription: Subscription): void;

  /**
   * Receives the next value in the sequence
   * @param value the next value in the sequence
   */
  next?(value: Value): void;

  /**
   * Receives the next error in the sequence
   * @param errorValue the next error in the sequence
   */
  error?(errorValue: unknown): void;

  /**
   * Receives a notification signaling that the sequence is completed
   */
  complete?(): void;
}