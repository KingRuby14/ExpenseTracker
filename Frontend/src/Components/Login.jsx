import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);

  // --- Login states ---
  const [loginEmailPhone, setLoginEmailPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // --- Register states ---
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // --- Handle login (Local Storage) ---
  const handleLogin = (e) => {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem("userData"));
    if (
      savedUser &&
      (savedUser.email === loginEmailPhone ||
        savedUser.phone === loginEmailPhone) &&
      savedUser.password === loginPassword
    ) {
      // Success
      localStorage.setItem("isLoggedIn", true);
      onLogin({
        fullName: savedUser.fullName,
        email: savedUser.email,
        phone: savedUser.phone,
        profilePic: savedUser.profilePic || null,
      });
      navigate("/");
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };

  // --- Handle register (Local Storage) ---
  const handleRegister = (e) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      return alert("Passwords do not match");
    }

    const userData = {
      fullName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    };

    localStorage.setItem("userData", JSON.stringify(userData));
    alert("Registration successful! Please login.");
    setIsFlipped(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <motion.div
        className="relative w-[400px] h-[520px] perspective"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* -------- Login Card -------- */}
        <div
          className="absolute w-full h-auto bg-white rounded-2xl shadow-xl p-8 backface-hidden"
          style={{ transform: "rotateY(0deg)" }}
        >
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
            Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-4 text-blue-500">
            <div>
              <label className="text-sm font-medium">Email or Phone</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2 mt-1 text-black font-medium"
                value={loginEmailPhone}
                onChange={(e) => setLoginEmailPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  className="w-full border rounded-lg p-2 mt-1 pr-10 text-black font-medium"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-4 text-blue-500"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <button
                type="button"
                className="text-blue-600 font-medium text-sm hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Login
            </button>
          </form>
          <p className="text-center mt-6 text-sm text-blue-500">
            Not registered?{" "}
            <button
              onClick={() => setIsFlipped(true)}
              className="text-blue-600 font-semibold hover:text-red-500 underline"
            >
              Create an account
            </button>
          </p>
        </div>

        {/* -------- Register Card -------- */}
        <div
          className="absolute w-full h-auto bg-white text-blue-500 font-medium rounded-2xl shadow-xl p-8 backface-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          <h2 className="text-2xl font-bold text-center text-green-600 mb-6">
            Register
          </h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm">Full Name</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2 mt-1 text-black font-medium"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <input
                type="email"
                className="w-full border rounded-lg p-2 mt-1 text-black font-medium"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm">Phone</label>
              <input
                type="tel"
                className="w-full border rounded-lg p-2 mt-1 text-black font-medium"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm">Password</label>
              <div className="relative">
                <input
                  type={showRegPassword ? "text" : "password"}
                  className="w-full border rounded-lg p-2 mt-1 pr-10 text-black font-medium"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-4 text-blue-500"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                >
                  {showRegPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm">Confirm Password</label>
              <div className="relative">
                <input
                  type={showRegConfirmPassword ? "text" : "password"}
                  className="w-full border rounded-lg p-2 mt-1 pr-10 text-black font-medium"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-4 text-blue-500"
                  onClick={() =>
                    setShowRegConfirmPassword(!showRegConfirmPassword)
                  }
                >
                  {showRegConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg"
            >
              Register
            </button>
          </form>
          <p className="text-center mt-6 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => setIsFlipped(false)}
              className="text-green-600 underline font-semibold text-xl hover:text-red-500"
            >
              Login here
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}