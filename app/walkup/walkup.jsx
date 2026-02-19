import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";
import SharedYouTubePlayer from "../components/SharedYouTubePlayer";
import { extractVideoId } from "../utils";
import Navbar from "../components/navbar";
import AnnouncementSettingsModal from "../components/AnnouncementSettingsModal";
import BattingOrderSlots from "../components/BattingOrderSlots";
import PlayerPool from "../components/PlayerPool";
import { useTeam } from "../components/TeamProvider";

const ANNOUNCEMENT_PREFS_KEY = "walkup-announcement-prefs";
const SLOTS_COUNT = 9;

// ── Persistence helpers ───────────────────────────────────────────────────────

function slotsKey(teamPrefix) {
  return teamPrefix ? `walkup-${teamPrefix}-slots` : "walkup-slots";
}

function loadSlots(key, allPlayers) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return Array(SLOTS_COUNT).fill(null);
    const ids = JSON.parse(raw);
    if (!Array.isArray(ids)) return Array(SLOTS_COUNT).fill(null);
    return ids.map((id) =>
      id ? allPlayers.find((p) => p.id === id) ?? null : null
    );
  } catch {
    return Array(SLOTS_COUNT).fill(null);
  }
}

function persistSlots(key, slots) {
  const ids = slots.map((p) => (p ? p.id : null));
  localStorage.setItem(key, JSON.stringify(ids));
}

const App = () => {
  const [players, setPlayers] = useState([]);
  const [slots, setSlots] = useState(Array(SLOTS_COUNT).fill(null));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const playerRef = useRef(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { currentTeam } = useTeam();

  const [announcementPrefs, setAnnouncementPrefs] = useState({
    includeVoiceIntro: true,
    includeJerseyNumber: true,
    includePosition: true,
  });

  useEffect(() => {
    const prefsKey = currentTeam?.id 
      ? `walkup-${currentTeam.id.substring(0, 8)}-announcement-prefs`
      : ANNOUNCEMENT_PREFS_KEY;
    const storedPrefs = localStorage.getItem(prefsKey);
    if (storedPrefs) {
      try {
        setAnnouncementPrefs(JSON.parse(storedPrefs));
      } catch {}
    }
  }, [currentTeam]);

  useEffect(() => {
    const prefsKey = currentTeam?.id 
      ? `walkup-${currentTeam.id.substring(0, 8)}-announcement-prefs`
      : ANNOUNCEMENT_PREFS_KEY;
    localStorage.setItem(prefsKey, JSON.stringify(announcementPrefs));
  }, [announcementPrefs, currentTeam]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        let query = supabase.from("players").select("*");
        
        // Scope by team if available
        if (currentTeam?.id) {
          query = query.eq("team_id", currentTeam.id);
        }
        
        const { data, error } = await query;

        if (error) throw error;

        setPlayers(data);

        const teamPrefix = currentTeam?.id
          ? currentTeam.id.substring(0, 8)
          : null;
        setSlots(loadSlots(slotsKey(teamPrefix), data));
      } catch (error) {
        console.error("Error in fetchPlayers:", error);
      }
    };

    fetchPlayers();
  }, [currentTeam]);

  // Persist slots whenever they change
  useEffect(() => {
    if (!players.length) return;
    const teamPrefix = currentTeam?.id ? currentTeam.id.substring(0, 8) : null;
    persistSlots(slotsKey(teamPrefix), slots);
  }, [slots, currentTeam, players]);

  // Unassigned players (pool)
  const slottedIds = React.useMemo(
    () => new Set(slots.filter(Boolean).map((p) => p.id)),
    [slots]
  );
  const poolPlayers = React.useMemo(
    () => players.filter((p) => !slottedIds.has(p.id)),
    [players, slottedIds]
  );

  // Slot interaction handlers
  const handleSelectSlot = useCallback((index) => {
    setSelectedSlot((prev) => (prev === index ? null : index));
  }, []);

  const handleRemovePlayer = useCallback((index) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setSelectedSlot(null);
  }, []);

  const handleAssignPlayer = useCallback(
    (playerId) => {
      const player = players.find((p) => p.id === playerId);
      if (!player) return;
      setSlots((prev) => {
        const next = [...prev];
        let target =
          selectedSlot !== null
            ? selectedSlot
            : next.findIndex((s) => s === null);
        if (target === -1) target = 0;
        const existingIndex = next.findIndex((s) => s?.id === playerId);
        if (existingIndex !== -1 && existingIndex !== target) {
          next[existingIndex] = next[target];
        }
        next[target] = player;
        return next;
      });
      setSelectedSlot(null);
    },
    [players, selectedSlot]
  );

  const handlePlay = (songUrl, startTime, duration = null, volume = 100, songType = "walkup", playerId = null) => {
    if (!songUrl) return;
    const videoId = extractVideoId(songUrl);
    if (!videoId) {
      alert(`Invalid YouTube URL: ${songUrl}`);
      return;
    }
    setCurrentSong({ videoId, start: startTime || 0, duration, volume, songType, playerId });
  };

  // Queue for announcements when responsiveVoice isn't ready
  const speechQueueRef = useRef([]);
  const responsiveVoiceReadyRef = useRef(
    typeof window !== 'undefined' && Boolean(window.responsiveVoice)
  );

  useEffect(() => {
    if (responsiveVoiceReadyRef.current) return;
    const interval = setInterval(() => {
      if (window.responsiveVoice) {
        responsiveVoiceReadyRef.current = true;
        // flush queued announcements
        while (speechQueueRef.current.length > 0) {
          const { text, voice, onEndCallback } = speechQueueRef.current.shift();
          try {
            window.responsiveVoice.speak(text, voice, {
              rate: 0.92,
              pitch: 1.02,
              volume: 1,
              onend: onEndCallback,
            });
          } catch (e) {
            console.error("responsiveVoice.speak failed while flushing queue", e);
          }
        }
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Prime TTS on first user interaction to avoid autoplay/initialization delays
  useEffect(() => {
    const prime = () => {
      try {
        if (window.responsiveVoice) {
          // small silent utterance to warm up voices (some browsers require user gesture)
          window.responsiveVoice.speak(" ", "US English Male", { rate: 1, volume: 0 });
        }
      } catch (e) {
        /* ignore */
      }

      try {
        if (window.speechSynthesis && typeof SpeechSynthesisUtterance !== "undefined") {
          const u = new SpeechSynthesisUtterance(" ");
          window.speechSynthesis.speak(u);
          window.speechSynthesis.cancel();
        }
      } catch (e) {
        /* ignore */
      }

      window.removeEventListener("pointerdown", prime);
    };

    window.addEventListener("pointerdown", prime, { once: true });
    return () => window.removeEventListener("pointerdown", prime);
  }, []);

  const speakAnnouncement = (text, voice = "US English Male", onEndCallback = null) => {
    const enhancedText = text
      .replace(/:\s*/g, ". ")
      .replace(/\.\s*/g, ". ")
      .replace(/,/g, ", ")
      .replace(/!+/g, ".")
      .replace(/\s+/g, " ")
      .trim();

    // Prefer responsiveVoice when available
    if (window.responsiveVoice) {
      try {
        window.responsiveVoice.speak(enhancedText, voice, {
          rate: 0.92,
          pitch: 1.02,
          volume: 1,
          onend: onEndCallback,
        });
        return;
      } catch (err) {
        console.warn("responsiveVoice.speak threw, falling back:", err);
      }
    }

    // Queue the announcement so it will run when responsiveVoice becomes available
    speechQueueRef.current.push({ text: enhancedText, voice, onEndCallback });
    console.warn("responsiveVoice not ready — queued announcement");

    // Fallback: use native Web Speech API if present to avoid initial silence
    if (typeof window.speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined") {
      try {
        const utter = new SpeechSynthesisUtterance(enhancedText);
        utter.rate = 0.92;
        utter.pitch = 1.02;
        utter.volume = 1;

        // best-effort language mapping from responsiveVoice voice name
        const langHint = (/Thai/i.test(voice) && "th") ||
                         (/Japanese/i.test(voice) && "ja") ||
                         (/Deutsch|German/i.test(voice) && "de") ||
                         (/French/i.test(voice) && "fr") ||
                         (/UK English/i.test(voice) && "en-GB") ||
                         "en-US";
        const voices = window.speechSynthesis.getVoices() || [];
        const matched = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(langHint.toLowerCase()));
        if (matched) utter.voice = matched;

        utter.onend = onEndCallback;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
        return;
      } catch (e) {
        console.warn("Native speechSynthesis fallback failed:", e);
      }
    }

    // If neither API is available the announcement remains queued until responsiveVoice loads.
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
    const englishVoice = "US English Male";

    const originalVolume = playerRef.current?.getVolume?.() ?? 100;
    if (playerRef.current?.setVolume) {
      playerRef.current.setVolume(30);
    }

    if (announcementPrefs.includeVoiceIntro) {
      speakAnnouncement("Now batting...", englishVoice, () => {
        let middle = "";
        if (announcementPrefs.includeJerseyNumber) {
          middle += `Number ${player.jersey_number}`;
        }

        if (announcementPrefs.includePosition && announcementPrefs.includeJerseyNumber) {
          middle += `, playing as ${player.position}`;
        } else if (announcementPrefs.includePosition) {
          middle += `Playing as ${player.position}`;
        }

        if (middle) {
          speakAnnouncement(middle, englishVoice, () => {
            const name = `${player.first_name} "${player.nickname}" ${player.last_name}`;
            speakAnnouncement(name, nativeVoice, () => {
              if (playerRef.current?.setVolume) {
                playerRef.current.setVolume(originalVolume);
              }
            });
          });
        } else {
          const name = `${player.first_name} "${player.nickname}" ${player.last_name}`;
          speakAnnouncement(name, nativeVoice, () => {
            if (playerRef.current?.setVolume) {
              playerRef.current.setVolume(originalVolume);
            }
          });
        }
      });
    } else {
      const name = `${player.first_name} "${player.nickname}" ${player.last_name}`;
      speakAnnouncement(name, nativeVoice, () => {
        if (playerRef.current?.setVolume) {
          playerRef.current.setVolume(originalVolume);
        }
      });
    }
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

    // Set the duration to 15 seconds explicitly for walk-up songs
    const WALK_UP_DURATION = 15;

    // Play the walk-up song with the 15 second limit
    handlePlay(
      player.walk_up_song, 
      player.walk_up_song_start, 
      WALK_UP_DURATION, // Explicitly set to 15 seconds
      30, 
      "walkup", 
      player.id
    );

    if (announcementPrefs.includeVoiceIntro) {
      speakAnnouncement("Now batting...", englishVoice, () => {
        let middle = "";
        if (announcementPrefs.includeJerseyNumber) {
          middle += `Number ${player.jersey_number}`;
        }

        if (announcementPrefs.includePosition && announcementPrefs.includeJerseyNumber) {
          middle += `, playing as ${player.position}`;
        } else if (announcementPrefs.includePosition) {
          middle += `Playing as ${player.position}`;
        }

        if (middle) {
          speakAnnouncement(middle, englishVoice, () => {
            const name = `${player.first_name} "${player.nickname}" ${player.last_name}`;
            speakAnnouncement(name, nativeVoice, () => {
              if (playerRef.current?.setVolume) {
                playerRef.current.setVolume(originalVolume);
              }
            });
          });
        } else {
          const name = `${player.first_name} "${player.nickname}" ${player.last_name}`;
          speakAnnouncement(name, nativeVoice, () => {
            if (playerRef.current?.setVolume) {
              playerRef.current.setVolume(originalVolume);
            }
          });
        }
      });
    } else {
      setTimeout(() => {
        if (playerRef.current?.setVolume) {
          playerRef.current.setVolume(originalVolume);
        }
      }, 2000);
    }
  };

  const handleClearLineup = () => {
    if (!window.confirm("Clear all 9 batting slots?")) return;
    setSlots(Array(SLOTS_COUNT).fill(null));
    setSelectedSlot(null);
  };

  return (
    <div>
      <Navbar />
      <div className="h-16" />
      <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
        {players.length === 0 ? (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent" />
            <p className="mt-4">Loading players…</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h1 className="text-xl sm:text-2xl font-bold">Team Walk-Up Songs</h1>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                  ⚙️ Settings
                </button>
                <button
                  onClick={handleClearLineup}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  🗑 Clear Lineup
                </button>
              </div>
            </div>

            {/* How-to hint */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
              <strong>How to build your lineup:</strong>{" "}
              Click an <em>empty slot</em> to select it, then click a player in
              the pool to assign them — or tap <strong>+ Assign</strong> on any
              player to automatically fill the next open slot. Click{" "}
              <strong>×</strong> on a filled slot to remove that player. The
              lineup saves automatically.
            </div>

            {/* 9 batting-order slots */}
            <BattingOrderSlots
              slotPlayers={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
              onRemovePlayer={handleRemovePlayer}
              handleIntro={handleIntro}
              handlePlay={handlePlay}
              handleAnnouncement={handleAnnouncement}
              currentSong={currentSong}
              playerRef={playerRef}
              onSongEnd={() => setCurrentSong(null)}
            />

            {/* Unassigned player pool */}
            <PlayerPool
              players={poolPlayers}
              selectedSlot={selectedSlot}
              onAssign={handleAssignPlayer}
            />
          </>
        )}
      </div>

      {showSettingsModal && (
        <AnnouncementSettingsModal
          announcementPrefs={announcementPrefs}
          setAnnouncementPrefs={setAnnouncementPrefs}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {currentSong && (
        <div className="fixed bottom-0 right-0 z-50">
          <SharedYouTubePlayer
            ref={playerRef}
            videoId={currentSong.videoId}
            start={parseInt(currentSong.start) || 0}
            duration={currentSong.duration}
            volume={currentSong.volume}
            onEnd={() => setCurrentSong(null)}
          />
        </div>
      )}
    </div>
  );
};

export default App;

