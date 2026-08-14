import { useEffect, useState } from "react";

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/expenseService";

import {
  Pencil,
  Trash2,
  Calendar,
  Wallet,
  Search,
  Plus,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Banknote,
  MoreVertical,
  X,
  Tag,
  ReceiptText,
  TrendingDown,
  IndianRupee,
} from "lucide-react";

import { createPortal } from "react-dom";
import Notification from "../Notification";
import { useNavigate } from "react-router-dom";


function CashBook() {

  const today =
    new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] =
    useState(today);

  const [expenses, setExpenses] =
    useState([]);

  const [totalExpense, setTotalExpense] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [showExpenseModal, setShowExpenseModal] =
    useState(false);

  const [openMenuId, setOpenMenuId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [categories, setCategories] =
    useState([]);

  const [showCategoryModal, setShowCategoryModal] =
    useState(false);

  const [newCategory, setNewCategory] =
    useState("");

  const [editingCategoryId, setEditingCategoryId] =
    useState(null);

  const [filterType, setFilterType] =
    useState("today");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const navigate = useNavigate();


  const [summary, setSummary] = useState({
    cash: 0,
    upi: 0,
    total: 0,
  });


  const [notification, setNotification] =
    useState({
      show: false,
      type: "success",
      message: "",
    });


  const [formData, setFormData] = useState({
    category: "",
    payment_method: "",
    amount: "",
    remarks: "",
    expense_date: today,
  });


  /* =====================================================
      NOTIFICATION
  ===================================================== */

  const showNotification = (
    type,
    message
  ) => {

    setNotification({
      show: true,
      type,
      message,
    });

    setTimeout(() => {

      setNotification((prev) => ({
        ...prev,
        show: false,
      }));

    }, 3000);
  };


  /* =====================================================
      FILTERED EXPENSES
  ===================================================== */

  const filteredExpenses =
    expenses.filter((expense) => {

      const text =
        search.toLowerCase();

      return (
        expense.category_details?.name
          ?.toLowerCase()
          .includes(text) ||

        (expense.remarks || "")
          .toLowerCase()
          .includes(text) ||

        String(expense.amount)
          .includes(text)
      );
    });


  /* =====================================================
      LOAD CATEGORIES
  ===================================================== */

  const loadCategories =
    async () => {

      try {

        const { data } =
          await getCategories();

        setCategories(data);

      } catch (err) {

        console.error(err);

      }
    };


  /* =====================================================
      LOAD EXPENSES
  ===================================================== */

  const loadExpenses =
    async () => {

      try {

        setLoading(true);

        const data =
          await getExpenses(
            filterType,
            fromDate,
            toDate
          );

        setExpenses(
          data.expenses || []
        );

        setSummary({
          cash:
            Number(data.cash_total || 0),

          upi:
            Number(data.upi_total || 0),

          total:
            Number(data.total || 0),
        });

        setTotalExpense(
          Number(data.total || 0)
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }
    };


  /* =====================================================
      INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    loadCategories();

  }, []);


  useEffect(() => {

    loadExpenses();

  }, [
    filterType,
    fromDate,
    toDate,
  ]);


  /* =====================================================
      FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {

    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));

  };


  /* =====================================================
      DATE CHANGE
  ===================================================== */

  const handleDateChange = (e) => {

    const newDate =
      e.target.value;

    setSelectedDate(newDate);

    setFormData((prev) => ({
      ...prev,
      expense_date: newDate,
    }));

  };


  /* =====================================================
      RESET FORM
  ===================================================== */

  const cancelEdit = () => {

    setEditingId(null);

    setFormData({
      category: "",
      payment_method: "",
      amount: "",
      remarks: "",
      expense_date:
        selectedDate,
    });

  };


  /* =====================================================
      SAVE EXPENSE
  ===================================================== */

  const saveExpense = async () => {

    if (!formData.category) {

      showNotification(
        "warning",
        "Please select a category."
      );

      return;
    }


    if (
      !formData.payment_method
    ) {

      showNotification(
        "warning",
        "Please select a payment method."
      );

      return;
    }


    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {

      showNotification(
        "warning",
        "Please enter a valid amount."
      );

      return;
    }


    try {

      if (editingId) {

        await updateExpense(
          editingId,
          formData
        );

        showNotification(
          "success",
          "Expense updated successfully."
        );

      } else {

        await createExpense(
          formData
        );

        showNotification(
          "success",
          "Expense added successfully."
        );

      }


      cancelEdit();

      await loadExpenses();

      setShowExpenseModal(false);

      setOpenMenuId(null);

    } catch (err) {

      console.error(err);

      showNotification(
        "error",
        "Failed to save expense."
      );

    }

  };


  /* =====================================================
      EDIT EXPENSE
  ===================================================== */

  const editExpense =
    (expense) => {

      setEditingId(
        expense.id
      );

      setFormData({
        category:
          expense.category,

        payment_method:
          expense.payment_method,

        amount:
          String(expense.amount),

        remarks:
          expense.remarks || "",

        expense_date:
          expense.expense_date,
      });

      setSelectedDate(
        expense.expense_date
      );

      setShowExpenseModal(true);

    };


  /* =====================================================
      DELETE EXPENSE
  ===================================================== */

  const removeExpense =
    async (id) => {

      if (
        !window.confirm(
          "Delete Expense?"
        )
      ) {
        return;
      }

      try {

        await deleteExpense(id);

        showNotification(
          "success",
          "Expense deleted successfully."
        );

        loadExpenses();

      } catch (err) {

        console.error(err);

        showNotification(
          "error",
          "Failed to delete expense."
        );

      }

    };


  /* =====================================================
      SAVE CATEGORY
  ===================================================== */

  const saveCategory =
    async () => {

      if (
        !newCategory.trim()
      ) {
        return;
      }

      try {

        if (
          editingCategoryId
        ) {

          await updateCategory(
            editingCategoryId,
            {
              name:
                newCategory,
            }
          );

        } else {

          await createCategory({
            name:
              newCategory,
          });

        }

        setNewCategory("");

        setEditingCategoryId(
          null
        );

        loadCategories();

      } catch (err) {

        console.error(err);

      }

    };


  /* =====================================================
      EDIT CATEGORY
  ===================================================== */

  const editCategory =
    (category) => {

      setEditingCategoryId(
        category.id
      );

      setNewCategory(
        category.name
      );

    };


  /* =====================================================
      DELETE CATEGORY
  ===================================================== */

  const removeCategory =
    async (id) => {

      if (
        !window.confirm(
          "Delete Category?"
        )
      ) {
        return;
      }

      try {

        await deleteCategory(id);

        loadCategories();

      } catch (err) {

        console.error(err);

      }

    };


  /* =====================================================
      PAYMENT ICON
  ===================================================== */

  const getPaymentIcon =
    (method) => {

      if (
        method?.toLowerCase() ===
        "upi"
      ) {

        return (
          <Smartphone
            size={15}
          />
        );

      }

      return (
        <Banknote
          size={15}
        />
      );

    };


  return (

    <div
      className="
        min-h-full
        pb-8
        space-y-6
      "
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          lg:flex-row

          lg:items-center
          lg:justify-between

          gap-5
        "
      >

        <div>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              inline-flex
              items-center
              gap-2

              mb-3

              text-[11px]
              font-black
              uppercase
              tracking-widest

              text-slate-400

              hover:text-indigo-600

              transition-all

              cursor-pointer
            "
          >

            <ArrowLeft
              size={14}
            />

            Dashboard

          </button>


          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-11
                h-11

                rounded-2xl

                flex
                items-center
                justify-center

                bg-gradient-to-br
                from-orange-500
                to-indigo-600

                text-white

                shadow-lg
                shadow-indigo-500/20

                animate-[pulse_3s_ease-in-out_infinite]
              "
            >

              <ReceiptText
                size={21}
              />

            </div>


            <div>

              <h1
                className="
                  text-2xl
                  sm:text-3xl

                  font-black
                  tracking-tight

                  text-slate-900
                "
              >
                Business Expenses
              </h1>

              <p
                className="
                  text-xs
                  sm:text-sm

                  font-medium

                  text-slate-400

                  mt-0.5
                "
              >
                Track and manage your
                business spending.
              </p>

            </div>

          </div>

        </div>


        {/* HEADER BUTTONS */}

        <div
          className="
            flex
            w-full
            sm:w-auto

            items-center
            gap-2
          "
        >

          <button
            type="button"
            onClick={() =>
              setShowCategoryModal(true)
            }
            className="
              flex-1
              sm:flex-none

              inline-flex
              items-center
              justify-center
              gap-2

              px-8
              py-5

              rounded-2xl

              border
              border-slate-200

              bg-white

              text-s
              font-black

              text-slate-600

              shadow-sm

              hover:-translate-y-0.5
              hover:border-indigo-200
              hover:text-indigo-600

              transition-all

              cursor-pointer
            "
          >

            <Tag size={15} />

            Category

          </button>


          <button
            type="button"
            onClick={() => {

              setEditingId(null);

              setFormData({
                category: "",
                payment_method: "",
                amount: "",
                remarks: "",
                expense_date:
                  selectedDate,
              });

              setShowExpenseModal(true);

            }}
            className="
              flex-1
              sm:flex-none

              inline-flex
              items-center
              justify-center
              gap-2

              px-8
              py-5

              rounded-2xl

              bg-gradient-to-r
              from-orange-500
              to-indigo-600

              text-white

              text-s
              font-black

              shadow-lg
              shadow-indigo-500/20

              hover:-translate-y-0.5
              hover:shadow-xl

              active:scale-95

              transition-all

              cursor-pointer
            "
          >

            <Plus
              size={16}
            />

            Add Expense

          </button>

        </div>

      </div>


      {/* =====================================================
          SUMMARY PANEL
      ===================================================== */}

      <div
        className="
          relative
          overflow-hidden

          rounded-[28px]

          bg-gradient-to-br
          from-[#111827]
          via-[#172033]
          to-[#101522]

          border
          border-slate-700/70

          shadow-[0_15px_45px_-20px_rgba(15,23,42,0.7)]

          p-5
          sm:p-6
        "
      >

        {/* Ambient glow */}

        <div
          className="
            absolute
            -right-16
            -top-16

            w-48
            h-48

            rounded-full

            bg-indigo-500/15

            blur-3xl

            pointer-events-none
          "
        />

        <div
          className="
            absolute
            -left-16
            -bottom-20

            w-48
            h-48

            rounded-full

            bg-orange-500/10

            blur-3xl

            pointer-events-none
          "
        />


        <div
          className="
            relative
            z-10

            grid
            grid-cols-1
            sm:grid-cols-3

            gap-3
          "
        >

          {/* CASH */}

          <div
            className="
              rounded-2xl

              bg-white/[0.05]

              border
              border-white/[0.08]

              p-4

              transition-all
              duration-300

              hover:bg-white/[0.08]
              hover:-translate-y-1
            "
          >

            <div
              className="
                flex
                items-center
                gap-2

                text-[10px]
                font-black

                uppercase
                tracking-widest

                text-slate-400
              "
            >

              <Banknote
                size={15}
                className="text-emerald-400"
              />

              Cash

            </div>


            <p
              className="
                mt-2

                text-xl

                font-black

                text-white
              "
            >
              ₹{Number(
                summary.cash
              ).toLocaleString("en-IN")}
            </p>

          </div>


          {/* UPI */}

          <div
            className="
              rounded-2xl

              bg-white/[0.05]

              border
              border-white/[0.08]

              p-4

              transition-all
              duration-300

              hover:bg-white/[0.08]
              hover:-translate-y-1
            "
          >

            <div
              className="
                flex
                items-center
                gap-2

                text-[10px]
                font-black

                uppercase
                tracking-widest

                text-slate-400
              "
            >

              <Smartphone
                size={15}
                className="text-cyan-400"
              />

              UPI

            </div>


            <p
              className="
                mt-2

                text-xl

                font-black

                text-white
              "
            >
              ₹{Number(
                summary.upi
              ).toLocaleString("en-IN")}
            </p>

          </div>


          {/* TOTAL */}

          <div
            className="
              rounded-2xl

              bg-gradient-to-r
              from-orange-500/15
              to-indigo-500/15

              border
              border-white/[0.1]

              p-4

              transition-all
              duration-300

              hover:-translate-y-1
            "
          >

            <div
              className="
                flex
                items-center
                gap-2

                text-[10px]
                font-black

                uppercase
                tracking-widest

                text-slate-400
              "
            >

              <TrendingDown
                size={15}
                className="text-orange-400"
              />

              Total Expense

            </div>


            <p
              className="
                mt-2

                text-xl

                font-black

                text-white
              "
            >
              ₹{Number(
                summary.total
              ).toLocaleString("en-IN")}
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div
        className="
          rounded-[26px]

          border
          border-slate-200/80

          bg-white

          p-4
          sm:p-5

          shadow-[0_8px_30px_-20px_rgba(15,23,42,0.25)]
        "
      >

        <div
          className="
            flex
            flex-col
            lg:flex-row

            lg:items-center
            lg:justify-between

            gap-4
          "
        >

          {/* SEARCH */}

          <div
            className="
              relative
              w-full
              lg:max-w-md
            "
          >

            <Search
              size={17}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2

                text-slate-400
              "
            />

            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="
                w-full

                rounded-2xl

                border
                border-slate-200

                bg-slate-50

                py-3
                pl-11
                pr-4

                text-sm
                font-semibold

                text-slate-800

                placeholder:text-slate-400

                outline-none

                focus:bg-white
                focus:border-indigo-400
                focus:ring-4
                focus:ring-indigo-500/10

                transition-all
              "
            />

          </div>


          {/* FILTERS */}

          <div
            className="
              flex
              flex-wrap

              gap-2
            "
          >

            {[
              "today",
              "week",
              "month",
              "custom",
            ].map((type) => (

              <button
                key={type}
                onClick={() =>
                  setFilterType(type)
                }
                className={`
                  px-4
                  py-2.5

                  rounded-xl

                  text-[10px]
                  font-black

                  uppercase
                  tracking-widest

                  transition-all

                  cursor-pointer

                  ${
                    filterType === type
                      ? `
                        bg-slate-900
                        text-white
                        shadow-lg
                        shadow-slate-900/15
                      `
                      : `
                        bg-slate-50
                        border
                        border-slate-200
                        text-slate-500
                        hover:bg-white
                        hover:text-slate-800
                      `
                  }
                `}
              >

                {type}

              </button>

            ))}

          </div>

        </div>


        {/* CUSTOM DATES */}

        {filterType ===
          "custom" && (

          <div
            className="
              mt-4
              pt-4

              border-t
              border-slate-100

              flex
              flex-col
              sm:flex-row

              items-stretch
              sm:items-center

              gap-3

              animate-[fadeIn_.25s_ease-out]
            "
          >

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
              className="
                rounded-xl

                border
                border-slate-200

                bg-slate-50

                px-3
                py-2.5

                text-sm
                font-semibold

                text-slate-700

                outline-none

                focus:border-indigo-400
                focus:bg-white
              "
            />

            <span
              className="
                hidden
                sm:block

                text-xs
                font-black

                uppercase
                tracking-widest

                text-slate-300
              "
            >
              To
            </span>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
              className="
                rounded-xl

                border
                border-slate-200

                bg-slate-50

                px-3
                py-2.5

                text-sm
                font-semibold

                text-slate-700

                outline-none

                focus:border-indigo-400
                focus:bg-white
              "
            />

            <button
              onClick={() =>
                loadExpenses()
              }
              className="
                rounded-xl

                bg-indigo-600

                px-5
                py-2.5

                text-xs
                font-black

                text-white

                hover:bg-indigo-700

                active:scale-95

                transition-all

                cursor-pointer
              "
            >
              Apply
            </button>

          </div>

        )}

      </div>


      {/* =====================================================
          EXPENSE LIST
      ===================================================== */}

      <div
        className="
          overflow-hidden

          rounded-[28px]

          border
          border-slate-200/80

          bg-white

          shadow-[0_10px_35px_-25px_rgba(15,23,42,0.3)]
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            sm:flex-row

            sm:items-center
            sm:justify-between

            gap-3

            border-b
            border-slate-100

            px-5
            sm:px-6

            py-5
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <h2
                className="
                  text-lg
                  sm:text-xl

                  font-black

                  text-slate-900
                "
              >
                Expenses
              </h2>


              <span
                className="
                  rounded-lg

                  bg-indigo-50

                  px-2

                  py-1

                  text-[10px]

                  font-black

                  text-indigo-600
                "
              >
                {filteredExpenses.length}
              </span>

            </div>

            <p
              className="
                mt-1

                text-xs

                font-medium

                text-slate-400
              "
            >
              Business expense records
            </p>

          </div>


          <div
            className="
              inline-flex
              items-center
              gap-2

              text-xs

              font-bold

              text-slate-400
            "
          >

            <Calendar
              size={15}
            />

            {selectedDate}

          </div>

        </div>


        {/* CONTENT */}

        {loading ? (

          <div
            className="
              flex
              min-h-[300px]

              flex-col

              items-center
              justify-center
            "
          >

            <div
              className="
                h-10
                w-10

                rounded-full

                border-4
                border-slate-200

                border-t-indigo-600

                animate-spin
              "
            />

            <p
              className="
                mt-4

                text-xs

                font-black

                uppercase
                tracking-widest

                text-slate-400
              "
            >
              Loading expenses...
            </p>

          </div>

        ) : expenses.length === 0 ? (

          <div
            className="
              flex

              min-h-[300px]

              flex-col

              items-center
              justify-center

              px-6
            "
          >

            <div
              className="
                flex

                h-16
                w-16

                items-center
                justify-center

                rounded-2xl

                bg-slate-50

                border
                border-slate-100
              "
            >

              <Wallet
                size={28}
                className="text-slate-300"
              />

            </div>


            <h3
              className="
                mt-4

                text-sm

                font-black

                text-slate-700
              "
            >
              No Expenses Found
            </h3>


            <p
              className="
                mt-1

                text-xs

                text-center

                text-slate-400
              "
            >
              Start by adding a business
              expense for this period.
            </p>

          </div>

        ) : filteredExpenses.length === 0 ? (

          <div
            className="
              py-20

              text-center
            "
          >

            <Search
              size={32}
              className="
                mx-auto
                text-slate-300
              "
            />

            <p
              className="
                mt-3

                text-sm

                font-bold

                text-slate-500
              "
            >
              No matching expenses
            </p>

          </div>

        ) : (

          <>

            {/* =================================================
                DESKTOP TABLE
            ================================================== */}

            <div
              className="
                hidden
                md:block

                overflow-x-auto

                px-4
                pb-5
              "
            >

              <table
                className="
                  w-full

                  border-separate
                  border-spacing-y-2

                  text-sm
                "
              >

                <thead>

                  <tr
                    className="
                      text-[10px]
                      font-black

                      uppercase
                      tracking-widest

                      text-slate-400
                    "
                  >

                    <th className="px-4 py-3 text-left">
                      Category
                    </th>

                    <th className="px-3 py-3 text-left">
                      Amount
                    </th>

                    <th className="px-3 py-3 text-left">
                      Remarks
                    </th>

                    <th className="px-3 py-3 text-left">
                      Payment
                    </th>

                    <th className="px-3 py-3 text-left">
                      Date
                    </th>

                    <th className="px-4 py-3 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredExpenses.map(
                    (expense) => (

                      <tr
                        key={expense.id}
                        className="
                          group

                          bg-slate-50/70

                          hover:bg-white

                          shadow-sm
                          hover:shadow-md

                          transition-all
                          duration-300
                        "
                      >

                        <td
                          className="
                            rounded-l-2xl

                            px-4
                            py-4
                          "
                        >

                          <span
                            className="
                              inline-flex
                              items-center

                              rounded-xl

                              bg-orange-50

                              border
                              border-orange-100

                              px-3
                              py-1.5

                              text-[10px]

                              font-black

                              uppercase
                              tracking-wide

                              text-orange-600
                            "
                          >
                            {expense.category_details?.name}
                          </span>

                        </td>


                        <td
                          className="
                            px-3
                            py-4
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-1

                              font-black

                              text-slate-900
                            "
                          >

                            <IndianRupee
                              size={14}
                            />

                            {expense.amount}

                          </div>

                        </td>


                        <td
                          className="
                            max-w-[260px]

                            px-3
                            py-4

                            font-medium

                            text-slate-500
                          "
                        >

                          <span
                            className="
                              block

                              truncate
                            "
                          >
                            {expense.remarks ||
                              "No remarks"}
                          </span>

                        </td>


                        <td
                          className="
                            px-3
                            py-4
                          "
                        >

                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1.5

                              rounded-xl

                              bg-white

                              border
                              border-slate-200

                              px-3
                              py-1.5

                              text-[10px]

                              font-black

                              uppercase

                              text-slate-500
                            "
                          >

                            {getPaymentIcon(
                              expense.payment_method
                            )}

                            {expense.payment_method}

                          </span>

                        </td>


                        <td
                          className="
                            px-3
                            py-4

                            text-xs

                            font-semibold

                            text-slate-400
                          "
                        >
                          {expense.expense_date}
                        </td>


                        <td
                          className="
                            relative

                            rounded-r-2xl

                            px-4
                            py-4

                            text-right
                          "
                        >

                          <button
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId ===
                                  expense.id
                                  ? null
                                  : expense.id
                              )
                            }
                            className="
                              inline-flex

                              h-9
                              w-9

                              items-center
                              justify-center

                              rounded-xl

                              border
                              border-transparent

                              text-slate-400

                              hover:border-slate-200
                              hover:bg-white
                              hover:text-slate-800

                              transition-all

                              cursor-pointer
                            "
                          >

                            <MoreVertical
                              size={17}
                            />

                          </button>


                          {openMenuId ===
                            expense.id && (

                            <div
                              className="
                                absolute
                                right-4
                                top-14

                                z-30

                                w-36

                                overflow-hidden

                                rounded-2xl

                                border
                                border-slate-200

                                bg-white

                                shadow-2xl

                                animate-[fadeIn_.15s_ease-out]
                              "
                            >

                              <button
                                onClick={() => {

                                  editExpense(
                                    expense
                                  );

                                  setOpenMenuId(
                                    null
                                  );

                                }}
                                className="
                                  flex
                                  w-full

                                  items-center
                                  gap-2

                                  px-4
                                  py-3

                                  text-xs
                                  font-bold

                                  text-slate-600

                                  hover:bg-indigo-50
                                  hover:text-indigo-600

                                  cursor-pointer
                                "
                              >

                                <Pencil
                                  size={14}
                                />

                                Edit

                              </button>


                              <button
                                onClick={() => {

                                  removeExpense(
                                    expense.id
                                  );

                                  setOpenMenuId(
                                    null
                                  );

                                }}
                                className="
                                  flex
                                  w-full

                                  items-center
                                  gap-2

                                  px-4
                                  py-3

                                  text-xs
                                  font-bold

                                  text-red-500

                                  hover:bg-red-50

                                  cursor-pointer
                                "
                              >

                                <Trash2
                                  size={14}
                                />

                                Delete

                              </button>

                            </div>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* =================================================
                MOBILE CARDS
            ================================================== */}

            <div
              className="
                md:hidden

                space-y-3

                p-4
              "
            >

              {filteredExpenses.map(
                (expense) => (

                  <div
                    key={expense.id}
                    className="
                      relative
                      overflow-hidden

                      rounded-2xl

                      border
                      border-slate-200

                      bg-slate-50/60

                      p-4

                      transition-all
                      duration-300

                      hover:bg-white

                      active:scale-[0.99]
                    "
                  >

                    {/* Accent */}

                    <div
                      className="
                        absolute
                        left-0
                        top-0
                        bottom-0

                        w-1

                        bg-gradient-to-b
                        from-orange-500
                        to-indigo-500
                      "
                    />


                    <div
                      className="
                        flex
                        items-start
                        justify-between

                        gap-3
                      "
                    >

                      <div
                        className="
                          min-w-0
                        "
                      >

                        <span
                          className="
                            inline-flex

                            rounded-lg

                            bg-orange-50

                            border
                            border-orange-100

                            px-2.5
                            py-1

                            text-[9px]

                            font-black

                            uppercase
                            tracking-wide

                            text-orange-600
                          "
                        >
                          {expense.category_details?.name}
                        </span>


                        <div
                          className="
                            mt-2

                            text-lg

                            font-black

                            text-slate-900
                          "
                        >
                          ₹{expense.amount}
                        </div>

                      </div>


                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId ===
                              expense.id
                              ? null
                              : expense.id
                          )
                        }
                        className="
                          flex

                          h-9
                          w-9

                          flex-shrink-0

                          items-center
                          justify-center

                          rounded-xl

                          bg-white

                          border
                          border-slate-200

                          text-slate-400

                          active:scale-90

                          transition-all
                        "
                      >

                        <MoreVertical
                          size={17}
                        />

                      </button>

                    </div>


                    {/* REMARK */}

                    <div
                      className="
                        mt-3

                        rounded-xl

                        bg-white

                        border
                        border-slate-100

                        px-3
                        py-2.5
                      "
                    >

                      <p
                        className="
                          text-xs

                          font-medium

                          text-slate-500

                          break-words
                        "
                      >
                        {expense.remarks ||
                          "No remarks added"}
                      </p>

                    </div>


                    {/* META */}

                    <div
                      className="
                        mt-3

                        flex
                        flex-wrap

                        items-center
                        justify-between

                        gap-2
                      "
                    >

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5

                          text-[10px]

                          font-black

                          uppercase

                          text-slate-400
                        "
                      >

                        {getPaymentIcon(
                          expense.payment_method
                        )}

                        {expense.payment_method}

                      </span>


                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5

                          text-[10px]

                          font-bold

                          text-slate-400
                        "
                      >

                        <Calendar
                          size={13}
                        />

                        {expense.expense_date}

                      </span>

                    </div>


                    {/* MOBILE MENU */}

                    {openMenuId ===
                      expense.id && (

                      <div
                        className="
                          absolute
                          right-4
                          top-14

                          z-20

                          w-32

                          overflow-hidden

                          rounded-xl

                          border
                          border-slate-200

                          bg-white

                          shadow-xl
                        "
                      >

                        <button
                          onClick={() => {

                            editExpense(
                              expense
                            );

                            setOpenMenuId(
                              null
                            );

                          }}
                          className="
                            flex
                            w-full

                            items-center
                            gap-2

                            px-3
                            py-2.5

                            text-xs
                            font-bold

                            text-slate-600

                            hover:bg-indigo-50

                            cursor-pointer
                          "
                        >

                          <Pencil
                            size={13}
                          />

                          Edit

                        </button>


                        <button
                          onClick={() => {

                            removeExpense(
                              expense.id
                            );

                            setOpenMenuId(
                              null
                            );

                          }}
                          className="
                            flex
                            w-full

                            items-center
                            gap-2

                            px-3
                            py-2.5

                            text-xs
                            font-bold

                            text-red-500

                            hover:bg-red-50

                            cursor-pointer
                          "
                        >

                          <Trash2
                            size={13}
                          />

                          Delete

                        </button>

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          </>

        )}

      </div>


      {/* =====================================================
          EXPENSE MODAL
      ===================================================== */}

      {showExpenseModal &&
        createPortal(

          <div
            className="
              fixed
              inset-0

              z-[9999]

              flex
              items-center
              justify-center

              bg-slate-950/60

              backdrop-blur-sm

              p-3
              sm:p-6
            "
          >

            <div
              className="
                w-full
                max-w-2xl

                max-h-[92vh]

                overflow-y-auto

                rounded-[28px]

                border
                border-slate-700/70

                bg-[#111827]

                shadow-2xl

                animate-[modalIn_.25s_ease-out]
              "
            >

              {/* MODAL HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between

                  border-b
                  border-slate-800

                  px-5
                  sm:px-7

                  py-5
                "
              >

                <div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <div
                      className="
                        flex

                        h-9
                        w-9

                        items-center
                        justify-center

                        rounded-xl

                        bg-gradient-to-br
                        from-orange-500
                        to-indigo-600

                        text-white
                      "
                    >

                      <ReceiptText
                        size={17}
                      />

                    </div>


                    <h2
                      className="
                        text-lg
                        font-black

                        text-white
                      "
                    >
                      {editingId
                        ? "Edit Expense"
                        : "Add Expense"}
                    </h2>

                  </div>


                  <p
                    className="
                      mt-1

                      text-xs

                      text-slate-500
                    "
                  >
                    Record your business
                    expense details.
                  </p>

                </div>


                <button
                  onClick={() => {

                    setShowExpenseModal(
                      false
                    );

                    cancelEdit();

                  }}
                  className="
                    flex

                    h-9
                    w-9

                    items-center
                    justify-center

                    rounded-xl

                    bg-slate-800

                    text-slate-400

                    hover:bg-red-500/10
                    hover:text-red-400

                    transition-all

                    cursor-pointer
                  "
                >

                  <X
                    size={17}
                  />

                </button>

              </div>


              {/* FORM */}

              <form
                onSubmit={(e) => {

                  e.preventDefault();

                  saveExpense();

                }}
                className="
                  grid

                  grid-cols-1
                  sm:grid-cols-2

                  gap-4

                  p-5
                  sm:p-7
                "
              >

                {/* CATEGORY */}

                <div>

                  <label
                    className="
                      mb-2
                      block

                      text-[10px]

                      font-black

                      uppercase
                      tracking-widest

                      text-slate-500
                    "
                  >
                    Category
                  </label>

                  <select
                    name="category"
                    value={
                      formData.category
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="
                      w-full

                      rounded-xl

                      border
                      border-slate-700

                      bg-slate-900

                      px-3
                      py-3

                      text-sm

                      font-semibold

                      text-slate-200

                      outline-none

                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-500/10
                    "
                  >

                    <option value="">
                      Select Category
                    </option>

                    {categories.map(
                      (category) => (

                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >
                          {category.name}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* PAYMENT */}

                <div>

                  <label
                    className="
                      mb-2
                      block

                      text-[10px]

                      font-black

                      uppercase
                      tracking-widest

                      text-slate-500
                    "
                  >
                    Payment Method
                  </label>

                  <select
                    name="payment_method"
                    value={
                      formData.payment_method
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="
                      w-full

                      rounded-xl

                      border
                      border-slate-700

                      bg-slate-900

                      px-3
                      py-3

                      text-sm

                      font-semibold

                      text-slate-200

                      outline-none

                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-500/10
                    "
                  >

                    <option value="">
                      Select Payment Method
                    </option>

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                  </select>

                </div>


                {/* AMOUNT */}

                <div>

                  <label
                    className="
                      mb-2
                      block

                      text-[10px]

                      font-black

                      uppercase
                      tracking-widest

                      text-slate-500
                    "
                  >
                    Amount (INR)
                  </label>

                  <div
                    className="
                      relative
                    "
                  >

                    <IndianRupee
                      size={15}
                      className="
                        absolute
                        left-3
                        top-1/2

                        -translate-y-1/2

                        text-slate-500
                      "
                    />

                    <input
                      type="number"
                      name="amount"
                      value={
                        formData.amount
                      }
                      onChange={
                        handleChange
                      }
                      required
                      className="
                        w-full

                        rounded-xl

                        border
                        border-slate-700

                        bg-slate-900

                        py-3
                        pl-9
                        pr-3

                        text-sm
                        font-bold

                        text-white

                        outline-none

                        focus:border-indigo-500
                        focus:ring-4
                        focus:ring-indigo-500/10
                      "
                    />

                  </div>

                </div>


                {/* DATE */}

                <div>

                  <label
                    className="
                      mb-2
                      block

                      text-[10px]

                      font-black

                      uppercase
                      tracking-widest

                      text-slate-500
                    "
                  >
                    Expense Date
                  </label>

                  <input
                    type="date"
                    name="expense_date"
                    value={
                      formData.expense_date
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="
                      w-full

                      rounded-xl

                      border
                      border-slate-700

                      bg-slate-900

                      px-3
                      py-3

                      text-sm
                      font-semibold

                      text-slate-200

                      outline-none

                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-500/10
                    "
                  />

                </div>


                {/* REMARKS */}

                <div
                  className="
                    sm:col-span-2
                  "
                >

                  <label
                    className="
                      mb-2
                      block

                      text-[10px]

                      font-black

                      uppercase
                      tracking-widest

                      text-slate-500
                    "
                  >
                    Remarks
                  </label>

                  <textarea
                    rows="3"
                    name="remarks"
                    value={
                      formData.remarks
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Add any notes about this expense..."
                    className="
                      w-full

                      resize-none

                      rounded-xl

                      border
                      border-slate-700

                      bg-slate-900

                      px-3
                      py-3

                      text-sm
                      font-medium

                      text-slate-200

                      placeholder:text-slate-600

                      outline-none

                      focus:border-indigo-500
                      focus:ring-4
                      focus:ring-indigo-500/10
                    "
                  />

                </div>


                {/* BUTTONS */}

                <div
                  className="
                    sm:col-span-2

                    flex
                    flex-col-reverse
                    sm:flex-row

                    justify-end

                    gap-2

                    border-t
                    border-slate-800

                    pt-5
                  "
                >

                  <button
                    type="button"
                    onClick={() => {

                      setShowExpenseModal(
                        false
                      );

                      cancelEdit();

                    }}
                    className="
                      rounded-xl

                      border
                      border-slate-700

                      px-5
                      py-3

                      text-xs
                      font-bold

                      text-slate-400

                      hover:bg-slate-800
                      hover:text-white

                      transition-all

                      cursor-pointer
                    "
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="
                      rounded-xl

                      bg-gradient-to-r
                      from-orange-500
                      to-indigo-600

                      px-6
                      py-3

                      text-xs
                      font-black

                      text-white

                      shadow-lg
                      shadow-indigo-500/20

                      hover:-translate-y-0.5

                      active:scale-95

                      transition-all

                      cursor-pointer
                    "
                  >

                    {editingId
                      ? "Update Expense"
                      : "Save Expense"}

                  </button>

                </div>

              </form>

            </div>

          </div>,

          document.body

        )}


      {/* =====================================================
          CATEGORY MODAL
      ===================================================== */}

      {showCategoryModal &&
        createPortal(

          <div
            className="
              fixed
              inset-0

              z-[9999]

              flex
              items-center
              justify-center

              bg-slate-950/60

              backdrop-blur-sm

              p-4
            "
          >

            <div
              className="
                w-full
                max-w-md

                rounded-[28px]

                border
                border-slate-700/70

                bg-[#111827]

                p-5
                sm:p-6

                shadow-2xl

                animate-[modalIn_.25s_ease-out]
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between

                  mb-5
                "
              >

                <div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <div
                      className="
                        flex

                        h-9
                        w-9

                        items-center
                        justify-center

                        rounded-xl

                        bg-indigo-500/10

                        text-indigo-400
                      "
                    >

                      <Tag
                        size={17}
                      />

                    </div>


                    <h2
                      className="
                        text-lg
                        font-black

                        text-white
                      "
                    >
                      Expense Categories
                    </h2>

                  </div>

                  <p
                    className="
                      mt-1

                      text-xs

                      text-slate-500
                    "
                  >
                    Manage your expense
                    classification.
                  </p>

                </div>


                <button
                  onClick={() => {

                    setShowCategoryModal(
                      false
                    );

                    setEditingCategoryId(
                      null
                    );

                    setNewCategory("");

                  }}
                  className="
                    flex

                    h-9
                    w-9

                    items-center
                    justify-center

                    rounded-xl

                    bg-slate-800

                    text-slate-400

                    hover:text-red-400

                    cursor-pointer
                  "
                >

                  <X
                    size={17}
                  />

                </button>

              </div>


              {/* ADD CATEGORY */}

              <div
                className="
                  flex
                  gap-2

                  mb-5
                "
              >

                <input
                  type="text"
                  value={
                    newCategory
                  }
                  onChange={(e) =>
                    setNewCategory(
                      e.target.value
                    )
                  }
                  placeholder="Category name"
                  className="
                    min-w-0
                    flex-1

                    rounded-xl

                    border
                    border-slate-700

                    bg-slate-900

                    px-3
                    py-3

                    text-sm
                    font-semibold

                    text-white

                    placeholder:text-slate-600

                    outline-none

                    focus:border-indigo-500
                  "
                />


                <button
                  type="button"
                  onClick={
                    saveCategory
                  }
                  className="
                    rounded-xl

                    bg-gradient-to-r
                    from-orange-500
                    to-indigo-600

                    px-5

                    text-xs
                    font-black

                    text-white

                    active:scale-95

                    transition-all

                    cursor-pointer
                  "
                >

                  {editingCategoryId
                    ? "Update"
                    : "Add"}

                </button>

              </div>


              {/* CATEGORIES */}

              <div
                className="
                  max-h-64

                  space-y-2

                  overflow-y-auto

                  scrollbar-none
                "
              >

                {categories.length ===
                0 ? (

                  <div
                    className="
                      rounded-2xl

                      border
                      border-dashed
                      border-slate-700

                      py-8

                      text-center
                    "
                  >

                    <Tag
                      size={22}
                      className="
                        mx-auto

                        text-slate-600
                      "
                    />

                    <p
                      className="
                        mt-2

                        text-xs

                        text-slate-500
                      "
                    >
                      No categories yet
                    </p>

                  </div>

                ) : (

                  categories.map(
                    (category) => (

                      <div
                        key={
                          category.id
                        }
                        className="
                          flex
                          items-center
                          justify-between

                          gap-3

                          rounded-xl

                          border
                          border-slate-800

                          bg-slate-900/70

                          px-3
                          py-3

                          transition-all

                          hover:border-slate-700
                          hover:bg-slate-800
                        "
                      >

                        <span
                          className="
                            min-w-0

                            truncate

                            text-xs

                            font-bold

                            text-slate-300
                          "
                        >
                          {category.name}
                        </span>


                        <div
                          className="
                            flex
                            flex-shrink-0

                            gap-1
                          "
                        >

                          <button
                            type="button"
                            onClick={() =>
                              editCategory(
                                category
                              )
                            }
                            className="
                              rounded-lg

                              px-2.5
                              py-1.5

                              text-[10px]

                              font-black

                              text-indigo-400

                              hover:bg-indigo-500/10

                              cursor-pointer
                            "
                          >
                            Edit
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              removeCategory(
                                category.id
                              )
                            }
                            className="
                              rounded-lg

                              px-2.5
                              py-1.5

                              text-[10px]

                              font-black

                              text-red-400

                              hover:bg-red-500/10

                              cursor-pointer
                            "
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    )
                  )

                )}

              </div>


              {/* CLOSE */}

              <div
                className="
                  mt-5

                  border-t
                  border-slate-800

                  pt-4

                  flex
                  justify-end
                "
              >

                <button
                  type="button"
                  onClick={() => {

                    setShowCategoryModal(
                      false
                    );

                    setEditingCategoryId(
                      null
                    );

                    setNewCategory("");

                  }}
                  className="
                    rounded-xl

                    border
                    border-slate-700

                    px-4
                    py-2.5

                    text-xs
                    font-bold

                    text-slate-400

                    hover:bg-slate-800
                    hover:text-white

                    transition-all

                    cursor-pointer
                  "
                >
                  Close
                </button>

              </div>

            </div>

          </div>,

          document.body

        )}


      {/* =====================================================
          NOTIFICATION
      ===================================================== */}

      <Notification
        show={
          notification.show
        }
        type={
          notification.type
        }
        message={
          notification.message
        }
        onClose={() =>
          setNotification(
            (prev) => ({
              ...prev,
              show: false,
            })
          )
        }
      />


      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style>{`

        @keyframes fadeIn {

          from {
            opacity: 0;
            transform: translateY(-5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }

        }


        @keyframes modalIn {

          from {
            opacity: 0;
            transform: translateY(12px) scale(.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }

        }

      `}</style>

    </div>

  );

}


export default CashBook;