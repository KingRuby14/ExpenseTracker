import { useEffect, useState } from "react";
import { getIncomes, addIncome, deleteIncome, downloadIncomesCSV } from "../api/api";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

export default function Incomes() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ amount: "", source: "", date: "", description: "" });
  const [loading, setLoading] = useState(false);

  const load = () => getIncomes().then(r=>setList(r.data)).catch(()=>setList([]));
  useEffect(()=>{ load() }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addIncome({ ...form, amount: Number(form.amount) });
      setForm({ amount: "", source: "", date: "", description: "" });
      load();
    } catch (err) {}
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if(!confirm("Delete this income?")) return;
    await deleteIncome(id);
    load();
  };

  const handleDownload = async () => {
    try {
      const res = await downloadIncomesCSV();
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "incomes.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err?.response?.data?.message || "No data to download");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar title="Incomes" />
        <div className="p-6">
          <div className="mb-6 grid grid-cols-2 gap-4">
            <form onSubmit={handleAdd} className="bg-white p-4 rounded shadow space-y-3">
              <h3 className="font-semibold">Add Income</h3>
              <input value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} placeholder="Amount" className="w-full border p-2 rounded" required />
              <input value={form.source} onChange={e=>setForm({...form, source:e.target.value})} placeholder="Source" className="w-full border p-2 rounded" required />
              <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className="w-full border p-2 rounded" required />
              <input value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Description" className="w-full border p-2 rounded" />
              <button disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">{loading ? "Adding..." : "Add Income"}</button>
            </form>

            <div className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Actions</h3>
                <button onClick={handleDownload} className="bg-indigo-600 text-white px-3 py-1 rounded">Download CSV</button>
              </div>
              <p className="text-sm text-gray-500">Export incomes CSV for the user.</p>
            </div>
          </div>

          <div className="bg-white rounded shadow overflow-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Source</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((i)=>(
                  <tr key={i._id} className="border-t">
                    <td className="p-2">₹{i.amount}</td>
                    <td className="p-2">{i.source}</td>
                    <td className="p-2">{new Date(i.date).toLocaleDateString()}</td>
                    <td className="p-2">{i.description}</td>
                    <td className="p-2">
                      <button onClick={()=>handleDelete(i._id)} className="text-red-600">Delete</button>
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
