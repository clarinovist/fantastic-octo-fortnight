package dto

type DashboardStatisticsRequest struct {
	StartDate string `json:"startDate" form:"startDate"`
	EndDate   string `json:"endDate" form:"endDate"`
}

type DashboardStatisticsResponse struct {
	TotalTutors           int64                        `json:"totalTutors"`
	TotalStudents         int64                        `json:"totalStudents"`
	TotalPremiumStudents  int64                        `json:"totalPremiumStudents"`
	TutorsCreatedPerDay   []UserCreatedPerDayResponse  `json:"tutorsCreatedPerDay"`
	StudentsCreatedPerDay []UserCreatedPerDayResponse  `json:"studentsCreatedPerDay"`
	SubscriptionsPerDay   []SubscriptionPerDayResponse `json:"subscriptionsPerDay"`
}

type UserCreatedPerDayResponse struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

type SubscriptionPerDayResponse struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

type SubscriptionStatisticsResponse struct {
	TotalAmount  float64                    `json:"totalAmount"`
	AmountPerDay []SubscriptionAmountPerDay `json:"amountPerDay"`
}

type SubscriptionAmountPerDay struct {
	Date   string  `json:"date"`
	Amount float64 `json:"amount"`
}

type TutorBookingStatisticResponse struct {
	TutorID      string `json:"tutorId"`
	TutorName    string `json:"tutorName"`
	PhotoProfile string `json:"photoProfile"`
	BookingCount int64  `json:"bookingCount"`
}

type StudentBookingStatisticResponse struct {
	StudentID    string `json:"studentId"`
	StudentName  string `json:"studentName"`
	PhotoProfile string `json:"photoProfile"`
	BookingCount int64  `json:"bookingCount"`
}

type CategoryBookingStatisticResponse struct {
	CategoryID   string `json:"categoryId"`
	CategoryName string `json:"categoryName"`
	BookingCount int64  `json:"bookingCount"`
}

type CourseStatisticByCategoryResponse struct {
	CategoryID   string `json:"categoryId"`
	CategoryName string `json:"categoryName"`
	CourseCount  int64  `json:"courseCount"`
}

type TutorViewStatisticResponse struct {
	TutorID      string `json:"tutorId"`
	TutorName    string `json:"tutorName"`
	PhotoProfile string `json:"photoProfile"`
	ViewCount    int64  `json:"viewCount"`
}

type CategoryViewStatisticResponse struct {
	CategoryID   string `json:"categoryId"`
	CategoryName string `json:"categoryName"`
	ViewCount    int64  `json:"viewCount"`
}
