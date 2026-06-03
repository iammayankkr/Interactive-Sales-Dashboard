import { useMemo } from "react";
import { DollarSign, ShoppingBag, CreditCard, Tag, TrendingUp, Award } from "lucide-react";
import { motion } from "motion/react";
import { Transaction } from "../data";

interface KPIMetricsProps {
  transactions: Transaction[];
  selectedProduct: string;
  setSelectedProduct: (product: string) => void;
  selectedPayment: string;
  setSelectedPayment: (payment: string) => void;
}

export default function KPIMetrics({
  transactions,
  selectedProduct,
  setSelectedProduct,
  selectedPayment,
  setSelectedPayment,
}: KPIMetricsProps) {
  const stats = useMemo(() => {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.price, 0);
    const totalItems = transactions.length;
    
    // Unique orders list
    const orderNumbers = new Set(transactions.map((t) => t.orderNumber));
    const totalOrders = orderNumbers.size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate top product
    const productSales: { [key: string]: { rev: number; qty: number } } = {};
    transactions.forEach((t) => {
      if (!productSales[t.product]) {
        productSales[t.product] = { rev: 0, qty: 0 };
      }
      productSales[t.product].qty += 1;
      productSales[t.product].rev += t.price;
    });

    let topProduct = "None";
    let topProductRev = 0;
    let topProductQty = 0;
    Object.entries(productSales).forEach(([name, data]) => {
      if (data.rev > topProductRev) {
        topProduct = name;
        topProductRev = data.rev;
        topProductQty = data.qty;
      }
    });

    // Calculate top payment method
    const paymentSales: { [key: string]: { rev: number; count: number } } = {};
    transactions.forEach((t) => {
      if (!paymentSales[t.paymentMethod]) {
        paymentSales[t.paymentMethod] = { rev: 0, count: 0 };
      }
      paymentSales[t.paymentMethod].count += 1;
      paymentSales[t.paymentMethod].rev += t.price;
    });

    let topPayment = "None";
    let topPaymentRev = 0;
    let topPaymentCount = 0;
    Object.entries(paymentSales).forEach(([name, data]) => {
      if (data.rev > topPaymentRev) {
        topPayment = name;
        topPaymentRev = data.rev;
        topPaymentCount = data.count;
      }
    });

    return {
      totalRevenue,
      totalItems,
      totalOrders,
      avgOrderValue,
      topProduct,
      topProductRev,
      topProductQty,
      topPayment,
      topPaymentRev,
      topPaymentCount,
    };
  }, [transactions]);

  const cardsData = [
    {
      id: "revenue",
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      description: "Gross merchandise volume",
      icon: DollarSign,
      textColor: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10",
      fontClass: "font-serif text-3xl text-[#D4AF37] font-light italic tracking-tight",
    },
    {
      id: "orders",
      title: "Unique Orders",
      value: stats.totalOrders.toLocaleString(),
      description: `Across ${stats.totalItems} distinct items`,
      icon: ShoppingBag,
      textColor: "text-white/60",
      bgColor: "bg-white/5",
      fontClass: "text-3xl font-light font-display text-white tabular-nums",
    },
    {
      id: "aov",
      title: "Avg Order Value",
      value: `$${stats.avgOrderValue.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`,
      description: "Total sales / unique orders",
      icon: TrendingUp,
      textColor: "text-white/60",
      bgColor: "bg-white/5",
      fontClass: "text-3xl font-light font-display text-white tabular-nums",
    },
    {
      id: "best-seller",
      title: "Best Seller (Rev)",
      value: stats.topProduct.split(" ").slice(-2).join(" ") || stats.topProduct, // Shorten name
      fullName: stats.topProduct,
      description: `${stats.topProductQty} units • $${stats.topProductRev.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      icon: Award,
      textColor: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10",
      fontClass: "text-xl font-light font-display text-white truncate block",
      clickable: true,
      onClick: () => {
        if (stats.topProduct !== "None") {
          setSelectedProduct(selectedProduct === stats.topProduct ? "" : stats.topProduct);
        }
      },
      isActive: selectedProduct === stats.topProduct,
    },
    {
      id: "top-payment",
      title: "Top Payment Method",
      value: stats.topPayment,
      description: `${stats.topPaymentCount} txs • $${stats.topPaymentRev.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      icon: CreditCard,
      textColor: "text-white/60",
      bgColor: "bg-white/5",
      fontClass: "text-xl font-light font-display text-white truncate block",
      clickable: true,
      onClick: () => {
        if (stats.topPayment !== "None") {
          setSelectedPayment(selectedPayment === stats.topPayment ? "" : stats.topPayment);
        }
      },
      isActive: selectedPayment === stats.topPayment,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cardsData.map((card) => {
        const Icon = card.icon;
        const isClickable = card.clickable;
        const isActive = card.isActive;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, scale: 1.01 }}
            onClick={isClickable ? card.onClick : undefined}
            className={`cursor-default bg-[#161920] p-5 rounded-2xl border transition-all relative overflow-hidden ${
              isClickable 
                ? "cursor-pointer hover:border-white/25 border-white/5" 
                : "border-white/5"
            } ${isActive ? "ring-2 ring-[#D4AF37]/50 border-transparent shadow-lg shadow-[#D4AF37]/5" : "shadow-md"}`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1 z-10 min-w-0 pr-2">
                <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest block">
                  {card.title}
                </span>
                <h3 className={`${card.fontClass}`}>
                  {card.value}
                </h3>
              </div>
              <div className={`p-2 rounded-xl shrink-0 ${card.bgColor} ${card.textColor}`}>
                <Icon className="w-5 h-5 stroke-[1.5]" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between z-10 relative">
              <div 
                className="text-xs text-white/40 truncate pr-2 max-w-full"
                title={card.fullName || card.description}
              >
                {card.fullName && card.fullName !== "None" ? (
                  <span className="font-medium text-white/70 block truncate text-[11px]" title={card.fullName}>
                    {card.fullName}
                  </span>
                ) : null}
                <span className="text-[11px] block text-white/30">{card.description}</span>
              </div>
              {isClickable && (
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 transition-colors ${
                  isActive 
                    ? "bg-[#D4AF37] text-black font-bold" 
                    : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                }`}>
                  {isActive ? "Filtered" : "Filter"}
                </span>
              )}
            </div>

            {/* Micro subtle background indicator */}
            {isActive && (
              <div className="absolute top-0 right-0 w-1 h-full bg-[#D4AF37]" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
