import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { supabase } from "../supabaseClient";
import Navbar from "../components/navbar";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Complete any pending team setup from signup (when email confirmation was required)
  const completePendingTeamSetup = async () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("walkup-pending-team-setup");
    if (!raw) return;

    try {
      const { teamAction, teamName, inviteCode, userType } = JSON.parse(raw);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (teamAction === "create" && teamName) {
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .insert({ name: teamName.trim(), created_by: user.id })
          .select()
          .single();

        if (teamError) throw teamError;

        await supabase.from("team_members").insert({
          user_id: user.id,
          team_id: team.id,
          user_type: userType || "player",
          role: "admin",
        });

        localStorage.setItem("walkup-current-team", team.id);
      } else if (teamAction === "join" && inviteCode) {
        const { data } = await supabase.rpc("claim_invite_code", {
          invite_code: inviteCode.toUpperCase().trim(),
          member_type: userType || "player",
        });
        if (data?.team_id) {
          localStorage.setItem("walkup-current-team", data.team_id);
        }
      }
    } catch (err) {
      console.error("Error completing team setup:", err);
    } finally {
      localStorage.removeItem("walkup-pending-team-setup");
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Complete pending team setup if any
    await completePendingTeamSetup();

    navigate("/player-manager");
    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: "6.5rem" }} className="p-4 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;