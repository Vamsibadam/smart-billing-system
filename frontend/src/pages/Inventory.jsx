import { useEffect, useState, useRef } from "react";
import {
  Boxes,
  CalendarDays,
  Plus,
  RefreshCw,
  Trash2,
  X,
  ArrowUpRight,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Search,
} from "lucide-react";
import { createPortal } from "react-dom";

import MainLayout from "../layouts/MainLayout";

import {
  getInventory,
  getInventoryLogs,
} from "../services/inventoryService";

import {
  adjustIngredientStock,
} from "../services/ingredientService";

const getDefaultStartDate = () => {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().split("T")[0];
};

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatQuantity = (value) => {
  if (value === null || value === undefined || value === "") {
    return "0";
  }
  const number = Number(value);
  if (Number.isNaN(number)) {
    return value;
  }
  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

const getMovementConfig = (type) => {
  if (type === "PURCHASE") {
    return {
      label: "Purchase",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      dotClass: "bg-emerald-500",
      spineClass: "bg-gradient-to-b from-emerald-500 to-teal-400",
      icon: ArrowUpRight,
    };
  }

  if (type === "WASTAGE") {
    return {
      label: "Wastage",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200/70",
      dotClass: "bg-rose-500",
      spineClass: "bg-gradient-to-b from-rose-500 to-amber-500",
      icon: TrendingDown,
    };
  }

  return {
    label: type || "-",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    dotClass: "bg-slate-400",
    spineClass: "bg-slate-300",
    icon: Boxes,
  };
};

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getToday());
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [filterSearchText, setFilterSearchText] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Update stock modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [updateIngredientId, setUpdateIngredientId] = useState("");
  const [modalSearchText, setModalSearchText] = useState("");
  const [showModalDropdown, setShowModalDropdown] = useState(false);
  const [stockType, setStockType] = useState("PURCHASE");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockUpdating, setStockUpdating] = useState(false);
  const [stockError, setStockError] = useState("");

  const filterDropdownRef = useRef(null);
  const modalDropdownRef = useRef(null);

  const selectedUpdateIngredient = inventory.find(
    (ingredient) => String(ingredient.id) === String(updateIngredientId)
  );

  // Filter suggestions
  const filterSuggestions = inventory.filter((item) =>
    item.name.toLowerCase().includes(filterSearchText.toLowerCase())
  );

  const modalSuggestions = inventory.filter((item) =>
    item.name.toLowerCase().includes(modalSearchText.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(e.target)
      ) {
        setShowFilterDropdown(false);
      }
      if (
        modalDropdownRef.current &&
        !modalDropdownRef.current.contains(e.target)
      ) {
        setShowModalDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load inventory:", error);
      setInventory([]);
    }
  };

  const fetchLogs = async (
    from = startDate,
    to = endDate,
    ingredientId = selectedIngredient
  ) => {
    try {
      setLogsLoading(true);
      const data = await getInventoryLogs(from, to, ingredientId);
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load inventory logs:", error);
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchInventory();
      await fetchLogs(startDate, endDate, selectedIngredient);
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilter = async () => {
    if (!startDate || !endDate) {
      alert("Please select both From Date and To Date.");
      return;
    }
    if (startDate > endDate) {
      alert("From Date cannot be after To Date.");
      return;
    }
    await fetchLogs(startDate, endDate, selectedIngredient);
  };

  const handleClearFilter = async () => {
    const defaultStart = getDefaultStartDate();
    const today = getToday();
    setStartDate(defaultStart);
    setEndDate(today);
    setSelectedIngredient("");
    setFilterSearchText("");
    await fetchLogs(defaultStart, today, "");
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchInventory(),
        fetchLogs(startDate, endDate, selectedIngredient),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const openStockModal = () => {
    setUpdateIngredientId("");
    setModalSearchText("");
    setStockType("PURCHASE");
    setStockQuantity("");
    setStockError("");
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    if (stockUpdating) return;
    setShowStockModal(false);
    setUpdateIngredientId("");
    setModalSearchText("");
    setStockType("PURCHASE");
    setStockQuantity("");
    setStockError("");
  };

  const handleStockUpdate = async (event) => {
    event.preventDefault();
    setStockError("");

    if (!updateIngredientId) {
      setStockError("Please search and select an ingredient.");
      return;
    }

    const quantity = Number(stockQuantity);
    if (!stockQuantity || Number.isNaN(quantity) || quantity <= 0) {
      setStockError("Please enter a valid quantity greater than 0.");
      return;
    }

    try {
      setStockUpdating(true);
      await adjustIngredientStock(updateIngredientId, {
        quantity: stockQuantity,
        transaction_type: stockType,
      });

      setShowStockModal(false);
      setUpdateIngredientId("");
      setModalSearchText("");
      setStockType("PURCHASE");
      setStockQuantity("");
      setStockError("");

      await Promise.all([
        fetchInventory(),
        fetchLogs(startDate, endDate, selectedIngredient),
      ]);
    } catch (error) {
      console.error("Failed to update stock:", error);
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to update stock. Please try again.";
      setStockError(message);
    } finally {
      setStockUpdating(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={28} className="animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-400">Loading inventory...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full pb-36 lg:pb-12">
        {/* =========================================================
            HEADER & TOP ACTIONS
        ========================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6 mt-2 sm:mt-5 relative z-10 px-3.5 sm:px-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
                Inventory
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200/60">
                <Sparkles size={10} /> {logs.length} Logs
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
              Track ingredient purchases, batch stock shifts, and kitchen wastage
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="
                flex-1 sm:flex-none
                bg-white
                border border-slate-200
                text-slate-700
                px-4 sm:px-5
                py-2.5 sm:py-3.5
                rounded-xl sm:rounded-2xl
                text-xs sm:text-sm
                font-bold
                hover:bg-slate-50
                active:scale-95
                transition-all
                cursor-pointer
                text-center
                flex items-center justify-center gap-1.5
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin text-indigo-600" : "text-slate-400"}
              />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={openStockModal}
              className="
                flex-1 sm:flex-none
                bg-gradient-to-r from-orange-500 to-indigo-600
                text-white
                px-4 sm:px-6
                py-2.5 sm:py-3.5
                rounded-xl sm:rounded-2xl
                text-xs sm:text-sm
                font-black
                tracking-wide
                shadow-sm
                hover:opacity-95
                active:scale-95
                transition-all
                duration-200
                cursor-pointer
                text-center
                flex items-center justify-center gap-1.5
              "
            >
              <Plus size={16} />
              <span>Update Stock</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            FILTER MODULE WITH SEARCH TEXT INPUT
        ========================================================== */}
        <div
          className="
            bg-white/80
            backdrop-blur-md
            border border-slate-200/80
            rounded-2xl sm:rounded-[28px]
            mx-3 sm:mx-6
            px-3.5 sm:px-6
            py-4 sm:py-5
            shadow-xs
            relative 
            z-20
            mb-4 sm:mb-6
          "
        >
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <CalendarDays size={16} className="text-indigo-600" />
            <h2 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
              Filter Records
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 items-end">
            {/* FROM DATE */}
            <div>
              <label
                htmlFor="inventory-start-date"
                className="mb-1 block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500"
              >
                From Date
              </label>
              <input
                id="inventory-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="
                  w-full
                  bg-slate-50/70
                  border border-slate-200/90
                  text-slate-800
                  rounded-xl sm:rounded-2xl
                  p-2.5 sm:p-3
                  text-xs sm:text-sm
                  font-semibold
                  outline-none
                  focus:bg-white
                  focus:border-indigo-400
                  transition-all
                "
              />
            </div>

            {/* TO DATE */}
            <div>
              <label
                htmlFor="inventory-end-date"
                className="mb-1 block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500"
              >
                To Date
              </label>
              <input
                id="inventory-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="
                  w-full
                  bg-slate-50/70
                  border border-slate-200/90
                  text-slate-800
                  rounded-xl sm:rounded-2xl
                  p-2.5 sm:p-3
                  text-xs sm:text-sm
                  font-semibold
                  outline-none
                  focus:bg-white
                  focus:border-indigo-400
                  transition-all
                "
              />
            </div>

            {/* INGREDIENT TEXT AUTOCOMPLETE INPUT */}
            <div ref={filterDropdownRef} className="relative">
              <label
                htmlFor="inventory-ingredient-input"
                className="mb-1 block text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500"
              >
                Ingredient
              </label>
              <div className="relative">
                <input
                  id="inventory-ingredient-input"
                  type="text"
                  placeholder="Type to search ingredient..."
                  value={filterSearchText}
                  onFocus={() => setShowFilterDropdown(true)}
                  onChange={(e) => {
                    setFilterSearchText(e.target.value);
                    setShowFilterDropdown(true);
                    if (!e.target.value) {
                      setSelectedIngredient("");
                    }
                  }}
                  className="
                    w-full
                    bg-slate-50/70
                    border border-slate-200/90
                    text-slate-800
                    rounded-xl sm:rounded-2xl
                    p-2.5 sm:p-3
                    pl-8
                    pr-8
                    text-xs sm:text-sm
                    font-semibold
                    outline-none
                    focus:bg-white
                    focus:border-indigo-400
                    transition-all
                  "
                />
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />

                {filterSearchText && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSearchText("");
                      setSelectedIngredient("");
                      setShowFilterDropdown(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown List */}
              {showFilterDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                  <div
                    onClick={() => {
                      setSelectedIngredient("");
                      setFilterSearchText("");
                      setShowFilterDropdown(false);
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer"
                  >
                    All Ingredients
                  </div>
                  {filterSuggestions.length > 0 ? (
                    filterSuggestions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedIngredient(item.id);
                          setFilterSearchText(item.name);
                          setShowFilterDropdown(false);
                        }}
                        className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer flex items-center justify-between ${
                          String(selectedIngredient) === String(item.id)
                            ? "bg-indigo-50/60 text-indigo-600 font-bold"
                            : "text-slate-700"
                        }`}
                      >
                        <span>{item.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.stock} {item.unit}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3.5 py-3 text-xs font-semibold text-slate-400 text-center">
                      No matching ingredients found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyFilter}
                disabled={logsLoading}
                className="
                  flex-1
                  bg-gradient-to-r from-orange-500 to-indigo-600
                  text-white
                  py-2.5 sm:py-3
                  rounded-xl sm:rounded-2xl
                  text-xs sm:text-sm
                  font-black
                  tracking-wide
                  shadow-xs
                  hover:opacity-95
                  active:scale-95
                  transition-all
                  cursor-pointer
                  disabled:opacity-60
                "
              >
                {logsLoading ? "Filtering..." : "Apply"}
              </button>

              <button
                type="button"
                onClick={handleClearFilter}
                disabled={logsLoading}
                className="
                  px-4
                  py-2.5 sm:py-3
                  bg-slate-100
                  hover:bg-slate-200
                  text-slate-700
                  rounded-xl sm:rounded-2xl
                  text-xs sm:text-sm
                  font-bold
                  active:scale-95
                  transition-all
                  cursor-pointer
                  disabled:opacity-60
                "
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            LOGS MODULE (MOBILE CARDS & DESKTOP TABLE)
        ========================================================== */}
        <div
          className="
            bg-white/80
            backdrop-blur-md
            border border-slate-200/80
            rounded-2xl sm:rounded-[28px]
            mx-3 sm:mx-6
            px-3.5 sm:px-6
            py-4 sm:py-6
            shadow-xs
            relative 
            z-10
          "
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                Purchase & Wastage History
              </h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                Detailed transaction logs with stock delta tracking
              </p>
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {logs.length} {logs.length === 1 ? "Record" : "Records"}
            </span>
          </div>

          {logsLoading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400">
                <RefreshCw size={18} className="animate-spin text-indigo-600" />
                <span>Loading history records...</span>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-14 text-center text-xs font-semibold text-slate-400 bg-white/70 rounded-2xl border border-dashed border-slate-200">
              No inventory movements recorded in this date range.
            </div>
          ) : (
            <>
              {/* =========================================================
                  MOBILE CARDS (Screen < md)
              ========================================================== */}
              <div className="block md:hidden space-y-3">
                {logs.map((log, index) => {
                  const movement = getMovementConfig(log.transaction_type);
                  const isWastage = log.transaction_type === "WASTAGE";
                  const unitLabel =
                    log.unit ||
                    log.ingredient_unit ||
                    log.ingredient?.unit ||
                    "";

                  return (
                    <div
                      key={log.id ?? `${log.ingredient}-${log.created_at}-${index}`}
                      className="
                        relative
                        overflow-hidden
                        rounded-[22px]
                        bg-white
                        p-4
                        border border-slate-200/70
                        shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)]
                        transition-all
                        space-y-3
                      "
                    >
                      {/* Left Status Color Spine */}
                      <div className={`absolute left-0 inset-y-0 w-1.5 ${movement.spineClass}`} />

                      {/* Header Row: Ingredient + Transaction Badge */}
                      <div className="flex items-start justify-between gap-2 pl-1.5">
                        <div className="min-w-0 flex-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${movement.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${movement.dotClass}`} />
                            {movement.label}
                          </span>

                          <h3 className="text-base font-black text-slate-800 mt-1 truncate">
                            {log.ingredient_name || log.ingredient?.name || "Ingredient"}
                          </h3>
                        </div>

                        {/* Quantity Delta Pill */}
                        <div
                          className={`shrink-0 px-3 py-1.5 rounded-xl font-black text-xs shadow-xs text-right ${
                            isWastage
                              ? "bg-rose-50 text-rose-700 border border-rose-200/70"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                          }`}
                        >
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block leading-none">
                            Delta
                          </span>
                          <span className="text-sm font-black mt-0.5 block leading-none">
                            {isWastage ? "-" : "+"}
                            {formatQuantity(log.quantity_changed)} {unitLabel}
                          </span>
                        </div>
                      </div>

                      {/* Middle Row: Stock Transition Capsule */}
                      <div className="ml-1.5 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div>
                          <span className="text-[9px] font-extrabold uppercase text-slate-400 block leading-none">
                            Previous Stock
                          </span>
                          <span className="font-bold text-slate-600 mt-0.5 block">
                            {formatQuantity(log.previous_stock)} {unitLabel}
                          </span>
                        </div>

                        <ArrowRight size={14} className="text-slate-300 shrink-0 mx-2" />

                        <div className="text-right">
                          <span className="text-[9px] font-extrabold uppercase text-slate-400 block leading-none">
                            New Stock
                          </span>
                          <span className="font-black text-slate-900 mt-0.5 block">
                            {formatQuantity(log.new_stock)} {unitLabel}
                          </span>
                        </div>
                      </div>

                      {/* Footer: Date & Time */}
                      <div className="pl-1.5 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span>{formatDateTime(log.created_at)}</span>
                        {log.id && <span className="font-mono text-[10px]">Log #{log.id}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* =========================================================
                  DESKTOP DATA TABLE (Screen >= md)
              ========================================================== */}
              <div className="hidden md:block overflow-x-auto max-w-full">
                <table className="w-full text-base border-separate border-spacing-y-2">
                  <thead className="text-slate-400 font-bold text-xs tracking-wider uppercase">
                    <tr>
                      <th className="pb-2 text-left pl-4 w-48">Date & Time</th>
                      <th className="pb-2 text-left">Ingredient</th>
                      <th className="pb-2 text-left w-32">Movement</th>
                      <th className="pb-2 text-right w-36">Quantity</th>
                      <th className="pb-2 text-right w-36">Previous Stock</th>
                      <th className="pb-2 text-right pr-4 w-36">New Stock</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log, index) => {
                      const movement = getMovementConfig(log.transaction_type);
                      const isWastage = log.transaction_type === "WASTAGE";
                      const unitLabel =
                        log.unit ||
                        log.ingredient_unit ||
                        log.ingredient?.unit ||
                        "";

                      return (
                        <tr
                          key={log.id ?? `${log.ingredient}-${log.created_at}-${index}`}
                          className="group hover:bg-slate-50/60 transition-all duration-150 bg-white"
                        >
                          <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-500 rounded-l-xl">
                            {formatDateTime(log.created_at)}
                          </td>

                          <td className="py-3.5 px-2 font-black text-slate-800 text-sm">
                            {log.ingredient_name || log.ingredient?.name || "-"}
                          </td>

                          <td className="py-3.5 px-2">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${movement.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${movement.dotClass}`} />
                              {movement.label}
                            </span>
                          </td>

                          <td className="py-3.5 px-2 text-right">
                            <span
                              className={`font-black text-sm ${
                                isWastage ? "text-rose-600" : "text-emerald-600"
                              }`}
                            >
                              {isWastage ? "-" : "+"}
                              {formatQuantity(log.quantity_changed)}
                            </span>
                            <span className="ml-1 text-xs font-semibold text-slate-400">
                              {unitLabel}
                            </span>
                          </td>

                          <td className="py-3.5 px-2 text-right text-sm font-semibold text-slate-600">
                            {formatQuantity(log.previous_stock)}
                            <span className="ml-1 text-xs text-slate-400">
                              {unitLabel}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right rounded-r-xl">
                            <span className="text-sm font-black text-slate-900">
                              {formatQuantity(log.new_stock)}
                            </span>
                            <span className="ml-1 text-xs font-semibold text-slate-400">
                              {unitLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =======================================================
          UPDATE STOCK MODAL WITH TEXT SEARCH INPUT
      ======================================================= */}
      {showStockModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={closeStockModal}
          >
            <div
              className="bg-white rounded-t-[32px] sm:rounded-3xl w-full max-w-md p-5 sm:p-7 max-h-[90vh] overflow-y-auto shadow-2xl animate-[slideUp_0.25s_ease-out] sm:animate-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-800">
                    Update Stock
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Add purchased stock or record kitchen wastage
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeStockModal}
                  disabled={stockUpdating}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleStockUpdate} className="space-y-4 pt-4">
                {/* Search Text Input for Ingredient */}
                <div ref={modalDropdownRef} className="relative">
                  <label
                    htmlFor="update-stock-search-input"
                    className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500"
                  >
                    Select Ingredient
                  </label>
                  <div className="relative">
                    <input
                      id="update-stock-search-input"
                      type="text"
                      placeholder="Type ingredient name..."
                      value={modalSearchText}
                      disabled={stockUpdating}
                      onFocus={() => setShowModalDropdown(true)}
                      onChange={(e) => {
                        setModalSearchText(e.target.value);
                        setShowModalDropdown(true);
                        setUpdateIngredientId("");
                      }}
                      className="
                        w-full
                        bg-slate-50
                        border border-slate-200
                        rounded-xl
                        p-3
                        pl-9
                        pr-8
                        text-xs sm:text-sm
                        font-semibold
                        text-slate-800
                        outline-none
                        focus:bg-white
                        focus:border-indigo-400
                        transition-all
                      "
                    />
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />

                    {modalSearchText && (
                      <button
                        type="button"
                        onClick={() => {
                          setModalSearchText("");
                          setUpdateIngredientId("");
                          setShowModalDropdown(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showModalDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {modalSuggestions.length > 0 ? (
                        modalSuggestions.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setUpdateIngredientId(item.id);
                              setModalSearchText(item.name);
                              setShowModalDropdown(false);
                            }}
                            className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer flex items-center justify-between ${
                              String(updateIngredientId) === String(item.id)
                                ? "bg-indigo-50/70 text-indigo-600 font-bold"
                                : "text-slate-700"
                            }`}
                          >
                            <span>{item.name}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.stock} {item.unit}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-xs font-semibold text-slate-400 text-center">
                          No ingredients found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Current Stock Preview */}
                {selectedUpdateIngredient && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-2.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700">
                      Current Stock
                    </span>
                    <span className="text-base font-black text-indigo-900">
                      {formatQuantity(selectedUpdateIngredient.stock)}
                      <span className="ml-1 text-xs font-medium">
                        {selectedUpdateIngredient.unit}
                      </span>
                    </span>
                  </div>
                )}

                {/* Stock Movement Type Selector */}
                <div>
                  <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">
                    Stock Movement Type
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setStockType("PURCHASE")}
                      disabled={stockUpdating}
                      className={`
                        rounded-xl
                        border
                        p-3
                        text-xs sm:text-sm
                        font-black
                        transition-all
                        flex items-center justify-center gap-1.5
                        cursor-pointer
                        ${
                          stockType === "PURCHASE"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs ring-2 ring-emerald-100"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }
                      `}
                    >
                      <Plus size={16} />
                      <span>Purchase</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStockType("WASTAGE")}
                      disabled={stockUpdating}
                      className={`
                        rounded-xl
                        border
                        p-3
                        text-xs sm:text-sm
                        font-black
                        transition-all
                        flex items-center justify-center gap-1.5
                        cursor-pointer
                        ${
                          stockType === "WASTAGE"
                            ? "border-rose-500 bg-rose-50 text-rose-700 shadow-xs ring-2 ring-rose-100"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }
                      `}
                    >
                      <Trash2 size={16} />
                      <span>Wastage</span>
                    </button>
                  </div>
                </div>

                {/* Quantity Input */}
                <div>
                  <label
                    htmlFor="update-stock-quantity"
                    className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500"
                  >
                    Quantity
                  </label>
                  <div className="relative">
                    <input
                      id="update-stock-quantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder="Enter quantity"
                      disabled={stockUpdating}
                      className="
                        w-full
                        bg-slate-50
                        border border-slate-200
                        rounded-xl
                        p-3
                        pr-16
                        text-xs sm:text-sm
                        font-semibold
                        text-slate-800
                        outline-none
                        focus:bg-white
                        focus:border-indigo-400
                        transition-all
                      "
                    />
                    {selectedUpdateIngredient && (
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        {selectedUpdateIngredient.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Resulting Stock Preview */}
                {selectedUpdateIngredient &&
                  stockQuantity &&
                  Number(stockQuantity) > 0 && (
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">
                        Stock After Update
                      </span>
                      <span className="font-black text-slate-900 text-sm">
                        {formatQuantity(
                          stockType === "PURCHASE"
                            ? Number(selectedUpdateIngredient.stock) + Number(stockQuantity)
                            : Number(selectedUpdateIngredient.stock) - Number(stockQuantity)
                        )}{" "}
                        <span className="text-xs font-bold text-slate-400">
                          {selectedUpdateIngredient.unit}
                        </span>
                      </span>
                    </div>
                  )}

                {/* Error Banner */}
                {stockError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <span className="shrink-0">⚠️</span>
                    <span>{stockError}</span>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeStockModal}
                    disabled={stockUpdating}
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
                      active:scale-95
                      transition
                      cursor-pointer
                      disabled:opacity-60
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={stockUpdating}
                    className="
                      flex-1
                      py-3
                      rounded-xl
                      bg-gradient-to-r from-orange-500 to-indigo-600
                      text-white
                      text-xs sm:text-sm
                      font-black
                      shadow-md
                      hover:opacity-95
                      active:scale-95
                      transition-all
                      cursor-pointer
                      disabled:opacity-60
                      flex items-center justify-center gap-1.5
                    "
                  >
                    {stockUpdating ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      "Confirm Update"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </MainLayout>
  );
}