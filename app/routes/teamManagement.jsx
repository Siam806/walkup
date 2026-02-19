import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../components/AuthProvider";
import { useTeam } from "../components/TeamProvider";
import Navbar from "../components/navbar";

export default function TeamManagement() {
  const { user } = useAuth();
  const { currentTeam, isAdmin, isCoach, loadTeams } = useTeam();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Invite code generation
  const [newCodeRole, setNewCodeRole] = useState("player");
  const [newCodePermanent, setNewCodePermanent] = useState(false);
  const [newCodeExpiry, setNewCodeExpiry] = useState("7");
  const [generatingCode, setGeneratingCode] = useState(false);

  // Team name editing
  const [editingName, setEditingName] = useState(false);
  const [teamName, setTeamName] = useState("");

  const loadData = useCallback(async () => {
    if (!currentTeam) return;
    setLoading(true);
    setError(null);

    try {
      // Load members
      const { data: memberData, error: memberError } = await supabase
        .from("team_members")
        .select("*, profiles:user_id(email)")
        .eq("team_id", currentTeam.id)
        .order("joined_at", { ascending: true });

      if (memberError) {
        // Fallback: query without profile join
        const { data: basicMembers } = await supabase
          .from("team_members")
          .select("*")
          .eq("team_id", currentTeam.id)
          .order("joined_at", { ascending: true });
        setMembers(basicMembers || []);
      } else {
        setMembers(memberData || []);
      }

      // Load invite codes (admins only)
      if (isAdmin) {
        const { data: codeData } = await supabase
          .from("invite_codes")
          .select("*")
          .eq("team_id", currentTeam.id)
          .order("created_at", { ascending: false });
        setInviteCodes(codeData || []);
      }

      // Load unlinked players for linking UI
      const { data: playerData } = await supabase
        .from("players")
        .select("id, first_name, last_name, jersey_number")
        .eq("team_id", currentTeam.id)
        .order("last_name", { ascending: true });
      setPlayers(playerData || []);

      setTeamName(currentTeam.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentTeam, isAdmin]);

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    if (currentTeam) {
      loadData();
    }
  }, [user, currentTeam, loadData, navigate]);

  // Generate invite code
  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc("generate_invite_code", {
        p_team_id: currentTeam.id,
        p_role: newCodeRole,
        p_is_permanent: newCodePermanent,
        p_expires_in_days: newCodePermanent ? null : parseInt(newCodeExpiry),
      });
      if (error) throw error;
      setSuccess(`Invite code generated: ${data}`);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setGeneratingCode(false);
    }
  };

  // Update member role
  const handleRoleChange = async (memberId, newRole) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ role: newRole })
        .eq("id", memberId);
      if (error) throw error;
      setSuccess("Role updated");
      loadData();
      loadTeams(); // Refresh in case current user's role changed
    } catch (err) {
      setError(err.message);
    }
  };

  // Link member to player record
  const handleLinkPlayer = async (memberId, playerId) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ player_id: playerId || null })
        .eq("id", memberId);
      if (error) throw error;

      // Also update the player's user_id to match the team member
      if (playerId) {
        const member = members.find((m) => m.id === memberId);
        if (member) {
          await supabase
            .from("players")
            .update({ user_id: member.user_id })
            .eq("id", playerId);
        }
      }

      setSuccess("Player linked");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Remove member
  const handleRemoveMember = async (memberId, memberUserId) => {
    if (memberUserId === user.id) {
      if (!confirm("Are you sure you want to leave this team?")) return;
    } else {
      if (!confirm("Remove this member from the team?")) return;
    }

    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
      setSuccess("Member removed");
      loadData();
      loadTeams();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete invite code
  const handleDeleteCode = async (codeId) => {
    try {
      const { error } = await supabase
        .from("invite_codes")
        .delete()
        .eq("id", codeId);
      if (error) throw error;
      setInviteCodes((prev) => prev.filter((c) => c.id !== codeId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Update team name
  const handleUpdateTeamName = async () => {
    if (!teamName.trim()) return;
    try {
      const { error } = await supabase
        .from("teams")
        .update({ name: teamName.trim() })
        .eq("id", currentTeam.id);
      if (error) throw error;
      setEditingName(false);
      setSuccess("Team name updated");
      loadTeams();
    } catch (err) {
      setError(err.message);
    }
  };

  // Copy invite code to clipboard
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setSuccess(`Copied: ${code}`);
  };

  if (!currentTeam) {
    return (
      <div>
        <Navbar />
        <div style={{ paddingTop: "6.5rem" }} className="p-4 max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-4">No Team Selected</h2>
          <p className="text-gray-600">
            You don't belong to any team yet.{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-500 hover:underline"
            >
              Create or join a team
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: "6.5rem" }} className="p-4 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {editingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="text-2xl font-bold border-b-2 border-blue-500 outline-none flex-1"
                autoFocus
              />
              <button
                onClick={handleUpdateTeamName}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setTeamName(currentTeam.name);
                }}
                className="px-3 py-1 bg-gray-200 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{currentTeam.name}</h1>
              {isAdmin && (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Edit team name"
                >
                  ✏️
                </button>
              )}
            </>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={() => setError(null)} className="float-right font-bold">
              ×
            </button>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
            <button onClick={() => setSuccess(null)} className="float-right font-bold">
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-8">
            {/* === MEMBERS === */}
            <section>
              <h2 className="text-lg font-semibold mb-3 border-b pb-2">
                Team Members ({members.length})
              </h2>
              <div className="space-y-3">
                {members.map((member) => {
                  const email = member.profiles?.email || member.user_id?.substring(0, 8) + "...";
                  const linkedPlayer = players.find(
                    (p) => p.id === member.player_id
                  );

                  return (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-white rounded-lg border"
                    >
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{email}</div>
                        <div className="text-sm text-gray-500 flex gap-2 flex-wrap">
                          <span className="capitalize">{member.user_type}</span>
                          <span>•</span>
                          <span
                            className={`font-medium ${
                              member.role === "admin"
                                ? "text-red-600"
                                : member.role === "coach"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          >
                            {member.role}
                          </span>
                          {linkedPlayer && (
                            <>
                              <span>•</span>
                              <span>
                                #{linkedPlayer.jersey_number}{" "}
                                {linkedPlayer.first_name} {linkedPlayer.last_name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions (admin only) */}
                      {isAdmin && member.user_id !== user.id && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Role selector */}
                          <select
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(member.id, e.target.value)
                            }
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="player">Player</option>
                            <option value="coach">Coach</option>
                            <option value="admin">Admin</option>
                          </select>

                          {/* Link to player */}
                          <select
                            value={member.player_id || ""}
                            onChange={(e) =>
                              handleLinkPlayer(member.id, e.target.value ? parseInt(e.target.value) : null)
                            }
                            className="text-sm border rounded px-2 py-1 max-w-[140px]"
                          >
                            <option value="">No player</option>
                            {players.map((p) => (
                              <option key={p.id} value={p.id}>
                                #{p.jersey_number} {p.first_name} {p.last_name}
                              </option>
                            ))}
                          </select>

                          {/* Remove */}
                          <button
                            onClick={() =>
                              handleRemoveMember(member.id, member.user_id)
                            }
                            className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                            title="Remove from team"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Self-leave (non-admin) */}
                      {member.user_id === user.id && !isAdmin && (
                        <button
                          onClick={() =>
                            handleRemoveMember(member.id, member.user_id)
                          }
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          Leave Team
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* === INVITE CODES (Admin only) === */}
            {isAdmin && (
              <section>
                <h2 className="text-lg font-semibold mb-3 border-b pb-2">
                  Invite Codes
                </h2>

                {/* Generate new code */}
                <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                  <h3 className="font-medium mb-3">Generate New Code</h3>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Role
                      </label>
                      <select
                        value={newCodeRole}
                        onChange={(e) => setNewCodeRole(e.target.value)}
                        className="border rounded px-3 py-2 text-sm"
                      >
                        <option value="player">Player</option>
                        <option value="coach">Coach</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Type
                      </label>
                      <select
                        value={newCodePermanent ? "permanent" : "single"}
                        onChange={(e) =>
                          setNewCodePermanent(e.target.value === "permanent")
                        }
                        className="border rounded px-3 py-2 text-sm"
                      >
                        <option value="single">Single Use</option>
                        <option value="permanent">Reusable</option>
                      </select>
                    </div>
                    {!newCodePermanent && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Expires In
                        </label>
                        <select
                          value={newCodeExpiry}
                          onChange={(e) => setNewCodeExpiry(e.target.value)}
                          className="border rounded px-3 py-2 text-sm"
                        >
                          <option value="1">1 day</option>
                          <option value="7">7 days</option>
                          <option value="30">30 days</option>
                          <option value="90">90 days</option>
                        </select>
                      </div>
                    )}
                    <button
                      onClick={handleGenerateCode}
                      disabled={generatingCode}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm font-medium"
                    >
                      {generatingCode ? "Generating..." : "Generate Code"}
                    </button>
                  </div>
                </div>

                {/* Existing codes */}
                {inviteCodes.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No invite codes yet. Generate one above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {inviteCodes.map((code) => {
                      const isUsed = code.used_by && !code.is_permanent;
                      const isExpired =
                        code.expires_at && new Date(code.expires_at) < new Date();

                      return (
                        <div
                          key={code.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            isUsed || isExpired
                              ? "bg-gray-100 opacity-60"
                              : "bg-white"
                          }`}
                        >
                          <code
                            className="font-mono text-lg tracking-widest font-bold cursor-pointer hover:text-blue-600"
                            onClick={() => copyCode(code.code)}
                            title="Click to copy"
                          >
                            {code.code}
                          </code>
                          <div className="flex-1 text-sm text-gray-500 flex gap-2 flex-wrap">
                            <span className="capitalize">{code.role}</span>
                            <span>•</span>
                            <span>
                              {code.is_permanent ? "Reusable" : "Single use"}
                            </span>
                            {isUsed && (
                              <>
                                <span>•</span>
                                <span className="text-orange-600">Used</span>
                              </>
                            )}
                            {isExpired && (
                              <>
                                <span>•</span>
                                <span className="text-red-600">Expired</span>
                              </>
                            )}
                            {code.expires_at && !isExpired && (
                              <>
                                <span>•</span>
                                <span>
                                  Expires{" "}
                                  {new Date(code.expires_at).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => copyCode(code.code)}
                            className="text-gray-400 hover:text-blue-500 text-sm"
                            title="Copy code"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => handleDeleteCode(code.id)}
                            className="text-gray-400 hover:text-red-500 text-sm"
                            title="Delete code"
                          >
                            🗑️
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* === QUICK ACTIONS === */}
            {(isAdmin || isCoach) && (
              <section>
                <h2 className="text-lg font-semibold mb-3 border-b pb-2">
                  Quick Actions
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/player-manager")}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                  >
                    Manage Players
                  </button>
                  <button
                    onClick={() => navigate("/field-layout")}
                    className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-sm"
                  >
                    Field Layout
                  </button>
                  <button
                    onClick={() => navigate("/edit-sound-effects")}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                  >
                    Sound Effects
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
