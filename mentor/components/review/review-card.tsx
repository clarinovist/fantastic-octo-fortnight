import { Review } from "@/utils/types/review";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
    review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={review.student_photo} alt={review.student_name} />
                        <AvatarFallback>{review.student_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold text-sm">{review.student_name}</h4>
                                <div className="flex items-center gap-1 mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={cn(
                                                "h-3 w-3",
                                                star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                            )}
                                        />
                                    ))}
                                    <span className="text-xs text-muted-foreground ml-2">
                                        {format(new Date(review.created_at), "d MMMM yyyy", { locale: id })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            {review.comment}
                        </p>
                        {review.course_name && (
                            <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-muted-foreground">
                                    Course: <span className="font-medium text-foreground">{review.course_name}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
