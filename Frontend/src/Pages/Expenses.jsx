import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatCurrency";
import { useEffect, useState } from "react";
import { getExpenses, addExpense, deleteExpense } from "../api/api.js";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus, Trash2 } from "lucide-react";



function buildTimeline(transactions, mode) {
  const map = new Map();

  transactions.forEach((t) => {
    const date = new Date(t.date);
    let key;
    if (mode === "day") key = date.toISOString().substring(0, 10);
    else if (mode === "month")
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    else key = `${date.getFullYear()}`;

    const sortKey = date.getTime();

    if (!map.has(key)) map.set(key, { period: key, expense: 0, details: [] });
    map.get(key).expense += Number(t.amount);
    map.get(key).details.push({ name: t.name, amount: t.amount });
    map.get(key).sortKey = sortKey;
  });

  return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
}

function downloadCSV(transactions) {
  if (!transactions.length) return;
  const header = ["Name", "Amount", "Date"];
  const rows = transactions.map((tx) => [tx.name, tx.amount, tx.date]);
  const csvContent = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "expense_report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Expense() {
  const { user } = useContext(AuthContext);
  const currency = user?.currency || "USD";
  const today = new Date().toISOString().split("T")[0];

  const [summary, setSummary] = useState({ totalExpenses: 0 });
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ name: "", amount: "", date: today });
  const [mode, setMode] = useState("day");

  const [errors, setErrors] = useState({
    name: false,
    amount: false,
    date: false,
  });
  const [shake, setShake] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const expensesRes = await getExpenses();
      const mapped = expensesRes.data.map((e) => ({
        id: e._id,
        name: e.category,
        amount: e.amount,
        date: e.date.substring(0, 10),
      }));

      setTransactions(
        mapped.sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      setSummary({
        totalExpenses: mapped.reduce((sum, tx) => sum + Number(tx.amount), 0),
      });
    } catch (err) {
      console.error("Error loading expenses:", err);
    }
  };

  const handleAdd = async () => {
    const newErrors = {
      name: !form.name,
      amount: !form.amount,
      date: !form.date,
    };

    setErrors(newErrors);
    if (newErrors.name || newErrors.amount || newErrors.date) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    try {
      const res = await addExpense({
        category: form.name,
        amount: form.amount,
        date: form.date,
      });

      const newTx = {
        id: res.data._id || Date.now(),
        name: form.name,
        amount: form.amount,
        date: form.date,
      };

      setTransactions((prev) => [newTx, ...prev]);
      setSummary((prev) => ({
        totalExpenses: prev.totalExpenses + Number(form.amount),
      }));

      setForm({ name: "", amount: "", date: today });
      setErrors({ name: false, amount: false, date: false });
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const handleDelete = async (tx) => {
    try {
      await deleteExpense(tx.id);
      setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
      setSummary((prev) => ({
        totalExpenses: prev.totalExpenses - Number(tx.amount),
      }));
    } catch (err) {
      console.error("Error delete expense:", err);
    }
  };

  const timeline = buildTimeline(transactions, mode);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Expense */}
            <div
              className={`w-full max-h-80 bg-gradient-to-tr from-purple-50 via-white to-indigo-50 shadow-lg rounded-2xl p-5 sm:p-6 ${
                shake ? "shake" : ""
              }`}
            >
              <h4 className="font-semibold text-indigo-700 text-lg mb-4 text-center">
                Add Expense
              </h4>

              <input
                type="text"
                placeholder="Expense Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full border rounded-lg p-3 mb-1 text-sm outline-none ${
                  errors.name
                    ? "border-red-500"
                    : "focus:ring-2 focus:ring-indigo-400"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mb-2 normal-case">
                  Please enter expense name
                </p>
              )}

              <input
                type="number"
                placeholder="Expense Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={`w-full border rounded-lg p-3 mb-1 text-sm outline-none ${
                  errors.amount
                    ? "border-red-500"
                    : "focus:ring-2 focus:ring-indigo-400"
                }`}
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mb-2 normal-case">
                  Please enter amount
                </p>
              )}

              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`w-full border rounded-lg p-3 mb-2 text-sm outline-none ${
                  errors.date
                    ? "border-red-500"
                    : "focus:ring-2 focus:ring-indigo-400"
                }`}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mb-2">Please select date</p>
              )}

              <button
                onClick={handleAdd}
                className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white py-3 text-sm font-semibold rounded-lg shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Expense
              </button>
            </div>

            {/* Transactions */}
            <div className="w-full max-h-80 bg-white shadow rounded-2xl p-4 flex flex-col col-span-2">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-sm">Recent Expenses</h4>
                <button
                  onClick={() => downloadCSV(transactions)}
                  className="px-3 py-1 text-xs bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                >
                  Download Report
                </button>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                <span>Total Expense:</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(summary.totalExpenses, currency)}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-72 pr-2 scrollbar-hide">
                <ul className="space-y-2.5">
                  {transactions.map((tx) => (
                    <li
                      key={tx.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-lg">
                          💸
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {tx.name}
                          </p>
                          <p className="text-xs text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-red-500">
                          {formatCurrency(tx.amount, currency)}
                        </span>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(tx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white shadow rounded-xl p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Expense Trend</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("day")}
                  className={`px-3 py-1 text-xs rounded-md ${
                    mode === "day" ? "bg-red-500 text-white" : "bg-gray-100"
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setMode("month")}
                  className={`px-3 py-1 text-xs rounded-md ${
                    mode === "month" ? "bg-red-500 text-white" : "bg-gray-100"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setMode("year")}
                  className={`px-3 py-1 text-xs rounded-md ${
                    mode === "year" ? "bg-red-500 text-white" : "bg-gray-100"
                  }`}
                >
                  Year
                </button>
              </div>
            </div>

            <div className="w-full h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient
                      id="colorExpense"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(value, currency),
                      "Amount",
                    ]}
                    labelFormatter={(label) => {
                      const item = timeline.find((t) => t.period === label);
                      if (!item) return label;
                      return `${label}\n${item.details
                        .map((d) => `${d.name}`)
                        .join(", ")}`;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#dc2626"
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="py-16"></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
