"use client";

import { createCourseAction, updateCourseAction } from "@/actions/course";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyIdrInput } from "@/components/ui/currency-idr-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { MultipleSelect } from "@/components/ui/multiple-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
=======
import { Form } from "@/components/ui/form";
>>>>>>> 1a19ced (chore: update service folders from local)
import type { CreateCoursePayload } from "@/services/course";
import type {
  ClassType,
  CourseDetail,
  CoursePayload,
  CourseSchedule,
<<<<<<< HEAD
  Tutor,
} from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Plus, SquarePen, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner"; // or your toast library
import * as z from "zod";

const formSchema = z.object({
  classType: z.array(z.string()),
  courseCategoryID: z.string().optional(),
  coursePrices: z.object({
    offline: z
      .array(
        z.object({
          durationInHour: z.number().min(0),
          price: z.number().min(0),
        })
      )
      .min(1),
    online: z
      .array(
        z.object({
          durationInHour: z.number().min(0),
          price: z.number().min(0),
        })
      )
      .min(1),
  }),
  courseSchedulesOffline: z.record(
    z.string(),
    z.array(
      z.object({
        startTime: z.string(),
        timezone: z.string(),
      })
    )
  ),
  courseSchedulesOnline: z.record(
    z.string(),
    z.array(
      z.object({
        startTime: z.string(),
        timezone: z.string(),
      })
    )
  ),
  description: z.string().optional(),
  isFreeFirstCourse: z.boolean(),
  levelEducationCourses: z.array(z.string()),
  onlineChannel: z.array(z.string()),
  subCategoryIDs: z.array(z.string()),
  title: z.string().optional(),
  tutorDescription: z.string().optional(),
  tutorId: z.string().optional(),
  oneHourOnlinePrice: z.number().min(0).optional(),
  oneHourOfflinePrice: z.number().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

const ONLINE_CHANNELS = ["Zoom", "Google Meet", "Microsoft Teams"];
const DURATION_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const TIMEZONE = ["WIT", "WITA", "WIB"];
const DAYS_OF_WEEK = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];
const INITIAL_DAYS = ["Senin", "Selasa", "Rabu"];

// Schedule management types
type TimeSlot = {
  id: string;
  time: string;
};

type DaySchedule = {
  day: string;
  timeSlots: TimeSlot[];
  isActive: boolean;
  isEditing: boolean;
  type: "online" | "offline";
};

const RemoveIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
  >
    <path
      d="M1.2 12L0 10.8L4.8 6L0 1.2L1.2 0L6 4.8L10.8 0L12 1.2L7.2 6L12 10.8L10.8 12L6 7.2L1.2 12Z"
      fill="black"
      fillOpacity="0.25"
    />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <g clipPath="url(#clip0_1216_30362)">
      <path
        d="M16 9.14286H9.14286V16H6.85714V9.14286H0V6.85714H6.85714V0H9.14286V6.85714H16V9.14286Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_1216_30362">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path fillRule="evenodd" clipRule="evenodd" fill="#7000FE" />
  </svg>
);
=======
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
>>>>>>> 1a19ced (chore: update service folders from local)

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
<<<<<<< HEAD
        ? ["Online"]
        : detail.tutor.classType === "offline"
        ? ["Offline"]
        : [],
=======
          ? ["Online"]
          : detail.tutor.classType === "offline"
            ? ["Offline"]
            : [],
>>>>>>> 1a19ced (chore: update service folders from local)
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
<<<<<<< HEAD
    // Fix: Ensure we're using the correct field name and it's an array
=======
>>>>>>> 1a19ced (chore: update service folders from local)
    levelEducationCourses: Array.isArray(detail.levelEducationCourse)
      ? [...detail.levelEducationCourse]
      : [],
    onlineChannel:
      detail.onlineChannel?.map((channel) => channel).filter(Boolean) || [],
    title: detail.title,
<<<<<<< HEAD
    // Fix: Extract subcategory IDs from subCourseCategories
    subCategoryIDs:
      detail.subCourseCategories?.map((subCat) => subCat.id) || [],
    tutorDescription: detail.tutor.description,
    // Set the 1-hour prices from the coursePrices
=======
    subCategoryIDs:
      detail.subCourseCategories?.map((subCat) => subCat.id) || [],
    tutorDescription: detail.tutor.description,
>>>>>>> 1a19ced (chore: update service folders from local)
    oneHourOnlinePrice: detail.coursePrices.online?.find(
      (p) => p.durationInHour === 1
    )
      ? parseInt(
<<<<<<< HEAD
          detail.coursePrices.online
            .find((p) => p.durationInHour === 1)!
            .price.replace(/[^\d]/g, "")
        ) || 0
=======
        detail.coursePrices.online
          .find((p) => p.durationInHour === 1)!
          .price.replace(/[^\d]/g, "")
      ) || 0
>>>>>>> 1a19ced (chore: update service folders from local)
      : 0,
    oneHourOfflinePrice: detail.coursePrices.offline?.find(
      (p) => p.durationInHour === 1
    )
      ? parseInt(
<<<<<<< HEAD
          detail.coursePrices.offline
            .find((p) => p.durationInHour === 1)!
            .price.replace(/[^\d]/g, "")
        ) || 0
=======
        detail.coursePrices.offline
          .find((p) => p.durationInHour === 1)!
          .price.replace(/[^\d]/g, "")
      ) || 0
>>>>>>> 1a19ced (chore: update service folders from local)
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

<<<<<<< HEAD
  // Schedule state management
  const [schedulesOnline, setSchedulesOnline] = useState<DaySchedule[]>([]);
  const [schedulesOffline, setSchedulesOffline] = useState<DaySchedule[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    detail?.courseSchedulesOnline
      ? Object.values(detail.courseSchedulesOnline).flat()[0]?.timezone || "WIB"
      : detail?.courseSchedulesOffline
      ? Object.values(detail.courseSchedulesOffline).flat()[0]?.timezone ||
        "WIB"
      : "WIB"
  );
  const [newTimeHour, setNewTimeHour] = useState<string>("09");
  const [newTimeMinute, setNewTimeMinute] = useState<string>("00");
  const [searchCategoryValue, setSearchCategoryValue] = useState(
    detail?.courseCategory?.name || ""
  );
  const [categorySelected, setCategorySelected] = useState<{
    id: string;
    name: string;
  } | null>(
    detail?.courseCategory
      ? { id: detail.courseCategory.id, name: detail.courseCategory.name }
      : null
  );
  const [subCategoryHasMore, setSubCategoryHasMore] = useState(true);
  const [subCategoryOptions, setSubCategoryOptions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [subCategoryKey, setSubCategoryKey] = useState(0);

  // Add tutor selection states
  const [searchTutorValue, setSearchTutorValue] = useState("");
  const [tutorSelected, setTutorSelected] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Helper function to create schedule from detail data
  const createScheduleFromDetail = (
    schedules: { [key: string]: { startTime: string; timezone: string }[] },
    type: "online" | "offline"
  ): DaySchedule[] => {
    return Object.entries(schedules).map(([dayKey, timeSlots]) => {
      // Convert day index to day name if it's a numeric key (from API)
      const dayName = isNaN(parseInt(dayKey))
        ? dayKey
        : DAYS_OF_WEEK[parseInt(dayKey) - 1] || dayKey;

      return {
        day: dayName,
        timeSlots: timeSlots.map((slot, index) => ({
          id: `${dayName}-${index}-${Date.now()}`,
          time: slot.startTime,
        })),
        isActive: timeSlots.length > 0,
        isEditing: false,
        type,
      };
    });
  };

  // Initialize schedules
  useEffect(() => {
    if (
      detail?.courseSchedulesOnline &&
      Object.keys(detail.courseSchedulesOnline).length > 0
    ) {
      // Initialize from detail data
      const schedulesFromDetail = createScheduleFromDetail(
        detail.courseSchedulesOnline,
        "online"
      );
      setSchedulesOnline(schedulesFromDetail);
    } else {
      // Initialize with default days
      const initialSchedulesOnline: DaySchedule[] = INITIAL_DAYS.map((day) => ({
        day,
        timeSlots: [],
        isActive: false,
        isEditing: false,
        type: "online",
      }));
      setSchedulesOnline(initialSchedulesOnline);
    }
  }, [detail]);

  useEffect(() => {
    if (
      detail?.courseSchedulesOffline &&
      Object.keys(detail.courseSchedulesOffline).length > 0
    ) {
      // Initialize from detail data
      const schedulesFromDetail = createScheduleFromDetail(
        detail.courseSchedulesOffline,
        "offline"
      );
      setSchedulesOffline(schedulesFromDetail);
    } else {
      // Initialize with default days
      const initialSchedulesOffline: DaySchedule[] = INITIAL_DAYS.map(
        (day) => ({
          day,
          timeSlots: [],
          isActive: false,
          isEditing: false,
          type: "offline",
        })
      );
      setSchedulesOffline(initialSchedulesOffline);
    }
  }, [detail]);

  // Watch classType for reactive updates
  const classType = form.watch("classType");
  const oneHourOnlinePrice = form.watch("oneHourOnlinePrice");
  const oneHourOfflinePrice = form.watch("oneHourOfflinePrice");

  // Field arrays for managing dynamic pricing packages
  const {
    fields: onlineFields,
    append: appendOnline,
    remove: removeOnline,
  } = useFieldArray({
    control: form.control,
    name: "coursePrices.online",
  });

  const {
    fields: offlineFields,
    append: appendOffline,
    remove: removeOffline,
  } = useFieldArray({
    control: form.control,
    name: "coursePrices.offline",
  });

  // Sync 1-hour prices with the first package entry
  useEffect(() => {
    const currentOnlinePrices = form.getValues("coursePrices.online");
    const currentOfflinePrices = form.getValues("coursePrices.offline");

    // Update online 1-hour package
    if (
      currentOnlinePrices.length > 0 &&
      currentOnlinePrices[0].durationInHour === 1
    ) {
      form.setValue(`coursePrices.online.0.price`, oneHourOnlinePrice || 0);
    }

    // Update offline 1-hour package
    if (
      currentOfflinePrices.length > 0 &&
      currentOfflinePrices[0].durationInHour === 1
    ) {
      form.setValue(`coursePrices.offline.0.price`, oneHourOfflinePrice || 0);
    }
  }, [oneHourOnlinePrice, oneHourOfflinePrice, form]);

  // Schedule management functions
  const toggleScheduleEdit = (dayIndex: number, type: "online" | "offline") => {
    if (type === "online") {
      setSchedulesOnline((prev) =>
        prev.map((schedule, index) =>
          index === dayIndex
            ? { ...schedule, isEditing: !schedule.isEditing }
            : schedule
        )
      );
    } else {
      setSchedulesOffline((prev) =>
        prev.map((schedule, index) =>
          index === dayIndex
            ? { ...schedule, isEditing: !schedule.isEditing }
            : schedule
        )
      );
    }
  };

  const addTimeSlot = (dayIndex: number, type: "online" | "offline") => {
    const newTime = `${newTimeHour}:${newTimeMinute}`;
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      time: newTime,
    };

    if (type === "online") {
      const schedule = schedulesOnline[dayIndex];
      if (schedule) {
        // Update local state
        setSchedulesOnline((prev) =>
          prev.map((sched, index) =>
            index === dayIndex
              ? {
                  ...sched,
                  timeSlots: [...sched.timeSlots, newSlot],
                  isActive: true,
                }
              : sched
          )
        );

        // Update form data
        const currentSchedules = form.getValues("courseSchedulesOnline");
        const daySchedules = currentSchedules[schedule.day] || [];
        const updatedSchedules = [
          ...daySchedules,
          { startTime: newTime, timezone: selectedTimezone },
        ];
        form.setValue(
          `courseSchedulesOnline.${schedule.day}`,
          updatedSchedules
        );
      }
    } else {
      const schedule = schedulesOffline[dayIndex];
      if (schedule) {
        // Update local state
        setSchedulesOffline((prev) =>
          prev.map((sched, index) =>
            index === dayIndex
              ? {
                  ...sched,
                  timeSlots: [...sched.timeSlots, newSlot],
                  isActive: true,
                }
              : sched
          )
        );

        // Update form data
        const currentSchedules = form.getValues("courseSchedulesOffline");
        const daySchedules = currentSchedules[schedule.day] || [];
        const updatedSchedules = [
          ...daySchedules,
          { startTime: newTime, timezone: selectedTimezone },
        ];
        form.setValue(
          `courseSchedulesOffline.${schedule.day}`,
          updatedSchedules
        );
      }
    }
  };

  const removeTimeSlot = (
    dayIndex: number,
    slotId: string,
    type: "online" | "offline"
  ) => {
    if (type === "online") {
      const schedule = schedulesOnline[dayIndex];
      if (schedule) {
        const updatedTimeSlots = schedule.timeSlots.filter(
          (slot) => slot.id !== slotId
        );

        // Update local state
        setSchedulesOnline((prev) =>
          prev.map((sched, index) =>
            index === dayIndex
              ? {
                  ...sched,
                  timeSlots: updatedTimeSlots,
                  isActive: updatedTimeSlots.length > 0,
                }
              : sched
          )
        );

        // Update form data - rebuild the schedule array without the removed slot
        const currentSchedules = form.getValues("courseSchedulesOnline");
        const daySchedules = currentSchedules[schedule.day] || [];

        // Find the slot index by matching time (since we don't store ID in form)
        const slotToRemove = schedule.timeSlots.find(
          (slot) => slot.id === slotId
        );
        if (slotToRemove) {
          const updatedDaySchedules = daySchedules.filter(
            (formSlot) => formSlot.startTime !== slotToRemove.time
          );

          if (updatedDaySchedules.length > 0) {
            form.setValue(
              `courseSchedulesOnline.${schedule.day}`,
              updatedDaySchedules
            );
          } else {
            // Remove the entire day if no schedules left
            const { [schedule.day]: _, ...remainingSchedules } =
              currentSchedules;
            form.setValue("courseSchedulesOnline", remainingSchedules);
          }
        }
      }
    } else {
      const schedule = schedulesOffline[dayIndex];
      if (schedule) {
        const updatedTimeSlots = schedule.timeSlots.filter(
          (slot) => slot.id !== slotId
        );

        // Update local state
        setSchedulesOffline((prev) =>
          prev.map((sched, index) =>
            index === dayIndex
              ? {
                  ...sched,
                  timeSlots: updatedTimeSlots,
                  isActive: updatedTimeSlots.length > 0,
                }
              : sched
          )
        );

        // Update form data - rebuild the schedule array without the removed slot
        const currentSchedules = form.getValues("courseSchedulesOffline");
        const daySchedules = currentSchedules[schedule.day] || [];

        // Find the slot index by matching time (since we don't store ID in form)
        const slotToRemove = schedule.timeSlots.find(
          (slot) => slot.id === slotId
        );
        if (slotToRemove) {
          const updatedDaySchedules = daySchedules.filter(
            (formSlot) => formSlot.startTime !== slotToRemove.time
          );

          if (updatedDaySchedules.length > 0) {
            form.setValue(
              `courseSchedulesOffline.${schedule.day}`,
              updatedDaySchedules
            );
          } else {
            // Remove the entire day if no schedules left
            const { [schedule.day]: _, ...remainingSchedules } =
              currentSchedules;
            form.setValue("courseSchedulesOffline", remainingSchedules);
          }
        }
      }
    }
  };

  const removeSchedule = (dayIndex: number, type: "online" | "offline") => {
    if (type === "online") {
      const schedule = schedulesOnline[dayIndex];
      if (schedule) {
        // Remove from form data first
        const currentSchedules = form.getValues("courseSchedulesOnline");
        const { [schedule.day]: _, ...remainingSchedules } = currentSchedules;
        form.setValue("courseSchedulesOnline", remainingSchedules);

        // Then remove from local state array
        setSchedulesOnline((prev) =>
          prev.filter((_, index) => index !== dayIndex)
        );
      }
    } else {
      const schedule = schedulesOffline[dayIndex];
      if (schedule) {
        // Remove from form data first
        const currentSchedules = form.getValues("courseSchedulesOffline");
        const { [schedule.day]: _, ...remainingSchedules } = currentSchedules;
        form.setValue("courseSchedulesOffline", remainingSchedules);

        // Then remove from local state array
        setSchedulesOffline((prev) =>
          prev.filter((_, index) => index !== dayIndex)
        );
      }
    }
  };

  // Fix the online channel checkbox logic
  const renderOnlineChannelCheckbox = (channel: string, field: any) => (
    console.log("Rendering channel:", channel, "with value:", field.value),
    (
      <div key={channel} className="flex items-center space-x-2">
        <Checkbox
          id={`online-${channel.replace(/\s+/g, "-").toLowerCase()}`}
          checked={field.value?.includes(channel)}
          disabled={!classType.includes("Online")}
          onCheckedChange={(checked) => {
            if (checked) {
              field.onChange([...(field.value || []), channel]);
            } else {
              field.onChange(field.value?.filter((c: string) => c !== channel));
            }
          }}
        />
        <Label
          htmlFor={`online-${channel.replace(/\s+/g, "-").toLowerCase()}`}
          className="text-sm select-none"
        >
          {channel}
        </Label>
      </div>
    )
  );

  const addNewSchedule = (type: "online" | "offline") => {
    const availableDays = DAYS_OF_WEEK.filter((day) => {
      const schedules = type === "online" ? schedulesOnline : schedulesOffline;
      return !schedules.some((schedule) => schedule.day === day);
    });

    if (availableDays.length === 0) {
      // All days are already added
      return;
    }

    // Add the first available day (you could show a picker instead)
    const newSchedule: DaySchedule = {
      day: availableDays[0],
      timeSlots: [],
      isActive: false,
      isEditing: true,
      type,
    };

    if (type === "online") {
      setSchedulesOnline((prev) => [...prev, newSchedule]);
    } else {
      setSchedulesOffline((prev) => [...prev, newSchedule]);
    }
  };

  // Add this useEffect to update existing schedules when timezone changes
  useEffect(() => {
    if (!selectedTimezone) return;

    // Update all existing online schedules with new timezone
    const currentOnlineSchedules = form.getValues("courseSchedulesOnline");
    const updatedOnlineSchedules: typeof currentOnlineSchedules = {};

    Object.entries(currentOnlineSchedules).forEach(([day, timeSlots]) => {
      if (timeSlots && timeSlots.length > 0) {
        updatedOnlineSchedules[day] = timeSlots.map((slot) => ({
          ...slot,
          timezone: selectedTimezone,
        }));
      }
    });

    // Update all existing offline schedules with new timezone
    const currentOfflineSchedules = form.getValues("courseSchedulesOffline");
    const updatedOfflineSchedules: typeof currentOfflineSchedules = {};

    Object.entries(currentOfflineSchedules).forEach(([day, timeSlots]) => {
      if (timeSlots && timeSlots.length > 0) {
        updatedOfflineSchedules[day] = timeSlots.map((slot) => ({
          ...slot,
          timezone: selectedTimezone,
        }));
      }
    });

    // Update form values
    form.setValue("courseSchedulesOnline", updatedOnlineSchedules);
    form.setValue("courseSchedulesOffline", updatedOfflineSchedules);
  }, [selectedTimezone, form]);
=======
  // Use custom hook for schedule management
  const scheduleProps = useSchedule({ form, detail });
>>>>>>> 1a19ced (chore: update service folders from local)

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
<<<<<<< HEAD
        console.log("Create course result:", result);
=======
>>>>>>> 1a19ced (chore: update service folders from local)

        if (result.success) {
          toast.success("Course created successfully");
          router.push(`/courses`);
        } else {
          toast.error(result.error || "Failed to create course");
        }
      }
<<<<<<< HEAD
    } catch (error) {
=======
    } catch {
>>>>>>> 1a19ced (chore: update service folders from local)
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<<<<<<< HEAD
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} ref={formRef}>
          {/* Audience Section */}
          <div className="relative ">
            <section>
              <div className="flex lg:flex-row xl:flex-none flex-1 flex-col gap-8">
                <div className="space-y-6 md:min-w-[560px] min-w-full">
                  <h3 className="text-2xl mb-10 font-bold">
                    Tingkat dan Subjek/Mata pelajaran
                  </h3>
                  <FormField
                    control={form.control}
                    name="levelEducationCourses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Pilih tingkat
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-y-3 gap-x-6">
                            <div className="grid grid-cols-4 gap-3">
                              {[
                                "TK",
                                "SD",
                                "SMP",
                                "SMA",
                                "MI",
                                "MTs",
                                "MTA",
                                "SMK",
                              ].map((grade) => {
                                const id = `targetGrade-${grade.toLowerCase()}`;
                                const isChecked = (field.value || []).includes(
                                  grade
                                );
                                return (
                                  <div
                                    key={grade}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={id}
                                      checked={!!isChecked}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || [];
                                        let newValue: string[];
                                        if (checked === true) {
                                          newValue = [...currentValue, grade];
                                        } else {
                                          newValue = currentValue.filter(
                                            (g) => g !== grade
                                          );
                                        }
                                        field.onChange(newValue);
                                      }}
                                    />
                                    <Label
                                      htmlFor={id}
                                      className="text-sm select-none cursor-pointer"
                                    >
                                      {grade}
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="courseCategoryID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Pilih subjek
                        </FormLabel>
                        <FormControl>
                          <div className="w-full rounded-md border px-3 py-1 bg-white focus:outline-none focus-visible:ring-black focus-visible:border-black">
                            <SearchableSelect<{ id: string; name: string }>
                              placeholder="Pilih Subjek"
                              icon={<SearchIcon />}
                              iconPosition="right"
                              value={searchCategoryValue}
                              showAllOnFocus
                              onChange={setSearchCategoryValue}
                              apiEndpoint="/api/v1/course-categories"
                              getDisplayText={(category) => category.name}
                              dropdownClassName="left-0 right-0 w-full"
                              renderItem={(category, _, isSelected) => (
                                <button
                                  key={category.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setCategorySelected(category);
                                    setSearchCategoryValue(category.name);
                                    field.onChange(category.id);
                                    form.setValue("subCategoryIDs", []);
                                    setSubCategoryKey((prev) => prev + 1);
                                    setSubCategoryHasMore(true);
                                    setSubCategoryOptions([]);
                                  }}
                                  className={`w-full px-6 py-3 text-left flex items-center gap-3 ${
                                    isSelected ? "bg-purple-100" : ""
                                  }`}
                                >
                                  <span className="text-gray-700">
                                    <span className="text-black font-medium">
                                      {category.name}
                                    </span>
                                  </span>
                                </button>
                              )}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subCategoryIDs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Pilih sub-subjek
                        </FormLabel>
                        <FormControl>
                          <MultipleSelect
                            key={subCategoryKey}
                            options={subCategoryOptions}
                            value={field.value || []}
                            onLoadMore={async (page) => {
                              if (!categorySelected) {
                                setSubCategoryHasMore(false);
                                return [];
                              }
                              try {
                                const response = await fetch(
                                  `/api/v1/course-categories/${categorySelected.id}/sub?page=${page}`,
                                  {
                                    next: { revalidate: 0 },
                                  }
                                );
                                const { data } = await response.json();
                                const newOptions =
                                  data?.map(
                                    (item: { id: string; name: string }) => ({
                                      id: item.id,
                                      label: item.name,
                                    })
                                  ) || [];
                                setSubCategoryOptions((prev) => {
                                  const ids = new Set(
                                    prev.map((opt) => opt.id)
                                  );
                                  const filtered = newOptions.filter(
                                    (opt: { id: string; name: string }) =>
                                      !ids.has(opt.id)
                                  );
                                  return filtered.length > 0
                                    ? [...prev, ...filtered]
                                    : prev;
                                });
                                setSubCategoryHasMore(newOptions.length === 20);
                                return newOptions;
                              } catch (_error) {
                                setSubCategoryHasMore(false);
                                return [];
                              }
                            }}
                            onSelectionChange={(selectedIds) => {
                              field.onChange(selectedIds);
                            }}
                            hasMore={subCategoryHasMore}
                            pageSize={20}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* About Section */}
          <div className="relative ">
            <section>
              <div className="flex lg:flex-row xl:flex-none flex-1 flex-col gap-8">
                <div className="space-y-6 md:min-w-[560px] min-w-full">
                  <h3 className="text-2xl mb-10 font-bold">
                    Tentang Course dan Tutor
                  </h3>

                  {/* Tutor Selection - Only show in create mode */}
                  {!isEditMode && (
                    <FormField
                      control={form.control}
                      name="tutorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">
                            Pilih Tutor <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="w-full rounded-md border px-3 py-1 bg-white focus:outline-none focus-visible:ring-black focus-visible:border-black">
                              <SearchableSelect<Tutor>
                                placeholder="Cari Tutor"
                                icon={<SearchIcon />}
                                iconPosition="right"
                                value={searchTutorValue}
                                showAllOnFocus
                                onChange={setSearchTutorValue}
                                apiEndpoint="/api/v1/admin/tutors"
                                getDisplayText={(tutor) => tutor.name}
                                dropdownClassName="left-0 right-0 w-full"
                                renderItem={(tutor, _, isSelected) => (
                                  <button
                                    key={tutor.id}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setTutorSelected({
                                        id: tutor.id,
                                        name: tutor.name,
                                      });
                                      setSearchTutorValue(tutor.name);
                                      field.onChange(tutor.id);
                                    }}
                                    className={`w-full px-6 py-1 text-left flex items-center gap-3 ${
                                      isSelected ? "bg-purple-100" : ""
                                    }`}
                                  >
                                    <span className="text-gray-700">
                                      <span className="text-black font-medium">
                                        {tutor.name}
                                      </span>
                                      <span className="block text-xs text-gray-500">
                                        {tutor.email}
                                      </span>
                                    </span>
                                  </button>
                                )}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Judul Course
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              {...field}
                              rows={8}
                              maxLength={150}
                              className="min-h-32"
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                              {field.value?.length || 0}/150
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Tentang Course
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              {...field}
                              rows={8}
                              maxLength={150}
                              className="min-h-32"
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                              {field.value?.length || 0}/150
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tutorDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">
                          Tentang Tutor
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              {...field}
                              rows={8}
                              maxLength={150}
                              className="min-h-32"
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                              {field.value?.length || 0}/150
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Pricing Section */}
          <div className="relative ">
            {/* Changed from top-0 to -top-24 */}
            <section>
              <div className="flex lg:flex-row xl:flex-none flex-1 flex-col gap-8">
                <div className="space-y-6 md:min-w-[560px] min-w-full">
                  <h3 className="text-2xl mb-4 font-bold">
                    Tentang Course dan Tutor
                  </h3>
                  <div className="flex md:flex-row flex-col gap-6">
                    <div className="pr-6 border-r-0 md:border-r">
                      <p className="font-bold mb-3">Tipe Course</p>
                      <FormField
                        control={form.control}
                        name={"classType" as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center space-x-3 mb-4">
                                <Checkbox
                                  id="online"
                                  checked={field.value?.includes("Online")}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([
                                        ...(field.value || []),
                                        "Online",
                                      ]);
                                    } else {
                                      const newVal = field.value?.filter(
                                        (g: string) => g !== "Online"
                                      );
                                      field.onChange(newVal);
                                      // reset onlineChannel if "Online" is unchecked
                                      form.setValue("onlineChannel", []);
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor="online"
                                  className="text-lg font-bold select-none"
                                >
                                  ONLINE
                                </Label>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="ml-8 mb-4">
                        <FormField
                          control={form.control}
                          name="onlineChannel"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex flex-col gap-4">
                                  {ONLINE_CHANNELS.map((channel) =>
                                    renderOnlineChannelCheckbox(channel, field)
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={"classType" as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center space-x-3 mb-4">
                                <Checkbox
                                  id="Offline"
                                  checked={field.value?.includes("Offline")}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([
                                        ...(field.value || []),
                                        "Offline",
                                      ]);
                                    } else {
                                      field.onChange(
                                        field.value?.filter(
                                          (g: string) => g !== "Offline"
                                        )
                                      );
                                    }
                                  }}
                                />
                                <Label
                                  htmlFor="Offline"
                                  className="text-lg font-bold select-none"
                                >
                                  OFFLINE
                                </Label>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <p className="font-bold">Tarif Course</p>
                        {/* 1-hour pricing input */}
                        <FormField
                          control={form.control}
                          name="oneHourOnlinePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold">
                                ONLINE
                              </FormLabel>
                              <FormControl>
                                <CurrencyIdrInput
                                  value={field.value || 0}
                                  onChange={field.onChange}
                                  placeholder="Rp XXXXX"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Package pricing */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold mb-4">
                            Package
                          </h4>
                          <div className="space-y-3">
                            {onlineFields
                              .filter(
                                (field) =>
                                  form.getValues(
                                    `coursePrices.online.${onlineFields.indexOf(
                                      field
                                    )}.durationInHour`
                                  ) !== 1
                              )
                              .map((field) => {
                                const index = onlineFields.indexOf(field);
                                return (
                                  <div
                                    key={field.id}
                                    className="flex gap-4 items-end"
                                  >
                                    <FormField
                                      control={form.control}
                                      name={`coursePrices.online.${index}.durationInHour`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs font-bold">
                                            DURASI
                                          </FormLabel>
                                          <FormControl>
                                            <Select
                                              value={
                                                field.value?.toString() || ""
                                              }
                                              onValueChange={(val) =>
                                                field.onChange(parseInt(val))
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Pilih durasi" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {DURATION_OPTIONS.map(
                                                  (duration) => (
                                                    <SelectItem
                                                      key={duration}
                                                      value={duration.toString()}
                                                    >
                                                      {duration} jam
                                                    </SelectItem>
                                                  )
                                                )}
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`coursePrices.online.${index}.price`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1">
                                          <FormLabel className="text-xs font-bold">
                                            TARIF
                                          </FormLabel>
                                          <FormControl>
                                            <CurrencyIdrInput
                                              value={field.value || 0}
                                              onChange={field.onChange}
                                              placeholder="Rp XXXXX"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeOnline(index);
                                      }}
                                    >
                                      <RemoveIcon className="w-4 h-4" />
                                    </Button>
                                  </div>
                                );
                              })}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                appendOnline({ durationInHour: 2, price: 0 });
                              }}
                              className="bg-[#8E8E8E] hover:bg-[#8E8E8E]/90 active:bg-[#8E8E8E]/80"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <p className="invisible font-bold">Tarif Course</p>
                        {/* 1-hour pricing input */}
                        <FormField
                          control={form.control}
                          name="oneHourOfflinePrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold">
                                OFFLINE
                              </FormLabel>
                              <FormControl>
                                <CurrencyIdrInput
                                  value={field.value || 0}
                                  onChange={field.onChange}
                                  placeholder="Rp XXXXX"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Package pricing */}
                        <div className="space-y-4">
                          <h4 className="invisible text-lg font-semibold mb-4">
                            Package
                          </h4>
                          <div className="space-y-3">
                            {offlineFields
                              .filter(
                                (field) =>
                                  form.getValues(
                                    `coursePrices.offline.${offlineFields.indexOf(
                                      field
                                    )}.durationInHour`
                                  ) !== 1
                              )
                              .map((field) => {
                                const index = offlineFields.indexOf(field);
                                return (
                                  <div
                                    key={field.id}
                                    className="flex items-end gap-4"
                                  >
                                    <FormField
                                      control={form.control}
                                      name={`coursePrices.offline.${index}.durationInHour`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs font-bold">
                                            DURASI
                                          </FormLabel>
                                          <FormControl>
                                            <Select
                                              value={
                                                field.value?.toString() || ""
                                              }
                                              onValueChange={(val) =>
                                                field.onChange(parseInt(val))
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Pilih durasi" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {DURATION_OPTIONS.map(
                                                  (duration) => (
                                                    <SelectItem
                                                      key={duration}
                                                      value={duration.toString()}
                                                    >
                                                      {duration} jam
                                                    </SelectItem>
                                                  )
                                                )}
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`coursePrices.offline.${index}.price`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1">
                                          <FormLabel className="text-xs font-bold">
                                            TARIF
                                          </FormLabel>
                                          <FormControl>
                                            <CurrencyIdrInput
                                              value={field.value || 0}
                                              onChange={field.onChange}
                                              placeholder="0"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeOffline(index);
                                      }}
                                    >
                                      <RemoveIcon className="w-4 h-4" />
                                    </Button>
                                  </div>
                                );
                              })}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                appendOffline({ durationInHour: 2, price: 0 });
                              }}
                              className="bg-[#8E8E8E] hover:bg-[#8E8E8E]/90 active:bg-[#8E8E8E]/80"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-24 flex justify-center">
                    <FormField
                      control={form.control}
                      name="isFreeFirstCourse"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="isFreeFirstCourse"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <Label
                                htmlFor="isFreeFirstCourse"
                                className="tex-xs"
                              >
                                Aktifkan label{" "}
                                <span className="font-bold">
                                  Sesi Pertama Gratis
                                </span>
                              </Label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Schedule Section */}
          <div className="relative ">
            {/* Changed from top-0 to -top-24 */}
            <section>
              <div className="flex lg:flex-row xl:flex-none flex-1 flex-col gap-8">
                <div className="space-y-6 md:min-w-[560px] min-w-full">
                  <h3 className="text-2xl mb-4 font-bold">
                    Availability Schedule
                  </h3>
                  <div className="flex md:flex-row flex-col gap-6">
                    <div className="pr-6">
                      <p className="font-bold mb-3">Zona Waktu</p>
                      <RadioGroup
                        value={selectedTimezone}
                        onValueChange={setSelectedTimezone}
                        className="flex flex-col gap-4"
                      >
                        {TIMEZONE.map((time) => (
                          <div
                            key={time}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={time}
                              id={`timezone-${time
                                .replace(/\s+/g, "-")
                                .toLowerCase()}`}
                            />
                            <Label
                              htmlFor={`timezone-${time
                                .replace(/\s+/g, "-")
                                .toLowerCase()}`}
                              className="text-sm select-none cursor-pointer"
                            >
                              {time}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="border-r-0 md:border-r max-h-[300px]" />
                    <div className="pr-6">
                      <p className="font-bold mb-3">Online</p>
                      <div className="flex-1 space-y-4">
                        {schedulesOnline.map((schedule, index) => (
                          <Card
                            key={schedule.day}
                            className={`p-2 min-w-[280px] bg-white rounded-2xl shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] transition-all hover:border-gray-300 ${
                              schedule.isEditing
                                ? "border hover:border-black"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col gap-3">
                                <h3 className="text-lg font-bold">
                                  {schedule.day}
                                </h3>
                                {schedule.isEditing ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                      <Select
                                        value={newTimeHour}
                                        onValueChange={setNewTimeHour}
                                      >
                                        <SelectTrigger className="w-24 border">
                                          <SelectValue placeholder="00" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from(
                                            { length: 24 },
                                            (_, i) => (
                                              <SelectItem
                                                key={i}
                                                value={i
                                                  .toString()
                                                  .padStart(2, "0")}
                                              >
                                                {i.toString().padStart(2, "0")}
                                              </SelectItem>
                                            )
                                          )}
                                        </SelectContent>
                                      </Select>
                                      <span className="font-medium">:</span>
                                      <Select
                                        value={newTimeMinute}
                                        onValueChange={setNewTimeMinute}
                                      >
                                        <SelectTrigger className="w-24">
                                          <SelectValue placeholder="00" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="00">00</SelectItem>
                                          <SelectItem value="15">15</SelectItem>
                                          <SelectItem value="30">30</SelectItem>
                                          <SelectItem value="45">45</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        type="button"
                                        size="sm"
                                        className="ml-auto bg-[#8E8E8E] hover:bg-gray-600 text-white rounded-lg w-8 h-8 p-0"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          addTimeSlot(index, "online");
                                        }}
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                      {schedule.timeSlots.map((slot) => (
                                        <div
                                          key={slot.id}
                                          className="flex items-center gap-1"
                                        >
                                          <Button
                                            type="button"
                                            className="relative group bg-black hover:bg-black text-white px-6 py-2 rounded-xl font-medium"
                                          >
                                            <span className="inline-block transition-opacity duration-150 group-hover:opacity-0">
                                              {slot.time}
                                            </span>
                                            <span
                                              onClick={() =>
                                                removeTimeSlot(
                                                  index,
                                                  slot.id,
                                                  "online"
                                                )
                                              }
                                              className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                                aria-hidden
                                              >
                                                <path
                                                  d="M4 4L12 12"
                                                  stroke="white"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                                <path
                                                  d="M12 4L4 12"
                                                  stroke="white"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            </span>
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-2 flex-wrap">
                                    {schedule.timeSlots.length === 0 ? (
                                      <p className="text-gray-500 italic">
                                        No time slots added
                                      </p>
                                    ) : (
                                      schedule.timeSlots.map((slot) => (
                                        <Button
                                          key={slot.id}
                                          type="button"
                                          variant="secondary"
                                          className="bg-[#B4B4B4] hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium"
                                        >
                                          {slot.time}
                                        </Button>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                {!schedule.isEditing ? (
                                  <>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleScheduleEdit(index, "online");
                                      }}
                                    >
                                      <SquarePen className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-400 hover:text-red-500"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeSchedule(index, "online");
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="lg"
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleScheduleEdit(index, "online");
                                    }}
                                  >
                                    <Check className="w-12 h-12" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addNewSchedule("online");
                          }}
                          className="bg-[#8E8E8E] hover:bg-[#8E8E8E]/90 active:bg-[#8E8E8E]/80"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="border-r-0 md:border-r max-h-[300px]" />
                    <div className="pr-6">
                      <p className="font-bold mb-3">Offline</p>
                      <div className="flex-1 space-y-4">
                        {schedulesOffline.map((schedule, index) => (
                          <Card
                            key={schedule.day}
                            className={`p-2 min-w-[280px] bg-white rounded-2xl shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] transition-all hover:border-gray-300 ${
                              schedule.isEditing
                                ? "border-black hover:border-black"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col gap-3">
                                <h3 className="text-lg font-bold">
                                  {schedule.day}
                                </h3>
                                {schedule.isEditing ? (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                      <Select
                                        value={newTimeHour}
                                        onValueChange={setNewTimeHour}
                                      >
                                        <SelectTrigger className="w-24">
                                          <SelectValue placeholder="00" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from(
                                            { length: 24 },
                                            (_, i) => (
                                              <SelectItem
                                                key={i}
                                                value={i
                                                  .toString()
                                                  .padStart(2, "0")}
                                              >
                                                {i.toString().padStart(2, "0")}
                                              </SelectItem>
                                            )
                                          )}
                                        </SelectContent>
                                      </Select>
                                      <span className="font-medium">:</span>
                                      <Select
                                        value={newTimeMinute}
                                        onValueChange={setNewTimeMinute}
                                      >
                                        <SelectTrigger className="w-24 border">
                                          <SelectValue placeholder="00" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="00">00</SelectItem>
                                          <SelectItem value="15">15</SelectItem>
                                          <SelectItem value="30">30</SelectItem>
                                          <SelectItem value="45">45</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        type="button"
                                        size="sm"
                                        className="ml-auto bg-[#8E8E8E] hover:bg-gray-600 text-white rounded-lg w-8 h-8 p-0"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          addTimeSlot(index, "offline");
                                        }}
                                      >
                                        <Plus className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                      {schedule.timeSlots.map((slot) => (
                                        <div
                                          key={slot.id}
                                          className="flex items-center gap-1"
                                        >
                                          <Button
                                            type="button"
                                            className="relative group bg-black hover:bg-black text-white px-6 py-2 rounded-xl font-medium"
                                          >
                                            <span className="inline-block transition-opacity duration-150 group-hover:opacity-0">
                                              {slot.time}
                                            </span>
                                            <span
                                              onClick={() =>
                                                removeTimeSlot(
                                                  index,
                                                  slot.id,
                                                  "offline"
                                                )
                                              }
                                              className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                                            >
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 16 16"
                                                fill="none"
                                                aria-hidden
                                              >
                                                <path
                                                  d="M4 4L12 12"
                                                  stroke="white"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                                <path
                                                  d="M12 4L4 12"
                                                  stroke="white"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            </span>
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-2 flex-wrap">
                                    {schedule.timeSlots.length === 0 ? (
                                      <p className="text-gray-500 italic">
                                        No time slots added
                                      </p>
                                    ) : (
                                      schedule.timeSlots.map((slot) => (
                                        <Button
                                          key={slot.id}
                                          type="button"
                                          variant="secondary"
                                          className="bg-[#B4B4B4] hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium"
                                        >
                                          {slot.time}
                                        </Button>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                {!schedule.isEditing ? (
                                  <>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleScheduleEdit(index, "offline");
                                      }}
                                    >
                                      <SquarePen className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-gray-400 hover:text-red-500"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeSchedule(index, "offline");
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="lg"
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleScheduleEdit(index, "offline");
                                    }}
                                  >
                                    <Check className="w-12 h-12" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addNewSchedule("offline");
                          }}
                          className="bg-[#8E8E8E] hover:bg-[#8E8E8E]/90 active:bg-[#8E8E8E]/80"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Add submit button at the end of your form */}
          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Update Course"
                : "Create Course"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
=======
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
>>>>>>> 1a19ced (chore: update service folders from local)
  );
}
