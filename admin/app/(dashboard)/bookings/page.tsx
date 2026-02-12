import { BookingList } from "@/components/booking/booking-list";
import { MainLayout } from "@/components/layout/main-layout";
import { getBookings } from "@/services/booking";
import { getSearchParamValue } from "@/utils/helpers";
import { BookingStatus } from "@/utils/types";

type BookingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BookingsPage({
  searchParams,
}: BookingsPageProps) {
  const query = await searchParams;
  const page = getSearchParamValue(query.page, 1);
  const pageSize = getSearchParamValue(query.pageSize, 10);
  const status = getSearchParamValue(query.status, "");
  const tutorName = getSearchParamValue(query.tutorName, "");
  const studentName = getSearchParamValue(query.studentName, "");
  const sort = getSearchParamValue(query.sort, "booking_date");
  const sortDirection = getSearchParamValue(query.sortDirection, "DESC");

  const bookings = await getBookings({
    page,
    pageSize,
    status: status as BookingStatus,
    tutorName,
    studentName,
    sort,
    sortDirection,
  });

  return (
    <MainLayout title="Bookings">
      <div className="@container/main p-4">
        <BookingList
          bookings={bookings.data}
          totalData={bookings.metadata?.total || 0}
          currentPage={page}
          pageSize={pageSize}
        />
      </div>
    </MainLayout>
  );
}
