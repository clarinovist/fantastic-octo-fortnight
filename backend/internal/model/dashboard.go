package model

type DashboardStatistics struct {
	TotalTutors           int64
	TotalStudents         int64
	TotalPremiumStudents  int64
	TutorsCreatedPerDay   []UserCreatedPerDay
	StudentsCreatedPerDay []UserCreatedPerDay
	SubscriptionsPerDay   []SubscriptionPerDay
}

type UserCreatedPerDay struct {
	Date  string
	Count int64
}

type SubscriptionPerDay struct {
	Date  string
	Count int64
}

type SubscriptionStatistics struct {
	TotalAmount  float64
	AmountPerDay []SubscriptionAmountPerDay
}

type SubscriptionAmountPerDay struct {
	Date   string
	Amount float64
}

type TutorBookingStatistic struct {
	TutorID      string
	TutorName    string
	PhotoProfile string
	BookingCount int64
}

type StudentBookingStatistic struct {
	StudentID    string
	StudentName  string
	PhotoProfile string
	BookingCount int64
}

type CategoryBookingStatistic struct {
	CategoryID   string
	CategoryName string
	BookingCount int64
}

type CourseStatisticByCategory struct {
	CategoryID   string
	CategoryName string
	CourseCount  int64
}

type TutorViewStatistic struct {
	TutorID      string
	TutorName    string
	PhotoProfile string
	ViewCount    int64
}

type CategoryViewStatistic struct {
	CategoryID   string
	CategoryName string
	ViewCount    int64
}
