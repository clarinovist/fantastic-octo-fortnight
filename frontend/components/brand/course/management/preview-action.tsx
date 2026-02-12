"use client"

import { Button } from "@/components/ui/button"
import { CustomSwitch } from "@/components/ui/custom-switch"
import { Label } from "@/components/ui/label"
import { clientFetchRaw } from "@/services/client"
import { COURSE_STATUS } from "@/utils/constants"
import { Check, FileText, Loader2, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

interface PreviewActionProps {
  className?: string
  id: string
  status: string
  isPublished: boolean
}

export function PreviewAction({ className, id, status, isPublished }: PreviewActionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [published, setPublished] = useState(isPublished)
  const [loading, setLoading] = useState(false)
  const isDraft = status === COURSE_STATUS.DRAFT
  const isWaitingForApproval = status === COURSE_STATUS.WAITING_FOR_APPROVAL
  const isAccepted = status === COURSE_STATUS.ACCEPTED
  const isRejected = status === COURSE_STATUS.REJECTED

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const response = await clientFetchRaw<{
        data: any
        message: string
        success: boolean
      }>(`/api/v1/tutors/courses/${id}/submit`, {
        method: "POST",
      })

      if (!response.success) {
        toast.error(response.message || "Failed to submit course. Please try again.")
        return
      }

      toast.success("Course submitted successfully!")
      const w = window.location.origin
      window.location.href = `${w}/account`
    } catch (error) {
      console.error("Error submitting course:", error)
      const err = error as unknown as { message?: string }
      toast.error(err.message || "Failed to submit course. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = () => {
    if (isAccepted) return <Check size={18} />
    if (isRejected) return <X size={18} />
    if (isWaitingForApproval) return <Loader2 size={18} className="animate-spin" />
    return <FileText size={18} />
  }

  const getStatusColor = () => {
    if (isDraft) return "bg-black"
    if (isWaitingForApproval) return "bg-[#B4B4B4]"
    if (isAccepted) return "bg-[#006312]"
    if (isRejected) return "bg-[#A70000]"
    return "bg-gray-600"
  }

  const handlePublishChange = async (value: boolean) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/tutors/courses/${id}/publish`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished: value }),
      })
      if (!res.ok) throw new Error("Failed to update publish state")
      setPublished(value)
      toast.success("Course publish state updated")
    } catch (e) {
      // Optionally show error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`md:max-w-fit flex md:flex-col flex-row justify-between items-start ${className}`}
    >
      <div className="md:order-1 bg-white order-2 flex md:items-center items-end md:flex-row flex-col md:rounded-full rounded-lg p-2 gap-4 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)]">
        <div className="flex gap-2 text-white">
          <Link href="/">
            <Button variant="ghost" className="bg-[#006312] rounded-l-full hover:bg-[#006312]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <g clipPath="url(#clip0_1223_36396)">
                  <path
                    d="M16 3.55556V14.2222C16 14.7111 15.8261 15.1298 15.4782 15.4782C15.1304 15.8267 14.7117 16.0006 14.2222 16H1.77778C1.28889 16 0.870519 15.8261 0.522667 15.4782C0.174815 15.1304 0.000592593 14.7117 0 14.2222V1.77778C0 1.28889 0.174222 0.870518 0.522667 0.522667C0.871111 0.174815 1.28948 0.000592593 1.77778 0H12.4444L16 3.55556ZM8 13.3333C8.74074 13.3333 9.37037 13.0741 9.88889 12.5556C10.4074 12.037 10.6667 11.4074 10.6667 10.6667C10.6667 9.92592 10.4074 9.2963 9.88889 8.77778C9.37037 8.25926 8.74074 8 8 8C7.25926 8 6.62963 8.25926 6.11111 8.77778C5.59259 9.2963 5.33333 9.92592 5.33333 10.6667C5.33333 11.4074 5.59259 12.037 6.11111 12.5556C6.62963 13.0741 7.25926 13.3333 8 13.3333ZM2.66667 6.22222H10.6667V2.66667H2.66667V6.22222Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1223_36396">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              SAVE
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="bg-main rounded-r-full hover:bg-main"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
          </Button>
        </div>
        <div className="flex gap-4">
          <Link href="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="24"
              viewBox="0 0 22 24"
              fill="none"
            >
              <path
                d="M2.75 21.2571H6.875V14.4C6.875 14.0114 7.007 13.6859 7.271 13.4235C7.535 13.1611 7.86133 13.0295 8.25 13.0286H13.75C14.1396 13.0286 14.4664 13.1602 14.7304 13.4235C14.9944 13.6869 15.1259 14.0123 15.125 14.4V21.2571H19.25V8.91428L11 2.74286L2.75 8.91428V21.2571ZM0 21.2571V8.91428C0 8.48 0.0976247 8.06857 0.292875 7.68C0.488125 7.29143 0.757167 6.97143 1.1 6.72L9.35 0.548571C9.83125 0.182857 10.3812 0 11 0C11.6187 0 12.1687 0.182857 12.65 0.548571L20.9 6.72C21.2437 6.97143 21.5132 7.29143 21.7085 7.68C21.9037 8.06857 22.0009 8.48 22 8.91428V21.2571C22 22.0114 21.7305 22.6574 21.1915 23.195C20.6525 23.7326 20.0053 24.0009 19.25 24H13.75C13.3604 24 13.0341 23.8683 12.771 23.605C12.5079 23.3417 12.3759 23.0162 12.375 22.6286V15.7714H9.625V22.6286C9.625 23.0171 9.493 23.3431 9.229 23.6064C8.965 23.8697 8.63866 24.0009 8.25 24H2.75C1.99375 24 1.34658 23.7317 0.8085 23.195C0.270416 22.6583 0.000916666 22.0123 0 21.2571Z"
                fill="#7000FE"
              />
            </svg>
          </Link>
          <Link href={`/account/course/${id}/draft`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5.05273 5.05273C5.75031 5.05279 6.31543 5.61882 6.31543 6.31641C6.31519 7.01379 5.75016 7.57905 5.05273 7.5791H3.78906C3.45421 7.57921 3.13327 7.71245 2.89648 7.94922C2.65971 8.186 2.52649 8.50696 2.52637 8.8418V20.2109L2.53223 20.335C2.56088 20.6242 2.68919 20.8962 2.89648 21.1035C3.13328 21.3403 3.4542 21.4735 3.78906 21.4736H15.1582C15.4931 21.4736 15.814 21.3403 16.0508 21.1035C16.2876 20.8667 16.4208 20.5458 16.4209 20.2109V18.9473C16.421 18.2498 16.987 17.6846 17.6846 17.6846C18.3819 17.6848 18.9471 18.2499 18.9473 18.9473V20.2109C18.9472 21.2159 18.5475 22.179 17.8369 22.8896C17.1263 23.6002 16.1631 23.9999 15.1582 24H3.78906C2.78418 23.9999 1.82092 23.6002 1.11035 22.8896C0.399797 22.1791 6.53264e-05 21.2158 0 20.2109V8.8418C0.000125182 7.83694 0.399799 6.87364 1.11035 6.16309C1.82092 5.45254 2.78419 5.05284 3.78906 5.05273H5.05273Z"
                fill="#7000FE"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.084 0C21.1223 0.000130784 22.1183 0.413241 22.8525 1.14746C23.5868 1.88182 24 2.87851 24 3.91699C23.9997 4.95433 23.5865 5.94866 22.8535 6.68262L21.251 8.29102C21.2076 8.35423 21.1596 8.4155 21.1035 8.47168C21.0495 8.52565 20.9902 8.5721 20.9297 8.61426L12.2627 17.3125C12.0257 17.5502 11.7038 17.6845 11.3682 17.6846H7.57812C6.88071 17.6843 6.31543 17.1184 6.31543 16.4209V12.6318C6.31547 12.2963 6.44896 11.9742 6.68652 11.7373L15.3809 3.07324C15.4236 3.01133 15.4722 2.9516 15.5273 2.89648C15.5839 2.83996 15.6453 2.79064 15.709 2.74707L17.3164 1.14551C18.0506 0.412144 19.0462 9.5095e-05 20.084 0ZM8.8418 13.1562V15.1582H10.8438L18.4092 7.56445L16.4346 5.58887L8.8418 13.1562ZM20.084 2.52637C19.7156 2.52646 19.3621 2.67312 19.1016 2.93359L19.0996 2.93457L18.2246 3.80664L20.1914 5.77441L21.0664 4.89844C21.3267 4.63809 21.4734 4.28512 21.4736 3.91699C21.4736 3.54853 21.3269 3.19418 21.0664 2.93359C20.8059 2.67315 20.4523 2.5265 20.084 2.52637Z"
                fill="#7000FE"
              />
            </svg>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="publish-mode" className="font-bold">
            PUBLISH
          </Label>
          <CustomSwitch
            disabled={isDraft || isWaitingForApproval || isRejected || loading}
            checked={published}
            onChange={handlePublishChange}
          />
        </div>
      </div>
      <span
        className={`${getStatusColor()} flex items-center justify-center p-2 gap-2 md:order-2 order-1 rounded-full md:w-full w-fit text-white font-bold md:mt-4`}
      >
        {getStatusIcon()}
        {status}
      </span>
    </div>
  )
}
