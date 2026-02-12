export interface BookingStudent {
    id: string;
    name: string;
    email: string;
    phone: string;
    photo_url: string | null;
}

export interface BookingCourse {
    id: string;
    title: string;
    category: string;
    level: string;
}

export interface Booking {
    id: string;
    student: BookingStudent;
    course: BookingCourse;
    booking_date: string; // ISO Date
    booking_time: string; // HH:mm
    duration_minutes: number;
    class_type: "online" | "offline";
    status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
    total_price: number;
    notes?: string;
    created_at: string;
    meeting_url?: string; // For online
    location?: { // For offline
        address: string;
        latitude: number;
        longitude: number;
    };
}

export interface BookingStats {
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
    total: number;
}
