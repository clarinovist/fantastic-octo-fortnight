import { MainLayout } from "@/components/layout/main-layout";
import { StatisticCourseWrapper } from "@/components/statistic/statistic-course/statistic-course-wrapper";
import { TopSubjectsWrapper } from "@/components/statistic/statistic-subject/statistic-subject-wrapper";
import { StatisticSubscriptionWrapper } from "@/components/statistic/statistic-subscription/statistic-subscription-wrapper";
import { StatisticUserWrapper } from "@/components/statistic/statistic-user/statistic-user-wrapper";
import { TopStudentsWrapper } from "@/components/statistic/top-student/top-student-wrapper";
import { TopTutorsWrapper } from "@/components/statistic/top-tutors/top-tutors-wrapper";

export default async function Page() {
  return (
    <MainLayout>
      <div className="@container/main flex flex-1 flex-col gap-2 p-4">
        <StatisticUserWrapper />
        <StatisticSubscriptionWrapper />
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-2">
          <TopTutorsWrapper />
          <TopStudentsWrapper />
          <TopSubjectsWrapper />
        </div>
        <StatisticCourseWrapper />
      </div>
    </MainLayout>
  );
}
