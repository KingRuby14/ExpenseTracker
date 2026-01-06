import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/api.js";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  // ---------- SEND OTP ----------
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      await axios.post("/auth/forgot", { email });
      setMsg("OTP sent to your email");
      setStep(2);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Something went wrong");
    }

    setLoading(false);
  };

  // ---------- VERIFY OTP + RESET ----------
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    if (password !== confirm) {
      setMsg("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await axios.post("/auth/reset", { email, otp, password });

      setMsg("Password reset successful! Redirecting...");
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Invalid OTP or expired");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-2">
          Forgot Password
        </h2>

        <p className="text-gray-500 text-center mb-6">
          {step === 1 && "Enter your registered email to receive OTP"}
          {step === 2 && "Enter the OTP sent to your email"}
          {step === 3 && "Create a new password"}
        </p>

        {msg && (
          <div className="text-center text-sm font-medium mb-3 text-blue-600">
            {msg}
          </div>
        )}

        {/* STEP 1 — EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              placeholder="Enter Email"
              className="w-full border p-3 rounded bg-gray-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2 — OTP */}
        {step === 2 && (
          <form onSubmit={() => setStep(3)} className="space-y-4">
            <input
              type="text"
              placeholder="Enter 6 Digit OTP"
              className="w-full border p-3 rounded bg-gray-50 text-center tracking-widest text-lg font-bold"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <button
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700"
            >
              Continue
            </button>

            <p
              className="text-blue-600 text-center text-sm cursor-pointer"
              onClick={() => setStep(1)}
            >
              Change Email
            </p>
          </form>
        )}

        {/* STEP 3 — RESET PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              className="w-full border p-3 rounded bg-gray-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full border p-3 rounded bg-gray-50"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />

            <button
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p
          className="text-center text-sm mt-5 text-gray-500 cursor-pointer"
          onClick={() => navigate("/auth")}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
}
