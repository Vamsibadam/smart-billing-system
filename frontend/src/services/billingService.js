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
export const deductBillInventory = async (billId) => {
  try {
    console.log(
      "DEDUCTING INVENTORY FOR BILL:",
      billId
    );

    const response = await api.post(
      `/billing/${billId}/deduct-inventory/`
    );

    console.log(
      "INVENTORY SUCCESS:",
      response.data
    );

    return response.data;

  } catch (error) {

    console.error(
      "INVENTORY ERROR:",
      error.response?.status,
      error.response?.data
    );

    throw error;
  }
};
export const deductBillInventoryWithRetry = async (
  billId,
  retries = 5
) => {

  for (
    let attempt = 1;
    attempt <= retries;
    attempt++
  ) {

    try {

      return await deductBillInventory(
        billId
      );

    } catch (error) {

      const status =
        error.response?.status;

      console.error(
        `Inventory deduction attempt ${attempt} failed`,
        error
      );

      // ==========================================
      // 400 = PERMANENT / BUSINESS ERROR
      // ==========================================

      if (status === 400) {
        throw error;
      }

      // ==========================================
      // OTHER ERRORS = RETRY
      // ==========================================

      if (attempt === retries) {
        throw error;
      }

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            attempt * 3000
          )
      );
    }
  }
};