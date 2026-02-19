import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import { supabase } from "../supabaseClient";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { useTeam } from '../components/TeamProvider';

// Helper function to log activity
const logActivity = async (userId, email, action, details, teamId) => {
  try {
    const { error } = await supabase.from("activity_logs").insert([{
      user_id: userId,
      email: email,
      action: action,
      details: details,
      timestamp: new Date().toISOString(),
      team_id: teamId || null,
    }]);
    
    if (error) {
      console.error("Error logging activity:", error);
    }
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};

const EditSoundEffects = () => {
  const [form, setForm] = useState({ id: null, label: "", src: "" });
  const [soundEffects, setSoundEffects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [componentLoading, setComponentLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const { currentTeam, isAdmin, isCoach, loading: teamLoading } = useTeam();

  useEffect(() => {
    // Only fetch data when auth is determined
    if (authLoading || teamLoading || !currentTeam) return;
    
    const fetchSoundEffects = async () => {
      setComponentLoading(true);
      try {
        const { data, error } = await supabase
          .from("sound_effects")
          .select("*")
          .eq("team_id", currentTeam.id);
        if (error) {
          console.error("Error fetching sound effects:", error);
          setError(`Error fetching sound effects: ${error.message}`);
        } else {
          setSoundEffects(data);
          setError(null);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setComponentLoading(false);
      }
    };
    
    fetchSoundEffects();
  }, [user, authLoading, teamLoading, currentTeam]);

  const fetchSoundEffects = async () => {
    if (!currentTeam) return;
    try {
      const { data, error } = await supabase
        .from("sound_effects")
        .select("*")
        .eq("team_id", currentTeam.id);
      if (error) {
        console.error("Error fetching sound effects:", error);
      } else {
        setSoundEffects(data);
      }
    } catch (err) {
      console.error("Unexpected error refreshing sound effects:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.label || !form.src) {
      alert("Please fill in both fields.");
      return;
    }

    if (isEditing) {
      const { error } = await supabase
        .from("sound_effects")
        .update({ label: form.label, src: form.src })
        .eq("id", form.id);

      if (error) {
        console.error("Error updating sound effect:", error);
      } else {
        // Log the update activity
        await logActivity(
          user.id,
          user.email,
          "UPDATE_SOUND_EFFECT",
          `Updated sound effect: ${form.label} (ID: ${form.id})`
        );

        alert("Sound effect updated!");
        setIsEditing(false);
        setForm({ id: null, label: "", src: "" });
        fetchSoundEffects();
      }
    } else {
      const { data, error } = await supabase.from("sound_effects").insert([{
        label: form.label,
        src: form.src,
        team_id: currentTeam?.id,
      }]).select();

      if (error) {
        console.error("Error adding sound effect:", error);
        alert("Failed to add sound.");
      } else {
        // Log the create activity
        await logActivity(
          user.id,
          user.email,
          "CREATE_SOUND_EFFECT",
          `Created sound effect: ${form.label}`
        );

        setForm({ id: null, label: "", src: "" });
        fetchSoundEffects();
      }
    }
  };

  const handleEdit = (effect) => {
    setForm(effect);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setForm({ id: null, label: "", src: "" });
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    // Find the sound effect to include details in the log
    const soundEffectToDelete = soundEffects.find(effect => effect.id === id);

    const { error } = await supabase.from("sound_effects").delete().eq("id", id);
    if (error) {
      console.error("Error deleting sound effect:", error);
    } else {
      // Log the delete activity
      await logActivity(
        user.id,
        user.email,
        "DELETE_SOUND_EFFECT",
        `Deleted sound effect: ${soundEffectToDelete?.label || 'Unknown'} (ID: ${id})`
      );

      fetchSoundEffects();
    }
  };

  // Add proper loading and auth check
  if (authLoading || teamLoading || componentLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: "6.5rem" }} className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Manage Sound Effects</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <input
            type="text"
            name="label"
            value={form.label}
            onChange={handleChange}
            placeholder="Label"
            className="p-2 border rounded mr-2"
          />
          <input
            type="text"
            name="src"
            value={form.src}
            onChange={handleChange}
            placeholder="MP3 URL"
            className="p-2 border rounded mr-2"
          />
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded ${
              isEditing ? "bg-green-600" : "bg-blue-500"
            }`}
          >
            {isEditing ? "Update" : "Add"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="ml-2 px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
          )}
        </form>

        <ul className="space-y-4">
          {soundEffects.map((effect) => (
            <li key={effect.id} className="border p-4 rounded">
              <h2 className="font-bold">{effect.label}</h2>
              <p className="text-sm text-gray-600 truncate max-w-full overflow-hidden">
                {effect.src}
              </p>
              <audio controls className="my-2">
                <source src={effect.src} type="audio/mpeg" />
              </audio>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(effect)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(effect.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EditSoundEffects;
