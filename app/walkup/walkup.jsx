// App.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import SharedYouTubePlayer from "../components/SharedYouTubePlayer";
import { extractVideoId } from "../utils";
import Navbar from "../components/navbar";

const App = () => {
  const [players, setPlayers] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("batting_number", { ascending: true });

      if (error) {
        console.error("Error fetching players:", error);
      } else {
        setPlayers(data);
      }
    };

    fetchPlayers();
  }, []);

  const handlePlay = (player) => {
    const videoId = extractVideoId(player.walk_up_song);
    setCurrentSong({
      videoId,
      start: player.walk_up_song_start || 0,
    });
  };

  return (
    <div>
        <Navbar />
        <div className="pt-20 p-4 sm:p-6 md:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Team Walk-Up Songs</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <div key={player.id} className="p-4 border rounded">
              <h2 className="text-lg font-bold mb-2">
                {player.first_name} "{player.nickname}" {player.last_name}
              </h2>
              <p>Jersey Number: {player.jersey_number}</p>
              <p>Batting Number: {player.batting_number}</p>
              <p>Position: {player.position}</p>
              <button
                onClick={() => handlePlay(player)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded w-full sm:w-auto"
              >
                Play Walk-Up Song
              </button>
            </div>
          ))}
        </div>

        {currentSong && (
          <div className="mt-8">
            <SharedYouTubePlayer
              key={currentSong.videoId}
              videoId={currentSong.videoId}
              start={currentSong.start}
              shouldPlay={true}
              onEnd={() => setCurrentSong(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
