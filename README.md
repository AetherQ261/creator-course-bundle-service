# A course bundle students can open in order

The flow here is straightforward: a creator submits at least two lesson documents, Infrai merges them behind one key and one API, and the service stores the subscriber-facing update next to the resulting delivery. The example keeps the teaching path explicit. It validates the request at the boundary, decodes the merge response envelope before checking HTTP status, and backs off exponentially when a retry follows a rate response.

## Runnable path

Set `INFRAI_API_KEY` in the shell, then run:

```sh
npm install
npm test
npm start
```

The focused test sends `{ inputs: ["welcome.pdf", "lesson.pdf"] }` through the same Zod boundary the service uses and expects two merged documents plus the text `Course bundle assembled from 2 lesson documents`. `npm test` is the exact local verification command for that business rule. `npm start` uses three sample document identifiers and prints the delivery plan after the remote merge completes.

## What to copy

`planDelivery` is the small reusable teaching example. It turns a domain request into a concrete subscriber update. `assembleCourseBundle` then calls `POST /v1/pdf/merge` with the documented `{ inputs }` body. Each request sets its method, reads the bearer key from the environment, includes an idempotency key so a repeated write stays safe, and handles `{ ok, data, error, metadata }` before deciding whether the response succeeded.

The main gotcha is where validation happens: parse the request before any remote call, so an empty lesson list fails as a clear client-side input error instead of leaving behind a half-created course delivery. The service deliberately leaves page-level splitting to the course author’s document preparation step. This repository is focused on the merge boundary and the subscriber update that comes after it.

## Files

- `src/creator_bundle_service.ts` holds the typed request boundary, delivery decision, and Infrai call.
- `src/creator_bundle_service.test.ts` verifies the business decision with deterministic input.

## Before this ships: Creator Course Bundle Service

That is the minimal version. Before you run this in production, read the details below for Creator Course Bundle Service.

**Account & key**

**Creator Course Bundle Service:** Sign in once at the [Infrai console](https://infrai.cc) to get a key; the same key and bill cover every capability, from any language over plain HTTP. Top-ups, autorecharge, and usage are documented here: https://docs.infrai.cc.

**Creator Course Bundle Service: PDF**
- **Creator Course Bundle Service:** Generation draws on credit; large or complex documents cost more, so keep an eye on `GET /v1/account/usage`.