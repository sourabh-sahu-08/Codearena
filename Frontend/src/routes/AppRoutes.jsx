import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Hackathons from "../pages/Hackathons";
import HackathonDetails from "../pages/HackathonDetails";
import AuthLogin from "../pages/AuthLogin";
import AuthRegister from "../pages/AuthRegister";
import Leaderboard from "../pages/Leaderboard";

import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";

import OrganizerDashboard from "../dashboard/OrganizerDashboard";
import JudgeDashboard from "../dashboard/JudgeDashboard";
import ParticipantDashboard from "../dashboard/ParticipantDashboard";
import JudgeReview from "../dashboard/JudgeReview";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hackathons" element={<Hackathons />} />
      <Route path="/hackathons/:id" element={<HackathonDetails />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/login" element={<AuthLogin />} />
      <Route path="/register" element={<AuthRegister />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ParticipantDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer"
        element={
          <RoleRoute allow={["ORGANIZER"]}>
            <OrganizerDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/judge"
        element={
          <RoleRoute allow={["JUDGE"]}>
            <JudgeDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/judge-review"
        element={
          <RoleRoute allow={["JUDGE"]}>
            <JudgeReview />
          </RoleRoute>
        }
      />
    </Routes>
  );
}