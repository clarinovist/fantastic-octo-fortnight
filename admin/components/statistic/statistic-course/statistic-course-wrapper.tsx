import { getStatisticCourse } from "@/services/statistic";
import { StatisticCourse } from "./statistic-course";

export async function StatisticCourseWrapper() {
  const coursesPromise = getStatisticCourse();
  return <StatisticCourse coursesData={coursesPromise} />;
}
