import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle, AlertTriangle, FileUp, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Papa from "papaparse";
import { Transaction } from "../data";

interface DataUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (data: Transaction[]) => void;
}

export default function DataUploadDialog({ isOpen, onClose, onDataLoaded }: DataUploadDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError("Failed to parse CSV file. Please ensure it is correctly formatted.");
          return;
        }

        const data = results.data as any[];
        if (data.length === 0) {
          setError("The uploaded file contains no data.");
          return;
        }

        const headers = Object.keys(data[0]);
        
        // Auto-detect columns
        let priceCol = headers.find(h => h.toLowerCase().includes('price') || h.toLowerCase().includes('revenue') || h.toLowerCase().includes('amount') || h.toLowerCase().includes('cost'));
        let dateCol = headers.find(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('time') || h.toLowerCase().includes('created'));
        let orderCol = headers.find(h => h.toLowerCase().includes('order') || h.toLowerCase().includes('id'));
        let productCol = headers.find(h => h.toLowerCase().includes('product') || h.toLowerCase().includes('item') || h.toLowerCase().includes('model') || h.toLowerCase().includes('category'));
        let paymentCol = headers.find(h => h.toLowerCase().includes('payment') || h.toLowerCase().includes('method') || h.toLowerCase().includes('channel') || h.toLowerCase().includes('type'));

        // Fallbacks
        if (!priceCol) {
          priceCol = headers.find(h => !isNaN(parseFloat(data[0][h])));
        }
        if (!dateCol) {
          dateCol = headers.find(h => !isNaN(Date.parse(data[0][h])));
        }
        
        const unusedHeaders = headers.filter(h => h !== priceCol && h !== dateCol && h !== orderCol);
        if (!productCol) productCol = unusedHeaders.shift();
        if (!paymentCol) paymentCol = unusedHeaders.shift();
        if (!orderCol) orderCol = unusedHeaders.shift();

        if (!priceCol || !dateCol || !productCol) {
          setError("Could not automatically map your data to required fields. Please ensure your CSV has clear columns for amounts, dates, and categories.");
          return;
        }

        const mappedData: Transaction[] = data.map((row, idx) => {
          let dateVal = row[dateCol!];
          // attempt to standardise date format to YYYY-MM-DD
          try {
             if (dateVal) {
                const parsedDate = new Date(dateVal);
                if (!isNaN(parsedDate.getTime())) {
                   dateVal = parsedDate.toISOString().split('T')[0];
                }
             }
          } catch(e) {}

          return {
            id: `imported-${idx}`,
            orderNumber: (orderCol && row[orderCol]) ? String(row[orderCol]) : `ORD-${idx + 1000}`,
            date: dateVal || new Date().toISOString().split('T')[0],
            product: String(row[productCol!]) || "Unknown Item",
            category: "Imported",
            price: parseFloat(row[priceCol!]) || 0,
            paymentMethod: (paymentCol && row[paymentCol]) ? String(row[paymentCol]) : "Standard",
          };
        });

        onDataLoaded(mappedData);
        onClose();
      },
      error: (error) => {
        setError(`Error reading file: ${error.message}`);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 z-50 cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto max-w-xl h-fit bg-[#161920] rounded-3xl p-6 shadow-2xl border border-white/5 z-50 flex flex-col pt-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 mb-8">
              <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/20 text-[#D4AF37]">
                <FileUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-light font-serif text-white italic">
                Inject Dataset
              </h3>
              <p className="text-sm text-white/40 max-w-sm mx-auto">
                Upload any CSV spreadsheet. The system will auto-detect your metrics, dates, and dimensions to generate rich visualizations.
              </p>
            </div>

            <form
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onSubmit={(e) => e.preventDefault()}
              className={`flex-1 relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition-all min-h-[220px] ${
                dragActive ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-white/10 hover:border-white/20 bg-[#0F1115]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleChange}
                className="hidden"
              />
              <UploadCloud className={`w-10 h-10 mb-4 ${dragActive ? "text-[#D4AF37]" : "text-white/20"}`} />
              <p className="text-sm font-semibold text-white/80">
                Drag & drop your CSV file here
              </p>
              <p className="text-xs text-white/40 mt-1 mb-6">
                Or select a file from your computer
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E2C35D] text-black rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#D4AF37]/10"
              >
                Browse Files
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-red-200">{error}</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
