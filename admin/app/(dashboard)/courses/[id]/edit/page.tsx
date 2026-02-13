import { MainLayout } from "@/components/layout/main-layout";
import { CourseWizard } from "@/components/course/course-wizard";
import { getTutors } from "@/services/tutor";
import { getCategories, getCourseDetail } from "@/services/course";
import { notFound } from "next/navigation";

interface CourseEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseEditPage({ params }: CourseEditPageProps) {
  const { id } = await params;
  const [tutorsRes, categoriesRes, courseRes] = await Promise.all([
    getTutors({ page: 1, pageSize: 100 }),
    getCategories(),
    getCourseDetail(id),
  ]);

  const tutors = tutorsRes?.data || [];
  const categories = categoriesRes?.data || [];
  const course = courseRes?.data;

  if (!course) {
    notFound();
  }

  return (
    <MainLayout title="Edit Course">
      <div className="@container/main p-4 md:p-8">
        <CourseWizard
          tutors={tutors}
          categories={categories}
          initialData={course}
          isEditMode={true}
        />
      </div>
    </MainLayout>
  );
}
