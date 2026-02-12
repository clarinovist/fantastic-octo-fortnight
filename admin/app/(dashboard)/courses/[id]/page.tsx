import { DetailCourse } from "@/components/course/detail/detail-course";
import { MainLayout } from "@/components/layout/main-layout";
import { getCourseDetail } from "@/services/course";
import { notFound } from "next/navigation";

type CoursePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  const resolvedParams = await params;
  const courseId = resolvedParams.id;
  const courseResponse = await getCourseDetail(courseId);
  if (!courseResponse.success) {
    notFound();
  }
  return (
    <MainLayout title={`Course Details - ${courseResponse.data.title}`}>
      <div className="@container/main p-4">
        <DetailCourse course={courseResponse.data} />
      </div>
    </MainLayout>
  );
}
