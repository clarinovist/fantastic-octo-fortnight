import { Card } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";

type Review = {
  id: string;
  name: string;
  courseTitle: string;
  review: string | null;
  rating: number | null;
  recommendByStudent?: "yes" | "no" | null;
};

type ReviewSectionProps = {
  title: string;
  reviews: Review[];
  showRecommendByStudent?: boolean;
  onEditClick?: (review: Review) => void;
  onDeleteClick?: (reviewId: string) => void;
};

export function ReviewSection({
  title,
  reviews,
  showRecommendByStudent = false,
  onEditClick,
  onDeleteClick,
}: ReviewSectionProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      <div className="space-y-4">
        {reviews.length === 0 && (
          <p className="text-sm text-foreground">no reviews yet</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="space-y-3 bg-muted p-4 rounded-md">
            <div className="flex items-center justify-between">
              <p className="font-medium text-foreground">{review.name}</p>
              <div className="flex gap-2">
                {onEditClick && (
                  <button
                    className="p-1.5 hover:bg-background rounded transition-colors"
                    onClick={() => onEditClick(review)}
                    type="button"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                {onDeleteClick && (
                  <button
                    className="p-1.5 hover:bg-background rounded transition-colors"
                    onClick={() => onDeleteClick(review.id)}
                    type="button"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">course</p>
              <p className="text-sm text-foreground">{review.courseTitle}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">review</p>
              <p className="text-sm text-foreground">{review.review}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">rating</p>
              <p className="text-sm text-foreground">
                {review.rating || "no"} rating
              </p>
            </div>
            {showRecommendByStudent && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  recommend by student
                </p>
                <p className="text-sm text-foreground">
                  {review.recommendByStudent || "-"}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
