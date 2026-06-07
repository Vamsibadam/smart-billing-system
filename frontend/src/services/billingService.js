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