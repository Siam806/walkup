import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import SharedYouTubePlayer from "../components/SharedYouTubePlayer";
import { extractVideoId } from "../utils";
import Navbar from "../components/navbar";

const LOCAL_STORAGE_KEY = "walkup-inGamePlayers";

const App = () => {
  const [players, setPlayers] = useState([]);
  const [battingOrder, setBattingOrder] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [inGamePlayers, setInGamePlayers] = useState([]);
  const playerRef = useRef(null);

  // Load inGamePlayers from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setInGamePlayers(JSON.parse(stored));
      } catch {
        setInGamePlayers([]);
      }
    }
  }, []);

  // Save inGamePlayers to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(inGamePlayers));
  }, [inGamePlayers]);

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
        setBattingOrder(data.map((player, index) => ({ ...player, index })));
      }
    };

    fetchPlayers();
  }, []);

  const handlePlay = (songUrl, startTime, duration = null, volume = 100, songType = "walkup", playerId = null) => {
    const videoId = extractVideoId(songUrl);
    setCurrentSong({
      videoId,
      start: startTime || 0,
      duration,
      volume,
      songType,
      playerId,
    });
  };

  const speakAnnouncement = (
    text,
    voice = "US English Male",
    onEndCallback = null
  ) => {
    if (window.responsiveVoice) {
      const enhancedText = text
        .replace(/:\s*/g, ". ")
        .replace(/\.\s*/g, ". ")
        .replace(/,/g, ", ")
        .replace(/!+/g, ".")
        .replace(/\s+/g, " ")
        .trim();

      window.responsiveVoice.speak(enhancedText, voice, {
        rate: 0.92,
        pitch: 1.02,
        volume: 1,
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
      playerRef.current.setVolume(30);
    }
    speakAnnouncement("Now batting...", "US English Male", () => {
      const mid = `Number ${player.jersey_number}, playing as ${player.position}.`;
      speakAnnouncement(mid, "US English Male", () => {
        const name = `${player.first_name} "${player.nickname}" ${player.last_name}`;
        speakAnnouncement(name, nativeVoice, () => {
          if (playerRef.current?.setVolume) {
            playerRef.current.setVolume(originalVolume);
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

    if (playerRef.current?.setVolume) {
      playerRef.current.setVolume(30);
    }

    // Start the music at 30% volume
    handlePlay(
      player.walk_up_song,
      player.walk_up_song_start,
      15,
      30, // <-- set initial volume to 30%
      "walkup",
      player.id
    );

    speakAnnouncement("Now batting...", englishVoice, () => {
      const middle = `Number ${player.jersey_number}, playing as ${player.position}.`;
      speakAnnouncement(middle, englishVoice, () => {
        const name = `${player.first_name} "${player.nickname}" ${player.last_name}`;
        speakAnnouncement(name, nativeVoice, () => {
          if (playerRef.current?.setVolume) {
            playerRef.current.setVolume(originalVolume);
          }
        });
      });
    });
  };

  // Batting order and in-game player logic
  const movePlayerToEnd = (player) => {
    setBattingOrder((prevOrder) => {
      const updatedOrder = prevOrder.filter((p) => p.id !== player.id);
      updatedOrder.push(player);
      return updatedOrder;
    });
  };

  const toggleInGamePlayer = (playerId) => {
    setInGamePlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const getSortedPlayers = () => {
    const inGame = battingOrder.filter((player) => inGamePlayers.includes(player.id));
    const reserve = battingOrder.filter((player) => !inGamePlayers.includes(player.id));
    return { inGame, reserve };
  };

  const { inGame, reserve } = getSortedPlayers();

  // Only reset the order of active players
  const resetBattingOrder = () => {
    // Get the original order of in-game players from the players array
    const originalOrder = players
      .filter((p) => inGamePlayers.includes(p.id))
      .map((p) => p.id);
    // Set battingOrder so in-game players are in original order, reserves unchanged
    setBattingOrder([
      ...players.filter((p) => inGamePlayers.includes(p.id)),
      ...players.filter((p) => !inGamePlayers.includes(p.id)),
    ]);
    // Optionally, you can also reset inGamePlayers to preserve only the order
    setInGamePlayers(originalOrder);
  };

  // Add a function to check if a player is currently playing a song
  const isPlayerCurrent = (player) =>
    currentSong && currentSong.videoId === extractVideoId(player.walk_up_song);

  return (
    <div>
      <Navbar />
      <div className="pt-28 p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Team Walk-Up Songs</h1>
        <button
          onClick={resetBattingOrder}
          className="mb-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          Reset Batting Order
        </button>
        {/* Active Players */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inGame.map((player) => (
            <div key={player.id} className="p-4 border rounded">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold mb-2">
                  {player.first_name} "{player.nickname}" {player.last_name}
                </h2>
                <input
                  type="checkbox"
                  checked={inGamePlayers.includes(player.id)}
                  onChange={() => toggleInGamePlayer(player.id)}
                  className="ml-2"
                />
              </div>
              <p>Jersey Number: {player.jersey_number}</p>
              <p>Batting Number: {player.batting_number}</p>
              <p>Position: {player.position}</p>
              <>
                <button
                  onClick={() => handlePlay(player.walk_up_song, player.walk_up_song_start, 15, 100, "walkup", player.id)}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded w-full sm:w-auto"
                >
                  Play Walk-Up Song (15s)
                </button>
                <button
                  onClick={() =>
                    handlePlay(player.home_run_song, player.home_run_song_start, null, 100, "home_run", player.id)
                  }
                  className="mt-2 px-4 py-2 bg-green-700 text-white rounded w-full sm:w-auto"
                >
                  Play Home Run Song
                </button>
                <button
                  onClick={() =>
                    handlePlay(player.pitching_walk_up_song, player.pitching_walk_up_song_start, 30, 100, "pitching", player.id)
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
                <button
                  onClick={() => movePlayerToEnd(player)}
                  className="mt-2 px-4 py-2 bg-gray-500 text-white rounded w-full sm:w-auto"
                >
                  Move to End
                </button>
              </>
              {/* Show YouTube player directly under this player if their song is playing */}
              {currentSong &&
                currentSong.playerId === player.id &&
                (
                  <div className="mt-4">
                    <SharedYouTubePlayer
                      ref={playerRef}
                      key={currentSong.videoId + currentSong.songType}
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
          ))}
        </div>

        {/* Separator for Reserve Players */}
        {reserve.length > 0 && (
          <>
            <div className="my-8 border-t border-gray-400 text-center relative">
              <span className="bg-white px-4 text-gray-600 absolute left-1/2 -translate-x-1/2 -top-3 font-semibold">
                Reserve Players
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reserve.map((player) => (
                <div key={player.id} className="p-4 border rounded opacity-70">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold mb-2">
                      {player.first_name} "{player.nickname}" {player.last_name}
                    </h2>
                    <input
                      type="checkbox"
                      checked={inGamePlayers.includes(player.id)}
                      onChange={() => toggleInGamePlayer(player.id)}
                      className="ml-2"
                    />
                  </div>
                  <p>Jersey Number: {player.jersey_number}</p>
                  <p>Batting Number: {player.batting_number}</p>
                  <p>Position: {player.position}</p>
                  {/* No action buttons for reserve players */}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;