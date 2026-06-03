import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, BarChart2, PieChart as PieIcon, CalendarDays, LineChart } from "lucide-react";
import { motion } from "motion/react";
import { Transaction } from "../data";

interface ChartsSectionProps {
  transactions: Transaction[];
}

export default function ChartsSection({ transactions }: ChartsSectionProps) {
  const [activeChartTab, setActiveChartTab] = useState<"sales_trend" | "product_performance" | "payment_methods" | "weekly_insights">("sales_trend");

  // 1. Sales Trend over Time Data Source
  const trendData = useMemo(() => {
    const dailyMap: { [key: string]: { revenue: number; volume: number; key: string } } = {};
    
    // Pre-populate date sequence or dynamically collect
    transactions.forEach((t) => {
      if (!dailyMap[t.date]) {
        dailyMap[t.date] = { revenue: 0, volume: 0, key: t.date };
      }
      dailyMap[t.date].revenue += t.price;
      dailyMap[t.date].volume += 1;
    });

    const sortedD = Object.values(dailyMap).sort((a, b) => a.key.localeCompare(b.key));
    
    // Add cumulative calculation
    let cumulative = 0;
    return sortedD.map((item) => {
      cumulative += item.revenue;
      return {
        ...item,
        formattedDate: new Date(item.key).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        cumulative: parseFloat(cumulative.toFixed(2)),
        revenue: parseFloat(item.revenue.toFixed(2)),
      };
    });
  }, [transactions]);

  // 2. Product sales performance Data Source
  const productPerformanceData = useMemo(() => {
    const productsMap: { [key: string]: { revenue: number; units: number; name: string } } = {};
    transactions.forEach((t) => {
      if (!productsMap[t.product]) {
        productsMap[t.product] = { revenue: 0, units: 0, name: t.product };
      }
      productsMap[t.product].revenue += t.price;
      productsMap[t.product].units += 1;
    });

    return Object.values(productsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .map((item) => ({
        ...item,
        // Short name for visual clean display
        shortName: item.name.length > 22 ? item.name.slice(0, 20) + "..." : item.name,
        revenue: parseFloat(item.revenue.toFixed(2)),
      }));
  }, [transactions]);

  // 3. Payment methods distribution Data Source
  const paymentMethodData = useMemo(() => {
    const paymentMap: { [key: string]: { value: number; count: number; name: string } } = {};
    transactions.forEach((t) => {
      if (!paymentMap[t.paymentMethod]) {
        paymentMap[t.paymentMethod] = { value: 0, count: 0, name: t.paymentMethod };
      }
      paymentMap[t.paymentMethod].value += t.price;
      paymentMap[t.paymentMethod].count += 1;
    });

    return Object.values(paymentMap).map((item) => ({
      ...item,
      value: parseFloat(item.value.toFixed(2)),
    }));
  }, [transactions]);

  // 4. Weekly Sales Insights / Day of week activity
  const dayOfWeekData = useMemo(() => {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysMap: { [key: number]: { count: number; revenue: number; name: string } } = {};
    
    for (let i = 0; i < 7; i++) {
      daysMap[i] = { count: 0, revenue: 0, name: weekdays[i] };
    }

    transactions.forEach((t) => {
      const dayIndex = new Date(t.date).getDay();
      if (daysMap[dayIndex]) {
        daysMap[dayIndex].count += 1;
        daysMap[dayIndex].revenue += t.price;
      }
    });

    return Object.values(daysMap).map((item) => ({
      ...item,
      revenue: parseFloat(item.revenue.toFixed(2)),
    }));
  }, [transactions]);

  // Colors mapping for products and sectors with elegant gold/bronze spectrum
  const PIE_COLORS = ["#D4AF37", "#B5942B", "#F3D063", "#9C7E22", "#E2C35D"];
  const ACCENT_GRADIENT = "url(#colorRevenue)";

  const customTooltipFormatter = (value: number) => {
    return [`$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, "Revenue"];
  };

  return (
    <div className="bg-[#161920] rounded-2xl border border-white/5 p-6 shadow-xl flex flex-col gap-6">
      {/* Visual Tab Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-light font-serif text-white italic flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
            Performance Analytics
          </h2>
          <p className="text-xs text-white/40">
            Realtime data visualization of transactions, product demand and transaction metrics
          </p>
        </div>

        {/* Chart switchers */}
        <div className="flex flex-wrap items-center gap-1 bg-[#0F1115] border border-white/5 p-1 rounded-xl self-start lg:self-center">
          <button
            onClick={() => setActiveChartTab("sales_trend")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeChartTab === "sales_trend"
                ? "bg-[#D4AF37] text-black shadow-sm"
                : "text-white/50 hover:text-white"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            Sales Trend
          </button>
          <button
            onClick={() => setActiveChartTab("product_performance")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeChartTab === "product_performance"
                ? "bg-[#D4AF37] text-black shadow-sm"
                : "text-white/50 hover:text-white"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Product Ranks
          </button>
          <button
            onClick={() => setActiveChartTab("payment_methods")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeChartTab === "payment_methods"
                ? "bg-[#D4AF37] text-black shadow-sm"
                : "text-white/50 hover:text-white"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Payments Split
          </button>
          <button
            onClick={() => setActiveChartTab("weekly_insights")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeChartTab === "weekly_insights"
                ? "bg-[#D4AF37] text-black shadow-sm"
                : "text-white/50 hover:text-white"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Weekly Cycle
          </button>
        </div>
      </div>

      {/* Render selected visualization */}
      <div className="w-full relative min-h-[340px] flex items-center justify-center">
        {transactions.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-white/30 font-medium">No sales data matches current filters.</p>
            <p className="text-xs text-white/30">Try loosening your search keywords or custom dates.</p>
          </div>
        ) : (
          <div className="w-full h-80">
            {activeChartTab === "sales_trend" && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="formattedDate"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 500 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F1115",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      color: "#E0E0E0",
                      fontSize: "11px",
                      fontFamily: "var(--font-sans)",
                    }}
                    formatter={customTooltipFormatter}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    name="Daily Sales"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    name="Growth Trend"
                    type="monotone"
                    dataKey="cumulative"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorCumulative)"
                    hide={trendData.length < 3} // Only show secondary curve if has substantial sequence
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === "product_performance" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productPerformanceData.slice(0, 8)} // Show top 8 for layout elegance
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 500 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#E0E0E0", fontSize: 10, fontWeight: 600 }}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F1115",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      color: "#E0E0E0",
                      fontSize: "11px",
                      fontFamily: "var(--font-sans)",
                    }}
                    formatter={(val: number) => [
                      `$${val.toLocaleString()} (${
                        productPerformanceData.find((p) => p.revenue === val)?.units || 0
                      } Units)`,
                      "Sales Generated",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#D4AF37" radius={[0, 8, 8, 0]} barSize={16}>
                    {productPerformanceData.slice(0, 8).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === "payment_methods" && (
              <div className="flex flex-col md:flex-row items-center justify-center h-full gap-8">
                <div className="w-full md:w-1/2 h-56 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F1115",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                          color: "#E0E0E0",
                          fontSize: "11px",
                          fontFamily: "var(--font-sans)",
                        }}
                        formatter={(val: number) => [
                          `$${val.toLocaleString()} (${
                            paymentMethodData.find((p) => p.value === val)?.count || 0
                          } orders)`,
                          "Total Share",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Absolute center widget inside donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-1">
                    <span className="text-2xl font-light text-[#D4AF37] font-serif italic">
                      {paymentMethodData.length}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest">
                      Channels
                    </span>
                  </div>
                </div>

                {/* Legends Grid details */}
                <div className="w-full md:w-1/2 grid grid-cols-2 gap-3.5">
                  {paymentMethodData.map((item, index) => {
                    const totalSalesValue = paymentMethodData.reduce((acc, curr) => acc + curr.value, 0);
                    const percentage = totalSalesValue > 0 ? (item.value / totalSalesValue) * 105 : 0;
                    return (
                      <div
                        key={item.name}
                        className="p-3 bg-[#0F1115] border border-white/5 rounded-xl flex items-center gap-3 transition-colors hover:bg-white/5"
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 animate-pulse"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-white/50 font-mono tracking-tight font-medium">
                            {percentage > 100 ? 100 : percentage.toFixed(0)}% • ${item.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeChartTab === "weekly_insights" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 550 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F1115",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      color: "#E0E0E0",
                      fontSize: "11px",
                      fontFamily: "var(--font-sans)",
                    }}
                    formatter={(val: number) => [
                      `$${val.toLocaleString()} (${
                        dayOfWeekData.find((d) => d.revenue === val)?.count || 0
                      } Sales)`,
                      "Aggregate Volume",
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#D4AF37" radius={[6, 6, 0, 0]} barSize={28}>
                    {dayOfWeekData.map((entry, index) => {
                      const maxRevenue = Math.max(...dayOfWeekData.map((d) => d.revenue));
                      const isApex = entry.revenue === maxRevenue;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={isApex ? "#E2C35D" : "#5d543e"} // Highlight weekends or top sales day with luxury gold shades
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
