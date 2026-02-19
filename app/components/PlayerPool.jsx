import React from "react";

/**
 * PlayerPool – shows players who haven't been assigned to any batting slot.
 *
 * Props:
 *   players      – array of player objects not yet slotted
 *   selectedSlot – index of the currently-selected batting slot (null = none)
 *   onAssign     – (playerId) => void  called when the user assigns a player
 */
const PlayerPool = ({ players, selectedSlot, onAssign }) => {
  if (!players.length) {
    return (
      <>
        <div className="my-8 border-t border-gray-400 text-center relative">
          <span className="bg-white px-4 text-gray-600 absolute left-1/2 -translate-x-1/2 -top-3 font-semibold">
            Player Pool
          </span>
        </div>
        <p className="text-center py-6 text-gray-500 italic">
          All players have been assigned to the batting order.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="my-8 border-t border-gray-400 text-center relative">
        <span className="bg-white px-4 text-gray-600 absolute left-1/2 -translate-x-1/2 -top-3 font-semibold">
          Player Pool
        </span>
      </div>

      {selectedSlot !== null ? (
        <p className="mb-4 text-center text-blue-700 text-sm">
          Click a player to assign them to{" "}
          <strong>Batting Slot #{selectedSlot + 1}</strong>
        </p>
      ) : (
        <p className="mb-4 text-center text-gray-500 text-sm">
          Click a player (or <strong>+ Assign</strong>) to place them in the
          next empty slot, or click a slot above first to choose a specific
          position.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            onClick={() => onAssign(player.id)}
            className={`p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm cursor-pointer transition-all select-none
              hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 hover:shadow-md active:scale-95 ${
                selectedSlot !== null ? "ring-2 ring-blue-200" : ""
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-gray-700 truncate mr-2">
                {player.first_name}
                {player.nickname ? ` "${player.nickname}"` : ""}{" "}
                {player.last_name}
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAssign(player.id);
                }}
                className="flex-shrink-0 px-3 py-1 rounded text-white text-sm bg-blue-500 hover:bg-blue-600 font-medium"
                title={
                  selectedSlot !== null
                    ? `Assign to slot ${selectedSlot + 1}`
                    : "Assign to next empty slot"
                }
              >
                {selectedSlot !== null ? `→ #${selectedSlot + 1}` : "+ Assign"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-700 text-white rounded text-xs">
                #{player.jersey_number}
              </span>
              <span className="px-2 py-1 bg-gray-700 text-white rounded text-xs">
                {player.position}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PlayerPool;
