"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  XAxis,
  YAxis,
  Legend as RechartsLegend,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  LabelList,
  Label,
} from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChartIcon, PieChartIcon } from "lucide-react";
import { cn, safeNumber } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";

interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string; // For PieChart specific colors
}

interface FinancialChartProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  chartTypeConfig?: {
    bar?: boolean;
    pie?: boolean;
  };
  defaultChartType?: "bar" | "pie";
  noCardCustomShadow?: boolean; // New prop
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];
const DAILY_EARNINGS_MOBILE_SEGMENT_SIZE = 7;

// Custom label component for BarChart
const ValueLabel = (props: any) => {
  const { x, y, width, value, formatter } = props;
  if (value === undefined || value === null || value <= 0) return null;
  const displayValue = formatter ? formatter(value) : String(value);
  return (
    <text
      x={x + width / 2}
      y={y}
      dy={-4}
      fill="hsl(var(--foreground))"
      fontSize="10"
      textAnchor="middle"
    >
      {displayValue}
    </text>
  );
};

export default function FinancialChart({
  title,
  description,
  data,
  chartTypeConfig = { bar: true, pie: true },
  defaultChartType = "bar",
  noCardCustomShadow = false, // Default to false
}: FinancialChartProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">(
    (chartTypeConfig.bar && defaultChartType === "bar") || !chartTypeConfig.pie
      ? "bar"
      : "pie"
  );
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sanitize incoming data: coerce invalid numbers to 0 and ensure names are strings
  const sanitizedData = useMemo(
    () =>
      (Array.isArray(data) ? data : []).map((d) => ({
        name: typeof d.name === "string" ? d.name : String(d.name ?? ""),
        value: safeNumber(d.value, 0),
        fill: d.fill,
      })),
    [data]
  );

  const chartConfig = sanitizedData.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: item.fill || COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  const showTabs = chartTypeConfig.bar && chartTypeConfig.pie;

  const getDynamicBarSize = (dataLength: number) => {
    if (dataLength <= 2) return 50;
    if (dataLength <= 4) return 40;
    if (dataLength <= DAILY_EARNINGS_MOBILE_SEGMENT_SIZE) return 30;
    return 20;
  };

  const renderChart = (type: "bar" | "pie") => {
    if (!isClient) {
      return (
        <div className="h-[250px] sm:h-[300px] w-full flex items-center justify-center text-muted-foreground">
          Loading chart...
        </div>
      );
    }

    const isDailyEarningsChart = title.includes("Daily Earnings");
    const isBudgetVsEarnings = title.includes("Budget vs. Earnings");
    const isEarningsChart =
      isDailyEarningsChart ||
      isBudgetVsEarnings ||
      title.includes("Weekly Earnings") ||
      title.includes("Monthly Earnings") ||
      title.includes("Earnings by Country") ||
      title.includes("Top Actors' Earnings") ||
      title === "";
    const isCriticsBreakdown = title.includes("Critics Breakdown");

    const { formatCurrency } = useCurrency();

    const valueFormatter = (v: number) => {
      if (isCriticsBreakdown) return `${Math.round(v)}%`;
      return formatCurrency(v);
    };

    if (type === "bar") {
      const barSize = getDynamicBarSize(sanitizedData.length);
      const isDailyMobileWithSegment =
        isDailyEarningsChart &&
        isMobile &&
        sanitizedData.length <= DAILY_EARNINGS_MOBILE_SEGMENT_SIZE;

      return (
        <ChartContainer
          config={chartConfig}
          className="h-[250px] sm:h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sanitizedData}
              margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
              barGap={4}
              barSize={barSize}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                tick={{
                  fill: "hsl(var(--foreground))",
                  fontSize: isDailyMobileWithSegment ? 9 : 10,
                  dy: 5,
                }}
                interval={
                  isDailyMobileWithSegment
                    ? 0
                    : sanitizedData.length > 10
                    ? Math.floor(sanitizedData.length / 7)
                    : 0
                }
                angle={
                  isDailyMobileWithSegment
                    ? -45
                    : sanitizedData.length > 7
                    ? -30
                    : 0
                }
                textAnchor={
                  isDailyMobileWithSegment || sanitizedData.length > 7
                    ? "end"
                    : "middle"
                }
                height={
                  isDailyMobileWithSegment
                    ? 50
                    : sanitizedData.length > 7
                    ? 40
                    : 20
                }
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `${Math.round(value)}`}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 10, dx: -2 }}
                width={36}
              />
              <RechartsTooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                content={
                  <ChartTooltipContent
                    formatter={(val: any, name: any) => [
                      valueFormatter(val as number),
                      name,
                    ]}
                  />
                }
              />
              <RechartsLegend
                content={
                  <ChartLegendContent
                    wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                  />
                }
              />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {sanitizedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill || COLORS[index % COLORS.length]}
                  />
                ))}
                <LabelList
                  dataKey="value"
                  content={<ValueLabel formatter={valueFormatter} />}
                />
                {isCriticsBreakdown && (
                  <Label position="insideTopLeft" content={() => null} />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      );
    }
    if (type === "pie") {
      return (
        <ChartContainer
          config={chartConfig}
          className="h-[250px] sm:h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <RechartsTooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                content={<ChartTooltipContent />}
              />
              <RechartsLegend
                content={
                  <ChartLegendContent
                    wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }}
                  />
                }
              />
              <Pie
                data={sanitizedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 60 : 100}
                labelLine={false}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                }) => {
                  if (percent === 0) return null;
                  const RADIAN = Math.PI / 180;
                  const radius =
                    innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  const labelColor = "hsl(var(--foreground))";
                  return (
                    <text
                      x={x}
                      y={y}
                      fill={labelColor}
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      fontSize="10px"
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {sanitizedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill || COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      );
    }
    return null;
  };

  const hasContent = title || description || showTabs;

  return (
    <Card
      noCustomShadow={noCardCustomShadow}
      className={cn(noCardCustomShadow && "border border-border")}
    >
      {hasContent && (
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              {title && (
                <CardTitle className="font-headline text-md sm:text-lg md:text-xl">
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="text-xs sm:text-sm mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
            {showTabs && (
              <Tabs
                value={chartType}
                onValueChange={(value) => setChartType(value as "bar" | "pie")}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-2 sm:w-auto h-8 sm:h-10 text-xs sm:text-sm">
                  {chartTypeConfig.bar && (
                    <TabsTrigger
                      value="bar"
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5"
                    >
                      <BarChartIcon className="w-3 h-3 sm:w-4 sm:h-4" /> Bar
                    </TabsTrigger>
                  )}
                  {chartTypeConfig.pie && (
                    <TabsTrigger
                      value="pie"
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5"
                    >
                      <PieChartIcon className="w-3 h-3 sm:w-4 sm:h-4" /> Pie
                    </TabsTrigger>
                  )}
                </TabsList>
              </Tabs>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent
        className={cn("p-1 pt-0 sm:p-2 md:p-4", hasContent && "md:pt-0")}
      >
        {renderChart(chartType)}
      </CardContent>
    </Card>
  );
}
