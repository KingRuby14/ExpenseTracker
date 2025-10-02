import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

//
// ---------- AUTH ----------
//
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getProfile = () => API.get("/auth/me");

//
// ---------- EXPENSES ----------
//
export const addExpense = (data) => API.post("/expenses", data);
export const getExpenses = (params) => API.get("/expenses", { params });
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

// ✅ Download Expenses CSV
export const downloadExpensesCSV = () =>
  API.get("/expenses/download/csv", { responseType: "blob" });

// ✅ Expenses by Category (for reports)
export const getExpensesByCategory = () =>
  API.get("/reports/expenses-by-category");

//
// ---------- INCOMES ----------
//
export const addIncome = (data) => API.post("/incomes", data);
export const getIncomes = (params) => API.get("/incomes", { params });
export const updateIncome = (id, data) => API.put(`/incomes/${id}`, data);
export const deleteIncome = (id) => API.delete(`/incomes/${id}`);

// ✅ Download Incomes CSV
export const downloadIncomesCSV = () =>
  API.get("/incomes/download/csv", { responseType: "blob" });

// ✅ Incomes by Category (optional reports)
export const getIncomesByCategory = () =>
  API.get("/reports/incomes-by-category");

//
// ---------- REPORTS ----------
//
export const getDashboard = () => API.get("/reports/summary");
export const getExpensesTimeline = () => API.get("/reports/timeline");
