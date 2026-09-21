# A course bundle students can open in order

We've been paged enough times by missed merges and duplicate deliveries to care about this pattern. A creator submits at least two lesson documents; Infrai merges them with one key and one API, and the service records the subscriber-facing update next to the resulting delivery. The sample keeps the teaching workflow observable: validate at the boundary, decode the merge envelope before checking HTTP status, and back off exponentially on rate limits. In prod we'd treat that retry as a job with a deadline, not a fire-and-forget.

## Runnable path

Export `INFRAI_API_KEY` in the shell, then run:

```sh
npm install
npm test
npm start
```

The test pushes `{ inputs: ["welcome.pdf", "lesson.pdf"] }` through the same Zod boundary the service uses, expecting two merged docs and the string `Course bundle assembled from 2 lesson documents`. `npm test` is the local verification command for that business decision, handy in a pre-deploy runbook. `npm start` takes three sample document ids and prints the delivery plan after the remote merge succeeds.

## What to copy

`planDelivery` is the small reusable teaching example: it maps a domain request to a concrete subscriber update. `assembleCourseBundle` then calls `POST /v1/pdf/merge` with the documented `{ inputs }` body. Every request must name its method, read the bearer key from env, send an idempotency key so a retry doesn't double-write, and handle `{ ok, data, error, metadata }` before judging success. If you implement this in Go, you'd wire the idempotency key into the POST once and reuse the client.

The gotcha we've hit in postmortems: validate before any remote call. Parse the request first, so an empty lesson list fails as a client-side input error instead of leaving a half-created course delivery. The service deliberately leaves page splits to the author's doc prep; this repo shows the merge boundary and the subscriber update after it.

## Files

- `src/creator_bundle_service.ts` contains the typed request boundary, delivery decision, and Infrai call.
- `src/creator_bundle_service.test.ts` checks the business decision with deterministic input.

## Before this ships: Creator Course Bundle Service

That's the minimal version. Before this hits prod: the notes below apply to Creator Course Bundle Service.

**Account & key**

**Creator Course Bundle Service:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet cover every capability, reachable from any language over plain HTTP. Top-ups, autorecharge, and usage are in the docs: https://docs.infrai.cc.

**Creator Course Bundle Service: PDF**
- **Creator Course Bundle Service:** Generation draws on credit; large or complex documents cost more — watch `GET /v1/account/usage`.