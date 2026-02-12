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
import { Star } from "lucide-react";
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
              <div className="flex justify-center">
                <div className="bg-[#EDEDED] rounded-full flex gap-2 py-2 px-4 justify-center">
                  {/* Tiktok */}
                  <div className="cursor-pointer hover:opacity-70 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M12.1071 2.50667C11.4969 1.81291 11.1606 0.922133 11.1607 0H8.40179V11.0222C8.38095 11.6188 8.12814 12.1841 7.6967 12.5987C7.26526 13.0133 6.68893 13.2448 6.08929 13.2444C4.82143 13.2444 3.76786 12.2133 3.76786 10.9333C3.76786 9.40444 5.25 8.25778 6.77679 8.72889V5.92C3.69643 5.51111 1 7.89333 1 10.9333C1 13.8933 3.46429 16 6.08036 16C8.88393 16 11.1607 13.7333 11.1607 10.9333V5.34222C12.2795 6.14209 13.6226 6.57124 15 6.56889V3.82222C15 3.82222 13.3214 3.90222 12.1071 2.50667Z"
                        fill="#7000FE"
                      />
                    </svg>
                  </div>
                  {/* Instagram */}
                  <div className="cursor-pointer hover:opacity-70 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_581_14834)">
                        <path
                          d="M4.64 0H11.36C13.92 0 16 2.08 16 4.64V11.36C16 12.5906 15.5111 13.7708 14.641 14.641C13.7708 15.5111 12.5906 16 11.36 16H4.64C2.08 16 0 13.92 0 11.36V4.64C0 3.4094 0.488856 2.22919 1.35902 1.35902C2.22919 0.488856 3.4094 0 4.64 0ZM4.48 1.6C3.71618 1.6 2.98364 1.90343 2.44353 2.44353C1.90343 2.98364 1.6 3.71618 1.6 4.48V11.52C1.6 13.112 2.888 14.4 4.48 14.4H11.52C12.2838 14.4 13.0164 14.0966 13.5565 13.5565C14.0966 13.0164 14.4 12.2838 14.4 11.52V4.48C14.4 2.888 13.112 1.6 11.52 1.6H4.48ZM12.2 2.8C12.4652 2.8 12.7196 2.90536 12.9071 3.09289C13.0946 3.28043 13.2 3.53478 13.2 3.8C13.2 4.06522 13.0946 4.31957 12.9071 4.50711C12.7196 4.69464 12.4652 4.8 12.2 4.8C11.9348 4.8 11.6804 4.69464 11.4929 4.50711C11.3054 4.31957 11.2 4.06522 11.2 3.8C11.2 3.53478 11.3054 3.28043 11.4929 3.09289C11.6804 2.90536 11.9348 2.8 12.2 2.8ZM8 4C9.06087 4 10.0783 4.42143 10.8284 5.17157C11.5786 5.92172 12 6.93913 12 8C12 9.06087 11.5786 10.0783 10.8284 10.8284C10.0783 11.5786 9.06087 12 8 12C6.93913 12 5.92172 11.5786 5.17157 10.8284C4.42143 10.0783 4 9.06087 4 8C4 6.93913 4.42143 5.92172 5.17157 5.17157C5.92172 4.42143 6.93913 4 8 4ZM8 5.6C7.36348 5.6 6.75303 5.85286 6.30294 6.30294C5.85286 6.75303 5.6 7.36348 5.6 8C5.6 8.63652 5.85286 9.24697 6.30294 9.69706C6.75303 10.1471 7.36348 10.4 8 10.4C8.63652 10.4 9.24697 10.1471 9.69706 9.69706C10.1471 9.24697 10.4 8.63652 10.4 8C10.4 7.36348 10.1471 6.75303 9.69706 6.30294C9.24697 5.85286 8.63652 5.6 8 5.6Z"
                          fill="#7000FE"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_581_14834">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  {/* LinkedIn */}
                  <div className="cursor-pointer hover:opacity-70 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <g clipPath="url(#clip0_581_14836)">
                        <path
                          d="M14.2222 0C14.6937 0 15.1459 0.187301 15.4793 0.520699C15.8127 0.854097 16 1.30628 16 1.77778V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V1.77778C0 1.30628 0.187301 0.854097 0.520699 0.520699C0.854097 0.187301 1.30628 0 1.77778 0H14.2222ZM13.7778 13.7778V9.06667C13.7778 8.29813 13.4725 7.56107 12.929 7.01763C12.3856 6.47419 11.6485 6.16889 10.88 6.16889C10.1244 6.16889 9.24444 6.63111 8.81778 7.32444V6.33778H6.33778V13.7778H8.81778V9.39556C8.81778 8.71111 9.36889 8.15111 10.0533 8.15111C10.3834 8.15111 10.6999 8.28222 10.9333 8.5156C11.1667 8.74898 11.2978 9.06551 11.2978 9.39556V13.7778H13.7778ZM3.44889 4.94222C3.84495 4.94222 4.22478 4.78489 4.50484 4.50484C4.78489 4.22478 4.94222 3.84495 4.94222 3.44889C4.94222 2.62222 4.27556 1.94667 3.44889 1.94667C3.05047 1.94667 2.66838 2.10494 2.38666 2.38666C2.10494 2.66838 1.94667 3.05047 1.94667 3.44889C1.94667 4.27556 2.62222 4.94222 3.44889 4.94222ZM4.68444 13.7778V6.33778H2.22222V13.7778H4.68444Z"
                          fill="#7000FE"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_581_14836">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  {/* Locked */}
                  <div className="ml-4 cursor-pointer hover:opacity-70 transition-opacity">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M3.5 16C3.0875 16 2.7345 15.8509 2.441 15.5528C2.1475 15.2546 2.0005 14.8957 2 14.4762V6.85714C2 6.4381 2.147 6.07949 2.441 5.78133C2.735 5.48317 3.088 5.33384 3.5 5.33333H4.25V3.80952C4.25 2.75556 4.61575 1.85727 5.34725 1.11467C6.07875 0.372064 6.963 0.000508457 8 5.20071e-07C9.037 -0.000507416 9.9215 0.371048 10.6535 1.11467C11.3855 1.85829 11.751 2.75657 11.75 3.80952V5.33333H12.5C12.9125 5.33333 13.2657 5.48267 13.5597 5.78133C13.8537 6.08 14.0005 6.4386 14 6.85714V14.4762C14 14.8952 13.8532 15.2541 13.5597 15.5528C13.2662 15.8514 12.913 16.0005 12.5 16H3.5ZM8 12.1905C8.4125 12.1905 8.76575 12.0414 9.05975 11.7432C9.35375 11.4451 9.5005 11.0862 9.5 10.6667C9.4995 10.2471 9.35275 9.88851 9.05975 9.59086C8.76675 9.29321 8.4135 9.14387 8 9.14286C7.5865 9.14184 7.2335 9.29117 6.941 9.59086C6.6485 9.89054 6.5015 10.2491 6.5 10.6667C6.4985 11.0842 6.6455 11.443 6.941 11.7432C7.2365 12.0434 7.5895 12.1925 8 12.1905ZM5.75 5.33333H10.25V3.80952C10.25 3.1746 10.0312 2.63492 9.59375 2.19048C9.15625 1.74603 8.625 1.52381 8 1.52381C7.375 1.52381 6.84375 1.74603 6.40625 2.19048C5.96875 2.63492 5.75 3.1746 5.75 3.80952V5.33333Z"
                        fill="black"
                      />
                    </svg>
                  </div>
                </div>
              </div>
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
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M2.90768 2.05043C3.5763 1.40036 4.37008 0.884705 5.2437 0.532891C6.11732 0.181077 7.05367 0 7.99928 0C8.94489 0 9.88124 0.181077 10.7549 0.532891C11.6285 0.884705 12.4223 1.40036 13.0909 2.05043C14.4414 3.36413 15.2 5.14543 15.2 7.00273C15.2 8.86003 14.4414 10.6413 13.0909 11.955L11.9306 13.069L9.42595 15.4389C9.06615 15.7774 8.59139 15.9763 8.09119 15.998C7.59098 16.0197 7.09987 15.8628 6.71043 15.5569L6.57363 15.4389L4.47219 13.454L2.90871 11.955C1.5585 10.6414 0.800049 8.86029 0.800049 7.00323C0.800049 5.14617 1.5585 3.36509 2.90871 2.05142M7.99928 4.50033C7.31727 4.50033 6.6632 4.76371 6.18094 5.23253C5.69869 5.70136 5.42776 6.33722 5.42776 7.00023C5.42776 7.66325 5.69869 8.29911 6.18094 8.76793C6.6632 9.23675 7.31727 9.50013 7.99928 9.50013C8.68128 9.50013 9.33536 9.23675 9.81761 8.76793C10.2999 8.29911 10.5708 7.66325 10.5708 7.00023C10.5708 6.33722 10.2999 5.70136 9.81761 5.23253C9.33536 4.76371 8.68128 4.50033 7.99928 4.50033Z"
                            fill="#7000FE"
                          />
                        </svg>
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
