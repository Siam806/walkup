import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import Navbar from "../components/navbar";

const PlayerManager = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    nickname: "",
    jersey_number: "",
    batting_number: "",
    position: "",
    walk_up_song: "",
    walk_up_song_start: "",
    home_run_song: "",
    home_run_song_start: "",
    pitching_walk_up_song: "",
    pitching_walk_up_song_start: "",
    nationality: "US", // Default nationality
  });

  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase.from("players").select("*");
      if (error) {
        console.error("Error fetching players:", error);
      } else {
        setPlayers(data);
      }
    };

    fetchPlayers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("players").insert([form]);
    if (error) {
      console.error("Error adding player:", error);
    } else {
      alert("Player added successfully!");
      setForm({
        first_name: "",
        last_name: "",
        nickname: "",
        jersey_number: "",
        batting_number: "",
        position: "",
        walk_up_song: "",
        walk_up_song_start: "",
        home_run_song: "",
        home_run_song_start: "",
        pitching_walk_up_song: "",
        pitching_walk_up_song_start: "",
        nationality: "US", // Reset to default
      });
      const { data, error: fetchError } = await supabase.from("players").select("*");
      if (fetchError) {
        console.error("Error fetching players:", fetchError);
      } else {
        setPlayers(data);
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: "6.5rem" }} className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Player Manager</h1>
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
            <input
              type="number"
              name="batting_number"
              value={form.batting_number}
              onChange={handleChange}
              placeholder="Batting Number"
              className="p-2 border rounded w-full"
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
        <ul className="space-y-4">
          {players.map((player) => (
            <li key={player.id} className="p-4 border rounded">
              <h3 className="text-lg font-bold">
                {player.first_name} "{player.nickname}" {player.last_name}
              </h3>
              <p>Jersey Number: {player.jersey_number}</p>
              <p>Position: {player.position}</p>
              <p>Nationality: {player.nationality}</p>
              <Link
                to={`/edit-player/${player.id}`}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded block sm:inline-block"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlayerManager;