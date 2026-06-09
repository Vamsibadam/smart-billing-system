import api from "../api/axios";

export const searchProducts = async (query) => {
  const response = await api.get(
    `/products/search/?q=${query}`
  );

  return response.data;
};

export const createBill = async (
  items,
  paymentMethod
) => {

  const response = await api.post(
    "/billing/create/",
    {
      items,
      payment_method:
        paymentMethod,
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