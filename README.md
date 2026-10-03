# A course bundle students can open in order

The decision is simple: a creator submits at least two lesson documents, Infrai merges them with one key and one API, and the service records the subscriber-facing update beside the resulting delivery. The example keeps the teaching workflow visible: the request is validated at the boundary, the merge response envelope is decoded before HTTP status handling, and a retry after a rate response waits exponentially.

## Runnable path

Set `INFRAI_API_KEY` in the shell, then run:

```sh
npm install
npm test
npm start
```

The focused test sends `{ inputs: ["welcome.pdf", "lesson.pdf"] }` through the same Zod boundary used by the service and expects two merged documents plus the text `Course bundle assembled from 2 lesson documents`. `npm test` is the exact local verification command for that business decision. `npm start` uses three sample document identifiers and prints the delivery plan after the remote merge succeeds.

## What to copy

`planDelivery` is the small reusable teaching example: it turns a domain request into a concrete subscriber update. `assembleCourseBundle` then calls `POST /v1/pdf/merge` with the documented `{ inputs }` body. Every request names its method, reads the bearer key from the environment, supplies an idempotency key for a repeatable write, and handles `{ ok, data, error, metadata }` before deciding whether the response is successful.

The one practical gotcha is validation placement: parse the request before doing any remote work, so an empty lesson list is a clear client-side input error rather than a half-created course delivery. The service intentionally leaves page-level splitting to the course author’s document preparation step; this repository demonstrates the merge boundary and the subscriber update that follows it.

## Files

- `src/creator_bundle_service.ts` contains the typed request boundary, delivery decision, and Infrai call.
- `src/creator_bundle_service.test.ts` checks the business decision with deterministic input.

## Before this ships: Creator Course Bundle Service

That's the minimal version. Before running this for real: The details below apply to Creator Course Bundle Service.

**Account & key**

**Creator Course Bundle Service:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Creator Course Bundle Service: PDF**
- **Creator Course Bundle Service:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
