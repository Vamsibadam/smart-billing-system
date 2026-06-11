import api from "../api/axios";

export const getStoreSettings =
  async () => {

    const response =
      await api.get(
        "/settings/"
      );

    return response.data;
};

export const updateStoreSettings =
  async (formData) => {

    const response =
      await api.put(
        "/settings/",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
};