import type { BaseResponse, StatisticCourse, StatisticSubscription, StatisticUser, TopBookedTutor, TopBookingStudent, TopSubjectBooked, TopSubjectViewed, TopViewedTutor } from "@/utils/types";
import { fetcherBase } from "./base";

export async function getStatisticSubscription(startDate: string, endDate: string): Promise<BaseResponse<StatisticSubscription>> {
  const qs = new URLSearchParams();
  qs.append('startDate', startDate);
  qs.append('endDate', endDate);
  return fetcherBase<StatisticSubscription>(`/v1/admin/dashboard/statistic-subscription?${qs.toString()}`, {
    next: { tags: ['statistic-subscription'] },
  });
}

export async function getStatisticUser(startDate: string, endDate: string): Promise<BaseResponse<StatisticUser>> {
  const qs = new URLSearchParams();
  qs.append('startDate', startDate);
  qs.append('endDate', endDate);
  return fetcherBase<StatisticUser>(`/v1/admin/dashboard/statistic-user?${qs.toString()}`, {
    next: { tags: ['statistic-user'] },
  });
}

export async function getTopBookedTutors(): Promise<BaseResponse<TopBookedTutor[]>> {
  return fetcherBase<TopBookedTutor[]>(`/v1/admin/dashboard/statistic-tutor`, {
    next: { tags: ['top-booked-tutors'] },
  });
}

export async function getTopBookingStudents(): Promise<BaseResponse<TopBookingStudent[]>> {
  return fetcherBase<TopBookingStudent[]>(`/v1/admin/dashboard/statistic-student`, {
    next: { tags: ['top-booked-students'] },
  });
}

export async function getTopViewedTutors(): Promise<BaseResponse<TopViewedTutor[]>> {
  return fetcherBase<TopViewedTutor[]>(`/v1/admin/dashboard/statistic-tutor-view`, {
    next: { tags: ['top-viewed-tutors'] },
  });
}

export async function getTopSubjectBooked(): Promise<BaseResponse<TopSubjectBooked[]>> {
  return fetcherBase<TopSubjectBooked[]>(`/v1/admin/dashboard/statistic-category`, {
    next: { tags: ['top-subject-booked'] },
  });
}

export async function getTopSubjectViewed(): Promise<BaseResponse<TopSubjectViewed[]>> {
  return fetcherBase<TopSubjectViewed[]>(`/v1/admin/dashboard/statistic-category-view`, {
    next: { tags: ['top-subject-viewed'] },
  });
}

export async function getStatisticCourse(): Promise<BaseResponse<StatisticCourse[]>> {
  return fetcherBase<StatisticCourse[]>(`/v1/admin/dashboard/statistic-course`, {
    next: { tags: ['statistic-course'] },
  });
}
