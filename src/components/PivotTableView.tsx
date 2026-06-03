import { useMemo, useState } from "react";
import { Table, LayoutGrid, DollarSign, CheckCircle2, ShoppingBag, Eye, ArrowUpDown } from "lucide-react";
import { motion } from "motion/react";
import { Transaction } from "../data";

interface PivotTableViewProps {
  transactions: Transaction[];
}

type SortField = "dimension" | "revenue" | "units" | "avgPrice" | "cashQty" | "cardQty";
type SortOrder = "asc" | "desc";

export default function PivotTableView({ transactions }: PivotTableViewProps) {
  const [pivotDimension, setPivotDimension] = useState<"product" | "paymentMethod">("product");
  const [sortField, setSortField] = useState<SortField>("revenue");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const pivotReport = useMemo(() => {
    const counts: {
      [key: string]: {
        dimValue: string;
        revenue: number;
        units: number;
        payments: { [key: string]: number };
      };
    } = {};

    transactions.forEach((t) => {
      const val = pivotDimension === "product" ? t.product : t.paymentMethod;
      if (!counts[val]) {
        counts[val] = {
          dimValue: val,
          revenue: 0,
          units: 0,
          payments: { Cash: 0, "Credit Card": 0, "Debit Card": 0, eWallet: 0 },
        };
      }
      counts[val].revenue += t.price;
      counts[val].units += 1;
      
      const pm = t.paymentMethod;
      if (counts[val].payments[pm] !== undefined) {
        counts[val].payments[pm] += 1;
      } else {
        counts[val].payments[pm] = 1;
      }
    });

    // Translate report rows
    let reportRows = Object.values(counts).map((row) => {
      const avgPrice = row.units > 0 ? row.revenue / row.units : 0;
      const cardQty = (row.payments["Credit Card"] || 0) + (row.payments["Debit Card"] || 0);
      const cashQty = row.payments["Cash"] || 0;
      return {
        dimension: row.dimValue,
        revenue: row.revenue,
        units: row.units,
        avgPrice,
        cashQty,
        cardQty,
        paymentSplit: row.payments,
      };
    });

    // Apply sorting
    reportRows.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === "dimension") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
    });

    return reportRows;
  }, [transactions, pivotDimension, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default to highest/most first
    }
  };

  const totalKPIs = useMemo(() => {
    const totalRev = transactions.reduce((acc, curr) => acc + curr.price, 0);
    const totalQty = transactions.length;
    return { totalRev, totalQty };
  }, [transactions]);

  const RenderSortSymbol = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-white/30 ml-1.5 shrink-0 inline-block" />;
    return (
      <span className="ml-1.5 font-bold text-[#D4AF37] shrink-0 inline-block text-xs">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="bg-[#161920] rounded-2xl border border-white/5 p-6 shadow-xl space-y-5">
      {/* Pivot Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-light font-serif text-white italic flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#D4AF37]" />
            Interactive Matrix Table
          </h3>
          <p className="text-xs text-white/40">
            Rotate dimensions, view average selling margins, and payment distributions on grouped facets
          </p>
        </div>

        {/* Pivot Selector Switcher */}
        <div className="flex items-center gap-1 bg-[#0F1115] border border-white/5 p-1 rounded-xl self-start md:self-center">
          <button
            onClick={() => {
              setPivotDimension("product");
              setSortField("revenue");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              pivotDimension === "product"
                ? "bg-[#D4AF37] text-black shadow-sm"
                : "text-white/50 hover:text-white"
            }`}
          >
            Group by Product
          </button>
          <button
            onClick={() => {
              setPivotDimension("paymentMethod");
              setSortField("revenue");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              pivotDimension === "paymentMethod"
                ? "bg-[#D4AF37] text-black shadow-sm"
                : "text-white/50 hover:text-white"
            }`}
          >
            Group by Payment
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-white/30 font-medium">No results to pivot.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0F1115]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#0F1115] border-b border-white/10 align-middle">
                {/* Facet Column */}
                <th
                  onClick={() => handleSort("dimension")}
                  className="p-4 text-xs font-semibold uppercase tracking-widest text-white/45 cursor-pointer hover:bg-white/5 select-none transition-all"
                >
                  <span className="flex items-center">
                    {pivotDimension === "product" ? "Product Model" : "Payment Gateway"}
                    <RenderSortSymbol field="dimension" />
                  </span>
                </th>

                {/* Units Sold */}
                <th
                  onClick={() => handleSort("units")}
                  className="p-4 text-xs font-semibold uppercase tracking-widest text-white/45 text-right cursor-pointer hover:bg-white/5 select-none transition-all"
                >
                  <span className="flex items-center justify-end">
                    Units Sold
                    <RenderSortSymbol field="units" />
                  </span>
                </th>

                {/* Avg Price */}
                <th
                  onClick={() => handleSort("avgPrice")}
                  className="p-4 text-xs font-semibold uppercase tracking-widest text-white/45 text-right cursor-pointer hover:bg-white/5 select-none transition-all"
                >
                  <span className="flex items-center justify-end">
                    Avg Item Price
                    <RenderSortSymbol field="avgPrice" />
                  </span>
                </th>

                {/* Revenue */}
                <th
                  onClick={() => handleSort("revenue")}
                  className="p-4 text-xs font-semibold uppercase tracking-widest text-white/45 text-right cursor-pointer hover:bg-white/5 select-none transition-all"
                >
                  <span className="flex items-center justify-end">
                    Total Revenue
                    <RenderSortSymbol field="revenue" />
                  </span>
                </th>

                {/* Volume share progress tracker bar */}
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/30 text-center select-none">
                  Revenue Share %
                </th>

                {/* Payment Splits */}
                <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/45 text-center select-none">
                  Payment Channels Split
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pivotReport.map((row) => {
                const sharePercent = totalKPIs.totalRev > 0 ? (row.revenue / totalKPIs.totalRev) * 100 : 0;
                return (
                  <motion.tr
                    key={row.dimension}
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                    className="align-middle text-sm border-white/5"
                  >
                    {/* Primary dimension name */}
                    <td className="p-4 font-semibold text-white truncate max-w-[200px]" title={row.dimension}>
                      {row.dimension}
                    </td>

                    {/* Quantity Units Count */}
                    <td className="p-4 text-right font-medium text-white/70 font-mono">
                      {row.units}
                    </td>

                    {/* Average price */}
                    <td className="p-4 text-right font-medium text-white/50 font-mono">
                      ${row.avgPrice.toFixed(2)}
                    </td>

                    {/* Total Generated Row Cash */}
                    <td className="p-4 text-right font-bold text-[#D4AF37] font-mono">
                      ${row.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Share progress visualization */}
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2 max-w-[120px] mx-auto">
                        <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#D4AF37] h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(2, sharePercent))}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-white/40 shrink-0">
                          {sharePercent.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    {/* Payment distributions widgets list */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {Object.entries(row.paymentSplit).map(([method, val]) => {
                          if (val === 0) return null;
                          let nameAbbr = method === "Credit Card" ? "CC" : method === "Debit Card" ? "DB" : method === "eWallet" ? "eW" : "CS";
                          let colorClass = "bg-white/5 text-white/70 border-white/10";
                          if (method === "Cash") colorClass = "bg-amber-500/10 text-amber-300 border-amber-500/20";
                          if (method === "Credit Card") colorClass = "bg-blue-500/10 text-blue-300 border-blue-500/30";
                          if (method === "Debit Card") colorClass = "bg-indigo-500/10 text-indigo-300 border-indigo-500/30";
                          if (method === "eWallet") colorClass = "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";

                          return (
                            <span
                              key={method}
                              title={`${method}: ${val} transactions`}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${colorClass} tracking-tight select-default shrink-0`}
                            >
                              {nameAbbr}: {val}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
