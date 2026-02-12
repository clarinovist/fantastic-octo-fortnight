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
import { formatDate } from "@/utils/helpers";
import type { TutorCourse, TutorDetail, TutorDocument } from "@/utils/types";
import { Edit2, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import TutorCourses from "./tutor-courses";
import TutorDocuments from "./tutor-documents";

type TutorDetailsProps = {
  tutor: TutorDetail;
  documents: TutorDocument[];
  courses: TutorCourse[];
};

type ReviewFormData = {
  id: string;
  review: string;
  rate: string;
  recommendByStudent: "yes" | "no" | null;
  type: "student" | "tutor";
};

// Helper function to get tutor level based on points
const getTutorLevel = (points: number): string => {
  return points <= 24 ? "Guru Aktif" : "Guru Favorit";
};

export function TutorDetails({ tutor, documents, courses }: TutorDetailsProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string>("");
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
<<<<<<< HEAD
      console.log(result);
=======
>>>>>>> 1a19ced (chore: update service folders from local)

      if (result.success) {
        toast.success("Review deleted successfully");
        setIsDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete review");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Failed to delete review:", error);
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
        result = await updateTutorReviewAction(editingReview);
      } else {
        result = await updateStudentReviewAction(editingReview);
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
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Failed to update review:", error);
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
            {/* Profile Photo */}
            <div className="mb-6">
              <Avatar className="w-full h-40 rounded-lg mb-4">
                <AvatarImage src={tutor.photoProfile} />
                <AvatarFallback className="rounded-lg text-xs text-muted-foreground">
                  photo profile
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Edit Profile Button */}
            <Link href={`/tutors/form?id=${tutor.id}`}>
              <Button variant="outline" className="w-full mb-6 bg-transparent">
                <Edit2 className="w-4 h-4 mr-2" />
                edit profile
              </Button>
            </Link>

            {/* Level */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-muted-foreground">
                level:
              </p>
              <div className="flex flex-col gap-1">
                <span className="text-base font-semibold text-foreground">
                  {getTutorLevel(tutor.levelPoint)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tutor.levelPoint} points
                </span>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-muted-foreground">
                rating:
              </p>
              <div className="flex items-center gap-1">
                {tutor.rating === 0 && (
                  <p className="text-sm text-foreground">no ratings yet</p>
                )}
                {tutor.rating > 0 && (
                  <span className="flex items-center gap-1">
                    {tutor.rating} ratings
                  </span>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                status:
              </p>
              <span
<<<<<<< HEAD
                className={`inline-block text-xs px-2 py-1 rounded-full font-medium capitalize ${
                  tutor.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
=======
                className={`inline-block text-xs px-2 py-1 rounded-full font-medium capitalize ${tutor.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                  }`}
>>>>>>> 1a19ced (chore: update service folders from local)
              >
                {tutor.status}
              </span>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Personal Information */}
          <Card className="p-8">
            <div className="space-y-8">
              {/* Name */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">nama</p>
                <p className="text-xl font-semibold text-foreground">
                  {tutor.name}
                </p>
              </div>

              {/* Gender */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">gender</p>
                <p className="text-xl font-semibold text-foreground">
                  {tutor.gender}
                </p>
              </div>

              {/* Birth Date */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  tanggal lahir
                </p>
                <p className="text-xl font-semibold text-foreground">
                  {formatDate(tutor.dateOfBirth)}
                </p>
              </div>

              {/* Email */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">email</p>
                <p className="text-xl font-semibold text-foreground">
                  {tutor.email}
                </p>
              </div>

              {/* Phone */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">nomor HP</p>
                <p className="text-xl font-semibold text-foreground">
                  {tutor.phoneNumber}
                </p>
              </div>

              {/* Social Media */}
              {tutor.socialMediaLinks && (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    social media
                  </p>
                  <div className="space-y-3">
                    {Object.entries(tutor.socialMediaLinks).map(
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

          {/* Location */}
          <Card className="p-0">
            {tutor.latitude && tutor.longitude && (
              <div className="relative h-64 w-full overflow-hidden rounded-md border border-border">
                <iframe
                  title="tutor-location"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    `${tutor.latitude},${tutor.longitude}`
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
                        'iframe[title="tutor-location"]'
                      ) as HTMLIFrameElement;
                      if (iframe) {
                        iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(
                          `${tutor.latitude},${tutor.longitude}`
                        )}&z=15&output=embed`;
                      }
                    }}
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Documents Section */}
          <Card className="p-8">
            <TutorDocuments documents={documents} tutor={tutor} />
          </Card>

          {/* Courses Section */}
          <Card className="p-8">
            <TutorCourses courses={courses} />
          </Card>

          {/* Reviews Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ReviewSection
              title="ulasan student → tutor"
              reviews={tutor.studentToTutorReview}
              showRecommendByStudent={true}
              onEditClick={(review) => handleEditClick(review, "student")}
              onDeleteClick={(reviewId) =>
                handleDeleteClick(reviewId, "student")
              }
            />

            <ReviewSection
              title="ulasan tutor → student"
              reviews={tutor.tutorToStudentReview}
              showRecommendByStudent={false}
              onEditClick={(review) => handleEditClick(review, "tutor")}
              onDeleteClick={(reviewId) => handleDeleteClick(reviewId, "tutor")}
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
                  setEditingReview({ ...editingReview, review: e.target.value })
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
