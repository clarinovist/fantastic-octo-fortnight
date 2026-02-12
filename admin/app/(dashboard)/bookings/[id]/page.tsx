import { BookingDetails } from "@/components/booking/booking-detail";
import { MainLayout } from "@/components/layout/main-layout";
import { getBookingById } from "@/services/booking";

type BookingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookingPage({ params }: BookingPageProps) {
  const resolvedParams = await params;
  const bookingId = resolvedParams.id;
  const bookingResponse = await getBookingById(bookingId);

  return (
    <MainLayout
      title={`Booking Details - ${bookingResponse.data?.course?.title}`}
    >
      <div className="@container/main p-4">
        <BookingDetails booking={bookingResponse.data} />
      </div>
    </MainLayout>
  );
}
