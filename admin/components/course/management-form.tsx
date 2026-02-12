"use client";

import { createCourseAction, updateCourseAction } from "@/actions/course";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { CreateCoursePayload } from "@/services/course";
import type {
  ClassType,
  CourseDetail,
  CoursePayload,
  CourseSchedule,
} from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { formSchema, FormData, DAYS_OF_WEEK } from "./management/form-schema";
import { useSchedule } from "./management/use-schedule";
import { BasicInfoSection } from "./management/sections/basic-info";
import { AboutSection } from "./management/sections/about";
import { PricingSection } from "./management/sections/pricing";
import { ScheduleSection } from "./management/sections/schedule";

type ManagementFormProps = {
  detail?: CourseDetail;
};

const transformDetailToFormData = (detail: CourseDetail): Partial<FormData> => {
  // Helper function to transform schedules from API format to form format
  const transformSchedules = (schedules: {
    [key: string]: { startTime: string; timezone: string }[];
  }) => {
    const transformed: {
      [key: string]: { startTime: string; timezone: string }[];
    } = {};

    Object.entries(schedules).forEach(([dayIndex, timeSlots]) => {
      // Convert day index to day name (assuming 1-7 maps to DAYS_OF_WEEK)
      const dayName = DAYS_OF_WEEK[parseInt(dayIndex) - 1];
      if (dayName && timeSlots && timeSlots.length > 0) {
        transformed[dayName] = timeSlots.map((slot) => ({
          startTime: slot.startTime,
          timezone: slot.timezone,
        }));
      }
    });

    return transformed;
  };

  return {
    classType:
      detail.tutor.classType === "all"
        ? ["Online", "Offline"]
        : detail.tutor.classType === "online"
          ? ["Online"]
          : detail.tutor.classType === "offline"
            ? ["Offline"]
            : [],
    courseCategoryID: detail.courseCategory.id,
    coursePrices: {
      offline: detail.coursePrices.offline?.map((price) => ({
        durationInHour: price.durationInHour,
        price: parseInt(price.price.replace(/[^\d]/g, "")) || 0,
      })) || [{ durationInHour: 1, price: 0 }],
      online: detail.coursePrices.online?.map((price) => ({
        durationInHour: price.durationInHour,
        price: parseInt(price.price.replace(/[^\d]/g, "")) || 0,
      })) || [{ durationInHour: 1, price: 0 }],
    },
    courseSchedulesOffline: transformSchedules(
      detail.courseSchedulesOffline || {}
    ),
    courseSchedulesOnline: transformSchedules(
      detail.courseSchedulesOnline || {}
    ),
    description: detail.description,
    isFreeFirstCourse: detail.isFreeFirstCourse,
    levelEducationCourses: Array.isArray(detail.levelEducationCourse)
      ? [...detail.levelEducationCourse]
      : [],
    onlineChannel:
      detail.onlineChannel?.map((channel) => channel).filter(Boolean) || [],
    title: detail.title,
    subCategoryIDs:
      detail.subCourseCategories?.map((subCat) => subCat.id) || [],
    tutorDescription: detail.tutor.description,
    oneHourOnlinePrice: detail.coursePrices.online?.find(
      (p) => p.durationInHour === 1
    )
      ? parseInt(
        detail.coursePrices.online
          .find((p) => p.durationInHour === 1)!
          .price.replace(/[^\d]/g, "")
      ) || 0
      : 0,
    oneHourOfflinePrice: detail.coursePrices.offline?.find(
      (p) => p.durationInHour === 1
    )
      ? parseInt(
        detail.coursePrices.offline
          .find((p) => p.durationInHour === 1)!
          .price.replace(/[^\d]/g, "")
      ) || 0
      : 0,
  };
};

export function ManagementForm({ detail }: ManagementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null!);
  const isEditMode = !!detail;

  // Transform detail data if provided
  const defaultValues = useMemo(() => {
    if (detail) {
      return transformDetailToFormData(detail);
    }
    return {
      classType: [],
      courseCategoryID: "",
      coursePrices: {
        offline: [
          { durationInHour: 1, price: 0 },
          { durationInHour: 2, price: 0 },
        ],
        online: [
          { durationInHour: 1, price: 0 },
          { durationInHour: 2, price: 0 },
        ],
      },
      courseSchedulesOffline: {
        Senin: [{ startTime: "", timezone: "" }],
        Selasa: [{ startTime: "", timezone: "" }],
        Rabu: [{ startTime: "", timezone: "" }],
      },
      courseSchedulesOnline: {
        Senin: [{ startTime: "", timezone: "" }],
        Selasa: [{ startTime: "", timezone: "" }],
        Rabu: [{ startTime: "", timezone: "" }],
      },
      description: "",
      isFreeFirstCourse: true,
      levelEducationCourses: [],
      onlineChannel: [],
      subCategoryIDs: [],
      title: "",
      tutorDescription: "",
      tutorId: "",
      oneHourOnlinePrice: 0,
      oneHourOfflinePrice: 0,
    };
  }, [detail]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  // Use custom hook for schedule management
  const scheduleProps = useSchedule({ form, detail });

  // Helper function to convert day name to index (1-7)
  const getDayIndex = (dayName: string): string => {
    const index = DAYS_OF_WEEK.indexOf(dayName);
    return (index + 1).toString(); // 1-7 for Monday-Sunday
  };

  // Transform form data to API payload
  const transformFormDataToPayload = (formData: FormData): CoursePayload => {
    // Determine classType
    let classType: ClassType;
    if (
      formData.classType.includes("Online") &&
      formData.classType.includes("Offline")
    ) {
      classType = "all";
    } else if (formData.classType.includes("Online")) {
      classType = "online";
    } else {
      classType = "offline";
    }

    // Transform schedules to API format
    const transformSchedules = (
      schedules: Record<string, { startTime: string; timezone: string }[]>
    ): CourseSchedule => {
      const transformed: CourseSchedule = {};

      Object.entries(schedules).forEach(([dayName, timeSlots]) => {
        // Filter out empty time slots
        const validTimeSlots = timeSlots.filter(
          (slot) => slot.startTime && slot.startTime.trim() !== ""
        );

        // Only add day if it has valid time slots
        if (validTimeSlots.length > 0) {
          const dayIndex = getDayIndex(dayName);
          transformed[dayIndex] = validTimeSlots.map((slot) => {
            // Normalize time format to HH:MM:SS
            let normalizedTime = slot.startTime;

            // Remove any existing seconds if already in HH:MM:SS format
            const timeParts = normalizedTime.split(":");
            if (timeParts.length === 3) {
              // Already has seconds, use as-is
              normalizedTime = slot.startTime;
            } else if (timeParts.length === 2) {
              // Only HH:MM, add seconds
              normalizedTime = `${slot.startTime}:00`;
            }

            return {
              startTime: normalizedTime,
              timezone: slot.timezone,
              classType: classType,
            };
          });
        }
      });

      return transformed;
    };

    // Convert prices to strings
    const coursePrices = {
      offline: formData.coursePrices.offline.map((price) => ({
        durationInHour: price.durationInHour,
        price: price.price.toString(),
      })),
      online: formData.coursePrices.online.map((price) => ({
        durationInHour: price.durationInHour,
        price: price.price.toString(),
      })),
    };

    return {
      classType,
      courseCategoryID: formData.courseCategoryID || "",
      coursePrices,
      courseSchedulesOffline: transformSchedules(
        formData.courseSchedulesOffline
      ),
      courseSchedulesOnline: transformSchedules(formData.courseSchedulesOnline),
      description: formData.description || "",
      isFreeFirstCourse: formData.isFreeFirstCourse,
      levelEducationCourses: formData.levelEducationCourses,
      onlineChannel: formData.onlineChannel,
      subCategoryIDs: formData.subCategoryIDs,
      title: formData.title || "",
      tutorDescription: formData.tutorDescription || "",
    };
  };

  // Transform form data to API payload for create
  const transformFormDataToCreatePayload = (
    formData: FormData
  ): CreateCoursePayload => {
    // Determine classType
    let classType: ClassType;
    if (
      formData.classType.includes("Online") &&
      formData.classType.includes("Offline")
    ) {
      classType = "all";
    } else if (formData.classType.includes("Online")) {
      classType = "online";
    } else {
      classType = "offline";
    }

    // Transform schedules to API format
    const transformSchedules = (
      schedules: Record<string, { startTime: string; timezone: string }[]>
    ): CourseSchedule => {
      const transformed: CourseSchedule = {};

      Object.entries(schedules).forEach(([dayName, timeSlots]) => {
        // Filter out empty time slots
        const validTimeSlots = timeSlots.filter(
          (slot) => slot.startTime && slot.startTime.trim() !== ""
        );

        // Only add day if it has valid time slots
        if (validTimeSlots.length > 0) {
          const dayIndex = getDayIndex(dayName);
          transformed[dayIndex] = validTimeSlots.map((slot) => ({
            startTime: `${slot.startTime}:00`,
            timezone: slot.timezone,
            classType: classType,
          }));
        }
      });

      return transformed;
    };

    // Convert prices to numbers (already numbers in form)
    const coursePrices = {
      offline: formData.coursePrices.offline.map((price) => ({
        durationInHour: price.durationInHour,
        price: price.price,
      })),
      online: formData.coursePrices.online.map((price) => ({
        durationInHour: price.durationInHour,
        price: price.price,
      })),
    };

    return {
      classType,
      courseCategoryID: formData.courseCategoryID || "",
      coursePrices,
      courseSchedulesOffline: transformSchedules(
        formData.courseSchedulesOffline
      ),
      courseSchedulesOnline: transformSchedules(formData.courseSchedulesOnline),
      description: formData.description || "",
      isFreeFirstCourse: formData.isFreeFirstCourse,
      levelEducationCourses: formData.levelEducationCourses,
      onlineChannel: formData.onlineChannel,
      subCategoryIDs: formData.subCategoryIDs,
      title: formData.title || "",
      tutorDescription: formData.tutorDescription || "",
      tutorId: formData.tutorId || "",
    };
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // Edit mode - update existing course
        if (!detail?.id) {
          toast.error("Course ID is missing");
          return;
        }

        const payload = transformFormDataToPayload(data);
        const result = await updateCourseAction(detail.id, payload);

        if (result.success) {
          toast.success("Course updated successfully");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update course");
        }
      } else {
        // Create mode - create new course
        if (!data.tutorId) {
          toast.error("Please select a tutor");
          return;
        }

        const payload = transformFormDataToCreatePayload(data);
        const result = await createCourseAction(payload);

        if (result.success) {
          toast.success("Course created successfully");
          router.push(`/courses`);
        } else {
          toast.error(result.error || "Failed to create course");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} ref={formRef}>

        {/* Basic Info Section */}
        <BasicInfoSection form={form} />

        {/* About Section */}
        <AboutSection form={form} isEditMode={isEditMode} />

        {/* Pricing Section */}
        <PricingSection form={form} />

        {/* Schedule Section */}
        <ScheduleSection
          form={form}
          {...scheduleProps}
        />

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Course"
                : "Create Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
