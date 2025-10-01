import { downloadExpensesCSV, downloadIncomesCSV, getExpensesByCategory } from "../api/api";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import { useEffect, useState } from "react";
import { SimplePie } from "../Components/ChartCard";

export default function Reports() {
  const [pie, setPie] = useState([]);

  useEffect(() => {
    getExpensesByCategory().then(r => setPie(r.data.map(i=>({ name: i.category, value: i.total })))) .catch(()=>setPie([]));
  },[]);

  const dl = async (fn, name) => {
    try {
      const res = await fn();
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err?.response?.data?.message || "No data to download");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar title="Reports" />
        <div className="p-6">
          <div className="mb-6 flex gap-3">
            <button onClick={() => dl(downloadExpensesCSV, "expenses.csv")} className="bg-blue-600 text-white px-4 py-2 rounded">Download Expenses CSV</button>
            <button onClick={() => dl(downloadIncomesCSV, "incomes.csv")} className="bg-green-600 text-white px-4 py-2 rounded">Download Incomes CSV</button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <SimplePie data={pie} />
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-gray-500">Use CSV downloads for reports. Use filters from backend by passing query params on the buttons if needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
