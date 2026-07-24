import api from "../api/axios";



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

export const getExpenses = async (
    filter = "today",
    from = "",
    to = ""
) => {

    let url = "/expenses/";

    if (filter === "custom") {

        url += `?from=${from}&to=${to}`;

    } else {

        url += `?filter=${filter}`;

    }

    const { data } = await api.get(url);

    return data;
};
export const getCategories = () =>
    api.get("/expenses/categories/");

export const createCategory = (data) =>
    api.post("/expenses/categories/", data);

export const updateCategory = (id, data) =>
    api.put(`/expenses/categories/${id}/`, data);

export const deleteCategory = (id) =>
    api.delete(`/expenses/categories/${id}/`);