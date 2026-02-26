import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/axios";
import { Link } from "react-router-dom";

export default function Hackathons() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("ALL");

  useEffect(() => {
    api.get("/hackathons").then((r) => setItems(r.data)).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((h) => {
      const okQ =
        !q ||
        h.title.toLowerCase().includes(q.toLowerCase()) ||
        (h.tagline || "").toLowerCase().includes(q.toLowerCase());
      const okMode = mode === "ALL" ? true : h.mode === mode;
      return okQ && okMode;
    });
  }, [items, q, mode]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Hackathons</h1>
          <p className="text-slate-600 mt-1">Browse upcoming and active events.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="px-4 py-2.5 rounded-xl border w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Search hackathons..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="px-4 py-2.5 rounded-xl border bg-white"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="ALL">All modes</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((h) => (
          <Link
            key={h._id}
            to={`/hackathons/${h._id}`}
            className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">{h.mode}{h.city ? ` • ${h.city}` : ""}</div>
                <div className="mt-1 font-bold text-slate-900 text-lg">{h.title}</div>
                <div className="text-sm text-slate-600 mt-1 line-clamp-2">{h.tagline}</div>
              </div>
              <div className="px-3 py-1 rounded-full border text-xs bg-slate-50">
                ₹{h.prizePool || 0}
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-600 space-y-1">
              <div>Reg ends: <b>{fmt(h.registrationEnd)}</b></div>
              <div>Submission: <b>{fmt(h.submissionDeadline)}</b></div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(h.domains || []).slice(0, 4).map((d) => (
                <span key={d} className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {d}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {!filtered.length && (
        <div className="mt-10 text-center text-slate-600">
          No hackathons found.
        </div>
      )}
    </div>
  );
}

function fmt(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}