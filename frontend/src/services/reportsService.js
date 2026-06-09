import api from "../api/axios";

export const getDailyReport =
  async () => {
    const response =
      await api.get(
        "/reports/daily/"
      );

    return response.data;
};

export const getWeeklyReport =
  async () => {
    const response =
      await api.get(
        "/reports/weekly/"
      );

    return response.data;
};

export const getMonthlyReport =
  async () => {
    const response =
      await api.get(
        "/reports/monthly/"
      );

    return response.data;
};
export const getCustomReport =
  async (date) => {

    const response =
      await api.get(
        `/reports/custom/?date=${date}`
      );

    return response.data;
};