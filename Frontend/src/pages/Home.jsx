import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* background blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-200/60 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-slate-200/70 blur-3xl rounded-full" />

      <div className="container-max py-14 relative">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-700">National-level Hackathon Management</span>
            </div>

            <h1 className="mt-5 text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Build. Compete. Win.
              <span className="block text-indigo-600">One platform for everything.</span>
            </h1>

            <p className="mt-4 text-slate-600 leading-relaxed">
              Teams, problem statements, submissions, judge scoring, leaderboard, real-time chat,
              announcements and certificates — all in a clean dashboard experience.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/hackathons" className="btn btn-primary px-5 py-3">
                Explore Hackathons
              </Link>
              <Link to="/register" className="btn btn-outline px-5 py-3">
                Create Account
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4">
              <Stat t="Role-based" v="Auth" d="Participant / Organizer / Judge" />
              <Stat t="Realtime" v="Chat" d="Team + global rooms" />
              <Stat t="Auto" v="PDF" d="Certificate generator" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Quick Flow</h3>
              <span className="badge">Demo Ready</span>
            </div>

            <div className="mt-5 space-y-3">
              <Step n="1" t="Register & choose role" d="Participant / Organizer / Judge" />
              <Step n="2" t="Create / Join team" d="Invite code based joining" />
              <Step n="3" t="Submit links" d="GitHub + Demo + PPT/PDF" />
              <Step n="4" t="Judges score" d="Rubric scoring + notes" />
              <Step n="5" t="Leaderboard + certificate" d="Ranks + PDF download" />
            </div>

            <div className="mt-6 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
              Organizer creates hackathon + problems. Judges review. Participants submit.
            </div>
          </div>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          <Feature title="Organizer Dashboard" desc="Create hackathons, timeline and problem statements." />
          <Feature title="Judge Panel" desc="Score submissions with innovation, UX, complexity, presentation." />
          <Feature title="Leaderboard & Certificates" desc="Live rankings and downloadable PDFs." />
        </div>
      </div>
    </div>
  );
}

function Stat({ t, v, d }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{t}</div>
      <div className="text-2xl font-black text-slate-900">{v}</div>
      <div className="text-xs text-slate-600 mt-1">{d}</div>
    </div>
  );
}

function Step({ n, t, d }) {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
        {n}
      </div>
      <div>
        <div className="font-semibold text-slate-900">{t}</div>
        <div className="text-sm text-slate-600">{d}</div>
      </div>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="card p-6 hover:shadow-md transition">
      <div className="font-bold text-slate-900">{title}</div>
      <div className="mt-2 text-slate-600 text-sm leading-relaxed">{desc}</div>
    </div>
  );
}