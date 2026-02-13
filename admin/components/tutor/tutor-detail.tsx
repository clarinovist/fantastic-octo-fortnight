"use client";

import { ProfileDetailLayout } from "@/components/shared/profile-detail-layout";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/utils/helpers";
import type { TutorCourse, TutorDetail, TutorDocument } from "@/utils/types";
import TutorCourses from "./tutor-courses";
import TutorDocuments from "./tutor-documents";

type TutorDetailsProps = {
  tutor: TutorDetail;
  documents: TutorDocument[];
  courses: TutorCourse[];
};

const getTutorLevel = (points: number): string => {
  return points <= 24 ? "Guru Aktif" : "Guru Favorit";
};

export function TutorDetails({ tutor, documents, courses }: TutorDetailsProps) {
  return (
    <ProfileDetailLayout
      photoUrl={tutor.photoProfile}
      editLink={`/tutors/form?id=${tutor.id}`}
      rating={tutor.rating}
      sidebarExtra={
        <>
          {/* Level */}
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-muted-foreground">level:</p>
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold text-foreground">
                {getTutorLevel(tutor.levelPoint)}
              </span>
              <span className="text-xs text-muted-foreground">
                {tutor.levelPoint} points
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-muted-foreground">status:</p>
            <span
              className={`inline-block text-xs px-2 py-1 rounded-full font-medium capitalize ${tutor.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                }`}
            >
              {tutor.status}
            </span>
          </div>
        </>
      }
      infoFields={[
        { label: "nama", value: tutor.name },
        { label: "gender", value: tutor.gender },
        { label: "tanggal lahir", value: formatDate(tutor.dateOfBirth) },
        { label: "email", value: tutor.email },
        { label: "nomor HP", value: tutor.phoneNumber },
      ]}
      socialMediaLinks={tutor.socialMediaLinks}
      latitude={tutor.latitude}
      longitude={tutor.longitude}
      mapTitle="tutor-location"
      studentToTutorReview={tutor.studentToTutorReview}
      tutorToStudentReview={tutor.tutorToStudentReview}
    >
      {/* Documents Section */}
      <Card className="p-8">
        <TutorDocuments documents={documents} tutor={tutor} />
      </Card>

      {/* Courses Section */}
      <Card className="p-8">
        <TutorCourses courses={courses} />
      </Card>
    </ProfileDetailLayout>
  );
}
