import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function AuthLogin() {
  const { login, user } = useContext(AuthContext);
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ navigate only after render
  useEffect(() => {
    if (user) nav("/dashboard", { replace: true });
  }, [user, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      // nav will happen by useEffect once user is set
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900">Login</h2>
        <p className="text-sm text-slate-600 mt-1">Access your dashboard.</p>

        {err && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border text-red-700 text-sm">
            {err}
          </div>
        )}

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <label className="block">
            <div className="text-sm font-semibold">Email</div>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block">
            <div className="text-sm font-semibold">Password</div>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <button
            disabled={loading}
            className={"btn btn-dark w-full " + (loading ? "opacity-70 cursor-not-allowed" : "")}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          New user?{" "}
          <Link className="text-indigo-600 font-semibold" to="/register">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}