import api from "../api/api";

export default function Reports() {
  const downloadFile = async (type) => {
    const res = await api.get(`/reports/download/${type}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${type}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="p-6">
      <h2 className="font-bold text-xl mb-4">Reports</h2>
      <div className="flex gap-4">
        <button onClick={() => downloadFile("expenses")} className="bg-blue-600 text-white px-4 py-2 rounded">
          Download Expenses CSV
        </button>
        <button onClick={() => downloadFile("incomes")} className="bg-green-600 text-white px-4 py-2 rounded">
          Download Incomes CSV
        </button>
      </div>
    </div>
  );
}
