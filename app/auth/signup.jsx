import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Navbar from "../components/navbar";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // New fields for multi-team
  const [userType, setUserType] = useState("player"); // 'player' or 'coach'
  const [teamAction, setTeamAction] = useState("create"); // 'create' or 'join'
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Validate team fields
    if (teamAction === "create" && !teamName.trim()) {
      setError("Please enter a team name");
      setLoading(false);
      return;
    }
    if (teamAction === "join" && !inviteCode.trim()) {
      setError("Please enter an invite code");
      setLoading(false);
      return;
    }

    try {
      // 1. Create the auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/signin",
          data: {
            user_type: userType,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // If email confirmation is required, we can't do team setup yet
      // The user needs to confirm their email first
      if (!authData.session) {
        // Save team setup intent to localStorage so we can complete it after email confirmation
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "walkup-pending-team-setup",
            JSON.stringify({ teamAction, teamName, inviteCode, userType })
          );
        }
        setMessage(
          "Check your email for the confirmation link. Your team will be set up after you sign in."
        );
        setTimeout(() => navigate("/signin"), 5000);
        setLoading(false);
        return;
      }

      // 2. If we have a session immediately (e.g. email confirmation disabled)
      await completeTeamSetup(authData.user.id);

      setMessage("Account created! Redirecting...");
      setTimeout(() => navigate("/player-manager"), 1500);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const completeTeamSetup = async () => {
    if (teamAction === "create") {
      // Create team and add user as admin
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({ name: teamName.trim(), created_by: (await supabase.auth.getUser()).data.user.id })
        .select()
        .single();

      if (teamError) throw teamError;

      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          user_id: (await supabase.auth.getUser()).data.user.id,
          team_id: team.id,
          user_type: userType,
          role: "admin",
        });

      if (memberError) throw memberError;

      // Set as current team
      if (typeof window !== "undefined") {
        localStorage.setItem("walkup-current-team", team.id);
      }
    } else {
      // Join team via invite code
      const { data, error } = await supabase.rpc("claim_invite_code", {
        invite_code: inviteCode.toUpperCase().trim(),
        member_type: userType,
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to join team");

      if (typeof window !== "undefined" && data.team_id) {
        localStorage.setItem("walkup-current-team", data.team_id);
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: "6.5rem" }} className="p-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 border rounded"
              required
              minLength={6}
            />
            <p className="text-sm text-gray-500 mt-1">
              Password must be at least 6 characters
            </p>
          </div>

          {/* User type */}
          <div>
            <label className="block mb-2 font-medium">I am a...</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUserType("player")}
                className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                  userType === "player"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                ⚾ Player
              </button>
              <button
                type="button"
                onClick={() => setUserType("coach")}
                className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                  userType === "coach"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                📋 Coach
              </button>
            </div>
          </div>

          {/* Team action */}
          <div>
            <label className="block mb-2 font-medium">Team Setup</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTeamAction("create")}
                className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                  teamAction === "create"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                + Create Team
              </button>
              <button
                type="button"
                onClick={() => setTeamAction("join")}
                className={`flex-1 py-2 px-4 rounded-lg border-2 font-medium transition-colors ${
                  teamAction === "join"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                🔑 Join with Code
              </button>
            </div>
          </div>

          {/* Team name (create) */}
          {teamAction === "create" && (
            <div>
              <label className="block mb-1 font-medium">Team Name</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Valley Tigers"
                className="w-full p-2 border rounded"
                required
              />
            </div>
          )}

          {/* Invite code (join) */}
          {teamAction === "join" && (
            <div>
              <label className="block mb-1 font-medium">Invite Code</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. A3B7X9Q2"
                className="w-full p-2 border rounded font-mono tracking-widest text-center text-lg"
                maxLength={8}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Ask your coach or team admin for the invite code
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-500 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;