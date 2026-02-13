import { MainLayout } from "@/components/layout/main-layout";
import { TutorDetails } from "@/components/tutor/tutor-detail";
import {
  getCoursesByTutor,
  getTutorById,
  getTutotrDocuments,
} from "@/services/tutor";

type DetailTutorPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DetailTutorPage(pageProps: DetailTutorPageProps) {
  const { id } = await pageProps.params;
  const [tutor, tutorDocuments, courses] = await Promise.all([
    getTutorById(id),
    getTutotrDocuments(id),
    getCoursesByTutor(id),
  ]);
  return (
    <MainLayout
      title="Tutor Details"
      breadcrumbs={[
        {
          label: "List Tutor",
          href: "/tutors",
        },
      ]}
    >
      <div className="@container/main p-4">
        <TutorDetails
          tutor={tutor.data}
          courses={courses.data}
          documents={tutorDocuments.data}
        />
      </div>
    </MainLayout>
  );
}
