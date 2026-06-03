import { useMemo } from "react";
import { Search, RotateCcw, Calendar, CheckSquare, Square, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Transaction } from "../data";

interface FiltersBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  selectedProduct: string;
  setSelectedProduct: (product: string) => void;
  selectedPayment: string;
  setSelectedPayment: (payment: string) => void;
  preset: string;
  setPreset: (preset: string) => void;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  allProducts: string[];
  allPayments: string[];
  onReset: () => void;
  transactionsCount: number;
}

export default function FiltersBar({
  searchQuery,
  setSearchQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedProduct,
  setSelectedProduct,
  selectedPayment,
  setSelectedPayment,
  preset,
  setPreset,
  showAdvanced,
  setShowAdvanced,
  allProducts,
  allPayments,
  onReset,
  transactionsCount,
}: FiltersBarProps) {
  // Apply quick presets immediately when clicked
  const handlePresetChange = (name: string) => {
    setPreset(name);
    if (name === "all") {
      setStartDate("");
      setEndDate("");
      setSearchQuery("");
      setSelectedProduct("");
      setSelectedPayment("");
    } else if (name === "august") {
      setStartDate("2025-08-15");
      setEndDate("2025-08-31");
    } else if (name === "september") {
      setStartDate("2025-09-01");
      setEndDate("2025-09-30");
    } else if (name === "october") {
      setStartDate("2025-10-01");
      setEndDate("2025-10-07");
    } else if (name === "high_ticket") {
      setStartDate("");
      setEndDate("");
      setSelectedProduct("");
      setSelectedPayment("");
    }
  };

  return (
    <div className="bg-[#161920] rounded-2xl border border-white/5 p-5 shadow-lg space-y-4">
      {/* Search & Main controls */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Order ID, product, or payment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 focus:border-[#D4AF37]/50 focus:bg-[#0F1115] focus:outline-none rounded-xl text-sm transition-all text-white placeholder-white/30 font-sans"
          />
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => handlePresetChange("all")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              preset === "all"
                ? "bg-[#D4AF37] text-black shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-white/65 border border-white/10"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => handlePresetChange("august")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              preset === "august"
                ? "bg-[#D4AF37] text-black shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-white/65 border border-white/10"
            }`}
          >
            Aug 2025
          </button>
          <button
            onClick={() => handlePresetChange("september")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              preset === "september"
                ? "bg-[#D4AF37] text-black shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-white/65 border border-white/10"
            }`}
          >
            Sept 2025
          </button>
          <button
            onClick={() => handlePresetChange("october")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              preset === "october"
                ? "bg-[#D4AF37] text-black shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-white/65 border border-white/10"
            }`}
          >
            Oct 2025
          </button>
          <button
            onClick={() => handlePresetChange("high_ticket")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              preset === "high_ticket"
                ? "bg-[#D4AF37] text-black shadow-sm"
                : "bg-white/5 hover:bg-white/10 text-white/65 border border-white/10"
            }`}
          >
            High Ticket (+$100)
          </button>
        </div>

        {/* Advanced toggle & Reset */}
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
              showAdvanced || selectedProduct || selectedPayment || startDate || endDate
                ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                : "border-white/10 hover:border-white/20 text-white/60 hover:bg-white/5"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {(selectedProduct || selectedPayment || startDate || endDate) && (
              <span className="bg-[#D4AF37] text-black rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-black">
                !
              </span>
            )}
          </button>

          <button
            onClick={onReset}
            className="flex items-center justify-center p-2.5 border border-white/10 hover:border-white/20 rounded-xl text-white/60 hover:text-white transition-all bg-white/5 hover:bg-white/10"
            title="Reset active parameters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advanced Filter drawer */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5 pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
              {/* Product Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest block">
                  Product Filter
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full p-2 bg-[#0F1115] border border-white/10 rounded-xl font-medium text-xs text-white/80 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="" className="bg-[#0F1115]">All Products ({allProducts.length})</option>
                  {allProducts.map((p) => (
                    <option key={p} value={p} className="bg-[#0F1115]">
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest block">
                  Payment Method
                </label>
                <select
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="w-full p-2 bg-[#0F1115] border border-white/10 rounded-xl font-medium text-xs text-white/80 focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="" className="bg-[#0F1115]">All Payments ({allPayments.length})</option>
                  {allPayments.map((pm) => (
                    <option key={pm} value={pm} className="bg-[#0F1115]">
                      {pm}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Ranges */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest block">
                  Date Range
                </label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 w-3 h-3 pointer-events-none" />
                    <input
                      type="date"
                      min="2025-08-15"
                      max="2025-10-07"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setPreset("custom");
                      }}
                      className="w-full pl-7 pr-2 py-1.5 bg-[#0F1115] border border-white/10 rounded-xl text-xs font-medium text-white/80 focus:outline-none focus:border-[#D4AF37] [color-scheme:dark]"
                    />
                  </div>
                  <span className="text-white/30 text-xs">to</span>
                  <div className="relative flex-1">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 w-3 h-3 pointer-events-none" />
                    <input
                      type="date"
                      min="2025-08-15"
                      max="2025-10-07"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setPreset("custom");
                      }}
                      className="w-full pl-7 pr-2 py-1.5 bg-[#0F1115] border border-white/10 rounded-xl text-xs font-medium text-white/80 focus:outline-none focus:border-[#D4AF37] [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Micro details panel */}
            <div className="mt-4 pt-3 border-t border-dashed border-white/10 flex items-center justify-between text-xs text-white/40">
              <span className="font-mono bg-white/5 text-[#D4AF37] border border-white/10 px-2 py-0.5 rounded text-[10px] tracking-widest uppercase">
                ACTIVE FOCUS: {transactionsCount} rows matched
              </span>
              <button
                onClick={() => {
                  setSelectedProduct("");
                  setSelectedPayment("");
                  setStartDate("");
                  setEndDate("");
                  setPreset("all");
                }}
                className="text-white/40 hover:text-[#D4AF37] transition-colors hover:underline font-semibold"
              >
                Clear sub-filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
