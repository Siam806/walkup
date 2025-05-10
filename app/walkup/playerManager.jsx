import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import { useAuth } from '../components/AuthProvider';

const PlayerManager = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    nickname: "",
    jersey_number: "",
    position: "",
    walk_up_song: "",
    walk_up_song_start: "",
    home_run_song: "",
    home_run_song_start: "",
    pitching_walk_up_song: "",
    pitching_walk_up_song_start: "",
    nationality: "US", // Default nationality
    user_id: null, // Will be set before submission
  });

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth(); // Rename to avoid confusion

  useEffect(() => {
    // Fetch all players, not just user's players
    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabase.from("players").select("*");
        if (error) {
          console.error("Error fetching players:", error);
        } else {
          setPlayers(data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Unexpected error:", err);
        setLoading(false);
      }
    };

    // Only fetch data after auth is determined
    if (!authLoading) {
      fetchPlayers();
    }
  }, [user, authLoading]); // Removed 'id' since it's not defined

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("You must be logged in to add a player.");
      return;
    }
    
    // Create playerData with user_id already populated
    const playerData = { 
      ...form, 
      user_id: user.id 
    };
    
    // Debug to make sure the user_id is being sent
    console.log("Submitting player with:", playerData);
    
    const { data, error } = await supabase
      .from("players")
      .insert([playerData])
      .select();
      
    if (error) {
      console.error("Error adding player:", error);
      alert(`Error adding player: ${error.message}`);
    } else {
      alert("Player added successfully!");
      // Reset form
      setForm({
        first_name: "",
        last_name: "",
        nickname: "",
        jersey_number: "",
        position: "",
        walk_up_song: "",
        walk_up_song_start: "",
        home_run_song: "",
        home_run_song_start: "",
        pitching_walk_up_song: "",
        pitching_walk_up_song_start: "",
        nationality: "US",
        user_id: null,
      });
      
      // Refresh players
      const { data, error: fetchError } = await supabase.from("players").select("*");
      if (!fetchError) {
        setPlayers(data);
      }
    }
  };

  // Function to check if current user owns a player record
  const userOwnsPlayer = (playerId) => {
    if (!user) return false;
    const player = players.find(p => p.id === playerId);
    return player && player.user_id === user.id;
  };
  
  if (authLoading || loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: "6.5rem" }} className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Player Manager</h1>
        
        {/* Form remains the same */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="First Name"
              className="p-2 border rounded w-full"
              required
            />
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last Name"
              className="p-2 border rounded w-full"
              required
            />
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="Nickname"
              className="p-2 border rounded w-full"
            />
            <input
              type="number"
              name="jersey_number"
              value={form.jersey_number}
              onChange={handleChange}
              placeholder="Jersey Number"
              className="p-2 border rounded w-full"
              required
            />
            <select
              name="position"
              value={form.position}
              onChange={handleChange}
              className="p-2 border rounded w-full bg-gray-100 text-gray-800"
            >
              <option value="">Select Position</option>
              <option value="Pitcher">Pitcher</option>
              <option value="Catcher">Catcher</option>
              <option value="First Base">First Base</option>
              <option value="Second Base">Second Base</option>
              <option value="Third Base">Third Base</option>
              <option value="Shortstop">Shortstop</option>
              <option value="Left Field">Left Field</option>
              <option value="Center Field">Center Field</option>
              <option value="Right Field">Right Field</option>
              <option value="Designated Hitter">Designated Hitter</option>
            </select>
            <select
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
              className="p-2 border rounded w-full bg-gray-100 text-gray-800"
            >
              <option value="US">United States</option>
              <option value="TH">Thailand</option>
              <option value="JP">Japan</option>
              <option value="UK">United Kingdom</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
            </select>
            <input
              type="text"
              name="walk_up_song"
              value={form.walk_up_song}
              onChange={handleChange}
              placeholder="Walk-Up Song (YouTube URL)"
              className="p-2 border rounded w-full"
            />
            <input
              type="number"
              name="walk_up_song_start"
              value={form.walk_up_song_start}
              onChange={handleChange}
              placeholder="Walk-Up Song Start Time (seconds)"
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              name="home_run_song"
              value={form.home_run_song}
              onChange={handleChange}
              placeholder="Home Run Song (YouTube URL)"
              className="p-2 border rounded w-full"
            />
            <input
              type="number"
              name="home_run_song_start"
              value={form.home_run_song_start}
              onChange={handleChange}
              placeholder="Home Run Song Start Time (seconds)"
              className="p-2 border rounded w-full"
            />
            <input
              type="text"
              name="pitching_walk_up_song"
              value={form.pitching_walk_up_song}
              onChange={handleChange}
              placeholder="Pitching Walk-Up Song (YouTube URL)"
              className="p-2 border rounded w-full"
            />
            <input
              type="number"
              name="pitching_walk_up_song_start"
              value={form.pitching_walk_up_song_start}
              onChange={handleChange}
              placeholder="Pitching Walk-Up Song Start Time (seconds)"
              className="p-2 border rounded w-full"
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded w-full sm:w-auto"
          >
            Add Player
          </button>
        </form>
        
        {/* Updated player list */}
        <ul className="space-y-4">
          {players.length === 0 ? (
            <p>No players found. Add your first player above!</p>
          ) : (
            players.map((player) => (
              <li key={player.id} className="p-4 border rounded">
                <h3 className="text-lg font-bold">
                  {player.first_name} {player.nickname ? `"${player.nickname}"` : ""} {player.last_name}
                </h3>
                <p>Jersey Number: {player.jersey_number}</p>
                <p>Position: {player.position || "Not specified"}</p>
                <p>Nationality: {player.nationality || "US"}</p>
                
                {/* Only show edit button for players the user owns */}
                {(player.user_id === user.id || !player.user_id) && (
                  <Link
                    to={`/edit-player/${player.id}`}
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded block sm:inline-block"
                  >
                    Edit
                  </Link>
                )}
                
                {/* If player has no user_id, show a claim button */}
                {!player.user_id && (
                  <button
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from("players")
                          .update({ user_id: user.id })
                          .eq("id", player.id)
                          .is("user_id", null); // Add this to ensure we only update unowned players

                        if (error) {
                          console.error("Error claiming player:", error);
                          alert(`Error claiming player: ${error.message}`);
                        } else {
                          alert("Player claimed successfully!");
                          // Refresh the player list
                          const { data, error: fetchError } = await supabase.from("players").select("*");
                          if (fetchError) {
                            console.error("Error refreshing players:", fetchError);
                          } else {
                            setPlayers(data);
                          }
                        }
                      } catch (err) {
                        console.error("Unexpected error:", err);
                        alert("An unexpected error occurred");
                      }
                    }}
                    className="mt-2 ml-2 px-4 py-2 bg-blue-500 text-white rounded block sm:inline-block"
                  >
                    Claim Player
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default PlayerManager;