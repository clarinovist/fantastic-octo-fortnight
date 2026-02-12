import type { Plan } from "@/utils/types/subscription";
import { fetcherBase } from "./base";

export const getPlans = (): Promise<{ data: Plan[] }> => {
  return fetcherBase(`/v1/students/subscriptions/prices`, {
    next: { tags: ["plans"] },
  });
}
