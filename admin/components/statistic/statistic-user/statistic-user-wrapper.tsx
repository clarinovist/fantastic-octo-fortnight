import { getStatisticUser } from "@/services/statistic";
import { format, subDays } from "date-fns";
import { StatisticUser } from "./statistic-user";

async function fetchStatisticData(startDate: string, endDate: string) {
  "use server";
  return await getStatisticUser(startDate, endDate);
}

export async function StatisticUserWrapper() {
  const today = new Date();
  const startDate = format(subDays(today, 6), "yyyy-MM-dd");
  const endDate = format(today, "yyyy-MM-dd");

  // Pass the Promise directly to the client component
  const initialDataPromise = getStatisticUser(startDate, endDate);

  return (
    <StatisticUser
      initialData={initialDataPromise}
      fetchData={fetchStatisticData}
    />
  );
}
