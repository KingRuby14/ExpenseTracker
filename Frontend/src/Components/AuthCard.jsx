import { useState } from "react";
import { login, register } from "../api/api";

export default function AuthCard({ onAuth }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", avatar: null });
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(loginForm);
      localStorage.setItem("token", res.data.token);
      onAuth();
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("name", regForm.name);
      fd.append("email", regForm.email);
      fd.append("password", regForm.password);
      if (regForm.avatar) fd.append("avatar", regForm.avatar);

      const res = await register(fd);
      localStorage.setItem("token", res.data.token);
      onAuth();
    } catch (err) {
      setError(err?.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-[1000px] h-[600px] bg-white shadow-2xl rounded-2xl flex overflow-hidden">

        {/* LEFT SIDE: LOGIN / REGISTER */}
        <div className="w-1/2 p-10 flex items-center justify-center relative">
          <div
            className={`absolute w-full transition-transform duration-700 ${isFlipped ? "rotate-y-180" : ""}`}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* LOGIN */}
            <div className="absolute -top-40 p-6 backface-hidden items-center justify-center">
              <h2 className="text-xl font-bold mb-2">Welcome Back</h2>
              <p className="text-gray-500 mb-6 text-sm">Please enter your details to log in</p>
              {error && <div className="text-red-500 mb-2">{error}</div>}
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  className="w-full border p-3 rounded bg-gray-50"
                  placeholder="Email Address"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
                <input
                  className="w-full border p-3 rounded bg-gray-50"
                  placeholder="Password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
                <button className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700">
                  LOGIN
                </button>
                <p className="text-center text-sm">
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    className="text-purple-600"
                    onClick={() => setIsFlipped(true)}
                  >
                    SignUp
                  </button>
                </p>
              </form>
            </div>

            {/* REGISTER */}
            <div
              className="absolute -top-52 p-6 rotate-y-180 backface-hidden"
              style={{ transform: "rotateY(180deg)" }}
            >
              <h2 className="text-xl font-bold mb-2">Create an Account</h2>
              <p className="text-gray-500 mb-6 text-sm">Join us today by entering your details below.</p>
              {error && <div className="text-red-500 mb-2">{error}</div>}
              <form onSubmit={handleRegister} className="space-y-4">
                <div  className="rounded-full w-20 h-20 border-red-700 bg-black">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute top-40 right-36"
                    onChange={(e) => setRegForm({ ...regForm, avatar: e.target.files[0] })}
                  />
                </div>
                <input
                  className="w-full border p-3 rounded bg-gray-50"
                  placeholder="Full Name"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  required
                />
                <input
                  className="w-full border p-3 rounded bg-gray-50"
                  placeholder="Email Address"
                  type="email"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  required
                />
                <input
                  className="w-full border p-3 rounded bg-gray-50"
                  placeholder="Password"
                  type="password"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  required
                />
                <button className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700">
                  SIGN UP
                </button>
                <p className="text-center text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-purple-600"
                    onClick={() => setIsFlipped(false)}
                  >
                    Login
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: PURPLE INFO PANEL */}
        <div className="w-1/2 bg-purple-100 flex flex-col justify-center items-center p-10 space-y-6">
          <div className="bg-white shadow rounded-xl p-6 w-full">
            <p className="text-sm text-gray-500">Track Your Income & Expenses</p>
            <h3 className="text-3xl font-bold text-purple-700">$430,000</h3>
          </div>

          <div className="bg-white shadow rounded-xl p-6 w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold">All Transactions</h4>
              <button className="text-purple-600 text-sm font-medium">View More</button>
            </div>
            {/* Replace this with chart component or image */}
            <img src="/chart.png" alt="Transactions Chart" className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
