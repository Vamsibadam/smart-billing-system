import api from "../api/axios";

export const searchProducts = async (query) => {
  const response = await api.get(
    `/products/search/?q=${query}`
  );

  return response.data;
};

export const createBill = async (
  items,
  payments,
  productDiscountId = null,
  directDiscountPercentage = 0
) => {

  const response = await api.post(
    "/billing/create/",
    {
      items,
      payments,

      product_discount_id:
        productDiscountId,

      direct_discount_percentage:
        directDiscountPercentage,
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

export const getDiscounts = async () => {
  const response = await api.get("/billing/discounts/");
  return response.data;
};
export const createDiscount = async (data) => {
  const response = await api.post(
    "/billing/discounts/",
    data
  );
  return response.data;
};

export const updateDiscount = async (id, data) => {
  const response = await api.patch(
    `/billing/discounts/${id}/`,
    data
  );
  return response.data;
};

export const deleteDiscount = async (id) => {
  const response = await api.delete(
    `/billing/discounts/${id}/`
  );
  return response.data;
};