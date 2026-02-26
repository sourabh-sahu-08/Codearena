import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

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

  // chat
  const [chatText, setChatText] = useState("");
  const [chat, setChat] = useState([]); // local only (socket messages)
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
    // socket listeners
    socket.on("chat:new", (msg) => {
      setChat((p) => [...p, msg]);
    });
    socket.on("leaderboard:refresh", () => {
      // optional: can show toast
    });
    return () => {
      socket.off("chat:new");
      socket.off("leaderboard:refresh");
    };
  }, [socket]);

  useEffect(() => {
    // prefill submission form from existing
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
      { t: "Registration Start", d: hack.registrationStart },
      { t: "Registration End", d: hack.registrationEnd },
      { t: "Submission Deadline", d: hack.submissionDeadline },
      { t: "Result Date", d: hack.resultDate },
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
    // notify leaderboard refresh
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
    // open backend pdf
    window.open(`http://localhost:8080/api/hackathons/${id}/cert/download`, "_blank");
  }

  if (!hack) {
    return <div className="max-w-6xl mx-auto px-4 py-10 text-slate-600">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-start gap-8">
        {/* Left */}
        <div className="flex-1">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">{hack.mode}{hack.city ? ` • ${hack.city}` : ""}</div>
                <h1 className="mt-1 text-3xl font-black text-slate-900">{hack.title}</h1>
                <p className="text-slate-600 mt-2">{hack.tagline}</p>
              </div>
              <div className="px-3 py-1.5 rounded-full border bg-slate-50 text-sm">
                Prize: <b>₹{hack.prizePool || 0}</b>
              </div>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              {timeline.map((x) => (
                <div key={x.t} className="rounded-xl border bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">{x.t}</div>
                  <div className="font-bold text-slate-900">{fmt(x.d)}</div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="font-bold text-slate-900">About</div>
              <p className="text-slate-600 mt-2 leading-relaxed">{hack.description || "No description."}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(hack.domains || []).map((d) => (
                <span key={d} className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {d}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={downloadCertificate}
                className="px-4 py-2.5 rounded-xl border bg-white hover:bg-slate-50 font-semibold"
              >
                Download Certificate (PDF)
              </button>
              <a
                href="/leaderboard"
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold"
              >
                View Leaderboard
              </a>
            </div>
          </div>

          {/* Problems */}
          <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900">Problem Statements</div>
              <div className="text-sm text-slate-500">{problems.length} items</div>
            </div>

            <div className="mt-4 space-y-3">
              {problems.map((p) => (
                <div key={p._id} className="rounded-xl border p-4 hover:bg-slate-50 transition">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{p.title}</div>
                      <div className="text-sm text-slate-600">{p.category} • {p.difficulty}</div>
                    </div>
                    {p.pdfUrl ? (
                      <a className="text-sm font-semibold text-indigo-600" href={p.pdfUrl} target="_blank" rel="noreferrer">
                        PDF
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No PDF</span>
                    )}
                  </div>
                  {p.statement && <p className="text-sm text-slate-600 mt-2">{p.statement}</p>}
                </div>
              ))}
              {!problems.length && <div className="text-slate-600">No problems added yet.</div>}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="w-full md:w-[380px] space-y-6">
          {/* Team */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="font-bold text-slate-900">Team</div>
            {!user ? (
              <div className="text-sm text-slate-600 mt-2">Login to create/join team.</div>
            ) : team ? (
              <div className="mt-3">
                <div className="text-sm text-slate-600">Team Name</div>
                <div className="text-xl font-black text-slate-900">{team.name}</div>
                <div className="mt-2 text-sm text-slate-600">
                  Invite Code: <b className="text-slate-900">{team.inviteCode}</b>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-semibold">Members</div>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {(team.members || []).map((m) => (
                      <li key={m._id} className="flex justify-between">
                        <span>{m.name}</span>
                        <span className="text-xs text-slate-500">{m.role}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                <div className="rounded-xl border p-4">
                  <div className="font-semibold">Create team</div>
                  <input
                    className="mt-2 w-full px-4 py-2.5 rounded-xl border"
                    placeholder="Team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                  <button
                    onClick={createTeam}
                    className="mt-3 w-full px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold"
                  >
                    Create
                  </button>
                </div>

                <div className="rounded-xl border p-4">
                  <div className="font-semibold">Join team</div>
                  <input
                    className="mt-2 w-full px-4 py-2.5 rounded-xl border"
                    placeholder="Invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                  <button
                    onClick={joinTeam}
                    className="mt-3 w-full px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold"
                  >
                    Join
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submission */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900">Submission</div>
              <span className="text-xs px-2 py-1 rounded-full border bg-slate-50">
                {submission?.status || "NOT SUBMITTED"}
              </span>
            </div>

            {!user ? (
              <div className="text-sm text-slate-600 mt-2">Login to submit.</div>
            ) : (
              <div className="mt-4 space-y-3">
                <label className="block">
                  <div className="text-sm font-semibold">Problem</div>
                  <select
                    className="mt-1 w-full px-4 py-2.5 rounded-xl border bg-white"
                    value={submitForm.problemId}
                    onChange={(e) => setSubmitForm((p) => ({ ...p, problemId: e.target.value }))}
                  >
                    <option value="">(Optional) Select</option>
                    {problems.map((p) => (
                      <option key={p._id} value={p._id}>{p.title}</option>
                    ))}
                  </select>
                </label>

                <Input label="GitHub URL *" value={submitForm.githubUrl} onChange={(v) => setSubmitForm(p => ({...p, githubUrl: v}))} />
                <Input label="Demo Video URL" value={submitForm.demoVideoUrl} onChange={(v) => setSubmitForm(p => ({...p, demoVideoUrl: v}))} />
                <Input label="PPT URL" value={submitForm.pptUrl} onChange={(v) => setSubmitForm(p => ({...p, pptUrl: v}))} />
                <Input label="Doc/PDF URL" value={submitForm.docUrl} onChange={(v) => setSubmitForm(p => ({...p, docUrl: v}))} />

                <button
                  onClick={submitProject}
                  className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold"
                >
                  {submission ? "Update / Re-Submit" : "Submit Project"}
                </button>

                <div className="text-xs text-slate-500">
                  Note: Duplicate GitHub repo in same hackathon is blocked (anti-cheat basic).
                </div>
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="font-bold text-slate-900">Realtime Chat</div>
            <div className="text-xs text-slate-500 mt-1">
              {team ? "Team room" : "Global room"} • Live via Socket.io
            </div>

            <div className="mt-3 h-56 overflow-auto rounded-xl border bg-slate-50 p-3 space-y-2">
              {chat.map((m, idx) => (
                <div key={m._id || idx} className="text-sm">
                  <span className="text-slate-500 text-xs">{new Date(m.createdAt).toLocaleTimeString()} </span>
                  <span className="text-slate-900">{m.text}</span>
                </div>
              ))}
              {!chat.length && <div className="text-sm text-slate-600">No messages yet.</div>}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 px-4 py-2.5 rounded-xl border"
                placeholder="Type message..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
              />
              <button
                onClick={sendChat}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold"
              >
                Send
              </button>
            </div>

            {!user && <div className="text-xs text-slate-500 mt-2">Login required to send.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold">{label}</div>
      <input
        className="mt-1 w-full px-4 py-2.5 rounded-xl border"
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