<<<<<<< HEAD
import { MainLayout } from "@/components/layout/main-layout";
import { SubscriptionList } from "@/components/subscription/subscription-list";
import { getSubscriptionPricess } from "@/services/subscription";
import { getSearchParamValue } from "@/utils/helpers";

type SubscriptionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SubscriptionsPage({
  searchParams,
}: SubscriptionsPageProps) {
  const query = await searchParams;
  const page = getSearchParamValue(query.page, 1);
  const pageSize = getSearchParamValue(query.pageSize, 10);

  const subscriptions = await getSubscriptionPricess();

  return (
    <MainLayout title="Subscriptions">
      <div className="@container/main p-4">
        <SubscriptionList
          subscriptions={subscriptions.data || []}
          totalData={subscriptions.metadata?.total || 0}
          currentPage={page}
          pageSize={pageSize}
        />
      </div>
    </MainLayout>
  );
=======
import { getSubscriptionPricess } from "@/services/subscription";
import { SubscriptionSettings } from "@/components/subscription/subscription-settings";

export default async function Page() {
    const { data: subscriptionPrices } = await getSubscriptionPricess();

    return (
        <div className="flex-1 w-full max-w-[1440px] mx-auto py-8">
            <SubscriptionSettings initialData={subscriptionPrices || []} />
        </div>
    );
>>>>>>> 1a19ced (chore: update service folders from local)
}
