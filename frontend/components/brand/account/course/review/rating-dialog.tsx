"use client"

import { BookingReview } from "@/utils/types"
import { SquarePen, User, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

interface RatingDialogProps {
  review: BookingReview
  isOpen: boolean
  isTutor: boolean
  onClose: () => void
  onSubmit?: (rating: number, reviewText: string, willLearnAgain: string) => void
}

export default function RatingDialog({
  isOpen,
  onClose,
  onSubmit,
  review,
  isTutor,
}: RatingDialogProps) {
  const [rating, setRating] = useState<number>(0)
  const [reviewText, setReviewText] = useState<string>("")
  const [willLearnAgain, setWillLearnAgain] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState<boolean>(false)

  // Initialize form with existing review data or reset
  useEffect(() => {
<<<<<<< HEAD
    if (isOpen && review) {
      setRating(review.rate || 0)
      setReviewText(review.review || "")
      setWillLearnAgain(review.recommendByStudent || "")
    } else if (!isOpen) {
      setIsEditMode(false)
      setRating(0)
      setReviewText("")
      setWillLearnAgain("")
    }
=======
    requestAnimationFrame(() => {
      if (isOpen && review) {
        setRating(review.rate || 0)
        setReviewText(review.review || "")
        setWillLearnAgain(review.recommendByStudent || "")
      } else if (!isOpen) {
        setIsEditMode(false)
        setRating(0)
        setReviewText("")
        setWillLearnAgain("")
      }
    })
>>>>>>> 1a19ced (chore: update service folders from local)
  }, [isOpen, review])

  const handleSubmit = () => {
    if (onSubmit && rating > 0 && (!isTutor ? willLearnAgain : true)) {
      onSubmit(rating, reviewText, willLearnAgain)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-black hover:opacity-70 transition-opacity"
          aria-label="Close dialog"
        >
          <X size={32} strokeWidth={3} />
        </button>

        {review?.isReviewed ? (
          <div className="flex gap-6 flex-1">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {review.photoProfile ? (
                <div className="w-22 h-22 rounded-full overflow-hidden border-4 border-gray-200">
                  <Image
                    src={review.photoProfile}
                    alt={review.name}
                    width={60}
                    height={60}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <User className="w-20 h-20 text-gray-400" />
              )}
            </div>

            {/* Student Info */}
            <div className="flex-1 pt-2">
              <h1 className="text-3xl font-bold text-black mb-1">{review.name}</h1>
              <div className="flex items-center gap-2">
                <svg
                  className="size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                >
                  <path
                    d="M23.9988 40.212L12.3651 47.5499C11.8511 47.8923 11.3138 48.0391 10.7532 47.9902C10.1925 47.9413 9.70191 47.7456 9.28142 47.4031C8.86092 47.0607 8.53387 46.6332 8.30026 46.1205C8.06665 45.6078 8.01993 45.0325 8.16009 44.3946L11.2437 30.5259L0.941565 21.2067C0.474346 20.7664 0.182802 20.2645 0.0669313 19.7009C-0.0489389 19.1374 -0.0143649 18.5875 0.170654 18.0514C0.355672 17.5152 0.636003 17.0749 1.01165 16.7305C1.38729 16.3861 1.90123 16.166 2.55347 16.0701L16.1495 14.8227L21.4057 1.76111C21.6394 1.17407 22.0019 0.733794 22.4934 0.440276C22.9849 0.146759 23.4867 0 23.9988 0C24.5109 0 25.0127 0.146759 25.5042 0.440276C25.9957 0.733794 26.3583 1.17407 26.5919 1.76111L31.8481 14.8227L45.4441 16.0701C46.0982 16.1679 46.6122 16.3881 46.986 16.7305C47.3597 17.073 47.6401 17.5132 47.827 18.0514C48.0138 18.5895 48.0493 19.1403 47.9335 19.7039C47.8176 20.2674 47.5251 20.7684 47.056 21.2067L36.7539 30.5259L39.8375 44.3946C39.9777 45.0305 39.931 45.6058 39.6974 46.1205C39.4637 46.6351 39.1367 47.0627 38.7162 47.4031C38.2957 47.7436 37.8051 47.9393 37.2445 47.9902C36.6838 48.0411 36.1465 47.8943 35.6325 47.5499L23.9988 40.212Z"
                    fill={rating >= review.rate ? "#FFA600" : "#d1d5db"}
                  />
                </svg>
                <span className="font-bold text-black">{rating}</span>
              </div>
            </div>
          </div>
        ) : (
          <h1 className="text-xl font-bold text-center mb-12 mt-4">Beri Rating</h1>
        )}

        {/* Star Rating Section */}
        {!review.isReviewed && (
          <div className="mb-12">
            <div className="flex justify-center gap-6 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                  >
                    <path
                      d="M23.9988 40.212L12.3651 47.5499C11.8511 47.8923 11.3138 48.0391 10.7532 47.9902C10.1925 47.9413 9.70191 47.7456 9.28142 47.4031C8.86092 47.0607 8.53387 46.6332 8.30026 46.1205C8.06665 45.6078 8.01993 45.0325 8.16009 44.3946L11.2437 30.5259L0.941565 21.2067C0.474346 20.7664 0.182802 20.2645 0.0669313 19.7009C-0.0489389 19.1374 -0.0143649 18.5875 0.170654 18.0514C0.355672 17.5152 0.636003 17.0749 1.01165 16.7305C1.38729 16.3861 1.90123 16.166 2.55347 16.0701L16.1495 14.8227L21.4057 1.76111C21.6394 1.17407 22.0019 0.733794 22.4934 0.440276C22.9849 0.146759 23.4867 0 23.9988 0C24.5109 0 25.0127 0.146759 25.5042 0.440276C25.9957 0.733794 26.3583 1.17407 26.5919 1.76111L31.8481 14.8227L45.4441 16.0701C46.0982 16.1679 46.6122 16.3881 46.986 16.7305C47.3597 17.073 47.6401 17.5132 47.827 18.0514C48.0138 18.5895 48.0493 19.1403 47.9335 19.7039C47.8176 20.2674 47.5251 20.7684 47.056 21.2067L36.7539 30.5259L39.8375 44.3946C39.9777 45.0305 39.931 45.6058 39.6974 46.1205C39.4637 46.6351 39.1367 47.0627 38.7162 47.4031C38.2957 47.7436 37.8051 47.9393 37.2445 47.9902C36.6838 48.0411 36.1465 47.8943 35.6325 47.5499L23.9988 40.212Z"
                      fill={rating >= star ? "#FFA600" : "#d1d5db"}
                    />
                  </svg>
                </button>
              ))}
            </div>
            <div className="flex justify-between font-semibold px-2">
              <span>very bad</span>
              <span>very good</span>
            </div>
          </div>
        )}

        {/* Review Section */}
        {!review.isReviewed || isEditMode ? (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-center mb-4">Beri Ulasan</h2>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Tulis ulasan Anda di sini..."
              className="w-full h-40 p-4 border-2 border-purple-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
            />
          </div>
        ) : (
          <div className="my-6">
            <div className="flex justify-between">
              <h3 className="font-bold">Ulasan</h3>
              <button className="flex gap-2 cursor-pointer" onClick={() => setIsEditMode(true)}>
                <SquarePen />
                <span>Edit</span>
              </button>
            </div>
            <p className="mt-2">{review.review}</p>
          </div>
        )}

        {/* Question Section */}
        {!isTutor &&
          (!review.isReviewed || isEditMode ? (
            <div className="mb-8">
              <p className="text-center text-lg font-semibold mb-6">
                Apakah Anda memutuskan belajar
                <br />
                bersama tutor ini kedepannya?
              </p>

              {/* Button Group */}
              <div className="flex justify-center gap-4 flex-wrap">
                {[
                  { label: "YES", value: "yes" },
                  { label: "NO", value: "no" },
                  { label: "BELUM MEMUTUSKAN", value: "undecided" },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setWillLearnAgain(option.value)}
<<<<<<< HEAD
                    className={`py-2 px-4 rounded-full font-bold transition-all border-2 ${
                      willLearnAgain === option.value
                        ? "bg-main text-white border-main"
                        : "bg-white text-main/50 border-main/50 hover:bg-main/50 hover:text-white disabled:hover:bg-white disabled:hover:text-main/50"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
=======
                    className={`py-2 px-4 rounded-full font-bold transition-all border-2 ${willLearnAgain === option.value
                        ? "bg-main text-white border-main"
                        : "bg-white text-main/50 border-main/50 hover:bg-main/50 hover:text-white disabled:hover:bg-white disabled:hover:text-main/50"
                      } disabled:cursor-not-allowed disabled:opacity-70`}
>>>>>>> 1a19ced (chore: update service folders from local)
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="font-semibold mb-2 text-left">
                Apakah Anda memutuskan belajar
                <br />
                bersama tutor ini kedepannya?
              </p>
              <p className="uppercase font-bold text-main text-2xl">{review.recommendByStudent}</p>
            </div>
          ))}

        {/* Submit Button */}
        {(!review.isReviewed || isEditMode) && (
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || (!isTutor && !willLearnAgain)}
              className="w-full max-w-sm bg-main hover:bg-main/70 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SUBMIT
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
