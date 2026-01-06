import { useState, useContext } from "react";
import { register as apiRegister } from "../api/api.js";
import { Eye, EyeOff, Trash2, Upload, User } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    avatar: null,
  });
  const [error, setError] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const { login: contextLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  // ---------- LOGIN ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // use AuthContext → this will call API login and set user + token
      await contextLogin(loginForm.email, loginForm.password);
      navigate("/"); // go to dashboard/home
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  // ---------- REGISTER ----------
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", regForm.name);
      fd.append("email", regForm.email);
      fd.append("password", regForm.password);
      if (regForm.avatar) fd.append("avatar", regForm.avatar);

      const res = await apiRegister(fd);

      // backend returns: { token, user: { ... } }
      localStorage.setItem("token", res.data.token);

      // simplest: navigate to home; AuthProvider can call /auth/me on mount
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-max max-w-6xl h-[80vh] shadow-2xl rounded-2xl flex flex-col lg:flex-row overflow-hidden relative">
        {/* TITLE */}
        <h1 className="absolute top-4 left-4 text-lg sm:text-xl font-bold z-10">
          Expense Tracker
        </h1>

        {/* LEFT SIDE: LOGIN / REGISTER */}
        <div className="w-full lg:w-1/2 p-14 sm:p-10 flex items-center justify-center relative">
          <div
            className="w-full h-[30rem] max-w-md transition-transform duration-700"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* LOGIN */}
            <div
              className="p-4 sm:p-6 w-full"
              style={{ backfaceVisibility: "hidden" }}
            >
              <h2 className="text-2xl text-center font-bold mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-500 mb-6 text-center text-sm sm:text-base">
                Please enter your details to log in
              </p>
              {error && <div className="text-red-500 mb-2">{error}</div>}

              <form
                onSubmit={handleLogin}
                className="space-y-4 w-full max-w-sm mx-auto"
              >
                <input
                  className="w-full border p-3 rounded bg-gray-50"
                  placeholder="Email Address"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  required
                />

                {/* Password with toggle */}
                <div className="relative">
                  <input
                    className="w-full border p-3 rounded bg-gray-50"
                    placeholder="Password"
                    type={showLoginPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <button className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700">
                  LOGIN
                </button>
                <p className="text-center text-sm sm:text-base">
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    className="text-purple-600 font-medium"
                    onClick={() => setIsFlipped(true)}
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            </div>

            {/* REGISTER */}
            <div
              className="p-5 w-full absolute top-0 left-0"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
              }}
            >
              <h2 className="text-2xl font-bold mb-2 text-center">
                Create an Account
              </h2>
              <p className="text-gray-500 mb-6 text-center text-sm sm:text-base">
                Join us today by entering your details below.
              </p>
              {error && <div className="text-red-500 mb-2">{error}</div>}

              <form
                onSubmit={handleRegister}
                className="space-y-4 w-full max-w-sm mx-auto flex flex-col items-center"
              >
                {/* Profile Picture Upload */}
                <div className="flex gap-5 items-center mb-4 relative">
                  <div className="relative">
                    {regForm.avatar ? (
                      <img
                        src={URL.createObjectURL(regForm.avatar)}
                        alt="Avatar"
                        className="w-14 h-14 rounded-full object-cover border-2 border-purple-600"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full border-2 border-purple-600 flex items-center justify-center text-purple-600 bg-purple-50">
                        <User size={28} />
                      </div>
                    )}
                    {regForm.avatar && (
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full p-1"
                        onClick={() =>
                          setRegForm({ ...regForm, avatar: null })
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <label className="mt-2 cursor-pointer bg-purple-600 p-2 rounded-full text-white hover:bg-purple-700 flex items-center justify-center">
                    <Upload size={15} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setRegForm({
                          ...regForm,
                          avatar: e.target.files[0],
                        })
                      }
                    />
                  </label>
                </div>

                <input
                  className="w-full border p-3 rounded bg-gray-50"
                  placeholder="Full Name"
                  value={regForm.name}
                  onChange={(e) =>
                    setRegForm({ ...regForm, name: e.target.value })
                  }
                  required
                />
                <input
                  className="w-full border p-3 rounded bg-gray-50"
                  placeholder="Email Address"
                  type="email"
                  value={regForm.email}
                  onChange={(e) =>
                    setRegForm({ ...regForm, email: e.target.value })
                  }
                  required
                />

                {/* Password with toggle */}
                <div className="relative w-full">
                  <input
                    className="w-full border p-3 rounded bg-gray-50"
                    placeholder="Password"
                    type={showRegPassword ? "text" : "password"}
                    value={regForm.password}
                    onChange={(e) =>
                      setRegForm({ ...regForm, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                  >
                    {showRegPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <button className="w-full bg-purple-600 text-white py-2 rounded font-medium hover:bg-purple-700">
                  SIGN UP
                </button>
                <p className="text-center text-sm sm:text-base pb-16">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-purple-600 font-medium"
                    onClick={() => setIsFlipped(false)}
                  >
                    Login
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: PURPLE INFO PANEL - HIDDEN ON MOBILE */}
        <div className="hidden lg:flex w-1/2 bg-purple-100 flex-col justify-center items-center p-6 sm:p-10 space-y-6">
          <div className="bg-white shadow rounded-xl p-6 w-full">
            <p className="text-sm sm:text-base text-gray-500">
              Track Your Income & Expenses
            </p>
            <h3 className="text-3xl font-bold text-purple-700">₹ 430,000</h3>
          </div>

          <div className="bg-white shadow rounded-xl p-6 w-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white py-2 px-4 rounded-full text-sm sm:text-base font-medium bg-purple-800">
                Track Your Expense & Income
              </span>
            </div>
            <img
              src="/1.png"
              alt="Transactions Chart"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
