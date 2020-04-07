import {
  assertEquals,
  assertThrows,
  assert,
  assertThrowsAsync
} from "https://deno.land/std/testing/asserts.ts";
import {
  CleanUp,
  SubscriberFunction,
  Subscription,
  SubscriptionLike,
  normalizeCleanUp
} from "../Subscription.ts";
import { assertIsCleanUp } from "../utils.ts";

Deno.test(`
Subscription:
it should throw if not given a observer
`, () => {
  assertThrows(() => new Subscription(undefined!));
});

Deno.test(`
Subscription:
it should throw if not given an optional function on options
`, () => {
  assertThrows(() => new Subscription({}, { subscriber: 1 as any }));
  assertThrows(() => new Subscription({}, { subscriber: {} as any }));
  assertThrows(() => new Subscription({}, { subscriber: null as any }));
  assertThrows(() => new Subscription({}, { subscriber: true as any }));
  assertThrows(() => new Subscription({}, { subscriber: [] as any }));
  assertThrows(() => new Subscription({}, { errorReporter: 1 as any }));
  assertThrows(() => new Subscription({}, { errorReporter: {} as any }));
  assertThrows(() => new Subscription({}, { errorReporter: null as any }));
  assertThrows(() => new Subscription({}, { errorReporter: true as any }));
  assertThrows(() => new Subscription({}, { errorReporter: [] as any }));
  assert(
    new Subscription(
      {},
      { errorReporter: undefined, subscriber: undefined },
    ) instanceof Subscription,
  );
});

Deno.test(`
Subscription:
it should invoke observer start method in constructor
`, () => {
  let started = false;
  new Subscription({
    start: () => started = true,
  }, undefined);
  assertEquals(started, true);
});

Deno.test(`
Subscription:
it should re-throw errors from start method into the host
`, () => {
  let error: unknown;
  new Subscription({
    start: () => {
      throw new Error("this should go to host");
    },
  }, { errorReporter: (e) => error = e });
  assert(error instanceof Error);
});

Deno.test(`
Subscription:
it should run subscriber on constructor
`, () => {
  let called = false;
  new Subscription({}, { subscriber: () => {
    called = true;
  } });
  assertEquals(called, true);
});

Deno.test(`
Subscription:
it should run observer error on subscriber errors
`, () => {
  let error: unknown;
  new Subscription({
    error: (e) => error = e,
  }, { subscriber: () => {
    throw new Error("this should go to observer error");
  } });
  assert(error instanceof Error);
});

Deno.test(`
Subscription:
it should be closed if subscriber completes
`, () => {
  assertEquals(new Subscription({}, { subscriber: (o) => {
    o.complete();
  } }).closed, true);
});

Deno.test(`
Subscription:
it should call cleanUp function on completion
`, () => {
  let called = false;
  assertEquals(new Subscription({}, { subscriber: (o) => {
    o.complete();
    return () => called = true;
  } }).closed, true);
  assertEquals(called, true);
});

Deno.test(`
Subscription.unsubscribe:
it should call cleanup ONCE and close the subscription
`, () => {
  let calls = 0;
  const subscription = new Subscription(
    {},
    { subscriber: (o) => () => ++calls },
  );
  assertEquals(subscription.closed, false);
  subscription.unsubscribe();
  subscription.unsubscribe();
  assertEquals(calls, 1);
  assertEquals(subscription.closed, true);
});

Deno.test(`
static Subscription.getObserver:
it should return observer provided to the subscription
`, () => {
  const observer = {};
  assertEquals(observer, Subscription.getObserver(new Subscription(observer)));
});

Deno.test(`
static Subscription.getErrorReporter:
it should return errorReporter provided to the subscription
`, () => {
  const observer = {};
  const errorReporter = () => {};
  assertEquals(
    errorReporter,
    Subscription.getErrorReporter(
      new Subscription(observer, { errorReporter }),
    ),
  );
});
