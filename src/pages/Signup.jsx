import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(form);
    navigate("/profile");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Name" onChange={(e) => setForm({...form, name: e.target.value})} />
      <input placeholder="Email" onChange={(e) => setForm({...form, email: e.target.value})} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({...form, password: e.target.value})} />
      <input type="date" onChange={(e) => setForm({...form, dob: e.target.value})} />
      <button>Signup</button>
    </form>
  );
}