import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";
import DashboardCards from "../components/DashboardCards";
import SalesChart from "../components/SalesChart";
import TopProducts from "../components/TopProducts";
import PaymentChart from "../components/PaymentChart";
import LowStockWidget from "../components/LowStockWidget";

import {
  getDashboardSummary,
  getSalesTrend,
  getTopProducts,
  getPaymentAnalytics,
  getLowStockProducts,
} from "../services/dashboardService";

function Dashboard() {
  const [summary, setSummary] = useState({
    today_sales: 0,
    weekly_sales: 0,
    monthly_sales: 0,
    total_transactions: 0,
  });

  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    fetchSummary();
    fetchSalesTrend();
    fetchTopProducts();
    fetchPaymentAnalytics();
    fetchLowStockProducts();
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSalesTrend = async () => {
    try {
      const data = await getSalesTrend();
      setSalesData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const data = await getTopProducts();
      setTopProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPaymentAnalytics = async () => {
    try {
      const data = await getPaymentAnalytics();
      setPaymentData(data);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchLowStockProducts =
  async () => {
    try {
      const data = await getLowStockProducts();
        console.log("LOW STOCK DATA:", data);
      setLowStockProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

return (
  <MainLayout>

    <div className="mb-6">

      <h1 className="text-4xl font-bold text-slate-800">
        Dashboard
      </h1>

      <p className="text-slate-500 mt-2">
        Sales analytics and business overview
      </p>

    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      <DashboardCards
        title="Today's Sales"
        value={`₹ ${summary.today_sales}`}
      />

      <DashboardCards
        title="Weekly Sales"
        value={`₹ ${summary.weekly_sales}`}
      />

      <DashboardCards
        title="Monthly Sales"
        value={`₹ ${summary.monthly_sales}`}
      />

      <DashboardCards
        title="Transactions"
        value={summary.total_transactions}
      />

    </div>

    <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
      <SalesChart data={salesData} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

      <TopProducts
        products={topProducts}
      />

      <PaymentChart
        data={paymentData}
      />

      <LowStockWidget
        products={lowStockProducts}
      />

    </div>

  </MainLayout>
);
}

export default Dashboard;