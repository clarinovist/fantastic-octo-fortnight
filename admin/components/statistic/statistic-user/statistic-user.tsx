"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import type { StatisticUser as StatisticUserType } from "@/utils/types";
import { endOfMonth, format, startOfMonth, subDays, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartDataPoint = {
  date: string;
  tutors: number;
  students: number;
  subscriptions: number;
};

type StatisticUserProps = {
  initialData: Promise<{ data: StatisticUserType | null }>;
  fetchData: (
    startDate: string,
    endDate: string
  ) => Promise<{ data: StatisticUserType | null }>;
};

function StatisticCardSkeleton() {
  return (
    <Card className="group relative overflow-hidden border-slate-200/60 bg-linear-to-br from-white to-slate-50/50 p-8 shadow-sm">
      <div className="space-y-3">
        <Skeleton className="h-1 w-12 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-12 w-24" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="mx-auto h-4 w-32" />
      <div className="flex h-[400px] items-center justify-center">
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export function StatisticUser({ initialData, fetchData }: StatisticUserProps) {
  const [selectedRange, setSelectedRange] = useState<
    "7days" | "lastMonth" | "thisMonth" | "custom"
  >("7days");
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });
  const [isPending, startTransition] = useTransition();
  const isInitialLoad = useRef(true);

  // Use the initial data from server
  const initial = use(initialData);
  const [statisticData, setStatisticData] = useState<StatisticUserType | null>(
    initial.data
  );

  // Calculate date range based on selected range
  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    let start: Date;
    let end: Date;

    switch (selectedRange) {
      case "7days":
        start = subDays(today, 6);
        end = today;
        break;
      case "lastMonth":
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        break;
      case "thisMonth":
        start = startOfMonth(today);
        end = today;
        break;
      case "custom":
        start = dateRange.from || today;
        end = dateRange.to || today;
        break;
    }

    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
    };
  }, [selectedRange, dateRange.from, dateRange.to]);

  const rangeLabels = {
    "7days": "7 hari terakhir",
    lastMonth: "Bulan lalu",
    thisMonth: "Bulan ini",
    custom:
      dateRange.from && dateRange.to
        ? `${format(dateRange.from, "dd MMM", { locale: id })} - ${format(
            dateRange.to,
            "dd MMM",
            { locale: id }
          )}`
        : "Pilih tanggal",
  };

  // Transform chart data based on statistic data
  const chartData = useMemo(() => {
    if (!statisticData) return [];

    const tutorsMap = new Map(
      statisticData.tutorsCreatedPerDay?.map((item) => [
        format(new Date(item.date), "yyyy-MM-dd"),
        item.count,
      ]) || []
    );
    const studentsMap = new Map(
      statisticData.studentsCreatedPerDay?.map((item) => [
        format(new Date(item.date), "yyyy-MM-dd"),
        item.count,
      ]) || []
    );
    const subscriptionsMap = new Map(
      statisticData.subscriptionsPerDay?.map((item) => [
        format(new Date(item.date), "yyyy-MM-dd"),
        item.count,
      ]) || []
    );

    // Generate all dates in the range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const transformedData: ChartDataPoint[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = format(d, "yyyy-MM-dd");
      transformedData.push({
        date: format(d, "dd-MM-yyyy"),
        tutors: tutorsMap.get(dateKey) || 0,
        students: studentsMap.get(dateKey) || 0,
        subscriptions: subscriptionsMap.get(dateKey) || 0,
      });
    }

    return transformedData;
  }, [statisticData, startDate, endDate]);

  // Fetch data when date range changes
  useEffect(() => {
    // Skip fetching on initial load since we already have initial data
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetchData(startDate, endDate);
        if (response.data) {
          setStatisticData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch statistic data:", error);
        setStatisticData(null);
      }
    });
  }, [startDate, endDate, fetchData]);

  const handleDateSelect = (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => {
    setDateRange(range);
    if (range.from && range.to) {
      setSelectedRange("custom");
    }
  };

  const maxValue = Math.max(
    ...chartData.flatMap((d) => [d.tutors, d.students, d.subscriptions]),
    0
  );

  // Ensure minimum yAxisMax to prevent duplicate ticks
  const yAxisMax = maxValue === 0 ? 10 : Math.ceil(maxValue * 1.2);
  const tickInterval = Math.max(Math.ceil(yAxisMax / 6), 1);
  const yAxisTicks = Array.from(
    { length: 7 },
    (_, i) => i * tickInterval
  ).filter((tick) => tick <= yAxisMax);

  // Determine if we should show skeletons
  const showSkeletons = !statisticData;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tutor Card */}
        {showSkeletons ? (
          <StatisticCardSkeleton />
        ) : (
          <Card className="group relative overflow-hidden border-slate-200/60 bg-linear-to-br from-white to-slate-50/50 p-8 shadow-sm transition-all hover:shadow-md">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 rounded-full bg-red-500" />
              </div>
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
                Jumlah User Tutor
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-bold tracking-tight text-slate-900">
                  {statisticData?.totalTutors?.toLocaleString() || "0"}
                </p>
                <span className="text-lg text-slate-400">users</span>
              </div>
            </div>
          </Card>
        )}

        {/* Student Card */}
        {showSkeletons ? (
          <StatisticCardSkeleton />
        ) : (
          <Card className="group relative overflow-hidden border-slate-200/60 bg-linear-to-br from-white to-blue-50/30 p-8 shadow-sm transition-all hover:shadow-md">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 rounded-full bg-indigo-500" />
              </div>
              <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
                Jumlah User Student
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-bold tracking-tight text-slate-900">
                  {statisticData?.totalStudents?.toLocaleString() || "0"}
                </p>
                <span className="text-lg text-slate-400">users</span>
              </div>
            </div>
          </Card>
        )}

        {/* Premium Card */}
        {showSkeletons ? (
          <Card className="group relative overflow-hidden border-slate-200/60 bg-linear-to-br from-slate-700 to-slate-800 p-8 shadow-sm">
            <div className="space-y-3">
              <Skeleton className="h-1 w-12 rounded-full bg-slate-600" />
              <Skeleton className="h-4 w-32 bg-slate-600" />
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-12 w-24 bg-slate-600" />
                <Skeleton className="h-6 w-12 bg-slate-600" />
              </div>
            </div>
          </Card>
        ) : (
          <Card className="group relative overflow-hidden border-slate-200/60 bg-linear-to-br from-slate-700 to-slate-800 p-8 shadow-sm transition-all hover:shadow-md">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 rounded-full bg-amber-400" />
              </div>
              <p className="text-sm font-medium uppercase tracking-wider text-slate-300">
                Jumlah User Premium
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-bold tracking-tight text-white">
                  {statisticData?.totalPremiumStudents?.toLocaleString() || "0"}
                </p>
                <span className="text-lg text-slate-400">users</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card className="border-slate-200/60 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <div className="h-5 w-5 rounded bg-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Statistik User & Subscriptions
              </h2>
              <p className="text-sm text-slate-500">
                Track the growth of tutors, students, and subscriptions over
                time.
              </p>
            </div>
          </div>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 rounded-lg border-slate-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition-all hover:bg-slate-50 hover:shadow"
              >
                <CalendarIcon className="h-4 w-4 text-slate-500" />
                <span className="text-slate-700">
                  {rangeLabels[selectedRange]}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex">
                <div className="space-y-1 border-r border-slate-200 bg-slate-50/50 p-3">
                  <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Quick Select
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm font-medium hover:bg-white hover:text-blue-600"
                    onClick={() => {
                      setSelectedRange("7days");
                      setIsOpen(false);
                    }}
                  >
                    7 hari terakhir
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm font-medium hover:bg-white hover:text-blue-600"
                    onClick={() => {
                      setSelectedRange("lastMonth");
                      setIsOpen(false);
                    }}
                  >
                    Bulan lalu
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm font-medium hover:bg-white hover:text-blue-600"
                    onClick={() => {
                      setSelectedRange("thisMonth");
                      setIsOpen(false);
                    }}
                  >
                    Bulan ini
                  </Button>
                </div>
                <div className="p-3">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range) {
                        handleDateSelect({ from: range.from, to: range.to });
                        if (range.from && range.to) {
                          setIsOpen(false);
                        }
                      }
                    }}
                    numberOfMonths={2}
                    defaultMonth={new Date()}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50/30 p-6">
          {/* Chart Legend */}
          <div className="mb-6 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm font-medium text-slate-600">Tutors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-indigo-500" />
              <span className="text-sm font-medium text-slate-600">
                Students
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-sm font-medium text-slate-600">
                Subscriptions
              </span>
            </div>
          </div>

          {/* Line Chart */}
          {showSkeletons && chartData.length === 0 ? (
            <ChartSkeleton />
          ) : isPending ? (
            <div className="flex h-[400px] items-center justify-center">
              <div className="space-y-2 text-center">
                <Skeleton className="mx-auto h-8 w-32" />
                <Skeleton className="mx-auto h-4 w-24" />
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-[400px] items-center justify-center">
              <p className="text-slate-500">No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorTutors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorStudents"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorSubscriptions"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                  domain={[0, yAxisMax]}
                  ticks={yAxisTicks}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="tutors"
                  name="Tutors"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{
                    fill: "#ef4444",
                    r: 5,
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                  fill="url(#colorTutors)"
                />
                <Line
                  type="monotone"
                  dataKey="students"
                  name="Students"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{
                    fill: "#6366f1",
                    r: 5,
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                  fill="url(#colorStudents)"
                />
                <Line
                  type="monotone"
                  dataKey="subscriptions"
                  name="Subscriptions"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{
                    fill: "#f59e0b",
                    r: 5,
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                  fill="url(#colorSubscriptions)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
