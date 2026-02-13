"use client";

import {
    deleteStudentReviewAction,
    updateStudentReviewAction,
} from "@/actions/student";
import {
    deleteTutorReviewAction,
    updateTutorReviewAction,
} from "@/actions/tutor";
import { ReviewSection } from "@/components/shared/review-section";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";

// -- Types --

type InfoField = {
    label: string;
    value: ReactNode;
};

type ReviewItem = {
    id: string;
    name: string;
    courseTitle: string;
    courseDescription?: string;
    review: string | null;
    rating: number | null;
    recommendByStudent?: "yes" | "no" | null;
};

type ReviewFormData = {
    id: string;
    review: string;
    rate: string;
    recommendByStudent: "yes" | "no" | null;
    type: "student" | "tutor";
};

export type ProfileDetailLayoutProps = {
    /** Photo URL */
    photoUrl?: string;
    /** Edit profile link */
    editLink: string;
    /** Rating number */
    rating: number;
    /** Extra sidebar content (level, status, etc.) */
    sidebarExtra?: ReactNode;
    /** Info fields for the main card */
    infoFields: InfoField[];
    /** Social media links */
    socialMediaLinks?: Record<string, string>;
    /** Latitude for map */
    latitude?: string;
    /** Longitude for map */
    longitude?: string;
    /** Map iframe title (for unique selector) */
    mapTitle?: string;
    /** Student→Tutor reviews */
    studentToTutorReview: ReviewItem[];
    /** Tutor→Student reviews */
    tutorToStudentReview: ReviewItem[];
    /** Extra content sections between map and reviews (documents, courses, etc.) */
    children?: ReactNode;
};

// -- Component --

export function ProfileDetailLayout({
    photoUrl,
    editLink,
    rating,
    sidebarExtra,
    infoFields,
    socialMediaLinks,
    latitude,
    longitude,
    mapTitle = "profile-location",
    studentToTutorReview,
    tutorToStudentReview,
    children,
}: ProfileDetailLayoutProps) {
    const router = useRouter();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletingReviewId, setDeletingReviewId] = useState("");
    const [deletingReviewType, setDeletingReviewType] = useState<
        "student" | "tutor"
    >("student");
    const [editingReview, setEditingReview] = useState<ReviewFormData>({
        id: "",
        review: "",
        rate: "",
        recommendByStudent: null,
        type: "student",
    });

    // -- Review handlers --

    const handleEditClick = (
        review: {
            id: string;
            review: string | null;
            rating: number | null;
            recommendByStudent?: "yes" | "no" | null;
        },
        type: "student" | "tutor"
    ) => {
        setEditingReview({
            id: review.id,
            review: review.review || "",
            rate: review.rating?.toString() || "",
            recommendByStudent: review.recommendByStudent || null,
            type,
        });
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (reviewId: string, type: "student" | "tutor") => {
        setDeletingReviewId(reviewId);
        setDeletingReviewType(type);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            let result;
            if (deletingReviewType === "student") {
                result = await deleteTutorReviewAction(deletingReviewId);
            } else {
                result = await deleteStudentReviewAction(deletingReviewId);
            }
            if (result.success) {
                toast.success("Review deleted successfully");
                setIsDeleteDialogOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete review");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsDeleting(false);
            setDeletingReviewId("");
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let result;
            if (editingReview.type === "student") {
                result = await updateTutorReviewAction({
                    id: editingReview.id,
                    review: editingReview.review,
                    rate: editingReview.rate,
                    recommendByStudent: editingReview.recommendByStudent,
                });
            } else {
                result = await updateStudentReviewAction({
                    id: editingReview.id,
                    review: editingReview.review,
                    rate: editingReview.rate,
                    recommendByStudent: null,
                });
            }
            if (result?.success && result?.data?.success) {
                toast.success("Review updated successfully");
                setIsEditDialogOpen(false);
                router.refresh();
            } else {
                toast.error(
                    result?.error || result?.data?.message || "Failed to update review"
                );
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="p-6 sticky top-6">
                        {/* Photo */}
                        <div className="mb-6">
                            <Avatar className="w-full h-40 rounded-lg mb-4">
                                <AvatarImage src={photoUrl} />
                                <AvatarFallback className="rounded-lg text-xs text-muted-foreground">
                                    photo profile
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Edit Button */}
                        <Link href={editLink}>
                            <Button variant="outline" className="w-full mb-6 bg-transparent">
                                <Edit2 className="w-4 h-4 mr-2" />
                                edit profile
                            </Button>
                        </Link>

                        {/* Extra sidebar content (level, status, etc.) */}
                        {sidebarExtra}

                        {/* Rating */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                rating:
                            </p>
                            <div className="flex items-center gap-1">
                                {rating === 0 && (
                                    <p className="text-sm text-foreground">no ratings yet</p>
                                )}
                                {rating > 0 && (
                                    <span className="flex items-center gap-1">
                                        {rating} ratings
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Personal Information */}
                    <Card className="p-8">
                        <div className="space-y-8">
                            {infoFields.map((field) => (
                                <div key={field.label}>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        {field.label}
                                    </p>
                                    <p className="text-xl font-semibold text-foreground">
                                        {field.value || "-"}
                                    </p>
                                </div>
                            ))}

                            {/* Social Media */}
                            {socialMediaLinks &&
                                Object.keys(socialMediaLinks).length > 0 && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            social media
                                        </p>
                                        <div className="space-y-3">
                                            {Object.entries(socialMediaLinks).map(
                                                ([platform, handle]) =>
                                                    handle ? (
                                                        <div key={platform} className="flex gap-4">
                                                            <span className="text-foreground font-medium min-w-16">
                                                                {platform}
                                                            </span>
                                                            <a
                                                                href={
                                                                    handle.startsWith("http")
                                                                        ? handle
                                                                        : `https://${handle}`
                                                                }
                                                                className="text-primary hover:underline"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {handle}
                                                            </a>
                                                        </div>
                                                    ) : null
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </Card>

                    {/* Location Map */}
                    {latitude && longitude && (
                        <Card className="p-0">
                            <div className="relative h-64 w-full overflow-hidden rounded-md border border-border">
                                <iframe
                                    title={mapTitle}
                                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                                        `${latitude},${longitude}`
                                    )}&z=15&output=embed`}
                                    className="w-full h-full border-0"
                                    loading="lazy"
                                    allowFullScreen
                                />
                                <div className="absolute top-3 right-3 flex flex-col gap-2">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-9 w-9 bg-background shadow-md hover:bg-background/90"
                                        onClick={() => {
                                            const iframe = document.querySelector(
                                                `iframe[title="${mapTitle}"]`
                                            ) as HTMLIFrameElement;
                                            if (iframe) {
                                                iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(
                                                    `${latitude},${longitude}`
                                                )}&z=15&output=embed`;
                                            }
                                        }}
                                    >
                                        <MapPin className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Extra sections (documents, courses, etc.) */}
                    {children}

                    {/* Reviews */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ReviewSection
                            title="ulasan student → tutor"
                            reviews={studentToTutorReview}
                            showRecommendByStudent={true}
                            onEditClick={(review) => handleEditClick(review, "student")}
                            onDeleteClick={(reviewId) =>
                                handleDeleteClick(reviewId, "student")
                            }
                        />
                        <ReviewSection
                            title="ulasan tutor → student"
                            reviews={tutorToStudentReview}
                            showRecommendByStudent={false}
                            onEditClick={(review) => handleEditClick(review, "tutor")}
                            onDeleteClick={(reviewId) =>
                                handleDeleteClick(reviewId, "tutor")
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Edit Review Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Review</DialogTitle>
                        <DialogDescription>
                            Update the review details below.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="review">Review</Label>
                            <Textarea
                                id="review"
                                value={editingReview.review}
                                onChange={(e) =>
                                    setEditingReview({
                                        ...editingReview,
                                        review: e.target.value,
                                    })
                                }
                                placeholder="Enter review text"
                                rows={4}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rate">Rating</Label>
                            <Input
                                id="rate"
                                type="number"
                                min="1"
                                max="5"
                                step="0.1"
                                value={editingReview.rate}
                                onChange={(e) =>
                                    setEditingReview({ ...editingReview, rate: e.target.value })
                                }
                                placeholder="Enter rating (1-5)"
                                required
                            />
                        </div>
                        {editingReview.type === "student" && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="recommendByStudent"
                                    checked={editingReview.recommendByStudent === "yes"}
                                    onCheckedChange={(checked) =>
                                        setEditingReview({
                                            ...editingReview,
                                            recommendByStudent: checked === true ? "yes" : "no",
                                        })
                                    }
                                />
                                <Label
                                    htmlFor="recommendByStudent"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    Recommend by student
                                </Label>
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            review.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
