import { useState, useMemo } from "react";
import { ArrowUpDown, Trash2, ExternalLink, Calendar, CreditCard, ShoppingCart, X, PlusCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Transaction } from "../data";

interface TransactionTableProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  allTransactions: Transaction[]; // Used for finding group order details
}

type SortField = "orderNumber" | "product" | "price" | "date" | "paymentMethod";
type SortOrder = "asc" | "desc";

export default function TransactionTable({
  transactions,
  onDeleteTransaction,
  allTransactions,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>("orderNumber");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<string | null>(null);

  // Sorting logic
  const sortedTransactions = useMemo(() => {
    const list = [...transactions];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });
    return list;
  }, [transactions, sortField, sortOrder]);

  // Pagination bounds
  const totalRows = sortedTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  
  // Guard current page in case table gets filtered/smaller
  const safeCurrentPage = Math.min(currentPage, totalPages);
  
  const currentRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedTransactions.slice(start, start + pageSize);
  }, [sortedTransactions, safeCurrentPage, pageSize]);

  // Toggle or cycle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Restarts at page 1 on Sort
  };

  // Grouped order items search handler
  const groupedOrderDetails = useMemo(() => {
    if (!selectedOrderDetails) return null;
    const sameOrderItems = allTransactions.filter((t) => t.orderNumber === selectedOrderDetails);
    const orderTotal = sameOrderItems.reduce((acc, curr) => acc + curr.price, 0);
    const orderDate = sameOrderItems[0]?.date || "Unknown";
    const orderPayment = sameOrderItems[0]?.paymentMethod || "Unknown";

    return {
      orderNumber: selectedOrderDetails,
      items: sameOrderItems,
      total: orderTotal,
      date: orderDate,
      paymentMethod: orderPayment,
    };
  }, [selectedOrderDetails, allTransactions]);

  const RenderColumnHeader = ({ field, label }: { field: SortField; label: string }) => {
    const isSorted = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className="p-4 text-xs font-semibold uppercase tracking-widest text-white/45 cursor-pointer hover:bg-white/5 transition-colors select-none"
      >
        <span className="flex items-center gap-1.5">
          {label}
          <ArrowUpDown className={`w-3 h-3 ${isSorted ? "text-[#D4AF37] font-bold" : "text-white/20"}`} />
        </span>
      </th>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Table grid section */}
      <div className="xl:col-span-2 bg-[#161920] rounded-2xl border border-white/5 p-6 shadow-xl space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-light font-serif text-white italic flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#D4AF37]" />
                Receipt Audit Ledger
              </h3>
              <p className="text-xs text-white/40">
                Sorted ledger view of transactions with full order consolidation drawers
              </p>
            </div>

            {/* Pagination Controls Sizes */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1 px-1.5 bg-[#0F1115] border border-white/10 rounded-lg text-xs font-semibold text-white/80 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Table proper */}
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0F1115]">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#0F1115] border-b border-white/10 align-middle text-white/45">
                  <RenderColumnHeader field="orderNumber" label="Order ID" />
                  <RenderColumnHeader field="product" label="Product Model" />
                  <RenderColumnHeader field="price" label="Unit Cost" />
                  <RenderColumnHeader field="date" label="Sale Date" />
                  <RenderColumnHeader field="paymentMethod" label="Gateway" />
                  <th className="p-4 text-xs font-semibold uppercase tracking-widest text-[#D4AF37]/80 text-center">
                    Ledger Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-white/30 text-sm font-medium">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  currentRows.map((row) => {
                    // Check if this order contains multiple items in entire dataset
                    const brotherItemsCount = allTransactions.filter(
                      (t) => t.orderNumber === row.orderNumber
                    ).length;

                    return (
                      <motion.tr
                        key={row.id}
                        onClick={() => setSelectedOrderDetails(row.orderNumber)}
                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                        className={`group cursor-pointer text-sm align-middle transition-colors border-white/5 ${
                          selectedOrderDetails === row.orderNumber ? "bg-[#D4AF37]/10" : ""
                        }`}
                      >
                        {/* Order Number column */}
                        <td className="p-4 font-mono font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                          <span className="flex items-center gap-1.5">
                            {row.orderNumber}
                            {brotherItemsCount > 1 && (
                              <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] px-1.5 py-0.5 rounded-full font-sans font-bold">
                                Combo ({brotherItemsCount})
                              </span>
                            )}
                          </span>
                        </td>

                        {/* Product */}
                        <td className="p-4 font-semibold text-white/80 max-w-[180px] truncate" title={row.product}>
                          {row.product}
                        </td>

                        {/* Price */}
                        <td className="p-4 font-bold font-mono text-white">
                          ${row.price.toFixed(2)}
                        </td>

                        {/* Date */}
                        <td className="p-4 text-white/40 font-mono text-xs font-medium">
                          {row.date}
                        </td>

                        {/* Payment method pill */}
                        <td className="p-4">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-white/5 border-white/10 text-white/70">
                            {row.paymentMethod}
                          </span>
                        </td>

                        {/* Trash Action */}
                        <td className="p-4 align-middle text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedOrderDetails(row.orderNumber)}
                              className="p-1 px-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                              title="Audit Group Order"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Inspect
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove this item record from session?`)) {
                                  onDeleteTransaction(row.id);
                                  if (selectedOrderDetails === row.orderNumber) {
                                    setSelectedOrderDetails(null);
                                  }
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/30 hover:text-rose-400 transition-colors"
                              title="Delete transaction line item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls visualizer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs font-semibold">
              <span className="text-white/40 font-mono">
                Showing {Math.min((safeCurrentPage - 1) * pageSize + 1, totalRows)} -{" "}
                {Math.min(safeCurrentPage * pageSize, totalRows)} of {totalRows} Items
              </span>

              <div className="flex items-center gap-1 bg-[#0F1115] border border-white/10 p-1 rounded-xl">
                <button
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2 py-1 rounded-lg text-white/40 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  «
                </button>
                <button
                  disabled={safeCurrentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-2.5 py-1 rounded-lg text-white/40 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Prev
                </button>
                <span className="px-2 text-white/80 font-bold">
                  {safeCurrentPage} / {totalPages}
                </span>
                <button
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 rounded-lg text-white/40 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Next
                </button>
                <button
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2 py-1 rounded-lg text-white/40 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consolidation Drawer detail panel */}
      <div className="xl:col-span-1 bg-[#0F1115] text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between border border-white/10 relative overflow-hidden min-h-[460px]">
        {/* Subtle abstract glow in backdrop */}
        <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-[#D4AF37]/5 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {groupedOrderDetails ? (
            <motion.div
              key={groupedOrderDetails.orderNumber}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="space-y-6 z-10 relative flex-1 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest font-mono">
                      Order Receipt Audit
                    </span>
                    <h4 className="text-lg font-light font-serif text-white italic tracking-tight flex items-center gap-2">
                      ID: {groupedOrderDetails.orderNumber}
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectedOrderDetails(null)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Sub Metadata blocks */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#161920]/80 rounded-xl border border-white/5 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-white/30" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-white/40 uppercase font-semibold">Date</p>
                      <p className="font-semibold text-white/80 truncate">{groupedOrderDetails.date}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-[#161920]/80 rounded-xl border border-white/5 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-white/30" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-white/40 uppercase font-semibold">Payment</p>
                      <p className="font-semibold text-white/80 truncate">{groupedOrderDetails.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                {/* Item List */}
                <div className="space-y-2.5">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]/80 block mb-1 font-mono">
                    Purchased Items ({groupedOrderDetails.items.length})
                  </p>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto scrollbar-none pr-1">
                    {groupedOrderDetails.items.map((it) => (
                      <div
                        key={it.id}
                        className="p-2.5 rounded-xl bg-[#161920] border border-white/5 flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-white truncate" title={it.product}>
                            {it.product}
                          </p>
                          <p className="text-[9px] text-white/35 mt-0.5">In-ledger index ID: {it.id.slice(-6)}</p>
                        </div>
                        <span className="font-bold text-xs text-[#D4AF37] shrink-0 font-mono">
                          ${it.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Summary Footer */}
              <div className="p-4 bg-[#161920]/70 border border-white/10 rounded-2xl flex items-center justify-between mt-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Order Total</p>
                  <p className="text-xs text-white/30 mt-0.5">{groupedOrderDetails.items.length} units total</p>
                </div>
                <h3 className="text-2xl font-light text-[#D4AF37] tracking-tight font-serif italic">
                  ${groupedOrderDetails.total.toFixed(2)}
                </h3>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-3 flex-1 select-none">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[#D4AF37] animate-pulse">
                <Sparkles className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-light font-serif italic text-lg">Receipt Examiner</h4>
                <p className="text-xs text-white/40 max-w-[200px] leading-relaxed mx-auto">
                  Click on any transaction line in the adjacent ledger to inspect items bought together.
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
