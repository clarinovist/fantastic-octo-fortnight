"use client";

import { ProfileDetailLayout } from "@/components/shared/profile-detail-layout";
import { formatDate } from "@/utils/helpers";
import type { StudentDetail } from "@/utils/types";

type StudentDetailsProps = {
  student: StudentDetail;
};

export function StudentDetails({ student }: StudentDetailsProps) {
  return (
    <ProfileDetailLayout
      photoUrl={student.photoProfile}
      editLink={`/students/form?id=${student.id}`}
      rating={student.rating}
      infoFields={[
        { label: "nama", value: student.name },
        { label: "gender", value: student.gender },
        { label: "tanggal lahir", value: formatDate(student.dateOfBirth) },
        { label: "tanggal premium hingga", value: formatDate(student.premiumUntil) },
        { label: "email", value: student.email },
        { label: "nomor HP", value: student.phoneNumber },
      ]}
      socialMediaLinks={student.socialMediaLinks}
      latitude={student.latitude}
      longitude={student.longitude}
      mapTitle="student-location"
      studentToTutorReview={student.studentToTutorReview}
      tutorToStudentReview={student.tutorToStudentReview}
    />
  );
}
