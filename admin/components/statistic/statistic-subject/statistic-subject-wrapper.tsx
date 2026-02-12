import { getTopSubjectBooked, getTopSubjectViewed } from "@/services/statistic";
import { TopSubjects } from "./statistic-subject";

export async function TopSubjectsWrapper() {
  const topBookedPromise = getTopSubjectBooked();
  const topViewedPromise = getTopSubjectViewed();

  return (
    <TopSubjects
      topBookedData={topBookedPromise}
      topViewedData={topViewedPromise}
    />
  );
}
