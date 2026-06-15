import api from "../api/axios";

export const getRangeReport =
  async (
    startDate,
    endDate
  ) => {

    const response =
      await api.get(
        `/reports/range/?start_date=${startDate}&end_date=${endDate}`
      );

    return response.data;
};

export const exportPdf =
  (
    startDate,
    endDate
  ) => {

    window.open(
      `${import.meta.env.VITE_API_URL}/api/reports/export/pdf/?start_date=${startDate}&end_date=${endDate}`
    );
};

export const exportExcel =
  (
    startDate,
    endDate
  ) => {

    window.open(
      `${import.meta.env.VITE_API_URL}/api/reports/export/excel/?start_date=${startDate}&end_date=${endDate}`
    );
};

export const exportCsv =
  (
    startDate,
    endDate
  ) => {

    window.open(
      `${import.meta.env.VITE_API_URL}/api/reports/export/csv/?start_date=${startDate}&end_date=${endDate}`
    );
};