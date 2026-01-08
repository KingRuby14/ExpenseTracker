import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { updateProfile } from "../api/api";
import { currencies } from "../utils/currencies";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

export default function Settings() {
  const { user, setUser, logout } = useContext(AuthContext);

  const [draftName, setDraftName] = useState("");
  const [draftCurrency, setDraftCurrency] = useState("USD");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);

  /* Sync draft state when user loads */
  useEffect(() => {
    if (user) {
      setDraftName(user.name || "");
      setDraftCurrency(user.currency || "USD");
      setPreview(user.avatar || "/default-avatar.png");
    }
  }, [user]);

  /* UPDATE PROFILE */
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", draftName);
      formData.append("currency", draftCurrency);
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await updateProfile(formData);

      // 🔥 Update global user (Sidebar auto-refreshes)
      setUser(res.data);

      // cleanup
      setAvatarFile(null);
    } catch (err) {
      console.error("Profile update failed", err);
    }
  };

  /* CANCEL */
  const handleCancel = () => {
    setDraftName(user.name);
    setDraftCurrency(user.currency);
    setPreview(user.avatar || "/default-avatar.png");
    setAvatarFile(null);
  };

  if (!user) return null;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-4 sm:p-6 space-y-6 max-w-xl w-full pb-24">
          <h2 className="text-xl font-bold">Account</h2>

          {/* PROFILE */}
          <div className="bg-white p-4 rounded shadow space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={preview}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover border"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setAvatarFile(file);
                  setPreview(URL.createObjectURL(file));
                }}
              />
            </div>

            <label className="block text-sm">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full bg-gray-100 p-2 rounded"
            />

            <label className="block text-sm mt-2">Name</label>
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* CURRENCY */}
          <div className="bg-white p-4 rounded shadow">
            <label className="block text-sm mb-1">Currency</label>
            <select
              value={draftCurrency}
              onChange={(e) => setDraftCurrency(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.label}
                </option>
              ))}
            </select>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUpdate}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Update
              </button>

              <button
                onClick={handleCancel}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* LOGOUT (MOBILE ONLY) */}
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
