import type { BaseResponse, SubscriptionItem } from "@/utils/types";
import { fetcherBase } from "./base";

export async function getSubscriptionPricess(): Promise<
  BaseResponse<SubscriptionItem[]>
> {
  return fetcherBase<SubscriptionItem[]>("/v1/admin/subscription-prices", {
    next: { tags: ["subscriptions"] },
  });
}

export type UpdateSubscriptionPayload = {
  interval: "monthly" | "yearly";
  name: string;
  price: number;
};

export async function updateSubscriptionPrices(
  subscriptionId: string,
  payload: UpdateSubscriptionPayload
) {
  return fetcherBase<SubscriptionItem>(
    `/v1/admin/subscription-prices/${subscriptionId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}
