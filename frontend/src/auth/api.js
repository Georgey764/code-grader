import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_URL;

const api = axios.create({
  baseURL: baseURL,
});

// Logic variables for the "Wait Queue"
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    // 1. Grab the latest token from localStorage
    const token = localStorage.getItem("access_token");

    // 2. If the token exists, add it to the Authorization header
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request errors here
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 1. If a refresh is ALREADY happening, wrap this request in a
        // new Promise and push it to the queue.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // 2. If this is the FIRST 401, start the refresh process
      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        axios
          .post(
            "https://api.yourdomain.com/api/token/refresh/",
            {},
            { withCredentials: true },
          )
          .then(({ data }) => {
            const newToken = data.accessToken;
            localStorage.setItem("access_token", newToken);

            // Set the header for the current request
            api.defaults.headers.common["Authorization"] = "Bearer " + newToken;
            originalRequest.headers["Authorization"] = "Bearer " + newToken;

            // Resolve all other pending requests in the queue
            processQueue(null, newToken);

            resolve(api(originalRequest));
          })
          .catch((err) => {
            // If refresh fails, reject everything in the queue and log out
            processQueue(err, null);
            localStorage.removeItem("access_token");
            window.location.href = "/login";
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  },
);

export default api;
