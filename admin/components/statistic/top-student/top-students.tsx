"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BaseResponse, TopBookingStudent } from "@/utils/types";
import Image from "next/image";
import { use, useState } from "react";

interface TopStudentsProps {
  topBookedData: Promise<BaseResponse<TopBookingStudent[]>>;
}

function StudentCardSkeleton() {
  return (
    <Card className="border-slate-200/60 bg-white p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </Card>
  );
}

export function TopStudents({ topBookedData }: TopStudentsProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Use the initial data from server
  const bookedResponse = use(topBookedData);

  const topBooked = bookedResponse.data || [];

  // Set loading to false after data is loaded
  if (isLoading) {
    setIsLoading(false);
  }

  return (
    <Card className="border-slate-200/60 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Student Rangkings
        </h2>
        <p className="text-sm text-slate-500">Most booking</p>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <>
            {Array.from({ length: 5 }).map((_, index) => (
              <StudentCardSkeleton key={index} />
            ))}
          </>
        ) : topBooked.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-500">
                No data available
              </p>
              <p className="mt-2 text-sm text-slate-400">
                No students have been booking yet
              </p>
            </div>
          </div>
        ) : (
          topBooked.map((student, index) => (
            <Card
              key={student.studentId}
              className="border-slate-200/60 bg-white p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-lg font-bold text-green-600">
                  {index + 1}
                </div>
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={student.photoProfile || "/placeholder-avatar.png"}
                    alt={student.studentName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {student.studentName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {student.bookingCount} bookings
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}
