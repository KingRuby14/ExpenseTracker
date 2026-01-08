import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/verify/${token}`
        );

        navigate("/login?verified=true", { replace: true });
      } catch (err) {
        navigate("/login?verified=failed", { replace: true });
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-semibold">Verifying your email…</p>
    </div>
  );
}
