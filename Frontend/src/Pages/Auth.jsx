import { useContext, useEffect } from "react";
import AuthCard from "../Components/AuthCard";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // If already logged in → redirect to home
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // Otherwise show login/register card
  return <AuthCard />;
}
