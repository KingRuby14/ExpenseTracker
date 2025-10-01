import { useEffect, useState } from "react";
import { getExpenses, addExpense, deleteExpense, downloadExpensesCSV } from "../api/api";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

export default function Expenses() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ amount: "", category: "Food", date: "", description: "" });
  const [loading, setLoading] = useState(false);

  const load = () => getExpenses().then(r=>setList(r.data)).catch(()=>setList([]));

  useEffect(()=>{ load() }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addExpense({ ...form, amount: Number(form.amount) });
      setForm({ amount: "", category: "Food", date: "", description: "" });
      load();
    } catch (err) {}
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if(!confirm("Delete this expense?")) return;
    await deleteExpense(id);
    load();
  };

  const handleDownload = async () => {
    try {
      const res = await downloadExpensesCSV();
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "expenses.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err?.response?.data?.message || "No data to download");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar title="Expenses" />
        <div className="p-6">
          <div className="mb-6 grid grid-cols-2 gap-4">
            <form onSubmit={handleAdd} className="bg-white p-4 rounded shadow space-y-3">
              <h3 className="font-semibold">Add Expense</h3>
              <input value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} placeholder="Amount" className="w-full border p-2 rounded" required />
              <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="w-full border p-2 rounded">
                <option>Food</option><option>Transport</option><option>Bills</option><option>Shopping</option><option>Other</option>
              </select>
              <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="w-full border p-2 rounded" required />
              <input value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description" className="w-full border p-2 rounded" />
              <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? "Adding..." : "Add Expense"}</button>
            </form>

            <div className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Actions</h3>
                <button onClick={handleDownload} className="bg-indigo-600 text-white px-3 py-1 rounded">Download CSV</button>
              </div>
              <p className="text-sm text-gray-500">Export expenses CSV for the user.</p>
            </div>
          </div>

          <div className="bg-white rounded shadow overflow-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((e)=>(
                  <tr key={e._id} className="border-t">
                    <td className="p-2">₹{e.amount}</td>
                    <td className="p-2">{e.category}</td>
                    <td className="p-2">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="p-2">{e.description}</td>
                    <td className="p-2">
                      <button onClick={()=>handleDelete(e._id)} className="text-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
