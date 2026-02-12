import type { CourseStatus } from "@/utils/types";
import Link from "next/link";

type DetailCourseActionProps = {
  id: string;
  status: CourseStatus;
  className?: string;
  onApprove?: () => void;
  onReject?: () => void;
};

function getStatusColor(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "bg-green-500";
    case "DRAFT":
      return "bg-gray-500";
    case "Waiting for Approval":
      return "bg-yellow-500";
    case "REJECTED":
      return "bg-red-500";
    case "ACCEPTED":
      return "bg-blue-500";
    default:
      return "bg-gray-500";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "PUBLISHED":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M6 10.2L3.5 7.7L2.5 8.8L6 12.3L14 4.3L13 3.2L6 10.2Z"
            fill="white"
          />
        </svg>
      );
    case "DRAFT":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1ZM8 13.5C5.51472 13.5 3.5 11.4853 3.5 9C3.5 6.51472 5.51472 4.5 8 4.5C10.4853 4.5 12.5 6.51472 12.5 9C12.5 11.4853 10.4853 13.5 8 13.5Z"
            fill="white"
          />
        </svg>
      );
    case "PENDING":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1ZM8.75 11.25H7.25V9.75H8.75V11.25ZM8.75 8.25H7.25V4.75H8.75V8.25Z"
            fill="white"
          />
        </svg>
      );
    case "REJECTED":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1ZM10.2426 11.6569L8 9.41421L5.75736 11.6569L4.34315 10.2426L6.58579 8L4.34315 5.75736L5.75736 4.34315L8 6.58579L10.2426 4.34315L11.6569 5.75736L9.41421 8L11.6569 10.2426L10.2426 11.6569Z"
            fill="white"
          />
        </svg>
      );
    default:
      return null;
  }
}

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
      <span
        className={`${getStatusColor(
          status
        )} flex items-center justify-center px-4 py-2 gap-2 order-1 rounded-full md:w-full w-fit text-white font-bold text-sm shadow-md transition-all`}
      >
        {getStatusIcon(status)}
        {status}
      </span>

      {/* Action Buttons Container */}
      <div className="order-2 bg-white flex md:flex-col flex-row md:items-stretch items-center md:rounded-2xl rounded-lg p-2 gap-2 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] w-full md:w-auto">
        {/* Edit Button */}
        <Link
          href={`/courses/${id}/edit`}
          className="flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors group relative"
          title="Edit Course"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="transition-transform group-hover:scale-110"
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-transform group-hover:scale-110"
              >
                <path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  fill="#22C55E"
                />
              </svg>
            </button>

            {/* Reject Button */}
            <button
              onClick={onReject}
              className="flex items-center justify-center p-3 rounded-lg hover:bg-red-50 transition-colors group relative"
              title="Reject Course"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-transform group-hover:scale-110"
              >
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                  fill="#EF4444"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
