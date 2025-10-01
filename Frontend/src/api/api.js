import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // change if deployed
});

// attach JWT
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const login = (payload) => api.post("/auth/login", payload);
export const register = (formData) => api.post("/auth/register", formData);
export const getProfile = () => api.get("/auth/me");

export const getDashboard = () => api.get("/reports/dashboard");
export const getExpensesByCategory = () =>
  api.get("/reports/expenses-by-category");
export const getExpensesTimeline = () =>
  api.get("/reports/expenses-timeline");
export const downloadExpensesCSV = (params) =>
  api.get("/reports/download/expenses", { params, responseType: "blob" });
export const downloadIncomesCSV = (params) =>
  api.get("/reports/download/incomes", { params, responseType: "blob" });

export const getExpenses = (params) => api.get("/expenses", { params });
export const addExpense = (payload) => api.post("/expenses", payload);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

export const getIncomes = (params) => api.get("/incomes", { params });
export const addIncome = (payload) => api.post("/incomes", payload);
export const deleteIncome = (id) => api.delete(`/incomes/${id}`);

export default api;
