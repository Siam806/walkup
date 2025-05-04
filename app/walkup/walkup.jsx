// App.js
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import SharedYouTubePlayer from "../components/SharedYouTubePlayer";
import { extractVideoId } from "../utils";
import Navbar from "../components/navbar";


const App = () => {
  const [players, setPlayers] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const playerRef = useRef(null); // NEW: Ref for controlling volume


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

  const speakAnnouncement = (
    text,
    voice = "US English Male",
    onEndCallback = null
  ) => {
    if (window.responsiveVoice) {
      // Add subtle pauses and emphasize key phrases
      const enhancedText = text
        .replace(/:\s*/g, ". ") // convert colons to pauses
        .replace(/\.\s*/g, ". ") // ensure proper spacing after periods
        .replace(/,/g, ", ") // ensure natural breaks at commas
        .replace(/!+/g, ".") // reduce unnatural shouting tone
        .replace(/\s+/g, " ") // normalize spacing
        .trim();
  
      window.responsiveVoice.speak(enhancedText, voice, {
        rate: 0.92,      // natural pace
        pitch: 1.02,     // slightly expressive
        volume: 1,       // max volume
        onend: onEndCallback,
      });
    } else {
      console.error("ResponsiveVoice is not loaded. Ensure the script is included globally.");
    }
  };

  const handleAnnouncement = (player) => {
    const voiceMap = {
      US: "US English Male",
      TH: "Thai Male",
      JP: "Japanese Male",
      UK: "UK English Male",
      FR: "French Male",
      DE: "Deutsch Male",
    };
  
    const nativeVoice = voiceMap[player.nationality] || "US English Male";
  
    const originalVolume = playerRef.current?.getVolume?.() ?? 100;
    if (playerRef.current?.setVolume) {
      playerRef.current.setVolume(30); // duck volume
    }
    speakAnnouncement("Now batting...", "US English Male", () => {
      const mid = `Number ${player.jersey_number}, playing as ${player.position}.`;
      speakAnnouncement(mid, "US English Male", () => {
        const name = `${player.first_name} "${player.nickname}" ${player.last_name}`;
        speakAnnouncement(name, nativeVoice, () => {
          if (playerRef.current?.setVolume) {
            playerRef.current.setVolume(originalVolume); // restore volume
          }
        });
      });
    });
  };

  const handleIntro = (player) => {
    const voiceMap = {
      US: "US English Male",
      TH: "Thai Male",
      JP: "Japanese Male",
      UK: "UK English Male",
      FR: "French Male",
      DE: "Deutsch Male",
    };
  
    const nativeVoice = voiceMap[player.nationality] || "US English Male";
    const englishVoice = "US English Male";
    const originalVolume = playerRef.current?.getVolume?.() ?? 100;
  
    // 1. Start the music at low volume
    handlePlay(player.walk_up_song, player.walk_up_song_start, 15, 30);
  
    // 2. Speak intro in English
    speakAnnouncement(
      `Now batting. Number ${player.jersey_number}, playing as ${player.position}.`,
      englishVoice,
      () => {
        // 3. Then speak the name in the player's native voice
        const name = `${player.first_name} "${player.nickname}" ${player.last_name}`;
        speakAnnouncement(name, nativeVoice, () => {
          // 4. Restore volume
          if (playerRef.current?.setVolume) {
            playerRef.current.setVolume(originalVolume);
          }
        });
      }
    );
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
              <button
  onClick={() => handleIntro(player)}
  className="mt-2 px-4 py-2 bg-purple-600 text-white rounded w-full sm:w-auto"
>
  Intro: Announce + Play Walk-Up
</button>

            </div>
          ))}
        </div>

        {currentSong && (
          <div className="mt-8">
            <SharedYouTubePlayer
  ref={playerRef}
  key={currentSong.videoId}
  videoId={currentSong.videoId}
  start={currentSong.start}
  shouldPlay={true}
  duration={currentSong.duration}
  volume={currentSong.volume}
  onEnd={() => setCurrentSong(null)}
/>

          </div>
        )}
      </div>
      </div>
  );
};

export default App;
