import { getTopBookingStudents } from "@/services/statistic";
import { TopStudents } from "./top-students";

export async function TopStudentsWrapper() {
  const topBookedPromise = getTopBookingStudents();

  return <TopStudents topBookedData={topBookedPromise} />;
}
