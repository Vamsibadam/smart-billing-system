import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ============================================================
// ATTACH ACCESS TOKEN
// ============================================================

api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("access_token");

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ============================================================
// REFRESH ACCESS TOKEN WHEN EXPIRED
// ============================================================

api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest =
      error.config;

    // Only handle 401 once
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;

      const refreshToken =
        localStorage.getItem(
          "refresh_token"
        );

      // No refresh token → login required
      if (!refreshToken) {

        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "refresh_token"
        );

        localStorage.removeItem(
          "username"
        );

        window.location.href = "/";

        return Promise.reject(error);
      }

      try {

        const response =
          await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );

        const newAccessToken =
          response.data.access;

        localStorage.setItem(
          "access_token",
          newAccessToken
        );

        // Update original request
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        // Retry original request
        return api(originalRequest);

      } catch (refreshError) {

        // Refresh token expired/invalid
        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "refresh_token"
        );

        localStorage.removeItem(
          "username"
        );

        window.location.href = "/";

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;