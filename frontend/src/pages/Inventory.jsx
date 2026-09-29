import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";

import {
  getInventory,
  getInventoryLogs,
} from "../services/inventoryService";

import {
  Boxes,
  Calendar,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Trash2,
  RotateCcw,
  SlidersHorizontal,
  PackageCheck,
} from "lucide-react";

function Inventory() {
  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const getMonthStart = () => {
    const date = new Date();

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    )
      .toISOString()
      .split("T")[0];
  };

  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);

  const [startDate, setStartDate] = useState(
    getMonthStart()
  );

  const [endDate, setEndDate] = useState(
    getToday()
  );

  const [inventoryLoading, setInventoryLoading] =
    useState(true);

  const [logsLoading, setLogsLoading] =
    useState(true);

  // ============================================================
  // FORMAT STOCK
  // ============================================================

  const formatStock = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return Number(number.toFixed(2)).toString();
  };

  // ============================================================
  // FETCH CURRENT INVENTORY
  // ============================================================

  const fetchInventory = async () => {
    try {
      setInventoryLoading(true);

      const data = await getInventory();

      setInventory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Failed to load inventory:",
        error
      );

      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  // ============================================================
  // FETCH INVENTORY LOGS
  // ============================================================

  const fetchLogs = async (
    from = startDate,
    to = endDate
  ) => {
    try {
      setLogsLoading(true);

      const data = await getInventoryLogs(
        from,
        to
      );

      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Failed to load inventory logs:",
        error
      );

      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchInventory();

    fetchLogs(
      getMonthStart(),
      getToday()
    );
  }, []);

  // ============================================================
  // APPLY DATE FILTER
  // ============================================================

  const handleApplyDateFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both dates.");
      return;
    }

    if (startDate > endDate) {
      alert(
        "Start date cannot be after end date."
      );
      return;
    }

    fetchLogs(startDate, endDate);
  };

  // ============================================================
  // MOVEMENT STYLE
  // ============================================================

  const getMovementStyle = (type) => {
    switch (type) {
      case "PURCHASE":
        return {
          label: "Purchase",
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
        };

      case "SALE":
        return {
          label: "Sale",
          className:
            "bg-orange-50 text-orange-600 border-orange-200",
        };

      case "WASTAGE":
        return {
          label: "Wastage",
          className:
            "bg-red-50 text-red-600 border-red-200",
        };

      case "RETURN":
        return {
          label: "Return",
          className:
            "bg-blue-50 text-blue-600 border-blue-200",
        };

      case "ADJUSTMENT":
        return {
          label: "Adjustment",
          className:
            "bg-violet-50 text-violet-600 border-violet-200",
        };

      default:
        return {
          label: type || "Unknown",
          className:
            "bg-slate-50 text-slate-600 border-slate-200",
        };
    }
  };

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    let purchase = 0;
    let sales = 0;
    let wastage = 0;
    let returns = 0;
    let adjustments = 0;

    logs.forEach((log) => {
      const quantity =
        Number(log.quantity_changed) || 0;

      switch (log.transaction_type) {
        case "PURCHASE":
          purchase += quantity;
          break;

        case "SALE":
          sales += quantity;
          break;

        case "WASTAGE":
          wastage += quantity;
          break;

        case "RETURN":
          returns += quantity;
          break;

        case "ADJUSTMENT":
          adjustments += quantity;
          break;

        default:
          break;
      }
    });

    return {
      purchase,
      sales,
      wastage,
      returns,
      adjustments,
    };
  }, [logs]);

  // ============================================================
  // CURRENT STOCK COUNT
  // ============================================================

  const ingredientCount = inventory.length;

  const lowStockCount = useMemo(() => {
    return inventory.filter((ingredient) => {
      return (
        Number(ingredient.stock) <=
        Number(ingredient.minimum_stock)
      );
    }).length;
  }, [inventory]);

  // ============================================================
  // STOCK CHANGED INGREDIENTS
  //
  // This is based ONLY on the selected date range.
  // An ingredient appears if its stock actually changed.
  // ============================================================

  const changedIngredients = useMemo(() => {
    const ingredientMap = new Map();

    logs.forEach((log) => {
      const previousStock =
        Number(log.previous_stock) || 0;

      const newStock =
        Number(log.new_stock) || 0;

      const stockChange =
        newStock - previousStock;

      // Ignore logs where stock didn't actually change
      if (stockChange === 0) {
        return;
      }

      const ingredientId = log.ingredient;

      if (!ingredientMap.has(ingredientId)) {
        ingredientMap.set(ingredientId, {
          id: ingredientId,
          name:
            log.ingredient_name ||
            "Unknown Ingredient",
          unit:
            log.ingredient_unit || "",
          firstStock: previousStock,
          latestStock: newStock,
          totalChange: stockChange,
          movementCount: 1,
          latestDate: log.created_at,
        });
      } else {
        const existing =
          ingredientMap.get(
            ingredientId
          );

        existing.latestStock = newStock;

        existing.totalChange += stockChange;

        existing.movementCount += 1;

        if (
          new Date(log.created_at) >
          new Date(existing.latestDate)
        ) {
          existing.latestDate =
            log.created_at;
        }
      }
    });

    return Array.from(
      ingredientMap.values()
    ).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [logs]);

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ============================================================
  // REFRESH EVERYTHING
  // ============================================================

  const handleRefresh = () => {
    fetchInventory();
    fetchLogs(startDate, endDate);
  };

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div
              className="
                w-11
                h-11
                rounded-2xl
                bg-indigo-50
                text-indigo-600
                flex
                items-center
                justify-center
              "
            >
              <Boxes size={21} />
            </div>

            <div>
              <h1
                className="
                  text-2xl
                  sm:text-3xl
                  font-black
                  text-slate-800
                "
              >
                Inventory
              </h1>

              <p
                className="
                  text-sm
                  text-slate-400
                  font-medium
                  mt-1
                "
              >
                Ingredient stock and movement history
              </p>
            </div>

          </div>

          <button
            onClick={handleRefresh}
            className="
              p-3
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-500
              hover:bg-slate-50
              transition
            "
            title="Refresh"
          >
            <RefreshCw
              size={17}
              className={
                inventoryLoading ||
                logsLoading
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

        </div>


        {/* ======================================================
            CUSTOM DATE FILTER
        ======================================================= */}

        <div
          className="
            bg-white
            border
            border-slate-200
            rounded-3xl
            p-5
            shadow-sm
          "
        >

          <div className="flex items-center gap-2 mb-4">

            <Calendar
              size={17}
              className="text-indigo-600"
            />

            <div>
              <h2
                className="
                  text-sm
                  font-bold
                  text-slate-700
                "
              >
                Custom Date Range
              </h2>

              <p
                className="
                  text-xs
                  text-slate-400
                  mt-0.5
                "
              >
                See which ingredients had stock changes
              </p>
            </div>

          </div>


          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-[1fr_auto_1fr_auto]
              gap-3
              items-center
            "
          >

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
              className="
                w-full
                bg-slate-50
                border
                border-slate-200
                rounded-xl
                px-4
                py-3
                text-sm
                font-medium
                text-slate-700
                outline-none
                focus:border-indigo-400
                focus:ring-2
                focus:ring-indigo-100
              "
            />

            <span
              className="
                hidden
                md:block
                text-slate-400
                font-bold
              "
            >
              →
            </span>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
              className="
                w-full
                bg-slate-50
                border
                border-slate-200
                rounded-xl
                px-4
                py-3
                text-sm
                font-medium
                text-slate-700
                outline-none
                focus:border-indigo-400
                focus:ring-2
                focus:ring-indigo-100
              "
            />

            <button
              onClick={handleApplyDateFilter}
              disabled={logsLoading}
              className="
                flex
                items-center
                justify-center
                gap-2
                bg-indigo-600
                hover:bg-indigo-700
                disabled:opacity-60
                text-white
                rounded-xl
                px-6
                py-3
                text-sm
                font-bold
                transition
              "
            >

              <RefreshCw
                size={15}
                className={
                  logsLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Apply

            </button>

          </div>

        </div>


        {/* ======================================================
            STOCK CHANGED INGREDIENTS
            THIS IS THE SECTION YOU ASKED FOR
        ======================================================= */}

        <div
          className="
            bg-white
            border
            border-slate-200
            rounded-3xl
            p-5
            sm:p-6
            shadow-sm
          "
        >

          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-2
              mb-5
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-indigo-50
                  text-indigo-600
                  flex
                  items-center
                  justify-center
                "
              >
                <PackageCheck size={18} />
              </div>

              <div>

                <h2
                  className="
                    text-base
                    font-bold
                    text-slate-800
                  "
                >
                  Stock Changed Ingredients
                </h2>

                <p
                  className="
                    text-xs
                    text-slate-400
                    mt-1
                  "
                >
                  Ingredients changed between{" "}
                  <span className="font-semibold">
                    {startDate}
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold">
                    {endDate}
                  </span>
                </p>

              </div>

            </div>


            <div
              className="
                px-3
                py-1.5
                rounded-xl
                bg-indigo-50
                text-indigo-600
                text-xs
                font-bold
              "
            >
              {changedIngredients.length} ingredient
              {changedIngredients.length === 1
                ? ""
                : "s"}
            </div>

          </div>


          {logsLoading ? (

            <div
              className="
                py-12
                text-center
                text-sm
                text-slate-400
              "
            >
              Loading stock changes...
            </div>

          ) : changedIngredients.length === 0 ? (

            <div
              className="
                py-12
                text-center
                border
                border-dashed
                border-slate-200
                rounded-2xl
              "
            >

              <div
                className="
                  w-12
                  h-12
                  mx-auto
                  rounded-2xl
                  bg-slate-100
                  text-slate-400
                  flex
                  items-center
                  justify-center
                  mb-3
                "
              >
                <PackageCheck size={20} />
              </div>

              <p
                className="
                  text-sm
                  font-bold
                  text-slate-500
                "
              >
                No stock changes
              </p>

              <p
                className="
                  text-xs
                  text-slate-400
                  mt-1
                "
              >
                No ingredient stock was changed
                during this date range.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table
                className="
                  w-full
                  min-w-[700px]
                "
              >

                <thead>

                  <tr
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-slate-400
                      font-bold
                      border-b
                      border-slate-100
                    "
                  >

                    <th
                      className="
                        text-left
                        px-4
                        py-3
                      "
                    >
                      Ingredient
                    </th>

                    <th
                      className="
                        text-right
                        px-4
                        py-3
                      "
                    >
                      Stock Before
                    </th>

                    <th
                      className="
                        text-right
                        px-4
                        py-3
                      "
                    >
                      Stock Change
                    </th>

                    <th
                      className="
                        text-right
                        px-4
                        py-3
                      "
                    >
                      Current Stock
                    </th>

                    <th
                      className="
                        text-right
                        px-4
                        py-3
                      "
                    >
                      Movements
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {changedIngredients.map(
                    (ingredient) => {

                      const change =
                        ingredient.totalChange;

                      const increased =
                        change > 0;

                      return (
                        <tr
                          key={ingredient.id}
                          className="
                            border-b
                            border-slate-50
                            hover:bg-slate-50/60
                            transition
                          "
                        >

                          <td
                            className="
                              px-4
                              py-4
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >

                              <div
                                className="
                                  w-9
                                  h-9
                                  rounded-xl
                                  bg-slate-100
                                  flex
                                  items-center
                                  justify-center
                                  text-slate-500
                                "
                              >
                                <Boxes size={16} />
                              </div>

                              <div>

                                <p
                                  className="
                                    text-sm
                                    font-bold
                                    text-slate-700
                                  "
                                >
                                  {ingredient.name}
                                </p>

                                <p
                                  className="
                                    text-[11px]
                                    text-slate-400
                                    mt-0.5
                                  "
                                >
                                  {ingredient.unit}
                                </p>

                              </div>

                            </div>

                          </td>


                          <td
                            className="
                              px-4
                              py-4
                              text-right
                              text-sm
                              font-semibold
                              text-slate-500
                            "
                          >
                            {formatStock(
                              ingredient.firstStock
                            )}
                          </td>


                          <td
                            className={`
                              px-4
                              py-4
                              text-right
                              text-sm
                              font-black
                              ${
                                increased
                                  ? "text-emerald-600"
                                  : "text-red-500"
                              }
                            `}
                          >
                            {increased
                              ? "+"
                              : ""}
                            {formatStock(change)}
                          </td>


                          <td
                            className="
                              px-4
                              py-4
                              text-right
                              text-sm
                              font-black
                              text-slate-800
                            "
                          >
                            {formatStock(
                              ingredient.latestStock
                            )}
                          </td>


                          <td
                            className="
                              px-4
                              py-4
                              text-right
                            "
                          >

                            <span
                              className="
                                inline-flex
                                px-2.5
                                py-1
                                rounded-lg
                                bg-slate-100
                                text-slate-600
                                text-xs
                                font-bold
                              "
                            >
                              {ingredient.movementCount}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* ======================================================
            SUMMARY CARDS
        ======================================================= */}

        <div
          className="
            grid
            grid-cols-2
            lg:grid-cols-5
            gap-3
            sm:gap-4
          "
        >

          {/* INGREDIENTS */}

          <div
            className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              p-4
              shadow-sm
            "
          >

            <div
              className="
                w-9
                h-9
                rounded-xl
                bg-indigo-50
                text-indigo-600
                flex
                items-center
                justify-center
              "
            >
              <Boxes size={17} />
            </div>

            <p
              className="
                text-2xl
                font-black
                text-slate-800
                mt-4
              "
            >
              {ingredientCount}
            </p>

            <p
              className="
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-slate-400
                mt-1
              "
            >
              Ingredients
            </p>

          </div>


          {/* PURCHASE */}

          <div
            className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              p-4
              shadow-sm
            "
          >

            <div
              className="
                w-9
                h-9
                rounded-xl
                bg-emerald-50
                text-emerald-600
                flex
                items-center
                justify-center
              "
            >
              <TrendingUp size={17} />
            </div>

            <p
              className="
                text-2xl
                font-black
                text-emerald-600
                mt-4
              "
            >
              +{formatStock(
                summary.purchase
              )}
            </p>

            <p
              className="
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-slate-400
                mt-1
              "
            >
              Purchases
            </p>

          </div>


          {/* SALES */}

          <div
            className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              p-4
              shadow-sm
            "
          >

            <div
              className="
                w-9
                h-9
                rounded-xl
                bg-orange-50
                text-orange-600
                flex
                items-center
                justify-center
              "
            >
              <TrendingDown size={17} />
            </div>

            <p
              className="
                text-2xl
                font-black
                text-orange-600
                mt-4
              "
            >
              -{formatStock(
                summary.sales
              )}
            </p>

            <p
              className="
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-slate-400
                mt-1
              "
            >
              Sales Usage
            </p>

          </div>


          {/* WASTAGE */}

          <div
            className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              p-4
              shadow-sm
            "
          >

            <div
              className="
                w-9
                h-9
                rounded-xl
                bg-red-50
                text-red-600
                flex
                items-center
                justify-center
              "
            >
              <Trash2 size={17} />
            </div>

            <p
              className="
                text-2xl
                font-black
                text-red-600
                mt-4
              "
            >
              -{formatStock(
                summary.wastage
              )}
            </p>

            <p
              className="
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-slate-400
                mt-1
              "
            >
              Wastage
            </p>

          </div>


          {/* LOW STOCK */}

          <div
            className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              p-4
              shadow-sm
            "
          >

            <div
              className="
                w-9
                h-9
                rounded-xl
                bg-amber-50
                text-amber-600
                flex
                items-center
                justify-center
              "
            >
              <SlidersHorizontal size={17} />
            </div>

            <p
              className="
                text-2xl
                font-black
                text-amber-600
                mt-4
              "
            >
              {lowStockCount}
            </p>

            <p
              className="
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-slate-400
                mt-1
              "
            >
              Low Stock
            </p>

          </div>

        </div>


        {/* ======================================================
            CURRENT INGREDIENT STOCK
        ======================================================= */}

        <div
          className="
            bg-white
            border
            border-slate-200
            rounded-3xl
            p-5
            sm:p-6
            shadow-sm
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              mb-5
            "
          >

            <div>

              <h2
                className="
                  text-base
                  font-bold
                  text-slate-800
                "
              >
                Current Ingredient Stock
              </h2>

              <p
                className="
                  text-xs
                  text-slate-400
                  mt-1
                "
              >
                Live stock shared with the
                Ingredients page
              </p>

            </div>

          </div>


          <div className="overflow-x-auto">

            <table
              className="
                w-full
                min-w-[650px]
              "
            >

              <thead>

                <tr
                  className="
                    text-[10px]
                    uppercase
                    tracking-wider
                    text-slate-400
                    font-bold
                    border-b
                    border-slate-100
                  "
                >

                  <th
                    className="
                      text-left
                      px-4
                      py-3
                    "
                  >
                    Ingredient
                  </th>

                  <th
                    className="
                      text-left
                      px-4
                      py-3
                    "
                  >
                    Unit
                  </th>

                  <th
                    className="
                      text-right
                      px-4
                      py-3
                    "
                  >
                    Current Stock
                  </th>

                  <th
                    className="
                      text-right
                      px-4
                      py-3
                    "
                  >
                    Minimum
                  </th>

                  <th
                    className="
                      text-right
                      px-4
                      py-3
                    "
                  >
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {inventoryLoading ? (

                  <tr>
                    <td
                      colSpan="5"
                      className="
                        text-center
                        py-10
                        text-sm
                        text-slate-400
                      "
                    >
                      Loading inventory...
                    </td>
                  </tr>

                ) : inventory.length === 0 ? (

                  <tr>
                    <td
                      colSpan="5"
                      className="
                        text-center
                        py-10
                        text-sm
                        text-slate-400
                      "
                    >
                      No ingredients found.
                    </td>
                  </tr>

                ) : (

                  inventory.map(
                    (ingredient) => {

                      const isLow =
                        Number(
                          ingredient.stock
                        ) <=
                        Number(
                          ingredient.minimum_stock
                        );

                      return (
                        <tr
                          key={ingredient.id}
                          className="
                            border-b
                            border-slate-50
                            hover:bg-slate-50/60
                            transition
                          "
                        >

                          <td
                            className="
                              px-4
                              py-3.5
                              text-sm
                              font-bold
                              text-slate-700
                            "
                          >
                            {ingredient.name}
                          </td>

                          <td
                            className="
                              px-4
                              py-3.5
                              text-sm
                              font-semibold
                              text-slate-500
                            "
                          >
                            {ingredient.unit}
                          </td>

                          <td
                            className="
                              px-4
                              py-3.5
                              text-right
                            "
                          >

                            <span
                              className={`
                                inline-flex
                                px-2.5
                                py-1
                                rounded-lg
                                text-xs
                                font-bold
                                ${
                                  isLow
                                    ? "bg-red-50 text-red-600"
                                    : "bg-slate-100 text-slate-700"
                                }
                              `}
                            >
                              {formatStock(
                                ingredient.stock
                              )}
                            </span>

                          </td>

                          <td
                            className="
                              px-4
                              py-3.5
                              text-right
                              text-sm
                              font-semibold
                              text-slate-500
                            "
                          >
                            {formatStock(
                              ingredient.minimum_stock
                            )}
                          </td>

                          <td
                            className="
                              px-4
                              py-3.5
                              text-right
                            "
                          >

                            <span
                              className={`
                                inline-flex
                                px-2.5
                                py-1
                                rounded-lg
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wider
                                ${
                                  isLow
                                    ? "bg-red-50 text-red-600"
                                    : "bg-emerald-50 text-emerald-600"
                                }
                              `}
                            >
                              {isLow
                                ? "Low Stock"
                                : "Normal"}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* ======================================================
            MOVEMENT HISTORY
        ======================================================= */}

        <div
          className="
            bg-white
            border
            border-slate-200
            rounded-3xl
            p-5
            sm:p-6
            shadow-sm
          "
        >

          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-2
              mb-5
            "
          >

            <div>

              <h2
                className="
                  text-base
                  font-bold
                  text-slate-800
                "
              >
                Inventory Movement History
              </h2>

              <p
                className="
                  text-xs
                  text-slate-400
                  mt-1
                "
              >
                Detailed stock movements for
                the selected period
              </p>

            </div>

            <div
              className="
                text-xs
                font-semibold
                text-slate-400
              "
            >
              {logs.length} movement
              {logs.length === 1
                ? ""
                : "s"}
            </div>

          </div>


          <div className="overflow-x-auto">

            <table
              className="
                w-full
                min-w-[900px]
              "
            >

              <thead>

                <tr
                  className="
                    text-[10px]
                    uppercase
                    tracking-wider
                    text-slate-400
                    font-bold
                    border-b
                    border-slate-100
                  "
                >

                  <th
                    className="
                      text-left
                      px-4
                      py-3
                    "
                  >
                    Date & Time
                  </th>

                  <th
                    className="
                      text-left
                      px-4
                      py-3
                    "
                  >
                    Ingredient
                  </th>

                  <th
                    className="
                      text-left
                      px-4
                      py-3
                    "
                  >
                    Movement
                  </th>

                  <th
                    className="
                      text-right
                      px-4
                      py-3
                    "
                  >
                    Qty
                  </th>

                  <th
                    className="
                      text-right
                      px-4
                      py-3
                    "
                  >
                    Previous
                  </th>

                  <th
                    className="
                      text-right
                      px-4
                      py-3
                    "
                  >
                    New Stock
                  </th>

                </tr>

              </thead>


              <tbody>

                {logsLoading ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="
                        text-center
                        py-12
                        text-sm
                        text-slate-400
                      "
                    >
                      Loading movements...
                    </td>

                  </tr>

                ) : logs.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="
                        text-center
                        py-12
                      "
                    >

                      <p
                        className="
                          text-sm
                          font-bold
                          text-slate-500
                        "
                      >
                        No inventory movements
                      </p>

                      <p
                        className="
                          text-xs
                          text-slate-400
                          mt-1
                        "
                      >
                        No stock changes were recorded
                        for this date range.
                      </p>

                    </td>

                  </tr>

                ) : (

                  logs.map((log) => {

                    const movement =
                      getMovementStyle(
                        log.transaction_type
                      );

                    const previous =
                      Number(
                        log.previous_stock
                      ) || 0;

                    const newStock =
                      Number(
                        log.new_stock
                      ) || 0;

                    const stockChange =
                      newStock - previous;

                    const isAddition =
                      stockChange > 0;

                    return (
                      <tr
                        key={log.id}
                        className="
                          border-b
                          border-slate-50
                          hover:bg-slate-50/60
                          transition
                        "
                      >

                        <td
                          className="
                            px-4
                            py-3.5
                            text-xs
                            font-medium
                            text-slate-500
                            whitespace-nowrap
                          "
                        >
                          {formatDateTime(
                            log.created_at
                          )}
                        </td>


                        <td
                          className="
                            px-4
                            py-3.5
                            text-sm
                            font-bold
                            text-slate-700
                          "
                        >
                          {log.ingredient_name}
                        </td>


                        <td
                          className="
                            px-4
                            py-3.5
                          "
                        >

                          <span
                            className={`
                              inline-flex
                              items-center
                              px-2.5
                              py-1
                              rounded-lg
                              border
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-wider
                              ${movement.className}
                            `}
                          >
                            {movement.label}
                          </span>

                        </td>


                        <td
                          className={`
                            px-4
                            py-3.5
                            text-right
                            font-black
                            ${
                              isAddition
                                ? "text-emerald-600"
                                : "text-red-500"
                            }
                          `}
                        >
                          {isAddition
                            ? "+"
                            : "-"}
                          {formatStock(
                            log.quantity_changed
                          )}
                        </td>


                        <td
                          className="
                            px-4
                            py-3.5
                            text-right
                            text-sm
                            font-semibold
                            text-slate-500
                          "
                        >
                          {formatStock(
                            log.previous_stock
                          )}
                        </td>


                        <td
                          className="
                            px-4
                            py-3.5
                            text-right
                            text-sm
                            font-black
                            text-slate-800
                          "
                        >
                          {formatStock(
                            log.new_stock
                          )}
                        </td>

                      </tr>
                    );
                  })

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </MainLayout>
  );
}

export default Inventory;