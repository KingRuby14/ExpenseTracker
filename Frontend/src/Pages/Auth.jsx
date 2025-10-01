import { useState } from "react";
import AuthCard from "../Components/AuthCard";

export default function Auth() {
  const [authed, setAuthed] = useState(false);
  if (authed) window.location.href = "/";
  return <AuthCard onAuth={() => setAuthed(true)} />;
}
