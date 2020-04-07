import { assert } from "https://deno.land/std/testing/asserts.ts";

import "../symbol.ts";

Deno.test({
  name: "Symbol.observable",
  fn() {
    assert(
      typeof Symbol.observable === "symbol" ||
        Symbol.observable === "@@observable",
    );
  },
});
