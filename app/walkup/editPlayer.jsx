import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Navbar from "../components/navbar";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { useTeam } from '../components/TeamProvider';

const EditPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [componentLoading, setComponentLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isCoach } = useTeam();

  // Players can only edit personal fields (songs, nickname)
  // Admins and coaches can edit everything
  const canEditAllFields = isAdmin || isCoach;

  useEffect(() => {
    // Only fetch data when auth is determined and we have a user
    const fetchPlayer = async () => {
      if (authLoading) return;
      
      setComponentLoading(true); // Use componentLoading instead of loading
      try {
        // Get player data
        const { data, error } = await supabase
          .from("players")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          setError(`Error fetching player: ${error.message}`);
        } else if (user && user.id !== data.user_id && !isAdmin && !isCoach) {
          setError("Not authorized to edit this player");
        } else {
          setForm(data);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("An unexpected error occurred");
      } finally {
        setComponentLoading(false); // Use componentLoading instead of loading
      }
    };

    fetchPlayer();
  }, [id, user, authLoading]); // Changed loading to authLoading

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("players")
      .update(form)
      .eq("id", id);

    if (error) {
      console.error("Error updating player:", error);
    } else {
      alert("Player updated successfully!");
      navigate("/player-manager"); // Redirect back to the player manager page
    }
  };

  if (authLoading || componentLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div style={{ paddingTop: "6.5rem" }} className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div>
        <Navbar />
        <div style={{ paddingTop: "6.5rem" }} className="p-4">
          <p>Player not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
        <Navbar />
        <div style={{ paddingTop: "6.5rem" }} className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Player</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="First Name"
            className={`p-2 border rounded ${!canEditAllFields ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
            disabled={!canEditAllFields}
          />
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            className={`p-2 border rounded ${!canEditAllFields ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
            disabled={!canEditAllFields}
          />
          <input
            type="text"
            name="nickname"
            value={form.nickname}
            onChange={handleChange}
            placeholder="Nickname"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="jersey_number"
            value={form.jersey_number}
            onChange={handleChange}
            placeholder="Jersey Number"
            className={`p-2 border rounded ${!canEditAllFields ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
            disabled={!canEditAllFields}
          />
          <input
            type="text"
            name="position"
            value={form.position}
            onChange={handleChange}
            placeholder="Position"
            className={`p-2 border rounded ${!canEditAllFields ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            disabled={!canEditAllFields}
          />
          <input
            type="text"
            name="walk_up_song"
            value={form.walk_up_song}
            onChange={handleChange}
            placeholder="Walk-Up Song (YouTube URL)"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="walk_up_song_start"
            value={form.walk_up_song_start}
            onChange={handleChange}
            placeholder="Walk-Up Song Start Time (seconds)"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="home_run_song"
            value={form.home_run_song}
            onChange={handleChange}
            placeholder="Home Run Song (YouTube URL)"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="home_run_song_start"
            value={form.home_run_song_start}
            onChange={handleChange}
            placeholder="Home Run Song Start Time (seconds)"
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="pitching_walk_up_song"
            value={form.pitching_walk_up_song}
            onChange={handleChange}
            placeholder="Pitching Walk-Up Song (YouTube URL)"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="pitching_walk_up_song_start"
            value={form.pitching_walk_up_song_start}
            onChange={handleChange}
            placeholder="Pitching Walk-Up Song Start Time (seconds)"
            className="p-2 border rounded"
          />
          <select
            name="nationality"
            value={form.nationality || "US"}
            onChange={handleChange}
            className="p-2 border rounded bg-gray-100 text-gray-800"
          >
            <option value="US">United States</option>
            <option value="TH">Thailand</option>
            <option value="JP">Japan</option>
            <option value="UK">United Kingdom</option>
            <option value="FR">France</option>
            <option value="DE">Germany</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Update Player
        </button>
      </form>
    </div>
    </div>
  );
};

export default EditPlayer;