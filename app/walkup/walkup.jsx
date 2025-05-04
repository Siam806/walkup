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

  const handlePlay = (songUrl, startTime, duration = 15) => {
    const videoId = extractVideoId(songUrl);
    setCurrentSong({
      videoId,
      start: startTime || 0,
      duration,
    });
  };

  const speakAnnouncement = (text) => {
    // Create a new SpeechSynthesisUtterance instance
    const speech = new SpeechSynthesisUtterance(text);
    
    // Set the language to Japanese
    speech.lang = 'ja-JP'; // Japanese language code
    
    // Customize speech rate, pitch, and volume
    speech.rate = 1; // Speed of speech
    speech.pitch = 1; // Neutral pitch
    speech.volume = 1; // Full volume
    
    // Get the available voices
    const voices = window.speechSynthesis.getVoices();
  
    // Find a Japanese male voice (Voice names can vary, but this should work in most cases)
    const selectedVoice = voices.find(voice => voice.lang === 'ja-JP' && voice.name.includes('Google 日本語男性'));
  
    // If a suitable voice is found, apply it
    if (selectedVoice) {
      speech.voice = selectedVoice;
    } else {
      console.log("Japanese male voice not found, using default.");
    }
  
    // Speak the announcement
    window.speechSynthesis.speak(speech);
  };
  const handleAnnouncement = (player) => {
    const announcement = `Now batting, number ${player.batting_number}, ${player.first_name} "${player.nickname}" ${player.last_name}, playing ${player.position}.`;
    speakAnnouncement(announcement);
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
                onClick={() => handlePlay(player.walk_up_song, player.walk_up_song_start)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded w-full sm:w-auto"
              >
                Play Walk-Up Song
              </button>
              <button
                onClick={() =>
                  handlePlay(player.home_run_song, player.home_run_song_start, 45)
                }
                className="mt-2 px-4 py-2 bg-green-700 text-white rounded w-full sm:w-auto"
              >
                Play Home Run Song (45s)
              </button>
              <button
                onClick={() =>
                  handlePlay(player.pitching_walk_up_song, player.pitching_walk_up_song_start, 45)
                }
                className="mt-2 px-4 py-2 bg-red-700 text-white rounded w-full sm:w-auto"
              >
                Play Pitching Walk-Up Song (45s)
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
              onEnd={() => setCurrentSong(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
