import { BookingForm } from "@/components/booking/booking-form";
import { createBookingAction } from "@/actions/booking";

export default function CreateBookingPage() {
    return (
        <div className="py-6">
            <BookingForm action={createBookingAction} />
        </div>
    );
}
