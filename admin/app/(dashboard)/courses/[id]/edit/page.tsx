import { ManagementForm } from "@/components/course/management-form";
import { MainLayout } from "@/components/layout/main-layout";
import { getCourseDetail } from "@/services/course";

type CourseEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseEditPage(params: CourseEditPageProps) {
  const resolvedParams = await params.params;
  const courseId = resolvedParams.id;
  const courseResponse = await getCourseDetail(courseId);
  if (!courseResponse.data) {
    return (
      <MainLayout title="Course Not Found">
        <div className="@container/main p-4">
          <h1 className="text-2xl font-bold">Course Not Found</h1>
          <p>The requested course does not exist.</p>
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout title={`Edit Course - ${courseResponse.data?.title || ""}`}>
      <div className="@container/main p-4">
        {/* Replace the following div with your CourseEditForm component */}
        <ManagementForm detail={courseResponse.data} />
      </div>
    </MainLayout>
  );
}
