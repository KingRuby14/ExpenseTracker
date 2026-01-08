import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/$/, "") 
    || "http://localhost:5000/api",
  timeout: 20000, // 20s safe timeout
});

// ---------- Attach Token ----------
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["Content-Type"] = "application/json";
  return config;
});

//
// ---------- AUTH ----------
//
export const register = (data) =>
  API.post("/auth/register", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const login = (data) => API.post("/auth/login", data);

export const getProfile = () => API.get("/auth/me");

//
// ---------- Forgot Password ----------
//

// Send OTP
export const sendOtp = (email) =>
  API.post("/auth/forgot", { email });

// Reset Password
export const resetPassword = ({ email, otp, password, confirmPassword }) =>
  API.post("/auth/reset", {
    email,
    otp,
    password,
    confirmPassword,
  });

//
// ---------- GOOGLE LOGIN ----------
export const googleLogin = (token) =>
  API.post("/auth/google", { token });


//
// ---------- EXPENSES ----------
export const addExpense = (data) => API.post("/expenses", data);
export const getExpenses = (params) => API.get("/expenses", { params });
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

export const downloadExpensesCSV = () =>
  API.get("/expenses/download/csv", { responseType: "blob" });

export const getExpensesByCategory = () =>
  API.get("/reports/expenses-by-category");

//
// ---------- INCOMES ----------
export const addIncome = (data) => API.post("/incomes", data);
export const getIncomes = (params) => API.get("/incomes", { params });
export const updateIncome = (id, data) => API.put(`/incomes/${id}`, data);
export const deleteIncome = (id) => API.delete(`/incomes/${id}`);

export const downloadIncomesCSV = () =>
  API.get("/incomes/download/csv", { responseType: "blob" });

export const getIncomesByCategory = () =>
  API.get("/reports/incomes-by-category");

//
// ---------- REPORTS ----------
export const getDashboard = () => API.get("/reports/summary");
export const getExpensesTimeline = () => API.get("/reports/timeline");

export default API;
