import { updateAccountLocationAction } from "@/actions/account"
import type { MeResponse } from "@/utils/types"
import { LayoutCustomer } from "../layout-customer"
import { LocationCard } from "../location-card"
import { AccountInfo } from "./account-info"
import { BookingHistoryList } from "./course/booking/booking-list"
import { ReviewList } from "./course/review/review-list"

interface AccountContainerProps {
  detail: MeResponse
  apiKey: string
}

export function AccountContainer({ detail, apiKey }: AccountContainerProps) {
  const currentLocation = {
    lat: detail.latitude ? Number(detail.latitude) : -6.2,
    lng: detail.longitude ? Number(detail.longitude) : 106.816666,
  }

  return (
    <LayoutCustomer isShowSidebar isShowNotification={false}>
      <div className="lg:p-4 pb-4 flex lg:flex-row flex-col gap-4">
        <AccountInfo className="lg:w-80" detail={detail} />
        <div className="flex-1 pr-4 flex flex-wrap gap-4 lg:flex-nowrap items-start">
          <div className="flex-1 space-y-4">
            <LocationCard
              apiKey={apiKey}
              onLocationUpdate={updateAccountLocationAction}
              currentLocation={currentLocation}
            />
            <BookingHistoryList />
            <ReviewList />
          </div>
        </div>
      </div>
    </LayoutCustomer>
  )
}
