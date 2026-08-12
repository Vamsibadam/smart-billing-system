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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockIngredients = ingredients.filter(
    (ingredient) =>
      Number(ingredient.stock) <=
      Number(ingredient.minimum_stock)
  );

  if (loading) {
    return (
      <MainLayout>
        <Loader text="Loading dashboard..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full px-6 py-6 bg-transparent relative z-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-500 bg-clip-text text-transparent">
              Enterprise Management Center
            </span>

            <h1 className="text-2xl font-black tracking-tight text-slate-800 mt-0.5">
              Business Dashboard
            </h1>
          </div>



          <div className="flex items-center gap-2 px-3 py-1.5  shadow-3xs rounded-xl self-start sm:self-center">

            <button
              onClick={() => navigate("/billing")}
              className="
  flex-1 
  w-full 
  sm:max-w-md 
  flex 
  items-center 
  justify-center 
  gap-3 
  bg-slate-900 
  text-white 
  border border-slate-900
  px-6
  py-2.5 
  rounded-2xl 
  text-base 
  font-bold 
  tracking-wide 
  shadow-sm 
  hover:bg-transparent 
  hover:text-slate-800 
  hover:border-indigo-400/80
  transition-all 
  duration-200 
  cursor-pointer 
  self-stretch
  "
            >

              <span className="text-[13px] font-extrabold tracking-widest text-slate-400 uppercase pl-1">
                Start Billing</span>
              <span className="mt-2 text-slate-400 border-l border-slate-400/60">
                Open POS and begin taking orders
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardCards
            icon={<CircleCheckBig size={18} />}
            title="Today's Sales"
            value={`₹${Number(summary.today_sales).toLocaleString(
              "en-IN"
            )}`}
          />

          <DashboardCards
            icon={<TrendingUp size={18} />}
            title="Weekly Sales"
            value={`₹${Number(summary.weekly_sales).toLocaleString(
              "en-IN"
            )}`}
          />

          <DashboardCards
            icon={<Calendar size={18} />}
            title="Monthly Sales"
            value={`₹${Number(summary.monthly_sales).toLocaleString(
              "en-IN"
            )}`}
          />

          <DashboardCards
            icon={<ReceiptIndianRupee size={18} />}
            title="Transactions"
            value={Number(
              summary.total_transactions
            ).toLocaleString("en-IN")}
          />

          <DashboardCards
            icon={<ReceiptIndianRupee size={18} />}
            title="Monthly Expenses"
            value={`₹${Number(summary.monthly_expense).toLocaleString("en-IN")}`}
            hint="Click to open →"
            onClick={() => navigate("/dashboard/expenses")}
            className="bg-amber-500 border-slate-1000 hover:bg-slate-900 cursor-pointer hover:scale-105"
          />
        </div>


        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
          <PaymentChart
            data={paymentData}
            todayExpense={todayExpense}
          />
          <SalesHeatmap data={heatmapData} />
        </div>

        <div className="mt-5">
          <LowStockWidget
            ingredients={lowStockIngredients}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">
          <SalesChart data={salesData} />
          <TopProducts products={topProducts} />
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;