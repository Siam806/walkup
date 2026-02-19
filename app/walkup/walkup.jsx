import React, { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "../supabaseClient";
import SharedYouTubePlayer from "../components/SharedYouTubePlayer";
import { extractVideoId } from "../utils";
import Navbar from "../components/navbar";
import SortablePlayerCard from "../components/SortablePlayerCard";
import ReservePlayerCard from "../components/ReservePlayerCard";
import AnnouncementSettingsModal from "../components/AnnouncementSettingsModal";
import BattingOrderGrid from "../components/BattingOrderGrid";
import ReservePlayersGrid from "../components/ReservePlayersGrid";
import * as PlayerManager from "../components/PlayerStatusManager";
import { useTeam } from "../components/TeamProvider";

const LOCAL_STORAGE_KEY = "walkup-inGamePlayers";
const ANNOUNCEMENT_PREFS_KEY = "walkup-announcement-prefs";
const BATTING_ORDER_KEY = "walkup-batting-order";

const App = () => {
  const [players, setPlayers] = useState([]);
  const [battingOrder, setBattingOrder] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [inGamePlayers, setInGamePlayers] = useState([]);
  const playerRef = useRef(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { currentTeam } = useTeam();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Desktop-only setting
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

        console.log("Fetched players from database:", data.length);

        // First set the player data
        setPlayers(data);

        // Initialize the player manager — use team-scoped localStorage keys
        const teamPrefix = currentTeam?.id ? currentTeam.id.substring(0, 8) : "default";
        PlayerManager.initializeManager(
          data,
          (activeIds) => {
            console.log("Manager updated active players:", activeIds);
            setInGamePlayers(activeIds);
          },
          (orderedPlayers) => {
            console.log("Manager updated batting order:", 
              orderedPlayers.map(p => p.id));
            setBattingOrder(orderedPlayers);
          },
          teamPrefix
        );
      } catch (error) {
        console.error("Error in fetchPlayers:", error);
      }
    };

    fetchPlayers();
  }, [currentTeam]);

  const handlePlay = (songUrl, startTime, duration = null, volume = 100, songType = "walkup", playerId = null) => {
    if (!songUrl) {
      console.log(`No ${songType} song URL provided for player ${playerId}`);
      return;
    }
    
    // Try to extract video ID
    const videoId = extractVideoId(songUrl);
    
    if (!videoId) {
      console.error(`Could not extract YouTube video ID from URL: ${songUrl}`);
      alert(`Invalid YouTube URL: ${songUrl}`);
      return;
    }
    
    console.log(`Playing ${songType} song: ${videoId} starting at ${startTime || 0} seconds, volume: ${volume}, duration: ${duration || 'unlimited'}`);
    
    // Set the current song with the explicitly passed duration
    setCurrentSong({
      videoId,
      start: startTime || 0,
      duration: duration, // Make sure this is passed through correctly
      volume,
      songType,
      playerId,
    });
  };

  // Add this helper function

  const playWalkUpSong = (player) => {
    if (!player?.walk_up_song) return;
    
    const WALK_UP_DURATION = 15; // Always 15 seconds
    
    handlePlay(
      player.walk_up_song,
      player.walk_up_song_start,
      WALK_UP_DURATION,
      100,
      "walkup",
      player.id
    );
    
    console.log(`Started walk-up song for ${player.first_name} ${player.last_name} with 15 second limit`);
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

  const movePlayerToEnd = (player) => {
    setBattingOrder((prevOrder) => {
      const updatedOrder = prevOrder.filter((p) => p.id !== player.id);
      updatedOrder.push(player);
      
      // Also update in PlayerManager
      PlayerManager.updateBattingOrder(updatedOrder);
      
      return updatedOrder;
    });
  };

  const movePlayerUp = (player) => {
    setBattingOrder((prevOrder) => {
      // Find current active players
      const currentInGamePlayers = prevOrder.filter(p => inGamePlayers.includes(p.id));
      const currentReservePlayers = prevOrder.filter(p => !inGamePlayers.includes(p.id));
      
      // Find player index
      const index = currentInGamePlayers.findIndex(p => p.id === player.id);
      
      // Can't move up if already at top
      if (index <= 0) return prevOrder;
      
      // Swap with player above
      const newInGameOrder = [...currentInGamePlayers];
      [newInGameOrder[index], newInGameOrder[index-1]] = [newInGameOrder[index-1], newInGameOrder[index]];
      
      // Create new full order
      const newFullOrder = [...newInGameOrder, ...currentReservePlayers];
      
      // Update manager
      PlayerManager.updateBattingOrder(newFullOrder);
      
      return newFullOrder;
    });
  };

  const movePlayerDown = (player) => {
    setBattingOrder((prevOrder) => {
      // Find current active players
      const currentInGamePlayers = prevOrder.filter(p => inGamePlayers.includes(p.id));
      const currentReservePlayers = prevOrder.filter(p => !inGamePlayers.includes(p.id));
      
      // Find player index
      const index = currentInGamePlayers.findIndex(p => p.id === player.id);
      
      // Can't move down if already at bottom
      if (index >= currentInGamePlayers.length - 1) return prevOrder;
      
      // Swap with player below
      const newInGameOrder = [...currentInGamePlayers];
      [newInGameOrder[index], newInGameOrder[index+1]] = [newInGameOrder[index+1], newInGameOrder[index]];
      
      // Create new full order
      const newFullOrder = [...newInGameOrder, ...currentReservePlayers];
      
      // Update manager
      PlayerManager.updateBattingOrder(newFullOrder);
      
      return newFullOrder;
    });
  };

  const toggleInGamePlayer = (playerId) => {
    console.log(`Toggling player ${playerId}`);
    
    // If player is playing a song, stop it
    if (currentSong && currentSong.playerId === playerId) {
      setCurrentSong(null);
    }
    
    // Use the manager to toggle status
    PlayerManager.togglePlayerStatus(playerId);
  };

  const saveBattingOrder = () => {
    // Manual force save
    PlayerManager.forceSave(inGamePlayers, battingOrder);
    alert("Batting order and player status saved successfully");
  };

  const recoverSavedData = () => {
    try {
      // Attempt to read saved data
      const orderStr = localStorage.getItem(BATTING_ORDER_KEY);
      const activeStr = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      if (!orderStr) {
        alert("No saved batting order found");
        return;
      }
      
      const orderIds = JSON.parse(orderStr);
      const activeIds = activeStr ? JSON.parse(activeStr) : [];
      
      console.log("Recovering from saved data:");
      console.log("- Saved order:", orderIds);
      console.log("- Saved active:", activeIds);
      
      // Recreate the player objects from IDs
      const validOrderIds = orderIds.filter(id => 
        players.some(p => p.id === id)
      );
      
      const validActiveIds = activeIds.filter(id => 
        players.some(p => p.id === id)
      );
      
      // Default to first player if no valid active players
      if (validActiveIds.length === 0 && validOrderIds.length > 0) {
        validActiveIds.push(validOrderIds[0]);
      }
      
      // Create the ordered player list
      const orderedPlayers = validOrderIds
        .map(id => players.find(p => p.id === id))
        .filter(Boolean);
      
      // Add any missing players in random order (not by batting_number)
      const missingPlayers = players.filter(p => !validOrderIds.includes(p.id));
      
      // Update state
      setBattingOrder([...orderedPlayers, ...missingPlayers]);
      setInGamePlayers(validActiveIds);
      
      alert(`Recovery successful!\nRestored ${orderedPlayers.length} players in batting order\nSet ${validActiveIds.length} active players`);
    } catch (e) {
      console.error("Error recovering data:", e);
      alert("Could not recover saved data. Error: " + e.message);
    }
  };

  const inGame = React.useMemo(() => 
    battingOrder.filter(p => inGamePlayers.includes(p.id)),
    [battingOrder, inGamePlayers]
  );

  const reserve = React.useMemo(() => 
    battingOrder.filter(p => !inGamePlayers.includes(p.id)),
    [battingOrder, inGamePlayers]
  );

  const handleDragEnd = (event) => {
    setIsDragging(false); // Reset dragging state
    
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      console.log("Drag ended with no valid target");
      return;
    }
    
    console.log(`Moving player ${active.id} to position ${over.id}`);
    
    const currentInGamePlayers = battingOrder.filter(p => inGamePlayers.includes(p.id));
    const currentReservePlayers = battingOrder.filter(p => !inGamePlayers.includes(p.id));
    
    const oldIndex = currentInGamePlayers.findIndex(p => p.id === active.id);
    const newIndex = currentInGamePlayers.findIndex(p => p.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newInGameOrder = arrayMove(currentInGamePlayers, oldIndex, newIndex);
      
      // Create the new full order
      const newFullOrder = [...newInGameOrder, ...currentReservePlayers];
      
      // Update state
      setBattingOrder(newFullOrder);
      
      // Notify manager
      PlayerManager.updateBattingOrder(newFullOrder);
      
      console.log("Drag completed successfully");
    } else {
      console.error("Invalid indices for drag operation", { oldIndex, newIndex });
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
    // Optional haptic feedback for mobile
    if (window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="h-16"></div>
      <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
        {/* Mobile instructions - only show on mobile */}
        <div className="md:hidden mb-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">📱 Mobile Controls:</h3>
          <p className="mb-2 text-blue-900">
            Use these buttons to change the batting order:
          </p>
          <div className="flex items-center justify-center bg-blue-600 p-2 rounded mb-2">
            <span className="font-medium text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="mr-2">
                <path d="M7 14l5-5 5 5H7z" fill="currentColor"/>
              </svg>
              UP / DOWN
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="ml-2">
                <path d="M7 10l5 5 5-5H7z" fill="currentColor"/>
              </svg>
            </span>
          </div>
          <ol className="list-disc pl-5 text-blue-900">
            <li className="mb-1">Tap <strong>Move Up</strong> to move a player higher in the order</li>
            <li className="mb-1">Tap <strong>Move Down</strong> to move a player lower in the order</li>
            <li>Tap <strong>Move To End</strong> to move a player to the end of the active lineup</li>
          </ol>
        </div>

        {/* Desktop instructions - only show on desktop */}
        <div className="hidden md:block mb-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">💻 Desktop Tips:</h3>
          <div className="flex items-center justify-center bg-blue-600 p-2 rounded mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="mr-2 text-white">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>
            </svg>
            <span className="font-medium text-white">DRAG TO REORDER</span>
          </div>
          <p className="mb-2 text-blue-900">Click and drag on the gray header to reorder players in the batting lineup</p>
        </div>

        {/* Add loading indicator */}
        {players.length === 0 && (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-4">Loading players...</p>
          </div>
        )}
        
        {/* Rest of your UI */}
        {players.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h1 className="text-xl sm:text-2xl font-bold">Team Walk-Up Songs</h1>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowSettingsModal(true)} className="px-4 py-2 bg-gray-600 text-white rounded">
                  ⚙️ Settings
                </button>
                <button onClick={saveBattingOrder} className="px-4 py-2 bg-green-500 text-white rounded">
                  Save Batting Order
                </button>
                <button 
                  onClick={() => {
                    console.log("CURRENT STATUS CHECK:");
                    console.log("inGamePlayers:", inGamePlayers);
                    console.log("localStorage value:", localStorage.getItem(LOCAL_STORAGE_KEY));
                    console.log("battingOrder:", battingOrder.map(p => p?.id));
                    console.log("localStorage value:", localStorage.getItem(BATTING_ORDER_KEY));
                    
                    // Re-save to ensure localStorage has current values
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(inGamePlayers));
                    localStorage.setItem(BATTING_ORDER_KEY, JSON.stringify(battingOrder.map(p => p.id)));
                    
                    alert(`Current active players: ${inGamePlayers.length}\nCheck console for details.`);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Debug Status
                </button>
                <button 
                  onClick={recoverSavedData}
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                >
                  Recover Saved Data
                </button>
                <button
                  onClick={() => {
                    console.log("CURRENT STATE:");
                    console.log("React inGamePlayers:", inGamePlayers);
                    console.log("React battingOrder:", battingOrder.map(p => p.id));
                    console.log("Manager active:", PlayerManager.getActivePlayerIds());
                    console.log("Manager order:", PlayerManager.getBattingOrderIds());
                    console.log("localStorage active:", JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"));
                    console.log("localStorage order:", JSON.parse(localStorage.getItem(BATTING_ORDER_KEY) || "[]"));
                  }}
                  className="px-4 py-2 bg-purple-500 text-white rounded"
                >
                  Check Sync
                </button>
                <button 
                  onClick={() => {
                    console.log("SONG DEBUG INFO:");
                    console.log("Current song:", currentSong);
                    console.log("YouTube player ref:", playerRef.current);
                    
                    // Test play with a known working video
                    handlePlay(
                      "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Test with Rick Astley
                      0,
                      null, 
                      100,
                      "test",
                      null
                    );
                    
                    alert("Playing test video. Check console for debug info.");
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Test Player
                </button>
              </div>
            </div>

            <BattingOrderGrid
              key={`active-${inGamePlayers.join(',')}`}
              inGame={inGame}
              inGamePlayers={inGamePlayers}
              toggleInGamePlayer={(id) => {
                console.log("BattingOrderGrid calling toggleInGamePlayer with ID:", id);
                toggleInGamePlayer(id);
              }}
              handleIntro={handleIntro}
              handlePlay={handlePlay}
              handleAnnouncement={handleAnnouncement}
              movePlayerToEnd={movePlayerToEnd}
              movePlayerUp={movePlayerUp}
              movePlayerDown={movePlayerDown}
              currentSong={currentSong}
              playerRef={playerRef}
              onSongEnd={() => setCurrentSong(null)}
              sensors={sensors}
              handleDragEnd={handleDragEnd}
              handleDragStart={handleDragStart}
              isDragging={isDragging}
            />

            {reserve.length > 0 && (
              <ReservePlayersGrid
                key={`reserve-${inGamePlayers.join(',')}`} // Same dependency
                reserve={reserve}
                inGamePlayers={inGamePlayers}
                toggleInGamePlayer={(id) => {
                  console.log("ReservePlayersGrid calling toggleInGamePlayer with ID:", id);
                  toggleInGamePlayer(id);
                }}
              />
            )}
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

      {/* Make sure the YouTube player is visible */}
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