"use client"

import { PageHeader } from "@/components/layout/page-header"
import { getTutorReviews, getTutorReviewStats } from "@/services/review"
import useSWR from "swr"
import { ReviewCard } from "@/components/review/review-card"
import { Loader2, Star, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function ReviewsPage() {
    const { data: reviewsRes, isLoading: isLoadingReviews } = useSWR("/v1/tutors/reviews", () => getTutorReviews())
    const { data: statsRes } = useSWR("/v1/tutors/reviews/stats", getTutorReviewStats)

    const reviews = reviewsRes?.data || []
    const stats = statsRes?.data

    // Setup default stats if not available
    const totalReviews = stats?.total_reviews || 0
    const averageRating = stats?.average_rating || 0
    const distribution = stats?.rating_distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

    return (
        <>
            <PageHeader
                breadcrumbs={[{ label: "Ulasan & Rating" }]}
            />

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-1">
                            <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center">
                                <h3 className="text-lg font-medium text-muted-foreground mb-2">Total Ulasan</h3>
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-6 w-6 text-primary" />
                                    <span className="text-4xl font-bold">{totalReviews}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    {/* Average Rating Big Number */}
                                    <div className="flex flex-col items-center justify-center min-w-[150px]">
                                        <div className="text-5xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
                                        <div className="flex gap-1 my-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-5 w-5 ${star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-muted-foreground">Rata-rata Rating</p>
                                    </div>

                                    {/* Rating Distribution Bars */}
                                    <div className="flex-1 w-full space-y-2">
                                        {[5, 4, 3, 2, 1].map((rating) => {
                                            const count = distribution[rating] || 0;
                                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                            return (
                                                <div key={rating} className="flex items-center gap-3 text-sm">
                                                    <div className="w-3 font-medium">{rating}</div>
                                                    <Star className="h-3 w-3 text-muted-foreground" />
                                                    <Progress value={percentage} className="h-2" />
                                                    <div className="w-8 text-right text-muted-foreground text-xs">{count}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Ulasan Terbaru</h3>

                        {isLoadingReviews ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground mt-2">Memuat ulasan...</p>
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/10">
                                <p className="text-muted-foreground">Belum ada ulasan dari murid.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {reviews.map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
