import { createStudentAction, updateStudentAction } from "@/actions/student";
import { MainLayout } from "@/components/layout/main-layout";
import {
  StudentForm,
  StudentSubmitPayload,
} from "@/components/student/student-form";
import { getStudentById } from "@/services/student";
import { GENDER_OPTIONS } from "@/utils/constants";
import { getSearchParamValue } from "@/utils/helpers";
import { notFound } from "next/navigation";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StudentFormPage(props: PageProps) {
  const query = await props.searchParams;
  const id = getSearchParamValue(query.id, "");
  const studentResponse = id ? await getStudentById(id) : null;
  const student = studentResponse?.data || null;

  if (id && !student) {
    notFound();
  }

  // Transform StudentDetail to StudentFormValues format
  const initialData = student
    ? {
        name: student.name,
        email: student.email,
        password: "",
        phoneNumber: student.phoneNumber,
        gender: student.gender as (typeof GENDER_OPTIONS)[number]["value"],
        dateOfBirth: new Date(student.dateOfBirth),
        premiumUntil: student.premiumUntil ? new Date(student.premiumUntil) : undefined,
        profilePhoto: student.photoProfile
          ? {
              url: student.photoProfile,
              key: "",
              filename: "",
              size: 0,
            }
          : undefined,
        location:
          student.latitude && student.longitude
            ? {
                lat: parseFloat(student.latitude),
                lng: parseFloat(student.longitude),
              }
            : undefined,
        socialMediaLinks: student.socialMediaLinks
          ? Object.entries(student.socialMediaLinks).map(([platform, url]) => ({
              platform,
              url,
            }))
          : [],
      }
    : undefined;

  // Create a unified action handler
  const handleAction = async (payload: StudentSubmitPayload) => {
    "use server";
    if (id) {
      return await updateStudentAction(id, payload);
    }
    return await createStudentAction(payload);
  };

  return (
    <MainLayout
      title={id ? "Edit Student" : "Create Student"}
      breadcrumbs={[
        {
          label: "List Students",
          href: "/students",
        },
        {
          label: id ? "Edit Student" : "Create Student",
          href: id ? `/students/form/${id}` : "/students/form",
        },
      ]}
    >
      <div className="@container/main p-4">
        <StudentForm
          action={handleAction}
          initialData={initialData}
          isEditMode={!!id}
        />
      </div>
    </MainLayout>
  );
}
