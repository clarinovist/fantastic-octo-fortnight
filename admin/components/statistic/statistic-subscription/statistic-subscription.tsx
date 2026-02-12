"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type {
  BaseResponse,
  StatisticSubscription as StatisticSubscriptionType,
} from "@/utils/types";
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

interface StatisticSubscriptionProps {
  initialData: Promise<BaseResponse<StatisticSubscriptionType>>;
  fetchData: (
    startDate: string,
    endDate: string
  ) => Promise<BaseResponse<StatisticSubscriptionType>>;
}

type ChartDataPoint = {
  date: string;
  amount: number;
};

export function StatisticSubscription({
  initialData,
  fetchData,
}: StatisticSubscriptionProps) {
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
  const [statisticData, setStatisticData] =
    useState<StatisticSubscriptionType | null>(initial.data);

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

    const transformedData: ChartDataPoint[] = statisticData.amountPerDay.map(
      (item) => ({
        date: format(new Date(item.date), "dd-MM-yyyy"),
        amount: item.amount,
      })
    );

    return transformedData;
  }, [statisticData]);

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

  const maxValue = Math.max(...chartData.map((d) => d.amount), 0);
  const yAxisMax = maxValue === 0 ? 10 : Math.ceil(maxValue * 1.2);
  const tickInterval = Math.max(Math.ceil(yAxisMax / 6), 1);
  const yAxisTicks = Array.from(
    { length: 7 },
    (_, i) => i * tickInterval
  ).filter((tick) => tick <= yAxisMax);

  if (!statisticData) {
    return (
      <Card className="border-slate-200/60 bg-white/80 p-8 shadow-sm">
        <div className="text-center text-slate-500">No data available</div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/60 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
            <div className="h-5 w-5 rounded bg-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Statistik Subscription
            </h2>
            <p className="text-sm text-slate-500">
              Track subscription revenue over time
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
                  className="w-full justify-start text-sm font-medium hover:bg-white hover:text-green-600"
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
                  className="w-full justify-start text-sm font-medium hover:bg-white hover:text-green-600"
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
                  className="w-full justify-start text-sm font-medium hover:bg-white hover:text-green-600"
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

      {isPending && (
        <div className="mb-4 text-sm text-slate-500">Loading...</div>
      )}

      <div className="flex justify-center">
        <Card className="group relative overflow-hidden border-slate-200/60 bg-linear-to-br from-white to-green-50/30 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 w-12 rounded-full bg-green-500" />
            </div>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
              Total Amount
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold tracking-tight text-slate-900">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(statisticData.totalAmount)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50/30 p-6">
        <div className="mb-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-slate-600">
              Subscription Amount
            </span>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-500">
                No data available
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Select a different date range to view statistics
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-200"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                ticks={yAxisTicks}
                domain={[0, yAxisMax]}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("id-ID", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "#475569", fontWeight: 600 }}
                formatter={(value: number) => [
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(value),
                  "Amount",
                ]}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{
                  fill: "#22c55e",
                  strokeWidth: 2,
                  r: 4,
                  className: "transition-all hover:r-6",
                }}
                activeDot={{
                  r: 6,
                  fill: "#22c55e",
                  stroke: "white",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
