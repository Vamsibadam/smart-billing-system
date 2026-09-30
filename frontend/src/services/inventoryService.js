import api from "../api/axios";

export const getInventory = async () => {
  const response = await api.get("/inventory/");
  return response.data;
};

export const getInventoryLogs = async (
  startDate,
  endDate,
  ingredientId = ""
) => {
  const response = await api.get("/inventory/logs/", {
    params: {
      start_date: startDate,
      end_date: endDate,
      ingredient: ingredientId || undefined,
    },
  });

  return response.data;
};