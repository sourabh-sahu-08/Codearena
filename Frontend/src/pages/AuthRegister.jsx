import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function AuthRegister() {
  const { register } = useContext(AuthContext);
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "PARTICIPANT",
  });
  const [err, setErr] = useState("");

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register(form);
      nav("/dashboard");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900">Create account</h2>
        <p className="text-sm text-slate-600 mt-1">Choose your role and start.</p>

        {err && <div className="mt-4 p-3 rounded-xl bg-red-50 border text-red-700 text-sm">{err}</div>}

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <label className="block">
            <div className="text-sm font-semibold">Full name</div>
            <input
              className="mt-1 w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Yashwant Sahu"
              required
            />
          </label>

          <label className="block">
            <div className="text-sm font-semibold">Email</div>
            <input
              className="mt-1 w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block">
            <div className="text-sm font-semibold">Password</div>
            <input
              type="password"
              className="mt-1 w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Min 6+ chars"
              required
            />
          </label>

          <label className="block">
            <div className="text-sm font-semibold">Role</div>
            <select
              className="mt-1 w-full px-4 py-2.5 rounded-xl border bg-white"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
            >
              <option value="PARTICIPANT">Participant</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="JUDGE">Judge</option>
              <option value="MENTOR">Mentor</option>
            </select>
          </label>

          <button className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold">
            Register
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Already have account? <Link className="text-indigo-600 font-semibold" to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}