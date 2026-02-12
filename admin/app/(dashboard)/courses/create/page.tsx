import { ManagementForm } from "@/components/course/management-form";
import { MainLayout } from "@/components/layout/main-layout";

export default function CourseCreatePage() {
  return (
    <MainLayout title="Create New Course">
      <div className="@container/main p-4">
        <ManagementForm />
      </div>
    </MainLayout>
  );
}