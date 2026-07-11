import api from "../api/axios";

export const getExpenses = async (date) => {

  const response = await api.get(
    `/expenses/?date=${date}`
  );

  return response.data;

};

export const createExpense = async (data) => {

  const response = await api.post(
    "/expenses/",
    data
  );

  return response.data;

};

export const updateExpense = async (
  id,
  data
) => {

  const response = await api.put(
    `/expenses/${id}/`,
    data
  );

  return response.data;

};

export const deleteExpense = async (
  id
) => {

  await api.delete(
    `/expenses/${id}/`
  );

};

export const getExpenseCategories = async () => {

  const response = await api.get(
    "/expenses/categories/"
  );

  return response.data;

};