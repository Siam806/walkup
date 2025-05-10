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

  const sensors = useSensors(
    useSensor(PointerSensor),
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
    const storedPrefs = localStorage.getItem(ANNOUNCEMENT_PREFS_KEY);
    if (storedPrefs) {
      try {
        setAnnouncementPrefs(JSON.parse(storedPrefs));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(ANNOUNCEMENT_PREFS_KEY, JSON.stringify(announcementPrefs));
  }, [announcementPrefs]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from("players")
          .select("*");  // No longer ordering by batting_number

        if (error) throw error;

        console.log("Fetched players from database:", data.length);

        // First set the player data
        setPlayers(data);

        // Initialize the player manager - this will handle local order
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
          }
        );
      } catch (error) {
        console.error("Error in fetchPlayers:", error);
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

  const speakAnnouncement = (text, voice = "US English Male", onEndCallback = null) => {
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

    handlePlay(player.walk_up_song, player.walk_up_song_start, 15, 30, "walkup", player.id);

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

  return (
    <div>
      <Navbar />
      <div className="h-16"></div>
      <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
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
              </div>
            </div>

            <BattingOrderGrid
              key={`active-${inGamePlayers.join(',')}`} // Only re-render when inGamePlayers changes
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
              currentSong={currentSong}
              playerRef={playerRef}
              onSongEnd={() => setCurrentSong(null)}
              sensors={sensors}
              handleDragEnd={handleDragEnd}
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
    </div>
  );
};

export default App;