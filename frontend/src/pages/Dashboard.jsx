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
  ArrowRight,
  Sparkles,
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
      setTodayExpense(Number(expenseData?.total || 0));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
      LOW STOCK
  ========================================================= */
  const lowStockIngredients = ingredients.filter(
    (ingredient) =>
      Number(ingredient.stock) <= Number(ingredient.minimum_stock)
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
          px-3.5
          py-4
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
        {/* Soft Light Layer */}
        <div
          className="pointer-events-none absolute inset-0"
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

        {/* Top Right Ambient Glow */}
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

        {/* Bottom Left Ambient Glow */}
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

        {/* Ambient Floating Sparks */}
        <div className="pointer-events-none absolute left-[42%] top-[20%] h-3 w-3 rounded-full bg-white/70 shadow-[0_0_25px_rgba(99,102,241,0.25)]" />
        <div className="pointer-events-none absolute right-[28%] bottom-[22%] h-2 w-2 rounded-full bg-orange-300/40 shadow-[0_0_20px_rgba(251,146,60,0.25)]" />

        {/* =====================================================
            CONTENT CONTAINER
        ====================================================== */}
        <div className="relative z-10 w-full space-y-4 sm:space-y-6">
          {/* ===================================================
              PAGE HEADER
          =================================================== */}
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-500 bg-clip-text text-transparent">
                  Enterprise Management Center
                </span>
                <span className="inline-flex sm:hidden items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-orange-50 text-orange-600 border border-orange-200/60">
                  <Sparkles size={9} /> Live
                </span>
              </div>

              <h1 className="mt-0.5 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-800">
                Business Dashboard
              </h1>
            </div>

            {/* Quick Billing Action Button */}
            <button
              type="button"
              onClick={() => navigate("/billing")}
              className="
                group
                flex
                w-full
                sm:w-auto
                items-center
                justify-between
                sm:justify-center
                gap-3
                rounded-2xl
                border
                border-slate-800/80
                bg-slate-900
                px-4
                py-2.5
                sm:px-6
                text-white
                shadow-[0_10px_25px_-8px_rgba(15,23,42,0.45)]
                hover:shadow-lg
                hover:-translate-y-0.5
                active:scale-[0.98]
                transition-all
                duration-200
                cursor-pointer
              "
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs sm:text-[13px] font-black uppercase tracking-wider text-slate-200">
                  Start Billing
                </span>
              </div>

              <span className="hidden sm:inline-block border-l border-slate-700/80 pl-3 text-xs font-medium text-slate-400">
                Open POS and take orders
              </span>

              <ArrowRight size={14} className="sm:hidden text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* ===================================================
              SUMMARY CARDS
              (Mobile: 2-column layout | Desktop: 5-column layout)
          =================================================== */}
          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-2
              lg:grid-cols-5
              gap-2.5
              sm:gap-4
            "
          >
            {/* Card 1: Today's Sales */}
            <div className="col-span-1">
              <DashboardCards
                icon={<CircleCheckBig size={18} />}
                title="Today's Sales"
                value={`₹${Number(summary.today_sales).toLocaleString("en-IN")}`}
              />
            </div>

            {/* Card 2: Weekly Sales */}
            <div className="col-span-1">
              <DashboardCards
                icon={<TrendingUp size={18} />}
                title="Weekly Sales"
                value={`₹${Number(summary.weekly_sales).toLocaleString("en-IN")}`}
              />
            </div>

            {/* Card 3: Monthly Sales */}
            <div className="col-span-1">
              <DashboardCards
                icon={<Calendar size={18} />}
                title="Monthly Sales"
                value={`₹${Number(summary.monthly_sales).toLocaleString("en-IN")}`}
              />
            </div>

            {/* Card 4: Total Transactions */}
            <div className="col-span-1">
              <DashboardCards
                icon={<ReceiptIndianRupee size={18} />}
                title="Transactions"
                value={Number(summary.total_transactions).toLocaleString("en-IN")}
              />
            </div>

            {/* Card 5: Monthly Expenses (Full width on mobile grid for emphasis) */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <DashboardCards
                icon={<ReceiptIndianRupee size={18} />}
                title="Monthly Expenses"
                value={`₹${Number(summary.monthly_expense).toLocaleString("en-IN")}`}
                hint="View details →"
                onClick={() => navigate("/dashboard/expenses")}
              />
            </div>
          </div>

          {/* ===================================================
              PAYMENT + HEATMAP
          =================================================== */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
            <PaymentChart
              data={paymentData}
              todayExpense={todayExpense}
            />

            <SalesHeatmap
              data={heatmapData}
            />
          </div>

          {/* ===================================================
              LOW STOCK WIDGET
          =================================================== */}
          <div>
            <LowStockWidget
              ingredients={lowStockIngredients}
            />
          </div>

          {/* ===================================================
              SALES CHART + TOP PRODUCTS
          =================================================== */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
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