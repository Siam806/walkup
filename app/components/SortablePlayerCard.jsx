import React from "react";
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
      className={`p-4 border rounded bg-white shadow-sm transition-all ${
        isDragging ? 'border-blue-500 shadow-lg scale-105' : ''
      } active:shadow-md`}
    >
      {/* Drag handle header - make it more obvious and larger target for mobile */}
      <div 
        className="flex items-center justify-between bg-gray-50 px-4 py-3 mb-2 rounded-t border-b"
      >
        <div 
          className="flex items-center cursor-grab active:cursor-grabbing w-full"
          {...attributes}
          {...listeners}
        >
          <div className="mr-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800">
            {player.first_name} "{player.nickname}" {player.last_name}
          </h2>
        </div>
        
        {/* Status toggle button - not part of drag handle */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            console.log("Toggle button clicked for player", player.id, "current status:", isInGame ? "active" : "reserve");
            toggleInGamePlayer(player.id);
          }}
          className={`ml-2 px-4 py-1 rounded font-bold transition-colors ${
            isInGame ? "bg-green-500 hover:bg-red-500 text-white" : "bg-gray-300 hover:bg-green-500 text-gray-800 hover:text-white"
          }`}
        >
          {isInGame ? "ACTIVE" : "RESERVE"}
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