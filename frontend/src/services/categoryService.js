import api from "../api/axios";

export const getCategories = async () => {
    const response = await api.get("/products/categories/");
    return response.data;
};

export const createCategory = async (data) => {
    const response = await api.post("/products/categories/", data);
    return response.data;
};

export const updateCategory = async (id, data) => {
    const response = await api.put(`/products/categories/${id}/`, data);
    return response.data;
};

export const deleteCategory = async (id) => {
    await api.delete(`/products/categories/${id}/`);
};