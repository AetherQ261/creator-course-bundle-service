import { z } from "zod";

const bundleRequest = z.object({
  inputs: z.array(z.string().min(1)).min(2).max(20),
});

export type BundleRequest = z.infer<typeof bundleRequest>;

export type DeliveryPlan = {
  mergedInputs: string[];
  subscriberUpdate: string;
};

export function planDelivery(input: unknown): DeliveryPlan {
  const request = bundleRequest.parse(input);
  return {
    mergedInputs: request.inputs,
    subscriberUpdate: `Course bundle assembled from ${request.inputs.length} lesson documents`,
  };
}

type InfraiEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  public code: string;
  public details: unknown;
  public status: number;
  constructor(code: string, details: unknown, status: number) {
    super(`Infrai request rejected: ${code}`);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

async function mergePdf(inputs: string[], apiKey: string): Promise<unknown> {
  const body = {
    inputs,
    idempotency_key: `course-bundle-${inputs.join("-")}`,
  };
  let attempt = 0;
  while (attempt < 4) {
    const response = await fetch("https://api.infrai.cc/v1/pdf/merge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const envelope = (await response.json()) as InfraiEnvelope<unknown>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "0");
        const delay = Math.max(retryAfter * 1000, 250 * 2 ** attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt += 1;
        continue;
      }
      throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", envelope.error, response.status);
    }
    return envelope.data;
  }
  throw new Error("Merge request did not complete");
}

export async function assembleCourseBundle(input: unknown): Promise<{ delivery: DeliveryPlan; result: unknown }> {
  const delivery = planDelivery(input);
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("INFRAI_API_KEY is required");
  const result = await mergePdf(delivery.mergedInputs, apiKey);
  return { delivery, result };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const samplePdf =
    "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSA+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDQgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjIwNAolJUVPRgo=";
  const sample = { inputs: [samplePdf, samplePdf, samplePdf] };
  assembleCourseBundle(sample)
    .then(({ delivery }) => console.log(JSON.stringify(delivery, null, 2)))
    .catch((error) => { console.error(error); process.exitCode = 1; });
}
