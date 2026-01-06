import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile } from "../api/api";
import { LayoutDashboard, Wallet, TrendingUp, LogOut } from "lucide-react";

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    getProfile()
      .then((r) => setUser(r.data))
      .catch(() => setUser(null));
  }, []);

  const isActive = (path) =>
    location.pathname === path
      ? "bg-purple-100 text-purple-700 font-semibold"
      : "";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-48 bg-white border-r min-h-screen p-5">
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <img
            src={
              user?.avatar
                ? user.avatar
                : "/default-avatar.png"
            }
            alt="avatar"
            className="w-14 h-14 rounded-full object-cover border-2 border-purple-500"
          />
          <div className="text-center">
            <div className="font-semibold">{user?.name || "User"}</div>
            <div className="text-sm text-gray-900 normal-case">{user?.email || ""}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 text-gray-700">
          <Link
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${isActive(
              "/"
            )}`}
            to="/"
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          <Link
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${isActive(
              "/incomes"
            )}`}
            to="/incomes"
          >
            <TrendingUp size={18} /> Incomes
          </Link>

          <Link
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${isActive(
              "/expenses"
            )}`}
            to="/expenses"
          >
            <Wallet size={18} /> Expenses
          </Link>

          <button
            className="flex items-center gap-2 mt-6 p-2 text-left rounded hover:bg-gray-100 text-red-600"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      {/* Mobile/Tablet Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-2 z-50">
        <Link
          to="/"
          className={`flex flex-col items-center text-xs ${
            location.pathname === "/" ? "text-purple-600" : "text-gray-600"
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/incomes"
          className={`flex flex-col items-center text-xs ${
            location.pathname === "/incomes"
              ? "text-purple-600"
              : "text-gray-600"
          }`}
        >
          <TrendingUp size={20} />
          <span>Incomes</span>
        </Link>

        <Link
          to="/expenses"
          className={`flex flex-col items-center text-xs ${
            location.pathname === "/expenses"
              ? "text-purple-600"
              : "text-gray-600"
          }`}
        >
          <Wallet size={20} />
          <span>Expenses</span>
        </Link>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="flex flex-col items-center text-xs text-red-600"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </>
  );
}
