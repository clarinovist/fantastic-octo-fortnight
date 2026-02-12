import { updateAccountLocationAction } from "@/actions/account"
import type { MeResponse, TutorDocumentResponse } from "@/utils/types"
import { LayoutCustomer } from "../layout-customer"
import { LocationCard } from "../location-card"
import { AccountInfo } from "./account-info"
import { BookingHistoryList } from "./course/booking/booking-list"
import { CourseList } from "./course/course-list"
import { ReviewList } from "./course/review/review-list"
import { DocumentList } from "./document/document-list"
import { TutorLevel } from "./tutor-level"

interface AccountContainerProps {
  documents: TutorDocumentResponse[]
  detail: MeResponse
  apiKey: string
}

export function AccountContainer({ detail, apiKey, documents }: AccountContainerProps) {
  const currentLocation = {
    lat: detail.latitude ? Number(detail.latitude) : -6.2,
    lng: detail.longitude ? Number(detail.longitude) : 106.816666,
  }
  const isTutor = detail.role === "tutor"
  return (
    <LayoutCustomer isShowSidebar isShowNotification>
      <div className="lg:p-4 pb-4 flex lg:flex-row flex-col gap-4">
        <AccountInfo className="lg:w-80" detail={detail} />
        <div className="flex-1 pr-4 flex flex-wrap gap-4 lg:flex-nowrap items-start">
          <div className="flex-1 space-y-4">
            {isTutor && <TutorLevel point={detail.level_point} />}
            <LocationCard
              apiKey={apiKey}
              onLocationUpdate={updateAccountLocationAction}
              currentLocation={currentLocation}
            />
            {isTutor && <CourseList />}
            <BookingHistoryList isTutor={isTutor} />
            <ReviewList isTutor={isTutor} />
          </div>
          {isTutor && <DocumentList documents={documents} className="ml-auto" />}
        </div>
      </div>
    </LayoutCustomer>
  )
}
