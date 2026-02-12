"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  BaseResponse,
  StatisticCourse as StatisticCourseType,
} from "@/utils/types";
import { use, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface StatisticCourseProps {
  coursesData: Promise<BaseResponse<StatisticCourseType[]>>;
}

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
  "#84cc16",
];

function CourseSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex h-[400px] items-center justify-center">
        <Skeleton className="h-60 w-60 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg border border-slate-200/60 bg-white p-3"
          >
            <Skeleton className="h-4 w-4 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatisticCourse({ coursesData }: StatisticCourseProps) {
  const [isLoading, setIsLoading] = useState(true);

  const initial = use(coursesData);
  const courses = useMemo(() => initial?.data ?? [], [initial?.data]);

  const chartData = useMemo(() => {
    return courses.map((course) => ({
      name: course.categoryName,
      value: course.courseCount,
    }));
  }, [courses]);

  // Set loading to false after data is loaded
  if (isLoading) {
    setIsLoading(false);
  }

  return (
    <Card className="border-slate-200/60 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
          <div className="h-5 w-5 rounded bg-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">
          Course Distribution by Category
        </h3>
      </div>

      <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50/30 p-6">
        {isLoading ? (
          <CourseSkeleton />
        ) : !courses || courses.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-500">
                No data available
              </p>
              <p className="mt-2 text-sm text-slate-400">No courses found</p>
            </div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number, name: string) => {
                    return [`${value} courses`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {chartData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 rounded-lg border border-slate-200/60 bg-white p-3 transition-all hover:shadow-sm"
                >
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.value} courses
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
