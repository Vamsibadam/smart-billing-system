import api from "../api/axios";

export const getRecipe = async (
    productId
) => {

    const response =
        await api.get(
            `/products/${productId}/recipe/`
        );

    return response.data;

};
export const saveRecipe = async (
    productId,
    ingredients
) => {

    const response = await api.put(

        `/products/${productId}/recipe/`,

        {
            ingredients
        }

    );

    return response.data;

};

export const getCustomization = async (productId) => {
    const response = await api.get(
        `/products/${productId}/customization/`
    );

    return response.data;
};
