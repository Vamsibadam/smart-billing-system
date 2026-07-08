import api from "../api/axios";

export const searchProducts = async (query) => {
  const response = await api.get(
    `/products/search/?q=${query}`
  );

  return response.data;
};

export const createBill = async (
  items,
  payments
) => {

  const response = await api.post(
    "/billing/create/",
    {
      items,
      payments,
    }
  );

  return response.data;
};

export const getBillHistory =
  async (date = "") => {

    let url =
      "/billing/history/";

    if (date) {
      url += `?date=${date}`;
    }

    const response =
      await api.get(url);

    return response.data;
};

export const getBillDetail =
  async (id) => {

    const response =
      await api.get(
        `/billing/history/${id}/`
      );

    return response.data;
};

export const deleteBill =
  async (id) => {

    await api.delete(
      `/billing/history/${id}/delete/`
    );
};

export const getBillDetails =
  async (id) => {

    const response =
      await api.get(
        `/billing/history/${id}/`
      );

    return response.data;
};

export const getProducts = async () => {
  const response = await api.get("/products/");
  return response.data;
};