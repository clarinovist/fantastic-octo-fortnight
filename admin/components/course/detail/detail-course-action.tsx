import type { CourseStatus } from "@/utils/types";
import Link from "next/link";
import { Check, X, Pencil } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";

type DetailCourseActionProps = {
  id: string;
  status: CourseStatus;
  className?: string;
  onApprove?: () => void;
  onReject?: () => void;
};

export function DetailCourseAction({
  id,
  status,
  className,
  onApprove,
  onReject,
}: DetailCourseActionProps) {
  const isPending = status === "Waiting for Approval";

  return (
    <div
      className={`md:max-w-fit flex md:flex-col flex-row justify-between items-start gap-3 ${className}`}
    >
      {/* Status Badge - Top on mobile, top on desktop */}
      <StatusBadge status={status} />

      {/* Action Buttons Container */}
      <div className="order-2 bg-white flex md:flex-col flex-row md:items-stretch items-center md:rounded-2xl rounded-lg p-2 gap-2 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] w-full md:w-auto">
        {/* Edit Button */}
        <Link
          href={`/courses/${id}/edit`}
          className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors group relative"
          title="Edit Course"
        >
          <Pencil className="size-5 transition-transform group-hover:scale-110 text-primary" />
        </Link>

        {/* Approve and Reject Buttons - Only show for PENDING status */}
        {isPending && (
          <>
            {/* Divider */}
            <div className="h-px md:h-px md:w-full w-px bg-gray-200" />

            {/* Approve Button */}
            <button
              onClick={onApprove}
              className="flex items-center justify-center p-3 rounded-lg hover:bg-green-50 transition-colors group relative"
              title="Approve Course"
            >
              <Check className="size-5 transition-transform group-hover:scale-110 text-green-600" />
            </button>

            {/* Reject Button */}
            <button
              onClick={onReject}
              className="flex items-center justify-center p-3 rounded-lg hover:bg-red-50 transition-colors group relative"
              title="Reject Course"
            >
              <X className="size-5 transition-transform group-hover:scale-110 text-red-600" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
