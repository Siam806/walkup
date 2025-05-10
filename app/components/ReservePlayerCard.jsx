import React from "react";

const ReservePlayerCard = ({ player, inGamePlayers, toggleInGamePlayer }) => {
  const isInGame = inGamePlayers.includes(player.id);
  
  const handleToggleStatus = () => {
    console.log(`Reserve player toggle clicked for ${player.id}`);
    toggleInGamePlayer(player.id);
  };

  return (
    <div className="p-4 border rounded bg-gray-50 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold mb-2 text-gray-600">
          {player.first_name} "{player.nickname}" {player.last_name}
        </h2>
        <button
          onClick={handleToggleStatus}
          className={`ml-2 px-3 py-1 rounded text-white text-sm ${
            isInGame ? "bg-green-500 hover:bg-red-500" : "bg-gray-400 hover:bg-green-500"
          }`}
          title={isInGame ? "Remove from game" : "Add to game"}
        >
          {isInGame ? "Active" : "Reserve"}
        </button>
      </div>
      <p className="text-gray-500">Jersey Number: {player.jersey_number}</p>
      <p className="text-gray-500">Position: {player.position}</p>
    </div>
  );
};

export default ReservePlayerCard;