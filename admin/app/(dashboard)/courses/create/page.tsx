import { MainLayout } from "@/components/layout/main-layout";
import { CourseWizard } from "@/components/course/course-wizard";
// import type { Tutor, CourseCategory } from "@/utils/types";
import { getTutors } from "@/services/tutor";
import { getCategories } from "@/services/course";

export default async function CourseCreatePage() {
  const [tutorsRes, categoriesRes] = await Promise.all([
    getTutors({ page: 1, pageSize: 100 }),
    getCategories(),
  ]);

  const tutors = tutorsRes?.data || [];
  const categories = categoriesRes?.data || [];

  return (
    <MainLayout title="Create New Course">
      <div className="@container/main p-4 md:p-8">
        <CourseWizard
          tutors={tutors}
          categories={categories}
        />
      </div>
    </MainLayout>
  );
}
