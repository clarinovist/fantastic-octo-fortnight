import { updateAccountLocationAction } from "@/actions/account"
<<<<<<< HEAD
import type { MeResponse, TutorDocumentResponse } from "@/utils/types"
=======
import type { MeResponse } from "@/utils/types"
>>>>>>> 1a19ced (chore: update service folders from local)
import { LayoutCustomer } from "../layout-customer"
import { LocationCard } from "../location-card"
import { AccountInfo } from "./account-info"
import { BookingHistoryList } from "./course/booking/booking-list"
<<<<<<< HEAD
import { CourseList } from "./course/course-list"
import { ReviewList } from "./course/review/review-list"
import { DocumentList } from "./document/document-list"
import { TutorLevel } from "./tutor-level"

interface AccountContainerProps {
  documents: TutorDocumentResponse[]
=======
import { ReviewList } from "./course/review/review-list"

interface AccountContainerProps {
>>>>>>> 1a19ced (chore: update service folders from local)
  detail: MeResponse
  apiKey: string
}

<<<<<<< HEAD
export function AccountContainer({ detail, apiKey, documents }: AccountContainerProps) {
=======
export function AccountContainer({ detail, apiKey }: AccountContainerProps) {
>>>>>>> 1a19ced (chore: update service folders from local)
  const currentLocation = {
    lat: detail.latitude ? Number(detail.latitude) : -6.2,
    lng: detail.longitude ? Number(detail.longitude) : 106.816666,
  }
<<<<<<< HEAD
  const isTutor = detail.role === "tutor"
  return (
    <LayoutCustomer isShowSidebar isShowNotification>
=======

  return (
    <LayoutCustomer isShowSidebar isShowNotification={false}>
>>>>>>> 1a19ced (chore: update service folders from local)
      <div className="lg:p-4 pb-4 flex lg:flex-row flex-col gap-4">
        <AccountInfo className="lg:w-80" detail={detail} />
        <div className="flex-1 pr-4 flex flex-wrap gap-4 lg:flex-nowrap items-start">
          <div className="flex-1 space-y-4">
<<<<<<< HEAD
            {isTutor && <TutorLevel point={detail.level_point} />}
=======
>>>>>>> 1a19ced (chore: update service folders from local)
            <LocationCard
              apiKey={apiKey}
              onLocationUpdate={updateAccountLocationAction}
              currentLocation={currentLocation}
            />
<<<<<<< HEAD
            {isTutor && <CourseList />}
            <BookingHistoryList isTutor={isTutor} />
            <ReviewList isTutor={isTutor} />
          </div>
          {isTutor && <DocumentList documents={documents} className="ml-auto" />}
=======
            <BookingHistoryList />
            <ReviewList />
          </div>
>>>>>>> 1a19ced (chore: update service folders from local)
        </div>
      </div>
    </LayoutCustomer>
  )
}
