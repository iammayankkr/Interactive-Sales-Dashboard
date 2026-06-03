import { useState, useEffect, useMemo } from "react";
import { 
  PlusCircle, 
  RotateCcw, 
  Download, 
  TrendingUp, 
  UploadCloud,
  Settings, 
  Sparkles, 
  CheckCircle2, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";

import { DATASET, Transaction } from "./data";
import KPIMetrics from "./components/KPIMetrics";
import FiltersBar from "./components/FiltersBar";
import ChartsSection from "./components/ChartsSection";
import PivotTableView from "./components/PivotTableView";
import TransactionTable from "./components/TransactionTable";
import AddTransactionDialog from "./components/AddTransactionDialog";

import DataUploadDialog from "./components/DataUploadDialog";

export default function App() {
  // State: Initialise ledger with localCache or baseline data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const cached = localStorage.getItem("transaction_sales_db_dataset");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Localstorage cache read failed", e);
    }

    // Map initial DATASET static rows with sequential index IDs
    return DATASET.map((t, idx) => ({
      ...t,
      id: `${t.orderNumber}-${idx}-${t.date}`,
    }));
  });

  // State: Interactive Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [preset, setPreset] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // State: Add item dialog tracker
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Persist ledger mutations into sandbox localStorage
  useEffect(() => {
    try {
      localStorage.setItem("transaction_sales_db_dataset", JSON.stringify(transactions));
    } catch (e) {
      console.error("Localstorage cache write failed", e);
    }
  }, [transactions]);

  // Dynamic values extract helper
  const allProducts = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.product))).sort();
  }, [transactions]);

  const allPayments = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.paymentMethod))).sort();
  }, [transactions]);

  // Primary pipeline sorting & filtering core
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // 1. Verbal matching
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchOrder = t.orderNumber.toLowerCase().includes(q);
        const matchProduct = t.product.toLowerCase().includes(q);
        const matchPayment = t.paymentMethod.toLowerCase().includes(q);
        if (!matchOrder && !matchProduct && !matchPayment) return false;
      }

      // 2. Custom date range bounds
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      // 3. Dropdown locks
      if (selectedProduct && t.product !== selectedProduct) return false;
      if (selectedPayment && t.paymentMethod !== selectedPayment) return false;

      // 4. Quick button presets overrides
      if (preset === "high_ticket" && t.price < 100) return false;

      return true;
    });
  }, [transactions, searchQuery, startDate, endDate, selectedProduct, selectedPayment, preset]);

  // Auto-calculated statistics alerts & anomalies banner (Architectural Honesty)
  const anomaliesMetrics = useMemo(() => {
    if (filteredTransactions.length === 0) return [];
    
    const notices: string[] = [];
    const totalRev = filteredTransactions.reduce((acc, curr) => acc + curr.price, 0);
    const avgPrice = totalRev / filteredTransactions.length;

    // Detect high transaction peaks
    const dateCounts: { [key: string]: number } = {};
    filteredTransactions.forEach((t) => {
      dateCounts[t.date] = (dateCounts[t.date] || 0) + 1;
    });

    let peakDay = "";
    let peakCount = 0;
    Object.entries(dateCounts).forEach(([day, count]) => {
      if (count > peakCount) {
        peakCount = count;
        peakDay = day;
      }
    });

    if (peakCount > 3) {
      const formattedDay = new Date(peakDay).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      notices.push(`Surge detected on ${formattedDay} with ${peakCount} items purchased within a single window.`);
    }

    // Focus on premium item share
    const highTicketCount = filteredTransactions.filter((t) => t.price >= 145).length;
    if (highTicketCount > 0) {
      const ratio = (highTicketCount / filteredTransactions.length) * 100;
      notices.push(`High Margin mix represents ${ratio.toFixed(0)}% of your active volume queue.`);
    }

    // Gateway concentration alerts
    const gatewayMap: { [key: string]: number } = {};
    filteredTransactions.forEach((t) => {
      gatewayMap[t.paymentMethod] = (gatewayMap[t.paymentMethod] || 0) + 1;
    });

    Object.entries(gatewayMap).forEach(([gateway, qty]) => {
      const gRatio = qty / filteredTransactions.length;
      if (gRatio > 0.45) {
        notices.push(`Gateway alert: ${gateway} processes ${qty} transactions (${(gRatio * 100).toFixed(0)}%+ aggregate channel share).`);
      }
    });

    // Default checklist fallback
    if (notices.length === 0) {
      notices.push("No material margin spikes or volumetric channels warnings recorded over time series.");
    }

    return notices.slice(0, 3); // Return at most 3 hot points
  }, [filteredTransactions]);

  // Core callback: add row to sandbox database
  const handleAddTransaction = (newT: Omit<Transaction, "id">) => {
    const id = `${newT.orderNumber}-${transactions.length}-${newT.date}-${Math.floor(Math.random() * 1000)}`;
    setTransactions((prev) => [
      {
        ...newT,
        id,
      },
      ...prev,
    ]);
  };

  // Core callback: remove row from sandbox database
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Replace Sandbox with User Upload
  const handleDataLoaded = (data: Transaction[]) => {
    setTransactions(data);
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setSelectedProduct("");
    setSelectedPayment("");
    setPreset("all");
  };

  // Hard Reset Sandbox to baseline data list
  const handleHardReset = () => {
    if (confirm("Restore sales ledger sandbox to default original static 116 records?")) {
      const baseline = DATASET.map((t, idx) => ({
        ...t,
        id: `${t.orderNumber}-${idx}-${t.date}`,
      }));
      setTransactions(baseline);
      setSearchQuery("");
      setStartDate("");
      setEndDate("");
      setSelectedProduct("");
      setSelectedPayment("");
      setPreset("all");
    }
  };

  // Export Filtered Subset to Excel CSV Link
  const handleExportCSV = () => {
    const headers = ["Order ID", "Product Model", "Revenue Cost ($)", "Date", "Payment Gateway"];
    const rows = filteredTransactions.map((t) => [
      t.orderNumber,
      `"${t.product}"`,
      t.price.toFixed(2),
      t.date,
      t.paymentMethod,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_ledger_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E0E0E0] selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Top Header Workspace navigation bar */}
      <nav className="bg-[#161920] border-b border-white/5 py-4 px-6 md:px-8 sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#D4AF37]/10 rounded-xl text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/20">
              <TrendingUp className="w-5 h-5 pointer-events-none" />
            </div>
            <div>
              <h1 className="text-lg font-light font-serif tracking-wide text-white italic">
                Interactive Sales Dashboard
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/5 border border-[#D4AF37]/15 px-2 py-0.5 rounded">
                Audit Ledger Scope
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Upload Data Button */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-[#D4AF37] hover:text-[#E2C35D] transition-all bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10"
              title="Upload your own custom CSV dataset"
            >
              <UploadCloud className="w-4 h-4" />
              Inject Dataset
            </button>

            {/* Hard Reset Dataset button */}
            <button
              onClick={handleHardReset}
              className="flex items-center gap-1.5 px-3 py-2 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-white/50 hover:text-white transition-all bg-[#0F1115] hover:bg-[#161920]"
              title="Revert modifications to original benchmark data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Benchmark
            </button>

            {/* Export current selection */}
            <button
              onClick={handleExportCSV}
              disabled={filteredTransactions.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 hover:border-white/20 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-all bg-[#0F1115] hover:bg-[#161920] disabled:opacity-35 disabled:pointer-events-none border border-white/10"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

            {/* Injected Action Feed Row */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#E2C35D] text-black rounded-xl text-xs font-bold transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Feed Receipt
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main Container scope */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-16">
        {/* Dynamic anomalies banner strip */}
        {anomaliesMetrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-[#D4AF37]/5 rounded-2xl border border-[#D4AF37]/20 overflow-hidden relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#D4AF37]/20 rounded-lg text-[#D4AF37] mt-0.5 md:mt-0 shrink-0 border border-[#D4AF37]/10">
                <AlertCircle className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest flex items-center gap-1 font-mono">
                  Active Sandbox Insights
                </span>
                <div className="text-xs text-white/80 leading-relaxed font-medium space-y-1">
                  {anomaliesMetrics.map((notice, uidx) => (
                    <p key={uidx} className="flex items-center gap-1.5">
                      <span className="text-[#D4AF37] font-bold">•</span>
                      {notice}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="text-[10px] font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded uppercase tracking-widest shrink-0">
              Computed Real-Time
            </div>
          </motion.div>
        )}

        {/* 1. AGGREGATES KPIs STATS CARD SYSTEM */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-[#D4AF37]/80 block">
              Performance Summary
            </span>
            <span className="text-[10px] font-semibold text-white/30 font-mono">
              TIME SCOPE: 2025-08-15 to 2025-10-07
            </span>
          </div>
          <KPIMetrics
            transactions={filteredTransactions}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            selectedPayment={selectedPayment}
            setSelectedPayment={setSelectedPayment}
          />
        </section>

        {/* 2. FILTERS CONTROL SHIELD BOARD */}
        <section className="space-y-3">
          <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-[#D4AF37]/80 block">
            Refinement Engine
          </span>
          <FiltersBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            selectedPayment={selectedPayment}
            setSelectedPayment={setSelectedPayment}
            preset={preset}
            setPreset={setPreset}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            allProducts={allProducts}
            allPayments={allPayments}
            onReset={() => {
              setSearchQuery("");
              setStartDate("");
              setEndDate("");
              setSelectedProduct("");
              setSelectedPayment("");
              setPreset("all");
            }}
            transactionsCount={filteredTransactions.length}
          />
        </section>

        {/* 3. VISUALIZATIONS CHARTS SYSTEM */}
        <section className="space-y-3">
          <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-[#D4AF37]/80 block">
            Analytical Charts
          </span>
          <ChartsSection transactions={filteredTransactions} />
        </section>

        {/* 4. PIVOT MATRIX CONSOLIDATED VIEW */}
        <section className="space-y-3">
          <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-[#D4AF37]/80 block">
            Cross-Tabulation Matrix
          </span>
          <PivotTableView transactions={filteredTransactions} />
        </section>

        {/* 5. AUDITED LEDGER & ITEM DRAWER SYSTEM */}
        <section className="space-y-3">
          <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-[#D4AF37]/80 block">
            Detailed Transactions
          </span>
          <TransactionTable
            transactions={filteredTransactions}
            onDeleteTransaction={handleDeleteTransaction}
            allTransactions={transactions}
          />
        </section>
      </main>

      {/* dialog component toggle form */}
      <AddTransactionDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddTransaction={handleAddTransaction}
        allProducts={allProducts}
        allPayments={allPayments}
      />

      {/* Dataset CSV Upload Dialog */}
      <DataUploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataLoaded={handleDataLoaded}
      />
    </div>
  );
}
