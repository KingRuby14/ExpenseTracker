import { useEffect, useState } from "react";
import api from "../api/api";
import ChartCard from "../Components/Chatcard";

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    api.get("/reports/dashboard").then((res) => setSummary(res.data));
    api.get("/reports/expenses-timeline").then((res) => setTimeline(res.data));
  }, []);

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded p-4">
          <h3>Total Income</h3>
          <p className="text-green-600 text-xl font-bold">${summary.totalIncomes}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3>Total Expense</h3>
          <p className="text-red-600 text-xl font-bold">${summary.totalExpenses}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3>Balance</h3>
          <p className="text-blue-600 text-xl font-bold">${summary.balance}</p>
        </div>
      </div>

      <ChartCard
        title="Expense Timeline"
        data={timeline.map((t) => ({
          month: `${t.month}/${t.year}`,
          total: t.total,
        }))}
      />
    </div>
  );
}
