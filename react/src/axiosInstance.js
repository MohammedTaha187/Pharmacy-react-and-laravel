// src/axiosInstance.js
import axios from "axios";

// إنشاء نسخة من axios
const instance = axios.create({
  baseURL: "http://127.0.0.1:8000",  // رابط الAPI الأساسي
});

// Interceptor لتعديل الطلب قبل الإرسال
instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers.Accept = "application/json";
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

// Interceptor لمعالجة الردود
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // رجعه للوجن لو التوكن باظ
    }
    return Promise.reject(error);
  }
);

export default instance;
