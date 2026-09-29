import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import {
  Calendar,
  DollarSign,
  Receipt,
  CreditCard,
  Search,
  X,
  TrendingUp,
  Package,
  FileSpreadsheet,
  FileText,
  Download,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import {
  getRangeReport,
  getProductSalesReport,
} from "../services/reportsService";

import { getProducts } from "../services/productService";

function Reports() {
  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'product'

  // General Report States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [generalLoading, setGeneralLoading] = useState(false);

  // Product Report States
  const [productStartDate, setProductStartDate] = useState("");
  const [productEndDate, setProductEndDate] = useState("");
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productReport, setProductReport] = useState(null);
  const [productLoading, setProductLoading] = useState(false);

  // Modal State
  const [showAllProducts, setShowAllProducts] = useState(false);

  const navigate = useNavigate();

  /* =========================================================
      LOAD SAVED REPORT & PRODUCTS ON MOUNT
  ========================================================== */
  useEffect(() => {
    const savedStart = localStorage.getItem("report_start_date");
    const savedEnd = localStorage.getItem("report_end_date");
    const savedReport = localStorage.getItem("report_data");

    if (savedStart) {
      setStartDate(savedStart);
      setProductStartDate(savedStart);
    }
    if (savedEnd) {
      setEndDate(savedEnd);
      setProductEndDate(savedEnd);
    }
    if (savedReport) {
      try {
        setReport(JSON.parse(savedReport));
      } catch (e) {
        console.error("Failed to parse saved report:", e);
      }
    }

    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data || []);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    loadProducts();
  }, []);

  /* =========================================================
      PRODUCT FILTERING
  ========================================================== */
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  /* =========================================================
      GENERAL SALES REPORT
  ========================================================== */
  const generateReport = async () => {
    try {
      if (!startDate || !endDate) {
        alert("Select both dates");
        return;
      }

      if (startDate > endDate) {
        alert("Start date cannot be after end date");
        return;
      }

      setGeneralLoading(true);
      const data = await getRangeReport(startDate, endDate);

      setReport(data);
      localStorage.setItem("report_start_date", startDate);
      localStorage.setItem("report_end_date", endDate);
      localStorage.setItem("report_data", JSON.stringify(data));
    } catch (error) {
      console.error("Sales report error:", error);
      alert(error.response?.data?.error || "Failed to load report");
    } finally {
      setGeneralLoading(false);
    }
  };

  /* =========================================================
      PRODUCT SALES REPORT
  ========================================================== */
  const generateProductReport = async () => {
    try {
      if (!selectedProduct) {
        alert("Select a product");
        return;
      }

      if (!productStartDate || !productEndDate) {
        alert("Select both dates");
        return;
      }

      if (productStartDate > productEndDate) {
        alert("Start date cannot be after end date");
        return;
      }

      setProductLoading(true);
      const data = await getProductSalesReport(
        selectedProduct.id,
        productStartDate,
        productEndDate
      );

      setProductReport(data);
    } catch (error) {
      console.error("Product report error:", error);
      alert(
        error.response?.data?.error || "Failed to generate product report"
      );
    } finally {
      setProductLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="relative min-h-screen pb-36 lg:pb-12">
        {/* Ambient Backgrounds */}
        <div className="fixed top-0 right-0 w-[28rem] h-[28rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="fixed bottom-10 left-0 w-[24rem] h-[24rem] bg-orange-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-1 sm:pt-2 space-y-4 sm:space-y-5">
          {/* =========================================================
              PAGE HEADER & TOP EXPORT ACTIONS
          ========================================================== */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/50 shrink-0">
                <Receipt size={20} className="sm:w-[22px] sm:h-[22px]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-800">
                    Reports
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200/60">
                    <Sparkles size={10} /> Live
                  </span>
                </div>
                <p className="text-[11px] sm:text-sm font-semibold text-slate-400">
                  Sales analytics and product metrics
                </p>
              </div>
            </div>

            {/* Quick Export Actions Track (Horizontally scrollable on mobile) */}
            {activeTab === "general" && report && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                <a
                  href={`${import.meta.env.VITE_API_URL}/reports/export/csv/?start_date=${startDate}&end_date=${endDate}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  <Download size={13} className="text-slate-400" />
                  <span>CSV</span>
                </a>

                <a
                  href={`${import.meta.env.VITE_API_URL}/reports/export/excel/?start_date=${startDate}&end_date=${endDate}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  <FileSpreadsheet size={13} className="text-emerald-500" />
                  <span>Excel</span>
                </a>

                <a
                  href={`${import.meta.env.VITE_API_URL}/reports/export/pdf/?start_date=${startDate}&end_date=${endDate}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200/40 transition-all active:scale-95"
                >
                  <FileText size={13} />
                  <span>PDF</span>
                </a>
              </div>
            )}
          </div>

          {/* =========================================================
              CONTROLS CONTAINER: GRADIENT BORDER BOX
          ========================================================== */}
          <div className="relative rounded-2xl sm:rounded-[28px] bg-gradient-to-r from-orange-500 via-orange-500 to-indigo-600 p-[1.5px] shadow-lg sm:shadow-xl shadow-indigo-200/30">
            <div className="relative overflow-visible rounded-[15px] sm:rounded-[27px] bg-white/95 backdrop-blur-xl p-3.5 sm:p-6">
              {/* Internal Subtle Glows */}
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

              {/* Segmented Switcher Bar */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3.5 sm:pb-5 border-b border-slate-100">
                <div className="inline-flex p-1 rounded-xl sm:rounded-2xl bg-slate-100/90 border border-slate-200/70 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab("general")}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg sm:rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeTab === "general"
                        ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white shadow-md shadow-indigo-200/40"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <TrendingUp size={14} />
                    <span>General Sales</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("product")}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg sm:rounded-xl text-xs font-black transition-all cursor-pointer ${
                      activeTab === "product"
                        ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white shadow-md shadow-indigo-200/40"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Package size={14} />
                    <span>Product Sales</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {activeTab === "general"
                    ? "Full store performance metrics"
                    : "Individual product volume & sales"}
                </div>
              </div>

              {/* Dynamic Filter Inputs */}
              <div className="relative z-10 pt-3.5 sm:pt-5">
                {/* General Filter Row */}
                {activeTab === "general" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 items-end">
                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 text-slate-800 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 text-slate-800 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={generateReport}
                      disabled={generalLoading}
                      className="w-full h-11 sm:h-[46px] bg-gradient-to-r from-orange-500 via-orange-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-black tracking-wide shadow-md shadow-indigo-200/40 hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                      {generalLoading ? "Generating..." : "Generate Report"}
                    </button>
                  </div>
                )}

                {/* Product Filter Row */}
                {activeTab === "product" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 items-end">
                    {/* Auto-Complete Search */}
                    <div className="relative">
                      <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Search Product
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search product..."
                          value={
                            selectedProduct ? selectedProduct.name : productSearch
                          }
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            setSelectedProduct(null);
                          }}
                          className="w-full bg-slate-50/80 border border-slate-200 text-slate-800 rounded-xl pl-9 sm:pl-10 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                        />
                        <Search
                          size={15}
                          className="absolute left-3 top-3 sm:top-3.5 text-slate-400 pointer-events-none"
                        />
                        {selectedProduct && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProduct(null);
                              setProductSearch("");
                            }}
                            className="absolute right-3 top-2.5 sm:top-3 text-slate-400 hover:text-slate-600 transition"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>

                      {/* Dropdown Suggestions */}
                      {!selectedProduct && productSearch.trim() !== "" && (
                        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setProductSearch("");
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                              >
                                {product.name}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-xs font-semibold text-slate-400">
                              No products found
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={productStartDate}
                        onChange={(e) => setProductStartDate(e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 text-slate-800 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={productEndDate}
                        onChange={(e) => setProductEndDate(e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 text-slate-800 rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={generateProductReport}
                      disabled={productLoading || !selectedProduct}
                      className="w-full h-11 sm:h-[46px] bg-gradient-to-r from-orange-500 via-orange-500 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-black tracking-wide shadow-md shadow-indigo-200/40 hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                      {productLoading ? "Generating..." : "Generate Report"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================
              VIEW: SINGLE PRODUCT REPORT RESULT CARD
          ========================================================== */}
          {activeTab === "product" && productReport && (
            <div className="relative overflow-hidden rounded-2xl sm:rounded-[28px] bg-white border border-slate-200/80 p-4 sm:p-7 shadow-[0_8px_35px_-12px_rgba(79,70,229,0.12)]">
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
                <div className="space-y-1 min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                    <Package size={11} /> Product Report
                  </div>
                  <h2 className="text-xl sm:text-3xl font-black text-slate-800 break-words mt-1">
                    {productReport.product_name}
                  </h2>
                  <p className="text-[11px] sm:text-sm font-semibold text-slate-400">
                    {productReport.start_date || productStartDate}
                    {" → "}
                    {productReport.end_date || productEndDate}
                  </p>
                </div>

                <div className="shrink-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 via-orange-500 to-indigo-600 text-white p-4 sm:px-6 sm:py-5 min-w-[170px] text-center shadow-lg shadow-indigo-200/50">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white/80">
                    Total Sold
                  </p>
                  <p className="text-3xl sm:text-4xl font-black mt-0.5 tracking-tight">
                    {productReport.total_quantity_sold}
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-bold text-white/75 uppercase tracking-widest">
                    units
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW: GENERAL SALES REPORT SUMMARY & METRICS
          ========================================================== */}
          {activeTab === "general" && report && (
            <div className="space-y-4 sm:space-y-6">
              {/* Metric KPI Cards (Mobile: 2x2 Grid | Desktop: 4 Columns) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {/* Revenue */}
                <div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs">
                  <div className="flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Revenue
                      </p>
                      <h2 className="text-base sm:text-2xl font-black text-slate-800 mt-0.5 truncate">
                        ₹{report.total_sales}
                      </h2>
                    </div>
                    <div className="shrink-0 p-2 sm:p-3 bg-orange-50 text-orange-600 rounded-xl">
                      <DollarSign size={16} className="sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>

                {/* Transactions */}
                <div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs">
                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Transactions
                      </p>
                      <h2 className="text-base sm:text-2xl font-black text-slate-800 mt-0.5">
                        {report.transactions}
                      </h2>
                    </div>
                    <div className="shrink-0 p-2 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Receipt size={16} className="sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>

                {/* Average Bill */}
                <div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs">
                  <div className="flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Avg Ticket
                      </p>
                      <h2 className="text-base sm:text-2xl font-black text-slate-800 mt-0.5 truncate">
                        ₹{report.average_bill}
                      </h2>
                    </div>
                    <div className="shrink-0 p-2 sm:p-3 bg-orange-50 text-orange-500 rounded-xl">
                      <Calendar size={16} className="sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>

                {/* Top Payment */}
                <div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-xs">
                  <div className="flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Top Channel
                      </p>
                      <h2 className="text-base sm:text-2xl font-black text-slate-800 capitalize mt-0.5 truncate">
                        {report?.most_used_payment?.payment_method || "—"}
                      </h2>
                    </div>
                    <div className="shrink-0 p-2 sm:p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <CreditCard size={16} className="sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary + Top Products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Payment Breakdown */}
                <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-[24px] p-4 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-lg font-black text-slate-800">
                        Payment Breakdown
                      </h2>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">
                        Revenue by payment method
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {Object.entries(report.payment_summary || {}).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center py-2.5 sm:py-3.5 text-xs sm:text-sm"
                        >
                          <span className="capitalize font-bold text-slate-600">
                            {key}
                          </span>
                          <span className="font-black text-slate-800">
                            ₹{value}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Top Products Card */}
                <div className="relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl sm:rounded-[24px] p-4 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <span className="text-xs sm:text-sm font-black">#</span>
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm sm:text-lg font-black text-slate-800">
                          Top Products
                        </h2>
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-400 truncate">
                          Best-selling items in this range
                        </p>
                      </div>
                    </div>

                    {report.top_products?.length > 5 && (
                      <button
                        type="button"
                        onClick={() => setShowAllProducts(true)}
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] sm:text-xs font-black active:scale-95 transition cursor-pointer"
                      >
                        <span>Show All</span>
                        <ChevronRight size={12} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    {report.top_products
                      ?.filter((p) => Number(p.quantity_sold) > 0)
                      .slice(0, 5)
                      .map((product, index) => (
                        <div
                          key={product.product_id || index}
                          className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] font-black ${
                                index === 0
                                  ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xs"
                                  : index === 1
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-slate-200/80 text-slate-600"
                              }`}
                            >
                              {index + 1}
                            </span>

                            <span className="min-w-0 truncate text-xs sm:text-sm font-bold text-slate-700">
                              {product.product__name}
                            </span>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className="text-xs sm:text-base font-black text-slate-800">
                              {product.quantity_sold}
                            </span>
                            <span className="block text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">
                              sold
                            </span>
                          </div>
                        </div>
                      ))}

                    {(!report.top_products ||
                      report.top_products.filter(
                        (p) => Number(p.quantity_sold) > 0
                      ).length === 0) && (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No products sold in this date range.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Transaction Registry: Cards on Mobile, Table on Desktop */}
              <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-[28px] p-4 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Receipt size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-lg font-black text-slate-800">
                      Transaction Details
                    </h2>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">
                      Detailed billing transactions
                    </p>
                  </div>
                </div>

                {/* Mobile View: High-Density Cards */}
                <div className="block sm:hidden space-y-2">
                  {report.details?.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">
                          {item.bill_number}
                        </span>
                        <span className="text-sm font-black text-slate-900">
                          ₹{item.amount}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                          {item.payment_display}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                          <button
                            type="button"
                            onClick={() => navigate(`/invoice/${item.id}`)}
                            className="inline-flex items-center gap-0.5 text-indigo-600 font-black text-xs active:scale-95"
                          >
                            View <ArrowUpRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!report.details || report.details.length === 0) && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No transactions recorded.
                    </div>
                  )}
                </div>

                {/* Desktop View: Full Data Table (Untouched) */}
                <div className="hidden sm:block overflow-x-auto max-w-full">
                  <table className="w-full text-sm border-separate border-spacing-y-2 min-w-[700px]">
                    <thead className="text-slate-400 font-bold text-[11px] tracking-wider uppercase">
                      <tr>
                        <th className="pb-1 text-left pl-4 w-44">Bill No</th>
                        <th className="pb-1 text-left w-32">Amount</th>
                        <th className="pb-1 text-left w-32">Payment</th>
                        <th className="pb-1 text-left">Date</th>
                        <th className="pb-1 text-right pr-4 w-28">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.details?.map((item) => (
                        <tr
                          key={item.id}
                          className="group hover:bg-slate-50/70 transition-all duration-150"
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-700 rounded-l-2xl">
                            {item.bill_number}
                          </td>
                          <td className="py-3.5 px-2 font-black text-slate-900">
                            ₹{item.amount}
                          </td>
                          <td className="py-3.5 px-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-white text-slate-600 border-slate-200">
                              {item.payment_display}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 font-medium text-slate-400">
                            {new Date(item.created_at).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-right rounded-r-2xl font-semibold">
                            <button
                              type="button"
                              onClick={() => navigate(`/invoice/${item.id}`)}
                              className="inline-flex items-center gap-1 text-indigo-600 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 hover:scale-105 transition-all text-xs font-black cursor-pointer"
                            >
                              <span>View</span>
                              <ArrowUpRight size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================
            ALL SOLD PRODUCTS MODAL
        ========================================================== */}
        {showAllProducts && (
          <div
            className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={() => setShowAllProducts(false)}
          >
            <div
              className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[calc(100vh-48px)] bg-[#0F172A] border border-white/10 rounded-t-[28px] sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative shrink-0 px-4 sm:px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                      #
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-xl font-black text-white truncate">
                        All Sold Products
                      </h2>
                      <p className="text-[10px] sm:text-xs font-medium text-slate-400 mt-0.5 truncate">
                        {startDate} → {endDate}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAllProducts(false)}
                    aria-label="Close"
                    className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer flex items-center justify-center text-base sm:text-lg"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Product List */}
              <div className="relative flex-1 overflow-y-auto px-3.5 sm:px-6 py-3 sm:py-5 space-y-2">
                {report?.top_products
                  ?.filter((p) => Number(p.quantity_sold) > 0)
                  .map((product, index) => (
                    <div
                      key={product.product_id || index}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.045] border border-white/[0.07]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] font-black bg-white/10 text-slate-300">
                          {index + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                          {product.product__name}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs sm:text-sm font-black text-white">
                          {product.quantity_sold}
                        </p>
                        <p className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-500">
                          units
                        </p>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Modal Footer */}
              <div className="relative shrink-0 px-4 py-3 border-t border-white/10 bg-slate-950/40 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAllProducts(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white text-xs font-black shadow-md transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Reports;