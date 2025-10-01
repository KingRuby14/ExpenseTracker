import { useEffect, useState } from "react";
import { getDashboard, getExpensesByCategory, getExpensesTimeline } from "../api/api";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { LineChartCard, SimplePie } from "../Components/ChartCard.jsx";

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [pie, setPie] = useState([]);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    getDashboard().then((r) => setSummary(r.data)).catch(()=>{});
    getExpensesByCategory().then((r)=>{
      setPie(r.data.map(i=>({name:i.category, value:i.total})));
    }).catch(()=>{});
    getExpensesTimeline().then((r)=>{
      setTimeline(r.data.map(t=>({ month: `${t.month}/${t.year}`, total: t.total })));
    }).catch(()=>{});
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar title="Dashboard" />
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white shadow rounded p-4">
              <h4 className="text-sm text-gray-500">Total Income</h4>
              <div className="text-2xl font-bold">₹{summary.totalIncomes ?? 0}</div>
            </div>
            <div className="bg-white shadow rounded p-4">
              <h4 className="text-sm text-gray-500">Total Expenses</h4>
              <div className="text-2xl font-bold">₹{summary.totalExpenses ?? 0}</div>
            </div>
            <div className="bg-white shadow rounded p-4">
              <h4 className="text-sm text-gray-500">Balance</h4>
              <div className="text-2xl font-bold">₹{summary.balance ?? 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <SimplePie data={pie} />
            <LineChartCard title="Last months" data={timeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
