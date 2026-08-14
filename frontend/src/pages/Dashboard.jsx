import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import DashboardCards from "../components/DashboardCards";
import SalesChart from "../components/SalesChart";
import TopProducts from "../components/TopProducts";
import PaymentChart from "../components/PaymentChart";
import LowStockWidget from "../components/LowStockWidget";
import SalesHeatmap from "../components/SalesHeatmap";
import Loader from "../components/Loader";

import { getExpenses } from "../services/expenseService";
import { useNavigate } from "react-router-dom";

import {
  getDashboardSummary,
  getSalesTrend,
  getTopProducts,
  getPaymentAnalytics,
  getSalesHeatmap,
} from "../services/dashboardService";

import { getIngredients } from "../services/ingredientService";

import {
  CircleCheckBig,
  TrendingUp,
  Calendar,
  ReceiptIndianRupee,
} from "lucide-react";


function Dashboard() {

  const [summary, setSummary] = useState({
    today_sales: 0,
    weekly_sales: 0,
    monthly_sales: 0,
    monthly_expense: 0,
    total_transactions: 0,
  });

  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [todayExpense, setTodayExpense] = useState(0);

  const navigate = useNavigate();


  /* =========================================================
      FETCH DATA
  ========================================================= */

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const fetchDashboardData = async () => {

    try {

      setLoading(true);

      const [
        summaryData,
        salesData,
        topProductsData,
        paymentData,
        ingredientData,
        heatmapData,
        expenseData,
      ] = await Promise.all([

        getDashboardSummary(),
        getSalesTrend(),
        getTopProducts(),
        getPaymentAnalytics(),
        getIngredients(),
        getSalesHeatmap(),
        getExpenses("today", "", ""),

      ]);


      setSummary(summaryData);

      setSalesData(salesData);

      setTopProducts(topProductsData);

      setPaymentData(paymentData);

      setIngredients(ingredientData);

      setHeatmapData(heatmapData);

      setTodayExpense(
        Number(expenseData?.total || 0)
      );

    }

    catch (error) {

      console.error(error);

    }

    finally {

      setLoading(false);

    }

  };


  /* =========================================================
      LOW STOCK
  ========================================================= */

  const lowStockIngredients = ingredients.filter(
    (ingredient) =>
      Number(ingredient.stock) <=
      Number(ingredient.minimum_stock)
  );


  /* =========================================================
      LOADING
  ========================================================= */

  if (loading) {

    return (
      <MainLayout>
        <Loader text="Loading dashboard..." />
      </MainLayout>
    );

  }


  /* =========================================================
      DASHBOARD
  ========================================================= */

  return (

    <MainLayout>

      <div
        className="
          relative
          min-h-full
          w-full

          overflow-hidden

          px-4
          py-5

          sm:px-5
          sm:py-6

          lg:px-7
          lg:py-6
        "

        style={{
          background: `
            radial-gradient(
              circle at 92% 4%,
              rgba(129, 140, 248, 0.32) 0%,
              rgba(165, 180, 252, 0.18) 18%,
              transparent 42%
            ),

            radial-gradient(
              circle at 5% 92%,
              rgba(251, 146, 60, 0.24) 0%,
              rgba(253, 186, 116, 0.12) 20%,
              transparent 44%
            ),

            radial-gradient(
              circle at 52% 45%,
              rgba(255, 255, 255, 0.95) 0%,
              rgba(248, 250, 252, 0.72) 32%,
              transparent 68%
            ),

            linear-gradient(
              135deg,
              #e8ebf4 0%,
              #f4f5fa 30%,
              #ffffff 52%,
              #f0f2fb 76%,
              #e6eaf7 100%
            )
          `,
        }}
      >

        {/* =====================================================
            SOFT LIGHT LAYER
        ====================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
          "
          style={{
            background: `
              linear-gradient(
                120deg,
                rgba(255,255,255,0.35),
                transparent 35%,
                rgba(255,255,255,0.18) 70%,
                transparent
              )
            `,
          }}
        />


        {/* =====================================================
            TOP RIGHT LIGHT
        ====================================================== */}

        <div
          className="
            pointer-events-none
            absolute

            right-[-120px]
            top-[-150px]

            h-[420px]
            w-[420px]

            rounded-full

            opacity-60

            blur-[80px]
          "
          style={{
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.24), rgba(129,140,248,0.06))",
          }}
        />


        {/* =====================================================
            BOTTOM LEFT WARM LIGHT
        ====================================================== */}

        <div
          className="
            pointer-events-none
            absolute

            bottom-[-180px]
            left-[-130px]

            h-[460px]
            w-[460px]

            rounded-full

            opacity-60

            blur-[85px]
          "
          style={{
            background:
              "linear-gradient(135deg, rgba(251,146,60,0.22), rgba(253,186,116,0.04))",
          }}
        />


        {/* =====================================================
            SMALL FLOATING LIGHT
        ====================================================== */}

        <div
          className="
            dashboard-light-one
            pointer-events-none
            absolute

            left-[42%]
            top-[20%]

            h-3
            w-3

            rounded-full

            bg-white/70

            shadow-[0_0_25px_rgba(99,102,241,0.25)]
          "
        />


        <div
          className="
            dashboard-light-two
            pointer-events-none
            absolute

            right-[28%]
            bottom-[22%]

            h-2
            w-2

            rounded-full

            bg-orange-300/40

            shadow-[0_0_20px_rgba(251,146,60,0.25)]
          "
        />


        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div
          className="
            relative
            z-10
            w-full
          "
        >

          {/* ===================================================
              HEADER
          =================================================== */}

          <div
            className="
              mb-6

              flex
              flex-col
              gap-4

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <span
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-widest

                  bg-gradient-to-r
                  from-orange-500
                  via-amber-500
                  to-indigo-500

                  bg-clip-text
                  text-transparent
                "
              >
                Enterprise Management Center
              </span>


              <h1
                className="
                  mt-0.5

                  text-2xl
                  font-black
                  tracking-tight

                  text-slate-800

                  sm:text-3xl
                "
              >
                Business Dashboard
              </h1>

            </div>


            {/* START BILLING */}

            <button
              onClick={() =>
                navigate("/billing")
              }
              className="
                flex
                w-full

                items-center
                justify-center
                gap-3

                rounded-2xl

                border
                border-slate-900

                bg-slate-900

                px-6
                py-2.5

                text-white

                shadow-[0_10px_30px_-12px_rgba(15,23,42,0.5)]

                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:bg-slate-800

                active:scale-[0.98]

                sm:w-auto
              "
            >

              <span
                className="
                  pl-1

                  text-[13px]
                  font-extrabold
                  uppercase
                  tracking-widest

                  text-slate-300
                "
              >
                Start Billing
              </span>


              <span
                className="
                  border-l
                  border-slate-500/60

                  pl-3

                  text-xs
                  font-medium

                  text-slate-400
                "
              >
                Open POS and begin taking orders
              </span>

            </button>

          </div>


          {/* ===================================================
              SUMMARY CARDS
          =================================================== */}

          <div
            className="
              grid
              grid-cols-1

              gap-4

              sm:grid-cols-2

              lg:grid-cols-5
            "
          >

            <DashboardCards
              icon={
                <CircleCheckBig size={18} />
              }

              title="Today's Sales"

              value={`₹${Number(
                summary.today_sales
              ).toLocaleString("en-IN")}`}
            />


            <DashboardCards
              icon={
                <TrendingUp size={18} />
              }

              title="Weekly Sales"

              value={`₹${Number(
                summary.weekly_sales
              ).toLocaleString("en-IN")}`}
            />


            <DashboardCards
              icon={
                <Calendar size={18} />
              }

              title="Monthly Sales"

              value={`₹${Number(
                summary.monthly_sales
              ).toLocaleString("en-IN")}`}
            />


            <DashboardCards
              icon={
                <ReceiptIndianRupee size={18} />
              }

              title="Transactions"

              value={Number(
                summary.total_transactions
              ).toLocaleString("en-IN")}
            />


            <DashboardCards
              icon={
                <ReceiptIndianRupee size={18} />
              }

              title="Monthly Expenses"

              value={`₹${Number(
                summary.monthly_expense
              ).toLocaleString("en-IN")}`}

              hint="Click to open →"

              onClick={() =>
                navigate(
                  "/dashboard/expenses"
                )
              }

              
            />

          </div>


          {/* ===================================================
              PAYMENT + HEATMAP
          =================================================== */}

          <div
            className="
              mt-5

              grid
              grid-cols-1

              gap-5

              xl:grid-cols-2
            "
          >

            <PaymentChart
              data={paymentData}
              todayExpense={todayExpense}
            />

            <SalesHeatmap
              data={heatmapData}
            />

          </div>


          {/* ===================================================
              LOW STOCK
          =================================================== */}

          <div className="mt-5">

            <LowStockWidget
              ingredients={
                lowStockIngredients
              }
            />

          </div>


          {/* ===================================================
              SALES + TOP PRODUCTS
          =================================================== */}

          <div
            className="
              mt-5

              grid
              grid-cols-1

              gap-5

              xl:grid-cols-2
            "
          >

            <SalesChart
              data={salesData}
            />

            <TopProducts
              products={topProducts}
            />

          </div>

        </div>

      </div>

    </MainLayout>
  );
}

export default Dashboard;