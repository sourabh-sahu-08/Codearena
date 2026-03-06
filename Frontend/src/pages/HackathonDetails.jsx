import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { motion, AnimatePresence } from "framer-motion";

export default function HackathonDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [hack, setHack] = useState(null);
  const [problems, setProblems] = useState([]);
  const [team, setTeam] = useState(null);
  const [submission, setSubmission] = useState(null);

  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const [submitForm, setSubmitForm] = useState({
    githubUrl: "",
    demoVideoUrl: "",
    pptUrl: "",
    docUrl: "",
    problemId: "",
  });

  const [chatText, setChatText] = useState("");
  const [chat, setChat] = useState([]);
  const [showTeammateModal, setShowTeammateModal] = useState(false);
  const socket = useSocket({ hackathonId: id, teamId: team?._id });

  useEffect(() => {
    api.get(`/hackathons/${id}`).then((r) => setHack(r.data)).catch(console.error);
    api.get(`/hackathons/${id}/problems`).then((r) => setProblems(r.data)).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!user) return;
    api.get(`/hackathons/${id}/teams/mine`).then((r) => setTeam(r.data)).catch(() => setTeam(null));
    api.get(`/hackathons/${id}/submissions/mine`).then((r) => setSubmission(r.data)).catch(() => setSubmission(null));
  }, [id, user]);

  useEffect(() => {
    socket.on("chat:new", (msg) => {
      setChat((p) => [...p, msg]);
    });
    socket.on("leaderboard:refresh", () => { });
    return () => {
      socket.off("chat:new");
      socket.off("leaderboard:refresh");
    };
  }, [socket]);

  useEffect(() => {
    if (submission) {
      setSubmitForm((p) => ({
        ...p,
        githubUrl: submission.githubUrl || "",
        demoVideoUrl: submission.demoVideoUrl || "",
        pptUrl: submission.pptUrl || "",
        docUrl: submission.docUrl || "",
        problemId: submission.problemId || "",
      }));
    }
  }, [submission]);

  const timeline = useMemo(() => {
    if (!hack) return [];
    return [
      { t: "Registration Start", d: hack.registrationStart, icon: "🚀" },
      { t: "Registration End", d: hack.registrationEnd, icon: "⏰" },
      { t: "Submission Deadline", d: hack.submissionDeadline, icon: "📤" },
      { t: "Result Date", d: hack.resultDate, icon: "🏆" },
    ];
  }, [hack]);

  async function createTeam() {
    const r = await api.post(`/hackathons/${id}/teams/create`, { name: teamName, maxSize: 4 });
    setTeam(r.data);
  }

  async function joinTeam() {
    const r = await api.post(`/hackathons/${id}/teams/join`, { inviteCode });
    setTeam(r.data);
  }

  async function submitProject() {
    const r = await api.post(`/hackathons/${id}/submissions`, submitForm);
    setSubmission(r.data);
    socket.emit("leaderboard:refresh", { hackathonId: id });
  }

  function sendChat() {
    if (!user || !chatText.trim()) return;
    socket.emit("chat:send", {
      hackathonId: id,
      teamId: team?._id || null,
      senderId: user.id || user._id,
      text: chatText.trim(),
    });
    setChatText("");
  }

  function downloadCertificate() {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    window.open(`${apiUrl}/hackathons/${id}/cert/download`, "_blank");
  }

  if (!hack) {
    return (
      <div className="container-max py-16">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" />
          </svg>
          Loading hackathon details...
        </div>
      </div>
    );
  }

  return (
    <div className="container-max py-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-start gap-8"
      >
        {/* Left — Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header Card */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">
                  {hack.mode}
                  {hack.city ? ` • ${hack.city}` : ""}
                </div>
                <h1 className="mt-1 text-3xl font-black text-white">{hack.title}</h1>
                <p className="text-slate-400 mt-2">{hack.tagline}</p>
              </div>
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold whitespace-nowrap">
                Prize: ₹{hack.prizePool || 0}
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              {timeline.map((x) => (
                <div key={x.t} className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{x.icon}</span>
                    <div className="text-xs text-slate-500">{x.t}</div>
                  </div>
                  <div className="font-bold text-white mt-1">{fmt(x.d)}</div>
                </div>
              ))}
            </div>

            {/* About */}
            <div className="mt-5">
              <div className="font-bold text-white">About</div>
              <p className="text-slate-400 mt-2 leading-relaxed">
                {hack.description || "No description."}
              </p>
            </div>

            {/* Domains */}
            <div className="mt-5 flex flex-wrap gap-2">
              {(hack.domains || []).map((d) => (
                <span
                  key={d}
                  className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20"
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={downloadCertificate} className="btn btn-outline">
                Download Certificate (PDF)
              </button>
              <a href="/leaderboard" className="btn btn-primary">
                View Leaderboard
              </a>
            </div>
          </div>

          {/* Problems */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white">Problem Statements</div>
              <span className="badge">{problems.length} items</span>
            </div>

            <div className="mt-4 space-y-3">
              {problems.map((p) => (
                <div
                  key={p._id}
                  className="rounded-xl border border-slate-700/50 p-4 hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{p.title}</div>
                      <div className="text-sm text-slate-500">
                        {p.category} •{" "}
                        <span
                          className={
                            p.difficulty === "HARD"
                              ? "text-red-400"
                              : p.difficulty === "MEDIUM"
                                ? "text-amber-400"
                                : "text-emerald-400"
                          }
                        >
                          {p.difficulty}
                        </span>
                      </div>
                    </div>
                    {p.pdfUrl ? (
                      <a
                        className="text-sm font-semibold text-cyan-400 hover:text-cyan-300"
                        href={p.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        PDF ↗
                      </a>
                    ) : (
                      <span className="text-xs text-slate-600">No PDF</span>
                    )}
                  </div>
                  {p.statement && (
                    <p className="text-sm text-slate-400 mt-2">{p.statement}</p>
                  )}
                </div>
              ))}
              {!problems.length && (
                <div className="text-slate-500 text-sm">No problems added yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Sidebar */}
        <div className="w-full md:w-[380px] space-y-6">
          {/* Team */}
          <div className="card p-6">
            <div className="font-bold text-white flex items-center gap-2">
              <span>👥</span> Team
            </div>
            {!user ? (
              <div className="text-sm text-slate-500 mt-3">Login to create/join team.</div>
            ) : team ? (
              <div className="mt-3">
                <div className="text-xs text-slate-500">Team Name</div>
                <div className="text-xl font-black text-gradient">{team.name}</div>
                <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="text-xs text-slate-500">Invite Code</div>
                  <div className="font-mono text-cyan-400 font-bold mt-0.5">{team.inviteCode}</div>
                </div>
                <div className="mt-4">
                  <div className="text-sm font-semibold text-slate-300">Members</div>
                  <ul className="mt-2 space-y-2">
                    {(team.members || []).map((m) => (
                      <li key={m._id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {m.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-300">{m.name}</span>
                        </div>
                        <span className="badge text-[10px]">{m.role}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                <div className="rounded-xl border border-slate-700/50 p-4 bg-slate-800/30">
                  <div className="font-semibold text-slate-300">Create team</div>
                  <input
                    className="input"
                    placeholder="Team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                  <button
                    onClick={createTeam}
                    className="mt-3 btn btn-primary w-full"
                  >
                    Create
                  </button>
                </div>

                <div className="rounded-xl border border-slate-700/50 p-4 bg-slate-800/30">
                  <div className="font-semibold text-slate-300">Join team</div>
                  <input
                    className="input"
                    placeholder="Invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                  <button
                    onClick={joinTeam}
                    className="mt-3 btn btn-dark w-full"
                  >
                    Join
                  </button>
                </div>

                {/* Matchmaking CTA */}
                <div className="rounded-xl border border-slate-700/50 p-4 bg-slate-800/30 text-center">
                  <div className="text-sm text-slate-400 mb-3">No team? Let us find one for you!</div>
                  <button
                    onClick={() => setShowTeammateModal(true)}
                    className="btn btn-outline border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 w-full flex justify-center items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Find Teammates
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submission */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white flex items-center gap-2">
                <span>📤</span> Submission
              </div>
              <span
                className={
                  "text-xs px-2.5 py-1 rounded-full font-semibold " +
                  (submission?.status === "SUBMITTED"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "badge")
                }
              >
                {submission?.status || "NOT SUBMITTED"}
              </span>
            </div>

            {!user ? (
              <div className="text-sm text-slate-500 mt-3">Login to submit.</div>
            ) : (
              <div className="mt-4 space-y-3">
                <label className="block">
                  <div className="text-sm font-semibold text-slate-300">Problem</div>
                  <select
                    className="select-dark w-full mt-1"
                    value={submitForm.problemId}
                    onChange={(e) =>
                      setSubmitForm((p) => ({ ...p, problemId: e.target.value }))
                    }
                  >
                    <option value="">(Optional) Select</option>
                    {problems.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </label>

                <Input label="GitHub URL *" value={submitForm.githubUrl} onChange={(v) => setSubmitForm((p) => ({ ...p, githubUrl: v }))} />
                <Input label="Demo Video URL" value={submitForm.demoVideoUrl} onChange={(v) => setSubmitForm((p) => ({ ...p, demoVideoUrl: v }))} />
                <Input label="PPT URL" value={submitForm.pptUrl} onChange={(v) => setSubmitForm((p) => ({ ...p, pptUrl: v }))} />
                <Input label="Doc/PDF URL" value={submitForm.docUrl} onChange={(v) => setSubmitForm((p) => ({ ...p, docUrl: v }))} />

                <button
                  onClick={submitProject}
                  className="btn btn-primary w-full py-3"
                >
                  {submission ? "Update / Re-Submit" : "Submit Project"}
                </button>

                <div className="text-xs text-slate-600">
                  Note: Duplicate GitHub repo in same hackathon is blocked (anti-cheat).
                </div>
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="card p-6">
            <div className="font-bold text-white flex items-center gap-2">
              <span>💬</span> Realtime Chat
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {team ? "Team room" : "Global room"} • Live via Socket.io
            </div>

            <div className="mt-3 h-56 overflow-auto rounded-xl border border-slate-700/50 bg-slate-900/60 p-3 space-y-2">
              {chat.map((m, idx) => (
                <div key={m._id || idx} className="text-sm">
                  <span className="text-slate-600 text-xs">
                    {new Date(m.createdAt).toLocaleTimeString()}{" "}
                  </span>
                  <span className="text-slate-300">{m.text}</span>
                </div>
              ))}
              {!chat.length && (
                <div className="text-sm text-slate-600 text-center py-8">
                  No messages yet.
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                className="input flex-1 !mt-0"
                placeholder="Type message..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
              />
              <button onClick={sendChat} className="btn btn-dark px-5">
                Send
              </button>
            </div>

            {!user && (
              <div className="text-xs text-slate-600 mt-2">Login required to send.</div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recommended Teammates Modal */}
      <AnimatePresence>
        {showTeammateModal && (
          <TeammatesModal onClose={() => setShowTeammateModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-slate-300">{label}</div>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://"
      />
    </label>
  );
}

function fmt(d) {
  if (!d) return "-";
  return new Date(d).toLocaleString();
}

function TeammatesModal({ onClose }) {
  // Mock data for recommended teammates
  const recommendations = [
    { id: 1, name: "Aarav Sharma", role: "Frontend Developer", match: "98%", skills: ["React", "Tailwind", "UI/UX"], status: "Looking for Team" },
    { id: 2, name: "Priya Patel", role: "Backend Engineer", match: "95%", skills: ["Node.js", "MongoDB", "Express"], status: "Looking for Team" },
    { id: 3, name: "Rohan Kumar", role: "UI/UX Designer", match: "88%", skills: ["Figma", "Prototyping"], status: "Looking for Team" },
    { id: 4, name: "Sneha Reddy", role: "Full Stack Developer", match: "85%", skills: ["Next.js", "PostgreSQL", "Prisma"], status: "Looking for Team" }
  ];

  const [requested, setRequested] = useState([]);

  const handleRequest = (id) => {
    setRequested(prev => [...prev, id]);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Find Teammates</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Recommended developers based on your profile.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {recommendations.map(user => (
              <div key={user.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 dark:hover:border-cyan-500/30 transition-colors bg-white dark:bg-slate-800/40 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group">

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">{user.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                        {user.match} Match
                      </span>
                    </div>
                    <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mt-0.5">{user.role}</div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {user.skills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRequest(user.id)}
                  disabled={requested.includes(user.id)}
                  className={`shrink-0 w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-bold transition-all ${requested.includes(user.id)
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                    : "bg-cyan-500 text-white hover:bg-cyan-400 shadow-lg shadow-cyan-500/25"
                    }`}
                >
                  {requested.includes(user.id) ? "Request Sent" : "Send Invite"}
                </button>
              </div>
            ))}
          </div>

        </motion.div>
      </motion.div>
    </>
  );
}