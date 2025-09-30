import { useEffect, useState } from "react";
import api from "../api/api";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    api.get("/expenses").then((res) => setExpenses(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="font-bold text-xl mb-4">Expenses</h2>
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Amount</th>
            <th className="p-2">Category</th>
            <th className="p-2">Date</th>
            <th className="p-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e._id}>
              <td className="p-2">${e.amount}</td>
              <td className="p-2">{e.category}</td>
              <td className="p-2">{new Date(e.date).toLocaleDateString()}</td>
              <td className="p-2">{e.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
