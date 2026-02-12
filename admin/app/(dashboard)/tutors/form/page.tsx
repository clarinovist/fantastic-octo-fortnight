import { createTutorAction, updateTutorAction } from "@/actions/tutor";
import { MainLayout } from "@/components/layout/main-layout";
import { TutorForm, TutorSubmitPayload } from "@/components/tutor/tutor-form";
import { getTutorById } from "@/services/tutor";
import { GENDER_OPTIONS } from "@/utils/constants";
import { getSearchParamValue } from "@/utils/helpers";
import { notFound } from "next/navigation";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TutorFormPage(props: PageProps) {
  const query = await props.searchParams;
  const id = getSearchParamValue(query.id, "");
  const tutorResponse = id ? await getTutorById(id) : null;
  const tutor = tutorResponse?.data || null;
  if (id && !tutor) {
    notFound();
  }

  // Transform TutorDetail to TutorFormValues format
  const initialData = tutor
    ? {
        name: tutor.name,
        email: tutor.email,
        password: "",
        phoneNumber: tutor.phoneNumber,
        gender: tutor.gender as (typeof GENDER_OPTIONS)[number]["value"],
        dateOfBirth: new Date(tutor.dateOfBirth),
        levelPoint: tutor.levelPoint,
        profilePhoto: tutor.photoProfile
          ? {
              url: tutor.photoProfile,
              key: "",
              filename: "",
              size: 0,
            }
          : undefined,
        location:
          tutor.latitude && tutor.longitude
            ? {
                lat: parseFloat(tutor.latitude),
                lng: parseFloat(tutor.longitude),
              }
            : undefined,
        socialMediaLinks: tutor.socialMediaLinks
          ? Object.entries(tutor.socialMediaLinks).map(([platform, url]) => ({
              platform,
              url,
            }))
          : [],
      }
    : undefined;

  // Create a unified action handler
  const handleAction = async (payload: TutorSubmitPayload) => {
    "use server";
    if (id) {
      return await updateTutorAction(id, payload);
    }
    return await createTutorAction(payload);
  };

  return (
    <MainLayout
      title={id ? "Edit Tutor" : "Create Tutor"}
      breadcrumbs={[
        {
          label: "List Tutors",
          href: "/tutors",
        },
        {
          label: id ? "Edit Tutor" : "Create Tutor",
          href: id ? `/tutors/form/${id}` : "/tutors/form",
        },
      ]}
    >
      <div className="@container/main p-4">
        <TutorForm
          action={handleAction}
          initialData={initialData}
          isEditMode={!!id}
        />
      </div>
    </MainLayout>
  );
}
