export const COURSE_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    DRAFT: "draft",
    PUBLISHED: "published",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    WAITING_FOR_APPROVAL: "waiting_for_approval",
} as const;

export const LOOKUP_TYPE_BE = {
    COURSE_STATUS: "course_status",
} as const;

export const DURATION_OPTIONS = [1, 1.5, 2, 2.5, 3, 4, 5, 8, 10, 12, 16, 20, 24];

export const ONLINE_CHANNELS = ["Google Meet", "Zoom", "Skype", "WhatsApp", "Lainnya"];

export const TIMEZONE = ["WIB", "WITA", "WIT"];

export const DAYS_OF_WEEK = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
];
