---
name: modern-javascript
description: Review ECMAScript semantics and Node or browser compatibility for JavaScript and TypeScript changes.
---

# Modern Javascript

Check the declared Node version, browser support and emitted language target before using a feature. Track three independent questions: is the feature standardized, does the compiler accept or transform it, and does the target runtime implement it? Type declarations alone supply no runtime behavior. Verify edition membership in [ECMA-262](https://tc39.es/ecma262/), proposals in [TC39's tracker](https://github.com/tc39/proposals), and the real runtime in the [Node CLI and API reference](https://nodejs.org/docs/latest-v24.x/api/).

Preserve property lookup, mutation, evaluation order, iterator consumption and exception timing during modernization. For example, object spread copies own enumerable values (including symbols) and can invoke getters. `Object.hasOwn(record, key)` distinguishes absent fields from own fields set to `undefined`. Use `toSorted` when callers still need the input order and verify that a shallow copy is sufficient.

Use sequential `for...of` when operations depend on previous results or a provider requires serialization. Use `Promise.all` for a known small set of independent tasks. Rejection does not stop work already started. For larger inputs batch by a measured bound or use a pool; propagate an abort signal and re-check the remaining budget before scheduling or retrying. Use `for await...of` for streaming inputs and test cancellation and cleanup explicitly.

Iterator helpers are generally lazy and consume single-pass iterators. When mapping an async iterable with `Array.fromAsync`, account for sequential consumption and materialization before returning. Check Node and browser compatibility for newer APIs such as Temporal and explicit resource management. Distinguish host APIs like `fetch` from language features. Confirm decorator semantics and avoid relying on withdrawn proposals. Test supported fallback behavior at the actual target boundary.
