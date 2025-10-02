import { useEffect, useState } from "react";
import {
  getDashboard,
  getExpenses,
  getIncomes,
  addExpense,
  addIncome,
  deleteExpense,
  deleteIncome,
} from "../api/api.js";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Plus, Trash2, Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

// === Utility: group transactions by day/week/month ===
function buildTimeline(transactions, view = "month") {
  const map = new Map();

  transactions.forEach((t) => {
    const date = new Date(t.date);
    let key = "";
    let sortKey = 0;

    if (view === "day") {
      key = date.toISOString().substring(0, 10);
      sortKey = date.getTime();
    } else if (view === "week") {
      const week = Math.ceil((date.getDate() - date.getDay()) / 7) + 1;
      key = `W${week}/${date.getMonth() + 1}/${date.getFullYear()}`;
      sortKey = date.getTime();
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      sortKey = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    }

    if (!map.has(key)) {
      map.set(key, { period: key, income: 0, expense: 0, sortKey });
    }
    if (t.type === "income") map.get(key).income += Number(t.amount);
    else map.get(key).expense += Number(t.amount);
  });

  return Array.from(map.values()).sort((a, b) => a.sortKey - b.sortKey);
}

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalIncomes: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [view, setView] = useState("day");
  const [form, setForm] = useState({
    type: "income",
    name: "",
    amount: "",
    date: "",
  });

  // Load data on mount and every 5s to reflect external API changes
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTimeline(buildTimeline(transactions, view));
  }, [transactions, view]);

  const loadData = async () => {
    try {
      const dashboardRes = await getDashboard();
      setSummary(dashboardRes.data);

      const expensesRes = await getExpenses();
      const incomesRes = await getIncomes();

      const merged = [
        ...expensesRes.data.map((e) => ({
          id: e._id,
          type: "expense",
          icon: "💸",
          name: e.category,
          amount: e.amount,
          date: e.date.substring(0, 10),
        })),
        ...incomesRes.data.map((i) => ({
          id: i._id,
          type: "income",
          icon: "💰",
          name: i.source,
          amount: i.amount,
          date: i.date.substring(0, 10),
        })),
      ];

      // Sort descending by date
      setTransactions(merged.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleAdd = async () => {
    if (!form.name || !form.amount || !form.date) return;

    try {
      const payload = {
        amount: form.amount,
        date: form.date,
      };
      let newTx = null;

      if (form.type === "income") {
        const res = await addIncome({ ...payload, source: form.name });
        newTx = {
          id: res.data._id || Date.now(),
          type: "income",
          icon: "💰",
          name: form.name,
          amount: form.amount,
          date: form.date,
        };
      } else {
        const res = await addExpense({ ...payload, category: form.name });
        newTx = {
          id: res.data._id || Date.now(),
          type: "expense",
          icon: "💸",
          name: form.name,
          amount: form.amount,
          date: form.date,
        };
      }

      setTransactions((prev) => [newTx, ...prev]);

      // Update summary locally
      setSummary((prev) => {
        let income = prev.totalIncomes;
        let expense = prev.totalExpenses;
        if (form.type === "income") income += Number(form.amount);
        else expense += Number(form.amount);
        return {
          totalIncomes: income,
          totalExpenses: expense,
          balance: income - expense,
        };
      });

      setForm({ type: "income", name: "", amount: "", date: "" });
    } catch (err) {
      console.error("Error adding transaction:", err);
    }
  };

  const handleDelete = async (tx) => {
    try {
      if (tx.type === "income") await deleteIncome(tx.id);
      else await deleteExpense(tx.id);

      setTransactions((prev) => prev.filter((t) => t.id !== tx.id));

      // Update summary locally
      setSummary((prev) => {
        let income = prev.totalIncomes;
        let expense = prev.totalExpenses;
        if (tx.type === "income") income -= Number(tx.amount);
        else expense -= Number(tx.amount);
        return {
          totalIncomes: income,
          totalExpenses: expense,
          balance: income - expense,
        };
      });
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  const filteredTx =
    filterType === "all"
      ? transactions
      : transactions.filter((t) => t.type === filterType);

  return (
    <div className="flex bg-gray-50 min-h-screen capitalize">
      <Sidebar />
      <div className="flex-1 flex flex-col capitalize">
        <Navbar />
        <div className="p-4 sm:p-6 space-y-6 capitalize">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 capitalize">
            {/* Add Transaction */}
            <div className="bg-gradient-to-tr from-purple-50 via-white to-indigo-50 shadow-lg rounded-2xl p-5 sm:p-6 capitalize">
              <h4 className="font-semibold text-indigo-700 text-lg mb-4 text-center">
                Add Transaction
              </h4>
              <div className="flex justify-center gap-4 mb-4">
                {["income", "expense"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, type: t })}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      form.type === t
                        ? t === "income"
                          ? "bg-green-500 text-white shadow"
                          : "bg-red-500 text-white shadow"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg p-3 mb-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              />
              <input
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border rounded-lg p-3 mb-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border rounded-lg p-3 mb-4 text-sm focus:ring-2 focus:ring-indigo-400 outline-none uppercase"
              />

              <button
                onClick={handleAdd}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3 text-sm font-semibold rounded-lg shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Transaction
              </button>
            </div>

            {/* Summary */}
            <div className="flex flex-col gap-4 capitalize">
              <SummaryCard
                icon={<ArrowDownCircle size={22} />}
                label="Income"
                value={summary.totalIncomes}
                color="green"
              />
              <SummaryCard
                icon={<ArrowUpCircle size={22} />}
                label="Expense"
                value={summary.totalExpenses}
                color="red"
              />
              <SummaryCard
                icon={<Wallet size={22} />}
                label="Balance"
                value={summary.balance}
                color="indigo"
              />
            </div>

            {/* Transactions */}
            <div className="bg-white shadow rounded-2xl p-4 flex flex-col capitalize">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-xs sm:text-sm">
                  Recent Transactions
                </h4>
                <div className="space-x-2 flex capitalize">
                  {["all", "income", "expense"].map((f) => (
                    <button
                      key={f}
                      className={`px-2 py-1 rounded text-xs ${
                        filterType === f
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100"
                      }`}
                      onClick={() => setFilterType(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto max-h-80 pr-2 scrollbar-hide">
                <ul className="space-y-2.5">
                  {filteredTx.map((tx) => (
                    <li
                      key={tx.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-lg">
                          {tx.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {tx.name}
                          </p>
                          <p className="text-xs text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-bold ${
                            tx.type === "income"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
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
            <div className="flex flex-wrap justify-between items-center mb-4">
              <h4 className="font-semibold">Income & Expense</h4>
              <div className="space-x-2 mt-2 sm:mt-0">
                {["day", "week", "month"].map((v) => (
                  <button
                    key={v}
                    className={`px-3 py-1 rounded text-xs sm:text-sm ${
                      view === v ? "bg-indigo-600 text-white" : "bg-gray-100"
                    }`}
                    onClick={() => setView(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={buildTimeline(transactions, view)}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#16a34a"
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
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

// Summary card
function SummaryCard({ icon, label, value, color }) {
  const colors = {
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };
  return (
    <div className="bg-white shadow rounded-xl p-4 flex items-center gap-3">
      <div className={`w-10 h-10 flex items-center justify-center rounded-full ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <h4 className="text-xs sm:text-sm text-gray-500">{label}</h4>
        <div className={`text-base sm:text-lg font-bold ${colors[color].split(" ")[1]}`}>
          ₹{value ?? 0}
        </div>
      </div>
    </div>
  );
}
