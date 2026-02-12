"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  BaseResponse,
  TopSubjectBooked,
  TopSubjectViewed,
} from "@/utils/types";
import { Eye, TrendingUp } from "lucide-react";
import { use, useState } from "react";

interface TopSubjectsProps {
  topBookedData: Promise<BaseResponse<TopSubjectBooked[]>>;
  topViewedData: Promise<BaseResponse<TopSubjectViewed[]>>;
}

function SubjectCardSkeleton() {
  return (
    <Card className="border-slate-200/60 bg-white p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </Card>
  );
}

export function TopSubjects({
  topBookedData,
  topViewedData,
}: TopSubjectsProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Use the initial data from server
  const bookedResponse = use(topBookedData);
  const viewedResponse = use(topViewedData);

  const topBooked = bookedResponse.data || [];
  const topViewed = viewedResponse.data || [];

  // Set loading to false after data is loaded
  if (isLoading) {
    setIsLoading(false);
  }

  return (
    <Card className="border-slate-200/60 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Top Subjects</h2>
        <p className="text-sm text-slate-500">
          Most popular subjects by bookings and views
        </p>
      </div>

      <Tabs defaultValue="booked" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="booked" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Top Booked
          </TabsTrigger>
          <TabsTrigger value="viewed" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Top Viewed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="booked" className="space-y-4">
          {isLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <SubjectCardSkeleton key={index} />
              ))}
            </>
          ) : topBooked.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-500">
                  No data available
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  No subjects have been booked yet
                </p>
              </div>
            </div>
          ) : (
            topBooked.map((subject, index) => (
              <Card
                key={subject.categoryId}
                className="border-slate-200/60 bg-white p-4 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-lg font-bold text-green-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {subject.categoryName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {subject.bookingCount} bookings
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="viewed" className="space-y-4">
          {isLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <SubjectCardSkeleton key={index} />
              ))}
            </>
          ) : topViewed.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-500">
                  No data available
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  No subjects have been viewed yet
                </p>
              </div>
            </div>
          ) : (
            topViewed.map((subject, index) => (
              <Card
                key={subject.categoryId}
                className="border-slate-200/60 bg-white p-4 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-lg font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {subject.categoryName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {subject.viewCount} views
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
