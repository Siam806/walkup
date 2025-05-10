import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
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
  movePlayerUp,
  movePlayerDown,
  currentSong,
  playerRef,
  onSongEnd,
  sensors,
  handleDragEnd,
  handleDragStart,
  isDragging,
}) => {
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

  // Use the provided sensors or create our own if not provided
  const gridSensors = sensors || useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">Active Lineup</h2>
      
      {inGame.length === 0 ? (
        <p className="text-gray-500 italic">No active players. Select players from the reserve section below.</p>
      ) : (
        <>
          {/* Only use DndContext on desktop */}
          {!isMobile ? (
            <DndContext
              sensors={gridSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              modifiers={[]} // Remove any modifiers to ensure 1:1 tracking
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
                      movePlayerUp={movePlayerUp}
                      movePlayerDown={movePlayerDown}
                      currentSong={currentSong}
                      playerRef={playerRef}
                      onSongEnd={onSongEnd}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            // Simple grid for mobile, no drag functionality
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
                  movePlayerUp={movePlayerUp}
                  movePlayerDown={movePlayerDown}
                  currentSong={currentSong}
                  playerRef={playerRef}
                  onSongEnd={onSongEnd}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BattingOrderGrid;