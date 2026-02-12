export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export type Booking = {
  id: string;
  bookingDate: string;
  studentName: string;
  tutorName: string;
  status: BookingStatus;
  courseTitle: string;
}

export type BookingDetail = {
  id: string;
  code: string;
  reportBooking: {
    id: string,
    bookingId: string,
    studentId: string,
    topic: string,
    body: string,
    status: string,
    createdAt: string,
    updatedAt: string
  }
  student: {
    name: string;
    gender: string | null;
    email: string;
    dateOfBirth: string | null;
    phoneNumber: string;
    socialMediaLink: Record<string, string>;
    photoProfile: string | null;
  };
  tutor: {
    name: string;
    gender: string | null;
    email: string;
    dateOfBirth: string | null;
    phoneNumber: string;
    socialMediaLink: Record<string, string>;
    photoProfile: string | null;
  };
  course: {
    title: string;
    description: string;
  };
  bookingDate: string;
  bookingTime: string;
  timezone: string;
  classType: string;
  latitude: string;
  longitude: string;
  notesTutor: string | null;
  notesStudent: string | null;
  status: BookingStatus;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
}
