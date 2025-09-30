import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gradient-to-b from-pink-500 to-purple-600 text-white h-screen p-5">
      <h1 className="text-2xl font-bold mb-6">Expense Tracker</h1>
      <nav className="flex flex-col gap-3">
        <Link to="/">Dashboard</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/incomes">Incomes</Link>
        <Link to="/reports">Reports</Link>
      </nav>
    </div>
  );
}
