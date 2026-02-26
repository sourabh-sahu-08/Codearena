import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  const linkClass = ({ isActive }) =>
    (isActive ? "text-slate-900 font-semibold" : "text-slate-600 hover:text-slate-900") +
    " transition";

  return (
    <div className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur">
      <div className="container-max py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-black text-xl tracking-tight">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-slate-900" />
          HackNation<span className="text-indigo-600">.</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <NavLink className={linkClass} to="/hackathons">Hackathons</NavLink>
          <NavLink className={linkClass} to="/leaderboard">Leaderboard</NavLink>

          {!user ? (
            <div className="flex items-center gap-2">
              <Link className="btn btn-outline" to="/login">Login</Link>
              <Link className="btn btn-primary" to="/register">Register</Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-slate-600">
                {user.name} • <b className="text-slate-900">{user.role}</b>
              </span>
              <Link className="btn btn-outline" to="/dashboard">Dashboard</Link>
              <button className="btn btn-dark" onClick={logout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}