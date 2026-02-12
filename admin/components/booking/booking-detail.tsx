"use client";

import {
  studentBookingReminderAction,
  tutorBookingReminderAction,
} from "@/actions/booking";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/helpers";
import type { BookingDetail } from "@/utils/types";
import {
  AlertCircle,
  Bell,
  Calendar,
  ExternalLink,
  MapPin,
  MessageSquare,
  Users,
} from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

interface BookingDetailsProps {
  booking: BookingDetail;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function BookingDetails({ booking }: BookingDetailsProps) {
  return (
    <div className="space-y-8">
      {/* Header with booking code and status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Booking Code:{" "}
            <span className="font-semibold text-foreground">
              {booking.code}
            </span>
          </p>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              booking.status === "accepted"
                ? "bg-green-100 text-green-800"
                : booking.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : booking.status === "declined"
                ? "bg-red-100 text-red-800"
                : booking.status === "expired"
                ? "bg-orange-100 text-orange-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {booking.status}
          </span>
        </div>
      </div>

      {/* Course Information */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl">{booking.course.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {booking.course.description}
          </p>
        </CardContent>
      </Card>

      {/* Booking Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-lg font-semibold">
                {formatDate(booking.bookingDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="text-lg font-semibold">
                {booking.bookingTime} {booking.timezone}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Class Type</p>
              <p className="text-lg font-semibold">{booking.classType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Timezone</p>
              <p className="text-lg font-semibold">{booking.timezone}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student & Tutor Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileCard
          title="Student"
          person={booking.student}
          getInitials={getInitials}
          bookingId={booking.id}
        />
        <ProfileCard
          title="Tutor"
          person={booking.tutor}
          getInitials={getInitials}
          bookingId={booking.id}
        />
      </div>

      {/* Notes Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {booking.notesTutor && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Tutor Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {booking.notesTutor}
              </p>
            </CardContent>
          </Card>
        )}
        {booking.notesStudent && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Student Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {booking.notesStudent}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Report Booking Section */}
      {booking.reportBooking && (
        <Card className="border-border bg-destructive/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Report
              </CardTitle>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  booking.reportBooking.status === "resolved"
                    ? "bg-green-100 text-green-800"
                    : booking.reportBooking.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : booking.reportBooking.status === "investigating"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {booking.reportBooking.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Topic</p>
              <p className="font-semibold">{booking.reportBooking.topic}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-muted-foreground leading-relaxed">
                {booking.reportBooking.body}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-sm">
              <div>
                <p className="text-muted-foreground">Reported</p>
                <p className="font-medium">
                  {formatDate(booking.reportBooking.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {formatDate(booking.reportBooking.updatedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Information */}
      {booking.classType === "In-Person" && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Coordinates: {booking.latitude}, {booking.longitude}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card className="border-border bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(booking.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Updated</p>
              <p className="font-medium">{formatDate(booking.updatedAt)}</p>
            </div>
            {booking.expiredAt && (
              <div>
                <p className="text-muted-foreground">Expires</p>
                <p className="font-medium">{formatDate(booking.expiredAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ProfileCardProps {
  title: "Student" | "Tutor";
  person: BookingDetail["student"] | BookingDetail["tutor"];
  getInitials: (name: string) => string;
  bookingId: string;
}

function ProfileCard({
  title,
  person,
  getInitials,
  bookingId,
}: ProfileCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleReminder = () => {
    startTransition(async () => {
      const action =
        title === "Student"
          ? studentBookingReminderAction
          : tutorBookingReminderAction;

      const result = await action(bookingId);

      if (result.success) {
        toast.success(`Reminder sent to ${title.toLowerCase()} successfully`);
      } else {
        toast.error(
          result.error || `Failed to send reminder to ${title.toLowerCase()}`
        );
      }
    });
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReminder}
            disabled={isPending}
            className="gap-2"
          >
            <Bell className="w-4 h-4" />
            {isPending ? "Sending..." : "Remind"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar and Name */}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={person.photoProfile || ""} alt={person.name} />
            <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{person.name}</h3>
            {person.gender && (
              <p className="text-sm text-muted-foreground">{person.gender}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 border-t border-border pt-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <a
              href={`mailto:${person.email}`}
              className="text-primary hover:underline break-all"
            >
              {person.email}
            </a>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <a
              href={`tel:${person.phoneNumber}`}
              className="text-primary hover:underline"
            >
              {person.phoneNumber}
            </a>
          </div>
        </div>

        {/* Date of Birth */}
        {person.dateOfBirth && (
          <div>
            <p className="text-sm text-muted-foreground">Date of Birth</p>
            <p className="font-medium">{formatDate(person.dateOfBirth)}</p>
          </div>
        )}

        {/* Social Media Links */}
        {Object.keys(person.socialMediaLink).length > 0 && (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-sm font-semibold">Social Media</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(person.socialMediaLink).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm hover:opacity-80 transition-opacity"
                >
                  <span className="capitalize">{platform}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
