import api from "../api/axios";

export const login = async (
  username,
  password
) => {

  const response =
    await api.post(
      "/auth/login/",
      {
        username,
        password,
      }
    );

  return response.data;
};

export const changePassword =
  async (
    currentPassword,
    newPassword
  ) => {

    const token =
      localStorage.getItem(
        "access_token"
      );

    const response =
      await api.post(
        "/auth/change-password/",
        {
          current_password:
            currentPassword,

          new_password:
            newPassword,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    return response.data;
};