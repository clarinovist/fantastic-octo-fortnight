import { getSubscriptionPricess } from "@/services/subscription";
import { SubscriptionSettings } from "@/components/subscription/subscription-settings";

export default async function Page() {
    const { data: subscriptionPrices } = await getSubscriptionPricess();

    return (
        <div className="flex-1 w-full max-w-[1440px] mx-auto py-8">
            <SubscriptionSettings initialData={subscriptionPrices || []} />
        </div>
    );
}
