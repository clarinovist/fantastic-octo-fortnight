import { getStatisticSubscription } from "@/services/statistic";
import { format, subDays } from "date-fns";
import { StatisticSubscription } from "./statistic-subscription";

async function fetchStatisticData(startDate: string, endDate: string) {
  "use server";
  return await getStatisticSubscription(startDate, endDate);
}

export async function StatisticSubscriptionWrapper() {
  const today = new Date();
  const startDate = format(subDays(today, 6), "yyyy-MM-dd");
  const endDate = format(today, "yyyy-MM-dd");

  // Pass the Promise directly to the client component
  const initialDataPromise = getStatisticSubscription(startDate, endDate);

  return (
    <StatisticSubscription
      initialData={initialDataPromise}
      fetchData={fetchStatisticData}
    />
  );
}
