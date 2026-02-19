import React from "react";
import ReservePlayerCard from "./ReservePlayerCard";

const ReservePlayersGrid = ({ reserve, inGamePlayers, toggleInGamePlayer }) => {
  if (!reserve.length) return null;

  return (
    <>
      <div className="my-8 border-t border-gray-400 text-center relative">
        <span className="bg-white dark:bg-gray-900 px-4 text-gray-600 dark:text-gray-300 absolute left-1/2 -translate-x-1/2 -top-3 font-semibold">
          Reserve Players
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reserve.map((player) => (
          <ReservePlayerCard
            key={player.id}
            player={player}
            inGamePlayers={inGamePlayers}
            toggleInGamePlayer={toggleInGamePlayer}
          />
        ))}
      </div>
    </>
  );
};

export default ReservePlayersGrid;