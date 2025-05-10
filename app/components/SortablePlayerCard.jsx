import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SharedYouTubePlayer from "./SharedYouTubePlayer";

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

  useEffect(() => {
    if (isDragging) {
      setIsLongPressed(true);
      
      // Reset after dragging ends
      return () => setIsLongPressed(false);
    }
  }, [isDragging]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const isInGame = inGamePlayers.includes(player.id);

  // Add this log or breakpoint check
  console.log(`SortablePlayerCard ${player.id} - isInGame: ${isInGame}, inGamePlayers:`, inGamePlayers);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg bg-white shadow-sm transition-all ${
        isDragging ? 'border-blue-500 shadow-lg scale-105 bg-blue-50' : ''
      } active:shadow-md mb-4`}
    >
      {/* Mobile-optimized drag handle */}
      <div 
        className={`flex items-center justify-between bg-gray-100 px-4 py-4 mb-3 rounded-t border-b border-gray-200 
          ${isLongPressed ? 'bg-blue-100' : ''} 
          ${isDragging ? 'bg-blue-200' : ''}`}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center cursor-grab active:cursor-grabbing w-full">
          <div className="mr-3 flex-shrink-0 bg-gray-200 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
              <path d="M7 19h2c0 1.1.9 2 2 2s2-.9 2-2h2v-2H7v2zM7 5h10v2H7V5zm10 8h2V7h-2v6zm-6 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
              <path d="M7 13h2c0 1.1.9 2 2 2s2-.9 2-2h2v-2H7v2z"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800">
            {player.first_name} "{player.nickname}" {player.last_name}
          </h2>
        </div>
      </div>

      {/* Status toggle button - separated from drag handle */}
      <div className="px-4 py-2 mb-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log("Toggle button clicked for player", player.id);
            toggleInGamePlayer(player.id);
          }}
          className={`px-4 py-2 rounded font-bold transition-colors w-full ${
            isInGame ? "bg-green-500 hover:bg-red-500 text-white" : "bg-gray-300 hover:bg-green-500 text-gray-800 hover:text-white"
          }`}
        >
          {isInGame ? "ACTIVE PLAYER" : "RESERVE PLAYER"}
        </button>
      </div>
      
      {/* Rest of the card content - no drag functionality here */}
      <div className="player-info">
        <p className="text-gray-700">Jersey Number: {player.jersey_number}</p>
        <p className="text-gray-700">Position: {player.position}</p>
        
        {/* Action buttons */}
        <div className="mt-4 space-y-3">
          <button
            onClick={() => handleIntro(player)}
            className="mt-2 px-4 py-3 bg-blue-500 text-white rounded w-full text-base"
          >
            Play Walk-Up Song
          </button>
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
            className="mt-2 px-4 py-3 bg-green-700 text-white rounded w-full text-base"
          >
            Play Home Run Song
          </button>
          <button
            onClick={() =>
              handlePlay(
                player.pitching_walk_up_song,
                player.pitching_walk_up_song_start,
                30,
                100,
                "pitching",
                player.id
              )
            }
            className="mt-2 px-4 py-2 bg-red-700 text-white rounded w-full sm:w-auto"
          >
            Play Pitching Walk-Up (30s)
          </button>
          <button
            onClick={() => handleAnnouncement(player)}
            className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded w-full sm:w-auto"
          >
            Announce Player
          </button>
          <button
            onClick={() => movePlayerToEnd(player)}
            className="mt-2 px-4 py-2 bg-gray-500 text-white rounded w-full sm:w-auto"
          >
            Move to End
          </button>
        </div>
        
        {/* YouTube player */}
        {currentSong && currentSong.playerId === player.id && (
          <div className="mt-4">
            <SharedYouTubePlayer
              ref={playerRef}
              key={currentSong.videoId + currentSong.songType}
              videoId={currentSong.videoId}
              start={currentSong.start}
              shouldPlay={true}
              duration={currentSong.duration}
              volume={currentSong.volume}
              onEnd={onSongEnd}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SortablePlayerCard;