import api from "../api/axios";

export const getDashboardSummary = async () => {
  const response = await api.get("/dashboard/summary/");
  return response.data;
};

export const getSalesTrend = async () => {
  const response = await api.get(
    "/dashboard/sales-trend/"
  );

  return response.data;
};

export const getTopProducts = async () => {
  const response = await api.get(
    "/dashboard/top-products/"
  );

  return response.data;
};

export const getPaymentAnalytics =
  async () => {

    const response =
      await api.get(
        "/dashboard/payment-analytics/"
      );

    return response.data;
};

export const getLowStockProducts = async () => {
  const response = await api.get(
    "/dashboard/low-stock/"
  );

  return response.data;
};