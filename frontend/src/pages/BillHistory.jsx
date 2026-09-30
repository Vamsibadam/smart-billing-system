import { useEffect, useState, useRef } from "react";
import { Search, X, FileText, Trash2, Calendar, Sparkles } from "lucide-react";
import MainLayout from "../layouts/MainLayout";

import {
  getBillHistory,
  getBillDetail,
  deleteBill,
} from "../services/billingService";

import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { createPortal } from "react-dom";

function BillHistory() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Persistent Date Filter
  const [selectedDate, setSelectedDate] = useState(() => {
    return sessionStorage.getItem("bill_history_date") || getTodayDate();
  });

  // Persistent Payment Filter ('all' | 'upi' | 'cash' | 'card' | 'swiggy' | 'zomato')
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState(() => {
    return sessionStorage.getItem("bill_history_payment_filter") || "all";
  });

  const [selectedBill, setSelectedBill] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);

  const navigate = useNavigate();

  // 1. Initial Fetch using persisted date
  useEffect(() => {
    const initialDate = sessionStorage.getItem("bill_history_date") || getTodayDate();
    fetchBills(initialDate);
  }, []);

  // 2. Guaranteed Scroll Restoration
  useEffect(() => {
    if (!loading && bills.length > 0) {
      const savedScroll = sessionStorage.getItem("bill_history_scroll");
      if (savedScroll !== null && savedScroll !== "0") {
        const targetY = parseInt(savedScroll, 10);
        const timer = setTimeout(() => {
          window.scrollTo({ top: targetY, behavior: "instant" });
          if (containerRef.current) {
            containerRef.current.scrollTop = targetY;
          }
        }, 80);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, bills]);

  // 3. Keep scroll offset fresh in storage
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop || 0;
      if (scrollPos > 0) {
        sessionStorage.setItem("bill_history_scroll", String(scrollPos));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchBills = async (date = "") => {
    try {
      setLoading(true);
      const data = await getBillHistory(date);
      setBills(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    sessionStorage.setItem("bill_history_date", selectedDate);
    sessionStorage.setItem("bill_history_scroll", "0");
    fetchBills(selectedDate);
  };

  const handleNavigateInvoice = (billId) => {
    const currentY = window.scrollY || document.documentElement.scrollTop || 0;
    sessionStorage.setItem("bill_history_scroll", String(currentY));
    sessionStorage.setItem("bill_history_date", selectedDate);
    sessionStorage.setItem("bill_history_payment_filter", selectedPaymentFilter);
    navigate(`/invoice/${billId}`);
  };

  const handlePaymentFilterChange = (filterId) => {
    setSelectedPaymentFilter(filterId);
    sessionStorage.setItem("bill_history_payment_filter", filterId);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deleteBill(billToDelete.id);
      await fetchBills(selectedDate);
      setShowDeleteModal(false);
      setBillToDelete(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Payment Filter Tabs definition
  const paymentTabs = [
    { id: "all", label: "All Bills" },
    { id: "upi", label: "⚡ UPI" },
    { id: "cash", label: "💵 Cash" },
    { id: "card", label: "💳 Card" },
    { id: "swiggy", label: "🧡 Swiggy" },
    { id: "zomato", label: "❤️️ Zomato" },
  ];

  // Multi-facet filtering: Search query + Payment channel
  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.bill_number
      .toLowerCase()
      .includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedPaymentFilter === "all") return true;

    const paymentStr = (bill.payment_display || "").toLowerCase();
    return paymentStr.includes(selectedPaymentFilter.toLowerCase());
  });

  if (loading) {
    return (
      <MainLayout>
        <Loader text="Loading bills..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div ref={containerRef} className="w-full pb-36 lg:pb-8">
        {/* =========================================================
            PAGE HEADER
        ========================================================== */}
        <div className="relative z-10 px-4 pt-2 sm:px-6 sm:pt-4 mb-3 sm:mb-5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
              Bill History
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200/60">
              <Sparkles size={10} /> {filteredBills.length} Bills
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
            View, filter by payment method, and manage billing records
          </p>
        </div>

        {/* =========================================================
            PAYMENT METHOD RIBBON (Horizontally scrollable)
        ========================================================== */}
        <div className="px-3 sm:px-6 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 -mx-1 px-1">
            {paymentTabs.map((tab) => {
              const isSelected = selectedPaymentFilter === tab.id;
              const count = bills.filter((b) => {
                if (tab.id === "all") return true;
                return (b.payment_display || "").toLowerCase().includes(tab.id);
              }).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handlePaymentFilterChange(tab.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 cursor-pointer shadow-xs ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-500 to-indigo-600 text-white shadow-md shadow-indigo-900/20"
                      : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/25 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            MAIN CONTAINER
        ========================================================== */}
        <div
          className="
            bg-white/85
            backdrop-blur-md
            border border-slate-200/80
            rounded-2xl sm:rounded-[28px]
            p-3.5 sm:p-6
            shadow-xs
            relative
            z-10
            mx-3 sm:mx-6
          "
        >
          {/* Search & Date Controls */}
          <div
            className="
              flex
              flex-col sm:flex-row
              gap-2.5 sm:gap-4
              mb-4 sm:mb-6
              items-stretch sm:items-center
            "
          >
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 sm:pl-4 pointer-events-none text-slate-400">
                <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <input
                type="text"
                placeholder="Search Bill No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-full
                  bg-slate-50/70
                  border border-slate-200/90
                  text-slate-800
                  rounded-xl sm:rounded-2xl
                  p-2.5 sm:p-3.5
                  pl-10 sm:pl-11
                  pr-8 sm:pr-4
                  text-xs sm:text-sm
                  font-semibold
                  placeholder:text-slate-400
                  outline-none
                  focus:bg-white
                  focus:border-indigo-400
                  transition-all
                "
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Date Picker + Filter Button Row */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  sessionStorage.setItem("bill_history_date", e.target.value);
                }}
                className="
                  flex-1 sm:flex-none
                  bg-slate-50/70
                  border border-slate-200/90
                  text-slate-800
                  rounded-xl sm:rounded-2xl
                  p-2.5 sm:p-3.5
                  text-xs sm:text-sm
                  font-semibold
                  outline-none
                  focus:bg-white
                  focus:border-indigo-400
                  transition-all
                "
              />

              <button
                type="button"
                onClick={handleDateFilter}
                className="
                  bg-gradient-to-r from-orange-500 to-indigo-600
                  text-white
                  px-4 sm:px-6
                  py-2.5 sm:py-3.5
                  rounded-xl sm:rounded-2xl
                  text-xs sm:text-sm
                  font-black
                  tracking-wide
                  shadow-xs
                  hover:opacity-95
                  active:scale-95
                  transition-all
                  duration-200
                  cursor-pointer
                  shrink-0
                "
              >
                Filter
              </button>
            </div>
          </div>

          {/* =========================================================
              CLEAN RESTYLED MOBILE BILL CARDS (Screen < sm)
          ========================================================== */}
          <div className="block sm:hidden space-y-3">
            {filteredBills.map((bill) => {
              const paymentMethod = bill.payment_display?.toLowerCase() || "";
              const isCash = paymentMethod.includes("cash");
              const isUPI = paymentMethod.includes("upi");
              const isZomato = paymentMethod.includes("zomato");
              const isSwiggy = paymentMethod.includes("swiggy");

              return (
                <div
                  key={bill.id}
                  className="
                    relative
                    overflow-hidden
                    rounded-[22px]
                    bg-white
                    p-4
                    border border-slate-200/70
                    shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)]
                    transition-all
                    active:scale-[0.985]
                    space-y-3.5
                  "
                >
                  {/* Top Bar: Bill Number + Total Amount Capsule */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Dynamic Payment Channel Chip */}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${
                            isCash
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                              : isUPI
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200/60"
                              : isZomato
                              ? "bg-rose-50 text-rose-700 border-rose-200/60"
                              : isSwiggy
                              ? "bg-orange-50 text-orange-700 border-orange-200/60"
                              : "bg-slate-100 text-slate-700 border-slate-200/60"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCash
                                ? "bg-emerald-500"
                                : isUPI
                                ? "bg-indigo-500"
                                : isZomato
                                ? "bg-rose-500"
                                : isSwiggy
                                ? "bg-orange-500"
                                : "bg-slate-500"
                            }`}
                          />
                          {bill.payment_display}
                        </span>

                        <span className="text-[10px] font-mono font-semibold text-slate-400">
                          #{bill.id}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-800 mt-1.5 truncate leading-tight">
                        {bill.bill_number}
                      </h3>
                    </div>

                    {/* Total Amount Contrast Capsule */}
                    <div className="shrink-0 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white shadow-xs text-right">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block leading-none">
                        Total
                      </span>
                      <span className="text-base font-black tracking-tight mt-0.5 block leading-none">
                        ₹{bill.total_amount}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Row: Timestamp */}
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 pt-1">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar size={13} className="text-slate-400" />
                      <span>
                        {new Date(bill.created_at).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action Button Deck */}
                  <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleNavigateInvoice(bill.id)}
                      className="
                        flex-1
                        py-2.5
                        rounded-xl
                        bg-indigo-50
                        text-indigo-700
                        hover:bg-indigo-100
                        font-black
                        text-xs
                        active:scale-95
                        transition-all
                        cursor-pointer
                        text-center
                        flex items-center justify-center gap-1.5
                      "
                    >
                      <FileText size={14} />
                      <span>View Invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBillToDelete(bill);
                        setShowDeleteModal(true);
                      }}
                      className="
                        px-4
                        py-2.5
                        rounded-xl
                        bg-rose-50
                        text-rose-600
                        hover:bg-rose-100
                        font-black
                        text-xs
                        active:scale-95
                        transition-all
                        cursor-pointer
                        shrink-0
                        flex items-center gap-1
                      "
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredBills.length === 0 && (
              <div className="py-14 text-center text-xs font-semibold text-slate-400 bg-white/70 rounded-2xl border border-dashed border-slate-200">
                No bills found matching your filter.
              </div>
            )}
          </div>

          {/* =========================================================
              DESKTOP DATA TABLE (Screen >= sm) — 100% UNTOUCHED
          ========================================================== */}
          <div className="hidden sm:block overflow-x-auto max-w-full">
            <table className="w-full text-sm border-separate border-spacing-y-2">
              <thead className="text-slate-400 font-bold text-[11px] tracking-wider uppercase">
                <tr>
                  <th className="pb-1 text-left pl-4 w-52">Bill No</th>
                  <th className="pb-1 text-left w-32">Amount</th>
                  <th className="pb-1 text-left w-32">Payment</th>
                  <th className="pb-1 text-left">Date</th>
                  <th className="pb-1 text-right pr-4 w-40">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="group hover:bg-slate-50/60 transition-all duration-150"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-700 rounded-l-xl">
                      {bill.bill_number}
                    </td>

                    <td className="py-3 px-2 font-bold text-slate-800">
                      ₹{bill.total_amount}
                    </td>

                    <td className="py-3 px-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-slate-50 text-slate-500 border-slate-200/60">
                        {bill.payment_display}
                      </span>
                    </td>

                    <td className="py-3 px-2 font-medium text-slate-400">
                      {new Date(bill.created_at).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right rounded-r-xl font-semibold">
                      <button
                        onClick={() => handleNavigateInvoice(bill.id)}
                        className="
                          text-indigo-600 
                          bg-indigo-50 
                          px-3.5 
                          py-2.5 
                          rounded-xl 
                          hover:bg-indigo-200
                          hover:scale-[1.1]
                          hover:text-indigo-900
                          transition-all 
                          mr-2
                          cursor-pointer
                        "
                      >
                        View
                      </button>

                      <button
                        onClick={() => {
                          setBillToDelete(bill);
                          setShowDeleteModal(true);
                        }}
                        className="
                          text-red-500 
                          px-3.5 
                          py-2.5 
                          rounded-xl 
                          hover:bg-red-100 
                          transition-all
                          cursor-pointer
                        "
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL: VIEW BILL DETAILS (Mobile Bottom Sheet / Desktop Centered)
      ========================================================== */}
      {showModal && selectedBill && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl animate-[slideUp_0.25s_ease-out] sm:animate-none">
            <h2 className="text-lg sm:text-xl font-bold tracking-normal text-slate-800 mb-4 sm:mb-6">
              {selectedBill.bill_number}
            </h2>

            <div className="overflow-x-auto max-w-full mb-4 sm:mb-6">
              <table className="w-full text-xs sm:text-sm border-separate border-spacing-y-2">
                <thead className="text-slate-400 font-bold text-[10px] sm:text-[11px] tracking-wider uppercase">
                  <tr>
                    <th className="pb-2 text-left pl-3 sm:pl-4">Product</th>
                    <th className="pb-2 text-center w-16 sm:w-24">Qty</th>
                    <th className="pb-2 text-center w-20 sm:w-28">Price</th>
                    <th className="pb-2 text-right pr-3 sm:pr-4 w-24 sm:w-32">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedBill.items.map((item, index) => (
                    <tr
                      key={index}
                      className="bg-slate-50/40 border border-slate-100 rounded-xl overflow-hidden shadow-3xs"
                    >
                      <td className="p-2.5 sm:p-3 font-bold text-slate-700 pl-3 sm:pl-4 rounded-l-xl">
                        {item.product_name}
                      </td>
                      <td className="p-2.5 sm:p-3 font-semibold text-slate-500 text-center">
                        {item.quantity}
                      </td>
                      <td className="p-2.5 sm:p-3 font-bold text-slate-600 text-center">
                        ₹{item.unit_price}
                      </td>
                      <td className="p-2.5 sm:p-3 font-extrabold text-slate-800 text-right pr-3 sm:pr-4 rounded-r-xl">
                        ₹{item.subtotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-100 mb-4 sm:mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Grand Total
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                ₹{selectedBill.total_amount}
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100">
              <a
                href={`${import.meta.env.VITE_API_URL}/billing/history/${selectedBill.id}/pdf/`}
                target="_blank"
                rel="noreferrer"
                className="
                  text-center
                  bg-indigo-600 
                  text-white 
                  px-4 
                  py-2.5 sm:py-2 
                  rounded-xl 
                  text-xs 
                  font-semibold 
                  shadow-sm 
                  hover:opacity-95 
                  transition
                "
              >
                Download PDF
              </a>

              <button
                type="button"
                onClick={() =>
                  window.open(
                    `${import.meta.env.VITE_API_URL}/billing/history/${selectedBill.id}/pdf/`,
                    "_blank"
                  )
                }
                className="
                  bg-emerald-600 
                  text-white 
                  px-4 
                  py-2.5 sm:py-2 
                  rounded-xl 
                  text-xs 
                  font-semibold 
                  shadow-sm 
                  hover:opacity-95 
                  transition
                "
              >
                Print
              </button>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="
                  px-4 
                  py-2.5 sm:py-2 
                  border 
                  border-slate-200 
                  text-slate-500 
                  font-semibold 
                  rounded-xl 
                  text-xs 
                  hover:bg-slate-50 
                  transition
                "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: DELETE BILL CONFIRMATION
      ========================================================== */}
      {showDeleteModal &&
        billToDelete &&
        createPortal(
          <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
            <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 animate-[slideUp_0.25s_ease-out] sm:animate-none">
              <div className="flex justify-center mb-4 sm:mb-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl">🗑️</span>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-center text-slate-800">
                Delete Bill?
              </h2>

              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-center text-slate-500 leading-relaxed">
                Are you sure you want to delete
                <br />
                <span className="font-bold text-slate-800">
                  {billToDelete.bill_number}
                </span>
                ?
              </p>

              <div className="mt-2 text-center text-xs text-red-500 font-semibold">
                Inventory will be restored automatically.
              </div>

              <div className="flex gap-2.5 sm:gap-3 mt-6 sm:mt-8">
                <button
                  type="button"
                  onClick={() => {
                    if (deleteLoading) return;
                    setShowDeleteModal(false);
                    setBillToDelete(null);
                  }}
                  disabled={deleteLoading}
                  className="
                    flex-1
                    py-3
                    rounded-xl
                    border border-slate-200
                    bg-white
                    text-slate-600
                    text-xs sm:text-sm
                    font-bold
                    hover:bg-slate-50
                    transition
                    cursor-pointer
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="
                    flex-1
                    py-3
                    rounded-xl
                    bg-gradient-to-r from-red-500 to-red-600
                    text-white
                    text-xs sm:text-sm
                    font-bold
                    transition-all
                    duration-200
                    cursor-pointer
                    disabled:opacity-70
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >
                  {deleteLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Delete Bill"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </MainLayout>
  );
}

export default BillHistory;