import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile } from "../api/api";

export default function Sidebar() {
  const [user, setUser] = useState({});
  useEffect(() => {
    getProfile()
      .then((r) => setUser(r.data))
      .catch(() => {});
  }, []);
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-5">
      <div className="flex items-center gap-3 mb-6">
        <img
          src={user.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <div className="font-semibold">{user.name || "User"}</div>
          <div className="text-sm text-gray-500">{user.email || ""}</div>
        </div>
      </div>

      <nav className="flex flex-col gap-2 text-gray-700">
        <Link className="p-2 rounded hover:bg-gray-100" to="/">
          Dashboard
        </Link>
        <Link className="p-2 rounded hover:bg-gray-100" to="/expenses">
          Expenses
        </Link>
        <Link className="p-2 rounded hover:bg-gray-100" to="/incomes">
          Incomes
        </Link>
        <Link className="p-2 rounded hover:bg-gray-100" to="/reports">
          Reports
        </Link>

        <button
          className="mt-6 p-2 text-left rounded hover:bg-gray-100"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
