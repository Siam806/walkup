import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragHandle from './DragHandle';

const SortablePlayerCard = ({
  player,
  inGamePlayers,
  toggleInGamePlayer,
  handleIntro,
  handlePlay,
  handleAnnouncement,
  movePlayerToEnd,
  currentSong,
  playerRef,
  onSongEnd,
  movePlayerUp,
  movePlayerDown,
  battingPosition
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const [isLongPressed, setIsLongPressed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if on mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isDragging) {
      setIsLongPressed(true);
    }
    return () => {
      if (isDragging) setIsLongPressed(false);
    };
  }, [isDragging]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const isInGame = inGamePlayers.includes(player.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-all ${
        isDragging ? 'border-blue-500 shadow-xl' : ''
      } mb-4`}
    >
      {/* Only show drag handle on desktop */}
      {!isMobile ? (
        <DragHandle 
          attributes={attributes}
          listeners={listeners}
          isDragging={isDragging}
          isLongPressed={isLongPressed}
          battingPosition={battingPosition}
        />
      ) : (
        <div className="bg-gray-700 rounded-t-lg p-2 border-b border-gray-600 select-none relative">
          {/* Mobile Header with batting position */}
          <div className="flex items-center justify-center py-2 rounded-lg bg-gray-600 pl-10">
            {/* Fixed positioning for the number badge on mobile */}
            {battingPosition !== undefined && isInGame && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg">
                {battingPosition + 1}
              </div>
            )}
            <h3 className="font-medium text-white">
              {player.first_name} "{player.nickname}" {player.last_name}
            </h3>
          </div>
        </div>
      )}

      {/* Player content */}
      <div className="p-4 pt-3">
        {/* Always show player name on desktop, but not on mobile (already shown in header) */}
        {!isMobile && (
          <div className="flex items-center mb-2">
            {/* Add batting number badge for desktop */}
            {battingPosition !== undefined && (
              <div className="bg-blue-500 text-white w-7 h-7 flex items-center justify-center rounded-full font-bold mr-2">
                {battingPosition + 1}
              </div>
            )}
            <h2 className="text-lg font-bold text-gray-800">
              {player.first_name} "{player.nickname}" {player.last_name}
            </h2>
          </div>
        )}
        
        {/* Always show player info */}
        <div className="flex flex-wrap gap-2 text-sm mb-3">
          <span className="px-2 py-1 bg-gray-700 text-white rounded">#{player.jersey_number}</span>
          <span className="px-2 py-1 bg-gray-700 text-white rounded">{player.position}</span>
        </div>
        
        {/* Status toggle button */}
        <div className="mb-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log("Toggle button clicked for player", player.id);
              toggleInGamePlayer(player.id);
            }}
            className={`w-full px-4 py-2 rounded font-bold transition-colors ${
              isInGame ? "bg-green-500 hover:bg-red-500 text-white" : "bg-gray-300 hover:bg-green-500 text-gray-800 hover:text-white"
            }`}
          >
            {isInGame ? "ACTIVE" : "RESERVE"}
          </button>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {/* Walk-up song */}
          <button
            onClick={() => handleIntro(player)}
            className={`w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
              !player.walk_up_song ? 'opacity-50' : ''
            }`}
            disabled={!player.walk_up_song}
          >
            {player.walk_up_song ? "Play Walk-Up Song" : "No Walk-Up Song"}
          </button>
          
          {/* Home run song */}
          <button
            onClick={() =>
              handlePlay(
                player.home_run_song,
                player.home_run_song_start,
                null,
                100,
                "home_run",
                player.id
              )
            }
            className={`w-full px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 ${
              !player.home_run_song ? 'opacity-50' : ''
            }`}
            disabled={!player.home_run_song}
          >
            {player.home_run_song ? "Play Home Run Song" : "No HR Song"}
          </button>
          
          {/* Pitcher walk-up song - show for all positions that contain "P" */}
          {(player.position === 'P' || player.position === 'SP' || player.position === 'RP' || 
            (player.position && player.position.includes('P'))) && (
            <button
              onClick={() =>
                handlePlay(
                  player.pitching_walk_up_song,
                  player.pitching_walk_up_song_start,
                  null,
                  100,
                  "pitching",
                  player.id
                )
              }
              className={`w-full px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 ${
                !player.pitching_walk_up_song ? 'opacity-50' : ''
              }`}
              disabled={!player.pitching_walk_up_song}
            >
              {player.pitching_walk_up_song ? "Pitching Entry" : "No Pitching Song"}
            </button>
          )}
          
          {/* Announcement button */}
          <button
            onClick={() => handleAnnouncement(player)}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Announce Player
          </button>
        </div>

        {/* Up/Down buttons for mobile only */}
        {isMobile && isInGame && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (typeof movePlayerUp === 'function') {
                  movePlayerUp(player);
                } else {
                  console.error("movePlayerUp is not a function", movePlayerUp);
                }
              }}
              className="px-3 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ↑ Move Up
            </button>
            <button
              onClick={() => {
                if (typeof movePlayerDown === 'function') {
                  movePlayerDown(player);
                } else {
                  console.error("movePlayerDown is not a function", movePlayerDown);
                }
              }}
              className="px-3 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ↓ Move Down
            </button>
          </div>
        )}

        {/* Move to End button */}
        {isInGame && (
          <button
            onClick={() => movePlayerToEnd(player)}
            className="w-full mt-2 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Move To End
          </button>
        )}

        {/* Show current song indicator if this player's song is playing */}
        {currentSong && currentSong.playerId === player.id && (
          <div className="mt-4 p-2 bg-blue-100 rounded text-blue-800 text-sm flex items-center justify-between">
            <span className="animate-pulse">▶ Now Playing</span>
            <button 
              onClick={() => onSongEnd && onSongEnd()}
              className="px-2 py-1 bg-blue-200 rounded hover:bg-blue-300"
            >
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SortablePlayerCard;