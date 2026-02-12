export interface Review {
    id: string;
    student_id: string;
    student_name: string;
    student_photo?: string;
    rating: number;
    comment: string;
    created_at: string;
    course_name?: string;
}

export interface ReviewStats {
    average_rating: number;
    total_reviews: number;
    rating_distribution: { [key: number]: number }; // e.g. { 5: 10, 4: 5, ... }
}
