"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { CourseDetail } from "@/utils/types";
import { Star, MapPin, Monitor } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { DetailCourseAction } from "./detail-course-action";
import { DetailCourseDescription } from "./detail-course-description";
import { DetailCoursePricing } from "./detail-course-pricing";
import { DetailCourseReview } from "./detail-course-review";
import { DetailCourseSchedule } from "./detail-course-schedule";
import { DetailCourseTutor } from "./detail-course-tutor";
import { approveCourseAction, rejectCourseAction } from "@/actions/course";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type DetailCourseProps = {
  isBookable?: boolean;
  course: CourseDetail;
};

// Helper function to generate dates array
function generateDates(
  course: CourseDetail,
  selectedTab: "online" | "offline" = "online"
) {
  const locale = "id-ID";
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: "long" });
  const monthFmt = new Intl.DateTimeFormat(locale, { month: "long" });

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 13); // two weeks ahead

  const out: {
    day: string;
    date: string;
    month: string;
    isAvailable: boolean;
    fullDate: string;
  }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get schedules based on selected tab or tutor's classType
  const currentSchedules = (() => {
    if (course.tutor.classType === "all") {
      return selectedTab === "online"
        ? course.courseSchedulesOnline || {}
        : course.courseSchedulesOffline || {};
    } else if (course.tutor.classType === "online") {
      return course.courseSchedulesOnline || {};
    } else {
      return course.courseSchedulesOffline || {};
    }
  })();

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const current = new Date(d);
    // Fix timezone issue by formatting date manually instead of using toISOString
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    const fullDate = `${year}-${month}-${day}`;

    // Check if date is in the past
    const isPastDate = current.getTime() < today.getTime();

    // Check if any time slots are available for this date
    let hasAvailableSlots = false;
    if (!isPastDate) {
      // Map JS getDay() (0 = Sunday, 1 = Monday, ...) to schedule keys
      const dayKey = String(current.getDay() === 0 ? 7 : current.getDay());
      const schedules = currentSchedules[dayKey] || [];

      // Available if there are any schedules for this day
      hasAvailableSlots = schedules.length > 0;
    }

    out.push({
      day: dayFmt.format(current), // e.g. "Senin"
      date: String(current.getDate()), // e.g. "20"
      month: monthFmt.format(current), // e.g. "Agustus"
      isAvailable: !isPastDate && hasAvailableSlots,
      fullDate: fullDate, // e.g. "2024-09-08"
    });
  }
  return out;
}

const TutorAbout = ({ course }: { course: CourseDetail }) => (
  <>
    {course.tutor.description && (
      <div>
        <h3 className="text-lg font-bold mb-4">TENTANG TUTOR</h3>
        <p className="text-sm leading-relaxed text-pretty">
          {course.tutor.description}
        </p>
      </div>
    )}
  </>
);

const StatsInfo = ({ course }: { course: CourseDetail }) => (
  <div className="flex items-center justify-center text-sm text-muted-foreground">
    <span className="text-[#8E8E8E] font-bold">
      {course.totalStudentEnrollment} murid
    </span>
    <div
      className="h-5 border-l border-muted-foreground mx-3"
      aria-hidden="true"
    />
    <div className="flex items-center gap-1">
      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      <span>{course.tutor.rating}</span>
      <span className="text-muted-foreground">
        ({course.tutor.totalRating} ulasan)
      </span>
    </div>
  </div>
);

export function DetailCourse({ course }: DetailCourseProps) {
  const router = useRouter();

  // State for selected schedule
  // State for selected schedule
  const [selectedTab, setSelectedTab] = useState<"online" | "offline">(
    "online"
  );

  // State for approval/rejection dialogs
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate dates using useMemo to ensure they're available on first render
  const dateOptions = useMemo(() => {
    return generateDates(course, selectedTab);
  }, [course, selectedTab]);

  // Handle schedule changes from DetailCourseSchedule
  const handleScheduleChange = (
    _date: string | null,
    _time: string | null,
    _timezone: string | null,
    tab?: "online" | "offline"
  ) => {
    if (tab) {
      setSelectedTab(tab);
    }
  };

  // Handle approve course
  const handleApprove = () => {
    setReviewNotes("");
    setIsApproveDialogOpen(true);
  };

  // Handle reject course
  const handleReject = () => {
    setReviewNotes("");
    setIsRejectDialogOpen(true);
  };

  // Submit approve
  const handleApproveSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await approveCourseAction(course.id, reviewNotes);

      if (result.success) {
        toast.success("Kursus berhasil disetujui");
        setIsApproveDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyetujui kursus");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyetujui kursus");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit reject
  const handleRejectSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await rejectCourseAction(course.id, reviewNotes);

      if (result.success) {
        toast.success("Kursus berhasil ditolak");
        setIsRejectDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menolak kursus");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menolak kursus");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="md:px-4 px-0">
      <DetailCourseAction
        id={course.id}
        status={course.status}
        className="fixed top-18 right-4 z-50"
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui Kursus</DialogTitle>
            <DialogDescription>
              Berikan catatan review untuk persetujuan kursus ini (opsional).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approve-notes">Catatan Review (Opsional)</Label>
              <Textarea
                id="approve-notes"
                placeholder="Masukkan catatan review..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={5}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleApproveSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Memproses..." : "Setujui"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Kursus</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk kursus ini (opsional).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-notes">Alasan Penolakan (Opsional)</Label>
              <Textarea
                id="reject-notes"
                placeholder="Masukkan alasan penolakan..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={5}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleRejectSubmit}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Memproses..." : "Tolak"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Profile Card - Only visible on mobile */}
        <div className="lg:hidden">
          <Card className="overflow-hidden pt-0 shadow-[0px_8px_12px_0px_#00000026]">
            <CardContent className="p-6 space-y-4 pt-0">
              <DetailCourseTutor variant="mobile" course={course} />
              <StatsInfo course={course} />
              <DetailCoursePricing variant="mobile" course={course} />
            </CardContent>
          </Card>
        </div>

        {/* Desktop Sidebar - Only visible on desktop */}
        <div className="hidden lg:block lg:w-[320px] xl:w-[360px] lg:shrink-0 space-y-4 sticky top-8 self-start">
          <Card className="shadow-[0px_8px_12px_0px_#00000026]">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col items-center gap-3">
                <DetailCourseTutor variant="desktop" course={course} />
              </div>
              <StatsInfo course={course} />
              <DetailCoursePricing variant="desktop" course={course} />
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Takes remaining space */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header - Only visible on desktop */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-balance">{course.title}</h1>

            <div className="flex flex-wrap md:flex-nowrap gap-4">
              <div className="flex gap-4">
                {(["all", "offline"] as string[]).includes(
                  course.tutor.classType
                ) && (
                    <div className="max-w-1/2 flex flex-col gap-2">
                      <span className="text-sm font-extrabold">OFFLINE</span>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-primary" />
                        <span className="text-sm">
                          {course.tutor.location.fullName}
                        </span>
                      </div>
                    </div>
                  )}
                {(["all", "online"] as string[]).includes(
                  course.tutor.classType
                ) && (
                    <div
                      className={`max-w-1/2 lg:max-w-fit flex flex-col gap-2 ${(["all"] as string[]).includes(course.tutor.classType)
                        ? "border-l-2 border-muted-foreground pl-4"
                        : ""
                        }`}
                    >
                      <span className="text-sm font-extrabold">ONLINE</span>
                      {course.tutor.onlineChannel.map(
                        (
                          platform: { channel: string; imageURL?: string },
                          idx: number
                        ) => (
                          <div key={idx} className="flex gap-2">
                            {platform.imageURL && (
                              <Image
                                src={`${platform.imageURL}`}
                                alt={platform.channel}
                                width={16}
                                height={16}
                              />
                            )}
                            <span className="text-sm text-[#6B6B6B]">
                              {platform.channel}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
              <Button className="bg-[#7000FE] hover:bg-[#7000FE]/90 text-white w-full md:w-fit">
                {course.tutor.level}
              </Button>
            </div>
          </div>

          <DetailCourseSchedule
            course={course}
            dateOptions={dateOptions}
            onScheduleChange={handleScheduleChange}
          />

          {/* Course and Tutor Info */}
          <DetailCourseDescription course={course} />
          <TutorAbout course={course} />
          <DetailCourseReview course={course} />
        </div>
      </div>
    </div>
  );
}
