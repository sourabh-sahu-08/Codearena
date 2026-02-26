import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { api } from "../api/axios";
import { Navigate } from "react-router-dom";

export default function OrganizerDashboard() {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("create");
  const [hackathons, setHackathons] = useState([]);
  const [selected, setSelected] = useState("");

  const [form, setForm] = useState({
    title: "",
    tagline: "",
    mode: "ONLINE",
    city: "",
    prizePool: 0,
    domains: "AI, Web, App",
    registrationStart: "",
    registrationEnd: "",
    submissionDeadline: "",
    resultDate: "",
    description: "",
  });

  const [problem, setProblem] = useState({
    title: "",
    category: "General",
    difficulty: "MEDIUM",
    statement: "",
    pdfUrl: "",
  });

  useEffect(() => {
    api.get("/hackathons").then((r) => {
      setHackathons(r.data);
      if (r.data[0]?._id) setSelected(r.data[0]._id);
    });
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "ORGANIZER") return <Navigate to="/dashboard" replace />;

  async function createHackathon() {
    const payload = {
      ...form,
      prizePool: Number(form.prizePool || 0),
      domains: form.domains.split(",").map(s => s.trim()).filter(Boolean),
    };
    const r = await api.post("/hackathons", payload);
    setHackathons((p) => [r.data, ...p]);
    setSelected(r.data._id);
    setTab("manage");
  }

  async function addProblem() {
    if (!selected) return;
    const r = await api.post(`/hackathons/${selected}/problems`, problem);
    alert("Problem added ✅");
    setProblem({ title: "", category: "General", difficulty: "MEDIUM", statement: "", pdfUrl: "" });
    return r.data;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">Organizer</div>
          <h1 className="text-3xl font-black text-slate-900">Organizer Dashboard</h1>
          <p className="text-slate-600 mt-1">Create and manage hackathons.</p>
        </div>

        <div className="flex gap-2">
          <TabButton active={tab === "create"} onClick={() => setTab("create")}>Create</TabButton>
          <TabButton active={tab === "manage"} onClick={() => setTab("manage")}>Manage</TabButton>
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}>Analytics</TabButton>
        </div>
      </div>

      {tab !== "create" && (
        <div className="mt-6 rounded-2xl border bg-white p-5">
          <div className="text-sm font-semibold">Select Hackathon</div>
          <select
            className="mt-2 w-full md:w-[420px] px-4 py-2.5 rounded-xl border bg-white"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {hackathons.map((h) => (
              <option key={h._id} value={h._id}>{h.title}</option>
            ))}
          </select>
        </div>
      )}

      {tab === "create" && (
        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <Card title="Create Hackathon">
            <Grid2>
              <Input label="Title" value={form.title} onChange={(v) => setForm(p => ({...p, title: v}))} />
              <Input label="Tagline" value={form.tagline} onChange={(v) => setForm(p => ({...p, tagline: v}))} />
              <Select label="Mode" value={form.mode} onChange={(v) => setForm(p => ({...p, mode: v}))}
                options={["ONLINE","OFFLINE","HYBRID"]} />
              <Input label="City (optional)" value={form.city} onChange={(v) => setForm(p => ({...p, city: v}))} />
              <Input label="Prize Pool" value={form.prizePool} onChange={(v) => setForm(p => ({...p, prizePool: v}))} />
              <Input label="Domains (comma separated)" value={form.domains} onChange={(v) => setForm(p => ({...p, domains: v}))} />
              <Input label="Registration Start (ISO)" value={form.registrationStart} onChange={(v) => setForm(p => ({...p, registrationStart: v}))} placeholder="2026-03-01T10:00:00" />
              <Input label="Registration End (ISO)" value={form.registrationEnd} onChange={(v) => setForm(p => ({...p, registrationEnd: v}))} placeholder="2026-03-10T23:59:59" />
              <Input label="Submission Deadline (ISO)" value={form.submissionDeadline} onChange={(v) => setForm(p => ({...p, submissionDeadline: v}))} placeholder="2026-03-12T23:59:59" />
              <Input label="Result Date (ISO)" value={form.resultDate} onChange={(v) => setForm(p => ({...p, resultDate: v}))} placeholder="2026-03-15T18:00:00" />
            </Grid2>

            <TextArea label="Description" value={form.description} onChange={(v) => setForm(p => ({...p, description: v}))} />

            <button onClick={createHackathon} className="mt-4 w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold">
              Create Hackathon
            </button>
          </Card>

          <Card title="Tips">
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
              <li>ISO date format required (example shown in placeholders).</li>
              <li>After creating, go to Manage tab and add Problem Statements.</li>
              <li>Leaderboard works after Judges score submissions.</li>
            </ul>
          </Card>
        </div>
      )}

      {tab === "manage" && (
        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <Card title="Add Problem Statement">
            <Input label="Title" value={problem.title} onChange={(v) => setProblem(p => ({...p, title: v}))} />
            <Grid2>
              <Input label="Category" value={problem.category} onChange={(v) => setProblem(p => ({...p, category: v}))} />
              <Select
                label="Difficulty"
                value={problem.difficulty}
                onChange={(v) => setProblem(p => ({...p, difficulty: v}))}
                options={["EASY","MEDIUM","HARD"]}
              />
            </Grid2>
            <TextArea label="Statement" value={problem.statement} onChange={(v) => setProblem(p => ({...p, statement: v}))} />
            <Input label="PDF URL (optional)" value={problem.pdfUrl} onChange={(v) => setProblem(p => ({...p, pdfUrl: v}))} />
            <button onClick={addProblem} className="mt-4 w-full px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold">
              Add Problem
            </button>
          </Card>

          <Card title="Announcements (Stub)">
            <div className="text-sm text-slate-600">
              Announcement feature backend model exists in our plan; UI stub added.
              Next step: create announcement route + store + push via socket.
            </div>
            <div className="mt-3 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
              You can ask me: “add announcements full” and I’ll add backend+frontend.
            </div>
          </Card>
        </div>
      )}

      {tab === "analytics" && (
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <Card title="Analytics (Stub)">
            <div className="text-sm text-slate-600">
              Next: API to compute counts (teams, submissions, active users).
            </div>
          </Card>
          <Card title="Export (Stub)">
            <div className="text-sm text-slate-600">
              Next: CSV export endpoint for teams/submissions.
            </div>
          </Card>
          <Card title="Anti-Cheat (Basic done)">
            <div className="text-sm text-slate-600">
              Duplicate GitHub per hackathon is blocked via unique index.
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2.5 rounded-xl border font-semibold " +
        (active ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50")
      }
    >
      {children}
    </button>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="font-bold text-slate-900">{title}</div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Grid2({ children }) {
  return <div className="grid sm:grid-cols-2 gap-3">{children}</div>;
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold">{label}</div>
      <input
        className="mt-1 w-full px-4 py-2.5 rounded-xl border"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
      />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold">{label}</div>
      <textarea
        className="mt-1 w-full px-4 py-2.5 rounded-xl border min-h-[110px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold">{label}</div>
      <select
        className="mt-1 w-full px-4 py-2.5 rounded-xl border bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}