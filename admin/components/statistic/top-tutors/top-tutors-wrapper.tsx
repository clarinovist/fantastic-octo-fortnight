import { getTopBookedTutors, getTopViewedTutors } from "@/services/statistic";
import { TopTutors } from "./top-tutors";

export async function TopTutorsWrapper() {
  const topBookedPromise = getTopBookedTutors();
  const topViewedPromise = getTopViewedTutors();

  return (
    <TopTutors
      topBookedData={topBookedPromise}
      topViewedData={topViewedPromise}
    />
  );
}
