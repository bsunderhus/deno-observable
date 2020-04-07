import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { SubscriptionObserver } from "../SubscriptionObserver.ts";
import { Subscription } from "../Subscription.ts";

Deno.test({
  name: `
  SubscriptionObserver:
  it should ignore next messages after completion
  `,
  fn() {
    let times = 0;
    const subscriptionObserver = new SubscriptionObserver<void>(
      new Subscription({
        next: () => ++times,
      }),
    );
    subscriptionObserver.next();
    subscriptionObserver.next();
    subscriptionObserver.complete();
    subscriptionObserver.next();
    assertEquals(times, 2);
  },
});

Deno.test({
  name: `
  SubscriptionObserver:
  it should ignore next messages after unsubscription
  `,
  fn() {
    let times = 0;
    const subscription = new Subscription({
      next: () => ++times,
    });
    const subscriptionObserver = new SubscriptionObserver<void>(
      subscription,
    );
    subscriptionObserver.next();
    subscriptionObserver.next();
    subscription.unsubscribe();
    subscriptionObserver.next();
    assertEquals(times, 2);
  },
});

Deno.test(`
SubscriptionObserver:
it should ignore error messages after unsubscription
`, () => {
  let times = 0;
  let errorCalled = false;
  const subscription = new Subscription({
    next() {
      times += 1;
    },
    error() {
      errorCalled = true;
    },
  });
  const subscriptionObserver = new SubscriptionObserver<void>(subscription);

  subscriptionObserver.next();
  subscriptionObserver.next();
  subscription.unsubscribe();
  subscriptionObserver.next();
  subscriptionObserver.error(undefined);

  assertEquals(times, 2);
  assertEquals(errorCalled, false);
});

Deno.test(`
SubscriptionObserver: it should ignore complete messages after unsubscription
`, () => {
  let times = 0;
  let completeCalled = false;

  const subscription = new Subscription({
    next() {
      times += 1;
    },
    complete() {
      completeCalled = true;
    },
  });

  const subscriptionObserver = new SubscriptionObserver<void>(subscription);

  subscriptionObserver.next();
  subscriptionObserver.next();
  subscription.unsubscribe();
  subscriptionObserver.next();
  subscriptionObserver.complete();

  assertEquals(times, 2);
  assertEquals(completeCalled, false);
});

Deno.test(`
SubscriptionObserver:
it should not be closed when other subscriber with same observer instance completes
`, () => {
  const observer = {
    next() {/*noop*/},
  };
  const sub1 = new SubscriptionObserver(new Subscription(observer));
  const sub2 = new SubscriptionObserver(new Subscription(observer));

  sub2.complete();

  assertEquals(sub1.closed, false);
  assertEquals(sub2.closed, true);
});

Deno.test(`
SubscriptionOnserver:
it should call complete observer without any arguments
`, () => {
  let argument: any[] = [];

  const observer = {
    complete: (...args: any[]) => {
      argument = args;
    },
  };

  const sub1 = new SubscriptionObserver(new Subscription(observer));
  sub1.complete();

  assertEquals(argument.length, 0);
});
