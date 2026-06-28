import api from "../api/axios";

export const getCombo = async (productId) => {
  const response = await api.get(
    `/products/${productId}/combo/`
  );

  return response.data;
};

export const saveCombo = async (
  productId,
  items
) => {
  const response = await api.put(
    `/products/${productId}/combo/`,
    {
      items,
    }
  );

  return response.data;
};