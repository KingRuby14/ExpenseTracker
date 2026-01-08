import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Settings as SettingsIcon,
} from "lucide-react";

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "bg-purple-100 text-purple-700 font-semibold"
      : "";

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r min-h-screen p-5">
        {/* Profile */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-14 h-14 rounded-full object-cover border-2 border-purple-500"
          />
          <div className="text-center">
            <div className="font-semibold">{user?.name}</div>
            <div className="text-sm text-gray-600">{user?.email}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 text-gray-700">
          <Link
            to="/"
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${isActive(
              "/"
            )}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          <Link
            to="/incomes"
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${isActive(
              "/incomes"
            )}`}
          >
            <TrendingUp size={18} /> Incomes
          </Link>

          <Link
            to="/expenses"
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${isActive(
              "/expenses"
            )}`}
          >
            <Wallet size={18} /> Expenses
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-2 p-2 rounded hover:bg-gray-100 ${isActive(
              "/settings"
            )}`}
          >
            <SettingsIcon size={18} /> Account
          </Link>
        </nav>
      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}
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

        <Link
          to="/settings"
          className={`flex flex-col items-center text-xs ${
            location.pathname === "/settings"
              ? "text-purple-600"
              : "text-gray-600"
          }`}
        >
          <SettingsIcon size={20} />
          <span>Account</span>
        </Link>
      </nav>
    </>
  );
}
