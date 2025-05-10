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
  handleDragStart,
  isDragging,
}) => {
  // Modify the sensors configuration for easier mobile dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Increase slightly to avoid accidental drags
      },
    }),
    useSensor(TouchSensor, {
      // Reduce delay for quicker response on mobile
      activationConstraint: {
        delay: 150, // Reduced from 250ms
        tolerance: 8, // Slightly more tolerance to avoid accidental drags
      },
    })
  );

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2 border-b pb-2">Active Lineup</h2>
      
      {isDragging && (
        <div className="fixed inset-0 bg-black bg-opacity-10 z-10 pointer-events-none flex items-center justify-center">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Dragging Player...
          </div>
        </div>
      )}
      
      {/* Instructions specific to the batting order */}
      <p className="text-sm text-gray-500 mb-4 md:hidden">
        Drag players using the gray header to reorder the batting lineup
      </p>
      
      {inGame.length === 0 ? (
        <p className="text-gray-500 italic">No active players. Select players from the reserve section below.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
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