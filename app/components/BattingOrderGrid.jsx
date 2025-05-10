import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortablePlayerCard from "./SortablePlayerCard";

const BattingOrderGrid = ({
  inGame,
  inGamePlayers,
  toggleInGamePlayer,
  handleIntro,
  handlePlay,
  handleAnnouncement,
  movePlayerToEnd,
  currentSong,
  playerRef,
  onSongEnd,
  handleDragEnd,
}) => {
  // Use both PointerSensor and TouchSensor for better mobile support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Reduce the activation distance for desktop
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      // Optimize for touch devices - delay ensures it doesn't interfere with scrolling
      activationConstraint: {
        delay: 250, // wait 250ms before activating
        tolerance: 5, // allow 5px of movement during delay
      },
    })
  );

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">Active Lineup</h2>
      
      {inGame.length === 0 ? (
        <p className="text-gray-500 italic">No active players. Select players from the reserve section below.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={inGame.map((player) => player.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inGame.map((player) => (
                <SortablePlayerCard
                  key={player.id}
                  player={player}
                  inGamePlayers={inGamePlayers}
                  toggleInGamePlayer={toggleInGamePlayer}
                  handleIntro={handleIntro}
                  handlePlay={handlePlay}
                  handleAnnouncement={handleAnnouncement}
                  movePlayerToEnd={movePlayerToEnd}
                  currentSong={currentSong}
                  playerRef={playerRef}
                  onSongEnd={onSongEnd}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default BattingOrderGrid;