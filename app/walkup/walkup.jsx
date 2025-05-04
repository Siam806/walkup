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

  const handlePlay = (songUrl, startTime, duration = 15, volume = 100) => {
    const videoId = extractVideoId(songUrl);
    setCurrentSong({
      videoId,
      start: startTime || 0,
      duration,
      volume,
    });
  };

  const speakAnnouncement = (text, voice = "US English Male", onEndCallback = null) => {
    // Use ResponsiveVoice with the specified voice
    if (window.responsiveVoice) {
      window.responsiveVoice.speak(
        text,
        voice,
        {
          rate: 1, // Slightly slower speech
          pitch: 1, // Slightly higher pitch
          volume: 1, // Full volume
          onend: onEndCallback,
        }
      );
    } else {
      console.error("ResponsiveVoice is not loaded. Ensure the script is included in your index.html.");
    }
  };

  const handleAnnouncement = (player) => {
    // Announcement text excluding the name
    const announcement = `Now batting, number ${player.batting_number}, playing ${player.position}.`;

    // Map nationality to voice
    const voiceMap = {
      US: "US English Male",
      TH: "Thai Male",
      JP: "Japanese Male",
      UK: "UK English Male",
      FR: "French Male",
      DE: "Deutsch Male",
    };

    const nativeVoice = voiceMap[player.nationality] || "US English Male";

    // Speak the announcement in US English Male
    speakAnnouncement(announcement, "US English Male", () => {
      // Speak the player's name in their native language
      const name = `${player.first_name} "${player.nickname}" ${player.last_name}`;
      speakAnnouncement(name, nativeVoice);
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
                onClick={() => handlePlay(player.walk_up_song, player.walk_up_song_start, 15)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded w-full sm:w-auto"
              >
                Play Walk-Up Song (15s)
              </button>
              <button
                onClick={() =>
                  handlePlay(player.home_run_song, player.home_run_song_start, 15)
                }
                className="mt-2 px-4 py-2 bg-green-700 text-white rounded w-full sm:w-auto"
              >
                Play Home Run Song (15s)
              </button>
              <button
                onClick={() =>
                  handlePlay(player.pitching_walk_up_song, player.pitching_walk_up_song_start, 30)
                }
                className="mt-2 px-4 py-2 bg-red-700 text-white rounded w-full sm:w-auto"
              >
                Play Pitching Walk-Up Song (30s)
              </button>
              <button
                onClick={() => handleAnnouncement(player)}
                className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded w-full sm:w-auto"
              >
                Announce Player
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
              duration={currentSong.duration} // Pass the duration
              volume={currentSong.volume} // Pass the volume
              onEnd={() => setCurrentSong(null)}
            />
          </div>
        )}
      </div>
      <button
  onClick={() => {
    if (window.responsiveVoice) {
      console.log("Calling responsiveVoice...");
      window.responsiveVoice.speak("Testing voice playback", "UK English Male");
    } else {
      console.log("responsiveVoice not available");
    }
  }}
>
  Test Voice
</button>
    </div>
  );
};

export default App;
