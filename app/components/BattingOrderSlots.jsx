import React from "react";

/**
 * SlotCard – renders a single batting-order slot (filled or empty).
 */
const SlotCard = ({
  slotIndex,
  player,
  isSelected,
  onSelect,
  onRemove,
  handleIntro,
  handlePlay,
  handleAnnouncement,
  currentSong,
  onSongEnd,
}) => {
  const isPitcher =
    player &&
    (player.position === "P" ||
      player.position === "SP" ||
      player.position === "RP" ||
      (player.position && player.position.includes("P")));

  /* ── Empty slot ─────────────────────────────────────────── */
  if (!player) {
    return (
      <div
        onClick={onSelect}
        className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all min-h-[90px] flex flex-col items-center justify-center select-none ${
          isSelected
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <div
          className={`w-9 h-9 flex items-center justify-center rounded-full font-bold text-lg mb-2 ${
            isSelected ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
          }`}
        >
          {slotIndex + 1}
        </div>
        <p
          className={`text-sm text-center ${
            isSelected ? "text-blue-600 font-medium" : "text-gray-400"
          }`}
        >
          {isSelected ? "← Select a player below" : "Empty Slot"}
        </p>
      </div>
    );
  }

  /* ── Filled slot ─────────────────────────────────────────── */
  return (
    <div
      className={`border rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-all ${
        isSelected ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Header */}
      <div
        className="bg-gray-700 rounded-t-lg px-3 py-2 flex items-center justify-between cursor-pointer select-none"
        onClick={onSelect}
        title={isSelected ? "Click to deselect" : "Click to swap player"}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-blue-500 text-white w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-bold text-base">
            {slotIndex + 1}
          </div>
          <h3 className="font-medium text-white text-sm truncate">
            {player.first_name}
            {player.nickname ? ` "${player.nickname}"` : ""} {player.last_name}
          </h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-gray-300 hover:text-red-400 text-xl leading-none px-1 flex-shrink-0"
          title="Remove from lineup"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 text-xs mb-3">
          <span className="px-2 py-1 bg-gray-700 text-white rounded">
            #{player.jersey_number}
          </span>
          <span className="px-2 py-1 bg-gray-700 text-white rounded">
            {player.position}
          </span>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={() => handleIntro(player)}
            disabled={!player.walk_up_song}
            className={`w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium ${
              !player.walk_up_song ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {player.walk_up_song ? "▶ Walk-Up Song" : "No Walk-Up Song"}
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
            disabled={!player.home_run_song}
            className={`w-full px-3 py-2 bg-green-700 text-white rounded hover:bg-green-800 text-sm font-medium ${
              !player.home_run_song ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {player.home_run_song ? "🏆 Home Run Song" : "No HR Song"}
          </button>

          {isPitcher && (
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
              disabled={!player.pitching_walk_up_song}
              className={`w-full px-3 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 text-sm font-medium ${
                !player.pitching_walk_up_song ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {player.pitching_walk_up_song
                ? "⚾ Pitching Entry"
                : "No Pitching Song"}
            </button>
          )}

          <button
            onClick={() => handleAnnouncement(player)}
            className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm font-medium"
          >
            📢 Announce Player
          </button>
        </div>

        {/* Now-playing indicator */}
        {currentSong && currentSong.playerId === player.id && (
          <div className="mt-3 p-2 bg-blue-100 rounded text-blue-800 text-sm flex items-center justify-between">
            <span className="animate-pulse">▶ Now Playing</span>
            <button
              onClick={() => onSongEnd && onSongEnd()}
              className="px-2 py-1 bg-blue-200 rounded hover:bg-blue-300 text-xs"
            >
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * BattingOrderSlots – displays 9 numbered batting-order slots.
 *
 * Props:
 *   slotPlayers   – array[9] of player objects or null
 *   selectedSlot  – index of currently-selected slot (null = none)
 *   onSelectSlot  – (index) => void   called when a slot is clicked
 *   onRemovePlayer– (index) => void   called when × is clicked on a slot
 *   handleIntro, handlePlay, handleAnnouncement – song/announcement handlers
 *   currentSong   – current song state
 *   playerRef     – ref forwarded to YouTube player
 *   onSongEnd     – called when song should stop
 */
const BattingOrderSlots = ({
  slotPlayers,
  selectedSlot,
  onSelectSlot,
  onRemovePlayer,
  handleIntro,
  handlePlay,
  handleAnnouncement,
  currentSong,
  playerRef,
  onSongEnd,
}) => {
  const filledCount = slotPlayers.filter(Boolean).length;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-xl font-semibold">Batting Order</h2>
        <span className="text-sm text-gray-500">
          {filledCount} / 9 slots filled
        </span>
      </div>

      {selectedSlot !== null && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded-lg text-blue-700 text-sm text-center">
          Batting slot <strong>#{selectedSlot + 1}</strong> is selected — pick a
          player from the pool below to assign them here.{" "}
          <button
            onClick={() => onSelectSlot(selectedSlot)} // toggles off
            className="underline ml-1 hover:text-blue-900"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slotPlayers.map((player, index) => (
          <SlotCard
            key={index}
            slotIndex={index}
            player={player}
            isSelected={selectedSlot === index}
            onSelect={() => onSelectSlot(index)}
            onRemove={() => onRemovePlayer(index)}
            handleIntro={handleIntro}
            handlePlay={handlePlay}
            handleAnnouncement={handleAnnouncement}
            currentSong={currentSong}
            playerRef={playerRef}
            onSongEnd={onSongEnd}
          />
        ))}
      </div>
    </div>
  );
};

export default BattingOrderSlots;
