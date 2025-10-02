import { useEffect, useState } from "react";
import {
  getIncomes,
  addIncome,
  deleteIncome,
} from "../api/api.js";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Plus, Trash2 } from "lucide-react";

// === Utility: group transactions by timeframe ===
function buildTimeline(transactions, mode) {
  const map = new Map();

  transactions.forEach((t) => {
    const date = new Date(t.date);
    let key;
    if (mode === "day") {
      key = date.toISOString().substring(0, 10); // yyyy-mm-dd
    } else if (mode === "month") {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    } else {
      key = `${date.getFullYear()}`;
    }

    const sortKey = date.getTime();

    if (!map.has(key)) {
      map.set(key, { period: key, income: 0, details: [] });
    }
    map.get(key).income += Number(t.amount);
    map.get(key).details.push({ name: t.source, amount: t.amount });
    map.get(key).sortKey = sortKey;
  });

  return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
}

// === Utility: download CSV ===
function downloadCSV(transactions) {
  if (!transactions.length) return;

  const header = ["Source", "Amount", "Date"];
  const rows = transactions.map((tx) => [tx.source, tx.amount, tx.date]);

  const csvContent =
    [header, ...rows].map((r) => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "income_report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Income() {
  const [summary, setSummary] = useState({ totalIncomes: 0 });
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ source: "", amount: "", date: "" });
  const [mode, setMode] = useState("day"); // day | month | year

  // Load incomes
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const incomesRes = await getIncomes();
      const mapped = incomesRes.data.map((e) => ({
        id: e._id,
        source: e.source,
        amount: e.amount,
        date: e.date.substring(0, 10),
      }));

      setTransactions(mapped.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setSummary({
        totalIncomes: mapped.reduce((sum, tx) => sum + Number(tx.amount), 0),
      });
    } catch (err) {
      console.error("Error loading incomes:", err);
    }
  };

  const handleAdd = async () => {
    if (!form.source || !form.amount || !form.date) return;
    try {
      const res = await addIncome({
        source: form.source,
        amount: form.amount,
        date: form.date,
      });

      const newTx = {
        id: res.data._id || Date.now(),
        source: form.source,
        amount: form.amount,
        date: form.date,
      };

      setTransactions((prev) => [newTx, ...prev]);
      setSummary((prev) => ({
        totalIncomes: prev.totalIncomes + Number(form.amount),
      }));

      setForm({ source: "", amount: "", date: "" });
    } catch (err) {
      console.error("Error adding income:", err);
    }
  };

  const handleDelete = async (tx) => {
    try {
      await deleteIncome(tx.id);
      setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
      setSummary((prev) => ({
        totalIncomes: prev.totalIncomes - Number(tx.amount),
      }));
    } catch (err) {
      console.error("Error deleting income:", err);
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
            {/* Add Income */}
            <div className="w-full max-h-80 bg-gradient-to-tr from-green-50 via-white to-emerald-50 shadow-lg rounded-2xl p-5 sm:p-6">
              <h4 className="font-semibold text-green-700 text-lg mb-4 text-center">
                Add Income
              </h4>

              <input
                type="text"
                placeholder="Source"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full border rounded-lg p-3 mb-3 text-sm focus:ring-2 focus:ring-green-400 outline-none"
              />
              <input
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border rounded-lg p-3 mb-3 text-sm focus:ring-2 focus:ring-green-400 outline-none"
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border rounded-lg p-3 mb-4 text-sm focus:ring-2 focus:ring-green-400 outline-none"
              />

              <button
                onClick={handleAdd}
                className="w-full bg-gradient-to-r from-green-600 via-emerald-500 to-lime-500 text-white py-3 text-sm font-semibold rounded-lg shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Income
              </button>
            </div>

            {/* Transactions */}
            <div className="w-full max-h-80 bg-white shadow rounded-2xl p-4 flex flex-col col-span-2">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-sm">Recent Incomes</h4>
                <button
                  onClick={() => downloadCSV(transactions)}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Download Report
                </button>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                <span>Total Income:</span>
                <span className="font-semibold text-green-600">₹{summary.totalIncomes}</span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-72 pr-2 scrollbar-hide">
                <ul className="space-y-2.5">
                  {transactions.map((tx) => (
                    <li
                      key={tx.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-lg">
                          💰
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {tx.source}
                          </p>
                          <p className="text-xs text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-green-600">
                          ₹{tx.amount}
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
              <h4 className="font-semibold">Income Overview</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("day")}
                  className={`px-3 py-1 text-xs rounded-md ${
                    mode === "day" ? "bg-purple-600 text-white" : "bg-gray-100"
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setMode("month")}
                  className={`px-3 py-1 text-xs rounded-md ${
                    mode === "month" ? "bg-purple-600 text-white" : "bg-gray-100"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setMode("year")}
                  className={`px-3 py-1 text-xs rounded-md ${
                    mode === "year" ? "bg-purple-600 text-white" : "bg-gray-100"
                  }`}
                >
                  Year
                </button>
              </div>
            </div>

            <div className="w-full h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline} barCategoryGap="30%">
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}`, "Amount"]}
                    labelFormatter={(label) => {
                      const item = timeline.find((t) => t.period === label);
                      if (!item) return label;
                      return `${label}\n${item.details
                        .map((d) => `${d.name}`)
                        .join(", ")}`;
                    }} />
                  <Bar
                    dataKey="income"
                    fill="#16a34a"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
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
