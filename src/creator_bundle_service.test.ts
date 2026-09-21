import { planDelivery } from "./creator_bundle_service.ts";

const plan = planDelivery({ inputs: ["welcome.pdf", "lesson.pdf"] });
if (plan.mergedInputs.length !== 2) throw new Error("expected two documents in the bundle");
if (plan.subscriberUpdate !== "Course bundle assembled from 2 lesson documents") {
  throw new Error("subscriber update should describe the assembled bundle");
}
console.log("planDelivery business decision passed");
