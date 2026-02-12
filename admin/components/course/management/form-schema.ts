import * as z from "zod";

export const formSchema = z.object({
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

export type FormData = z.infer<typeof formSchema>;

export const ONLINE_CHANNELS = ["Zoom", "Google Meet", "Microsoft Teams"];
export const DURATION_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const TIMEZONE = ["WIT", "WITA", "WIB"];
export const DAYS_OF_WEEK = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
];
export const INITIAL_DAYS = ["Senin", "Selasa", "Rabu"];

// Schedule management types
export type TimeSlot = {
    id: string;
    time: string;
};

export type DaySchedule = {
    day: string;
    timeSlots: TimeSlot[];
    isActive: boolean;
    isEditing: boolean;
    type: "online" | "offline";
};
