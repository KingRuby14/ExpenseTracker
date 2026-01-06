import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getProfile = () => API.get("/auth/me");

export const addExpense = (data) => API.post("/expenses", data);
export const getExpenses = (params) => API.get("/expenses", { params });
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

export const downloadExpensesCSV = () =>
  API.get("/expenses/download/csv", { responseType: "blob" });

export const getExpensesByCategory = () =>
  API.get("/reports/expenses-by-category");

export const addIncome = (data) => API.post("/incomes", data);
export const getIncomes = (params) => API.get("/incomes", { params });
export const updateIncome = (id, data) => API.put(`/incomes/${id}`, data);
export const deleteIncome = (id) => API.delete(`/incomes/${id}`);

export const downloadIncomesCSV = () =>
  API.get("/incomes/download/csv", { responseType: "blob" });

export const getIncomesByCategory = () =>
  API.get("/reports/incomes-by-category");

export const getDashboard = () => API.get("/reports/summary");
export const getExpensesTimeline = () => API.get("/reports/timeline");
export default API;
