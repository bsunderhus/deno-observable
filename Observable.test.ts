import { assertEquals, assert } from "https://deno.land/std/testing/asserts.ts";
import { Observable } from "../Observable.ts";
import { isSubscription } from "../utils.ts";

function expectFullObserver(val: any) {
  assertEquals(typeof val, "object");
  assertEquals(typeof val.next, "function");
  assertEquals(typeof val.error, "function");
  assertEquals(typeof val.complete, "function");
  assertEquals(typeof val.closed, "boolean");
}

Deno.test({
  name: `
  Observable:
  it should be constructed with a subscriber function
  `,
  fn() {
    let assertions = 0;
    const source = new Observable<number>((observer) => {
      expectFullObserver(observer);
      observer.next(1);
      observer.complete();
    });
    source.subscribe({
      next: (value) => {
        assertEquals(value, 1);
        assertions += 1;
      },
      complete: () => assertions += 1,
    });
    assertEquals(assertions, 2);
  },
});

Deno.test({
  name: `
  Observable:
  it should send errors thrown in the constructor down the error path
  `,
  fn() {
    let calls = 0;
    new Observable<number>(() => {
      throw new Error("this should be handled");
    })
      .subscribe({
        error(err) {
          assert(err instanceof Error);
          calls += 1;
        },
      });
    assertEquals(calls, 1);
  },
});

Deno.test({
  name: `
  Observable.subscribe:
  it should be synchronous
  `,
  fn() {
    let subscribed = false;
    let nexted: string;
    let completed: boolean;
    const source = new Observable<string>((observer) => {
      subscribed = true;
      observer.next("wee");
      assertEquals(nexted, "wee");
      observer.complete();
      assertEquals(completed, true);
    });
    assertEquals(subscribed, false);
    let mutatedByNext = false;
    let mutatedByComplete = false;

    source.subscribe({
      next: (x) => {
        nexted = x;
        mutatedByNext = true;
      },
      complete: () => {
        completed = true;
        mutatedByComplete = true;
      },
    });

    assertEquals(mutatedByNext, true);
    assertEquals(mutatedByComplete, true);
  },
});

Deno.test({
  name: `
  Observable.subscribe:
  it should not be unsubscribed when other empty subscription completes
  `,
  fn() {
    let unsubscribeCalled = false;
    new Observable<number>(() =>
      () => {
        unsubscribeCalled = true;
      }
    ).subscribe({});
    assertEquals(unsubscribeCalled, false);
    assertEquals(Observable.of().subscribe({}).closed, true);
    assertEquals(unsubscribeCalled, false);
  },
});

Deno.test({
  name: `
  Observable.subscribe:
  it should not be unsubscribed when other subscription with same observer completes
  `,
  fn() {
    let unsubscribeCalled = false;
    const source = new Observable<number>(() => {
      return () => {
        unsubscribeCalled = true;
      };
    });

    const observer = () => {};

    source.subscribe(observer);

    assertEquals(unsubscribeCalled, false);

    assertEquals(Observable.of().subscribe(observer).closed, true);

    assertEquals(unsubscribeCalled, false);
  },
});

Deno.test({
  name: `
  Observable.subscribe:
  it should return a Subscription that calls the unsubscribe function returned by the subscriber
  `,
  fn() {
    let unsubscribeCalled = false;
    const source = new Observable<number>(() => {
      return () => {
        unsubscribeCalled = true;
      };
    });

    const sub = source.subscribe(() => {
      //noop
    });
    assertEquals(isSubscription(sub), true);
    assertEquals(unsubscribeCalled, false);
    assertEquals(typeof sub.unsubscribe, "function");
    sub.unsubscribe();
    assertEquals(unsubscribeCalled, true);
  },
});

Deno.test({
  name: `
  Observable.subscribe:
  it should ignore next messages after unsubscription
  `,
  async fn() {
    let times = 0;
    await new Promise((resolve) => {
      const subscription = new Observable<number>((observer) => {
        let i = 0;
        setTimeout(() => {
          observer.next(i++);
          observer.next(i++);
          observer.next(i++);
        });
        return () => resolve();
      })
        .subscribe(
          () => {
            if (++times === 2) subscription.unsubscribe();
          },
        );
    });
    assertEquals(times, 2);
  },
});

Deno.test({
  name: `
  Observable.subscribe:
  it should ignore error messages after unsubscription
  `,
  async fn() {
    let times = 0;
    await new Promise((resolve) => {
      const subscription = new Observable<number>((observer) => {
        let i = 0;
        setTimeout(() => {
          observer.error(i++);
          observer.error(i++);
          observer.error(i++);
        });
        return () => resolve();
      })
        .subscribe({
          error: () => {
            if (++times === 2) subscription.unsubscribe();
          },
        });
    });
    assertEquals(times, 2);
  },
});

Deno.test({
  name: `
  Observable.subscribe:
  it should ignore complete messages after unsubscription
  `,
  async fn() {
    let times = 0;
    let called = false;
    await new Promise((resolve) => {
      const subscription = new Observable<number>((observer) => {
        let i = 0;
        setTimeout(() => {
          observer.next(i++);
          observer.next(i++);
          observer.next(i++);
          observer.complete();
          resolve();
        });
      })
        .subscribe({
          complete: () => called = true,
          next: () => {
            if (++times === 2) subscription.unsubscribe();
          },
        });
    });
    assertEquals(times, 2);
    assertEquals(called, false);
  },
});

Deno.test({
  name: `
    Observable.subscribe:
    it should accept an anonymous observer with just a next function
    and call the next function in the context of the anonymous observer
  `,
  fn() {
    const observer = {
      calls: 0,
      next(x: number) {
        assertEquals(x, 1);
        assertEquals(this.calls = x, 1);
      },
    };
    Observable.of(1).subscribe(observer);
    assertEquals(observer.calls, 1);
  },
});

Deno.test({
  name: `
    Observable.subscribe:
    it should accept an anonymous observer with just an error function
    and call the error function in the context of the anonymous observer
  `,
  fn() {
    const observer = {
      calls: 0,
      error(x: number) {
        assertEquals(x, 1);
        assertEquals(this.calls = x, 1);
      },
    };
    new Observable((observer) => {
      observer.error(1);
    }).subscribe(observer);
    assertEquals(observer.calls, 1);
  },
});

Deno.test({
  name: `
    Observable.subscribe:
    it should accept an anonymous observer with just a complete function
    and call the complete function in the context of the anonymous observer
  `,
  fn() {
    const observer = {
      calls: 0,
      complete() {
        assertEquals(++this.calls, 1);
      },
    };
    new Observable((observer) => {
      observer.complete();
    }).subscribe(observer);
    assertEquals(observer.calls, 1);
  },
});

Deno.test({
  name: `
    Observable.subscribe:
    it should accept an anonymous observer with no functions at all
  `,
  fn() {
    assert(isSubscription(Observable.of().subscribe({})));
  },
});
