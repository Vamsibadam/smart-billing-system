import api from "../api/axios";

export const getInventory = async () => {
  const response = await api.get(
    "/inventory/"
  );

  return response.data;
};

export const getInventoryLogs =
  async () => {

    const response =
      await api.get(
        "/inventory/logs/"
      );

    return response.data;
};

export const addStock =
  async (data) => {

    const response =
      await api.post(
        "/inventory/add-stock/",
        data
      );

    return response.data;
};