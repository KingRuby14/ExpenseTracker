import { useEffect, useState } from "react";
import api from "../api/api";

export default function Incomes() {
  const [incomes, setIncomes] = useState([]);

  useEffect(() => {
    api.get("/incomes").then((res) => setIncomes(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="font-bold text-xl mb-4">Incomes</h2>
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Amount</th>
            <th className="p-2">Source</th>
            <th className="p-2">Date</th>
            <th className="p-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {incomes.map((i) => (
            <tr key={i._id}>
              <td className="p-2">${i.amount}</td>
              <td className="p-2">{i.source}</td>
              <td className="p-2">{new Date(i.date).toLocaleDateString()}</td>
              <td className="p-2">{i.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
