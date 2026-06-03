import { useState, FormEvent } from "react";
import { PlusCircle, Search, Calendar, CreditCard, DollarSign, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Transaction } from "../data";

interface AddTransactionDialogProps {
  onAddTransaction: (t: Omit<Transaction, "id">) => void;
  allProducts: string[];
  allPayments: string[];
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTransactionDialog({
  onAddTransaction,
  allProducts,
  allPayments,
  isOpen,
  onClose,
}: AddTransactionDialogProps) {
  const [orderNumber, setOrderNumber] = useState("TT-1099");
  const [product, setProduct] = useState(allProducts[0] || "Slim-Fit Denim Jeans");
  const [price, setPrice] = useState("88.00");
  const [date, setDate] = useState("2025-10-07");
  const [paymentMethod, setPaymentMethod] = useState(allPayments[0] || "Credit Card");

  // Automatically fetch standard price of standard models when product shifts
  const handleProductChange = (prod: string) => {
    setProduct(prod);
    const standardPrices: { [key: string]: number } = {
      "Slim-Fit Denim Jeans": 88.0,
      "Technical Performance Joggers": 75.0,
      "Classic Fit Chinos": 78.0,
      "Flannel-Lined Canvas Work Pants": 98.0,
      "Double-Pleated Khaki Trousers": 82.0,
      "Relaxed Fit Corduroy Trousers": 85.0,
      "Multi-Pocket Cargo Shorts": 58.0,
      "Premium Tailored Trousers": 175.0,
      "Classic Denim Overalls": 115.0,
      "Drawstring Linen Trousers": 92.0,
      "Tailored Wool Dress Trousers": 145.0,
      "Striped Seersucker Trousers": 95.0,
    };
    if (standardPrices[prod] !== undefined) {
      setPrice(standardPrices[prod].toFixed(2));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return alert("Order ID is required");
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) return alert("Price must be a valid positive number");

    onAddTransaction({
      orderNumber: orderNumber.toUpperCase().trim(),
      product,
      price: numPrice,
      date,
      paymentMethod,
    });
    
    // Auto increment default order ID for subsequent items in ledger
    const matches = orderNumber.match(/\d+/);
    if (matches) {
      const currentVal = parseInt(matches[0]);
      setOrderNumber(`TT-${currentVal + 1}`);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop screen split */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 z-50 cursor-pointer"
          />

          {/* Modal content body container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto max-w-lg h-fit bg-[#161920] rounded-3xl p-6 shadow-2xl border border-white/5 z-50 space-y-5"
          >
            {/* Title Dialog row bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-lg font-light font-serif text-white italic flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-[#D4AF37]" />
                  Feed New Receipt Row
                </h3>
                <p className="text-xs text-white/40">
                  Inject new entries into your sandbox; charts and matrices will immediately compile
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 px-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form list fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Order ID */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest block">
                    Order ID
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30 font-mono">
                      #
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TT-1099"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-[#0F1115] border border-white/10 focus:border-[#D4AF37]/50 focus:bg-[#0F1115] rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30 font-mono"
                    />
                  </div>
                </div>

                {/* Sell Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest block">
                    Sale Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#0F1115] border border-white/10 focus:border-[#D4AF37]/50 focus:bg-[#0F1115] rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Product selector list dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest block">
                  Product apparel Model
                </label>
                <select
                  value={product}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full p-2.5 bg-[#0F1115] border border-white/10 focus:border-[#D4AF37]/50 focus:bg-[#0F1115] rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
                >
                  {allProducts.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Product price in cost context */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest block">
                    Product Price ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      placeholder="e.g. 88.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-[#0F1115] border border-white/10 focus:border-[#D4AF37]/50 focus:bg-[#0F1115] rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30 font-mono"
                    />
                  </div>
                </div>

                {/* Gateway Split chooser */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest block">
                    Payment gateway
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full pl-9 pr-2 py-2 bg-[#0F1115] border border-white/10 focus:border-[#D4AF37]/50 focus:bg-[#0F1115] rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30"
                    >
                      {allPayments.map((pm) => (
                        <option key={pm} value={pm}>
                          {pm}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action buttons row */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 hover:bg-white/5 text-white/50 hover:text-white rounded-xl text-xs font-semibold transition-colors animate-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E2C35D] text-black rounded-xl text-xs font-bold transition-all"
                >
                  Feed Item
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
