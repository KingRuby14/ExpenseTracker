import { useState, useContext, useEffect } from "react";
import {
  register as apiRegister,
  sendOtp,
  resetPassword,
  googleLogin,
} from "../api/api.js";
import { Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [googleReady, setGoogleReady] = useState(false); // ✅ ADD

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    avatar: null,
  });

  const [forgotEmail, setForgotEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const { login: contextLogin, googleLoginContext } =
    useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ LOAD GOOGLE SCRIPT ONCE
  useEffect(() => {
    if (window.google) {
      setGoogleReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleReady(true);
    document.body.appendChild(script);
  }, []);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await contextLogin(loginForm.email, loginForm.password);
      navigate("/");
    } catch (err) {
      const message = err?.response?.data?.message;

      if (message === "Please verify your email") {
        setError("Please verify your email. Check inbox.");
      } else {
        setError(message || "Login failed");
      }
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const fd = new FormData();
      fd.append("name", regForm.name);
      fd.append("email", regForm.email);
      fd.append("password", regForm.password);
      if (regForm.avatar) fd.append("avatar", regForm.avatar);

      await apiRegister(fd);
      alert("Registered Successfully. Verify Email Before Login.");
      setIsFlipped(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Register failed");
    }
  };

  // ✅ GOOGLE LOGIN (FIXED)
  const handleGoogleLogin = async () => {
    if (!googleReady || !window.google) {
      alert("Google is still loading. Try again.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        const userData = JSON.parse(
          atob(response.credential.split(".")[1])
        );

        const res = await googleLogin({
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
        });

        localStorage.setItem("token", res.data.token);
        googleLoginContext(res.data.token, res.data.user);
        navigate("/");
      },
    });

    window.google.accounts.id.prompt();
  };

  // SEND OTP
  const handleSendOtp = async () => {
    if (!forgotEmail) {
      setMsg("Enter email first");
      return;
    }

    setMsg("");
    setLoading(true);

    try {
      await sendOtp(forgotEmail);
      setOtpSent(true);
      setMsg("OTP sent to your email");
    } catch (err) {
      setMsg(err?.response?.data?.error || "Failed to send OTP");
    }

    setLoading(false);
  };

  // RESET PASSWORD
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!otpSent) return setMsg("Request OTP first");
    if (newPass !== confirm) return setMsg("Passwords do not match");

    try {
      await resetPassword({
        email: forgotEmail,
        otp,
        password: newPass,
        confirmPassword: confirm,
      });

      setMsg("Password Reset Successful! Please login now.");

      setTimeout(() => {
        setShowForgot(false);
        setOtpSent(false);
        setOtp("");
        setNewPass("");
        setConfirm("");
      }, 1500);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-max max-w-6xl h-[80vh] shadow-2xl rounded-2xl flex flex-col lg:flex-row overflow-hidden relative">
        <h1 className="absolute top-4 left-4 text-lg sm:text-xl font-bold z-10">
          Expense Tracker
        </h1>

        {/* LEFT SECTION */}
        <div className="w-full lg:w-1/2 p-14 sm:p-10 flex items-center justify-center relative">
          {!showForgot ? (
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

                {error && (
                  <div className="text-red-500 mb-2 text-center">{error}</div>
                )}

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
                      {showLoginPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  <button className="w-full bg-purple-600 text-white py-3 rounded font-medium hover:bg-purple-700">
                    LOGIN
                  </button>

                  {/* GOOGLE BUTTON */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-red-500 text-white py-3 rounded font-medium hover:bg-red-600"
                  >
                    Continue with Google
                  </button>

                  <p
                    className="text-center text-sm mt-1 text-blue-600 cursor-pointer"
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot Password?
                  </p>

                  <p className="text-center text-sm">
                    Don’t have an account?
                    <button
                      type="button"
                      className="text-purple-600 font-medium ml-1"
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

                {error && (
                  <div className="text-red-500 mb-2 text-center">{error}</div>
                )}

                <form
                  onSubmit={handleRegister}
                  className="space-y-4 w-full max-w-sm mx-auto flex flex-col items-center"
                >
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
                      {showRegPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  <button className="w-full bg-purple-600 text-white py-2 rounded font-medium hover:bg-purple-700">
                    SIGN UP
                  </button>

                  <p className="text-center text-sm pb-16">
                    Already have an account?
                    <button
                      type="button"
                      className="text-purple-600 font-medium ml-1"
                      onClick={() => setIsFlipped(false)}
                    >
                      Login
                    </button>
                  </p>
                </form>
              </div>
            </div>
          ) : (
            // FORGOT PASSWORD — SINGLE FORM
            <div className="w-full max-w-md">
              <h2 className="text-2xl font-bold text-center mb-2">
                Reset Password
              </h2>

              <p className="text-gray-500 text-center mb-4">
                Enter details below
              </p>

              {msg && <p className="text-center text-blue-600 mb-3">{msg}</p>}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  className="w-full p-3 border rounded"
                  placeholder="Enter Email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />

                {!otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full bg-purple-600 text-white py-3 rounded"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                )}

                {otpSent && (
                  <>
                    <input
                      className="w-full p-3 border rounded text-center tracking-widest"
                      placeholder="Enter OTP"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />

                    <p
                      onClick={handleSendOtp}
                      className="text-blue-600 text-center cursor-pointer"
                    >
                      Resend OTP
                    </p>

                    <input
                      className="w-full p-3 border rounded"
                      placeholder="New Password"
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      required
                    />

                    <input
                      className="w-full p-3 border rounded"
                      placeholder="Confirm Password"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />

                    <button className="w-full bg-purple-600 text-white py-3 rounded">
                      Reset Password
                    </button>
                  </>
                )}
              </form>

              <p
                className="text-center text-sm mt-5 text-gray-500 cursor-pointer"
                onClick={() => {
                  setShowForgot(false);
                  setOtpSent(false);
                }}
              >
                Back to Login
              </p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="hidden lg:flex w-1/2 bg-purple-100 flex-col justify-center items-center p-8 space-y-6">
          <div className="bg-white shadow rounded-xl p-6 w-full">
            <p className="text-gray-500">Track Income & Expenses</p>
            <h3 className="text-3xl font-bold text-purple-700">₹ 430,000</h3>
          </div>

          <div className="bg-white shadow rounded-xl p-6 w-full">
            <span className="bg-purple-800 text-white px-4 py-2 rounded-full">
              Smart Financial Management
            </span>
            <img src="/1.png" alt="" className="rounded mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
