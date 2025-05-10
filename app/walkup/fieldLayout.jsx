import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Navbar from '../components/navbar';
import BaseballField from '../components/BaseballField';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';

// Player component that can be dragged (desktop) or clicked (mobile)
const DraggablePlayer = ({ player, isAssigned, isMobile, onPlayerClick }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: player.id,
    data: {
      player,
    },
  });
  
  const style = transform && !isMobile ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  // For mobile, use onClick event instead of drag
  const handleClick = () => {
    if (isMobile) {
      onPlayerClick(player);
    }
  };

  return (
    <div 
      ref={!isMobile ? setNodeRef : undefined}
      style={style} 
      {...(!isMobile ? { ...listeners, ...attributes } : {})}
      onClick={handleClick}
      className={`${isMobile ? '' : 'cursor-grab active:cursor-grabbing'} p-2 mb-2 rounded-lg border ${
        isAssigned 
          ? 'bg-gray-100 border-gray-300 text-gray-700' 
          : `bg-white border-blue-300 text-gray-800 ${isMobile ? 'active:bg-blue-100 hover:bg-blue-50' : ''}`
      }`}
    >
      <div className="font-bold">{player.first_name} {player.last_name}</div>
      <div className="text-xs text-gray-600">#{player.jersey_number} {player.position || 'No Position'}</div>
    </div>
  );
};

// Drop zone for each position on the field
const PositionDropZone = ({ position, positionKey, currentPlayer, onRemovePlayer, positionLabels, isMobile, onPositionClick, isSelected }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: positionKey,
    data: {
      position: positionKey,
    },
  });
  
  const handleClick = () => {
    if (isMobile) {
      onPositionClick(positionKey);
    }
  };
  
  const positionMap = {
    P: { top: '45%', left: '50%', transform: 'translate(-50%, -50%)' },
    C: { bottom: '8%', left: '50%', transform: 'translate(-50%, 0)' },
    '1B': { bottom: '35%', right: '23%', transform: 'translate(0, 0)' },
    '2B': { top: '30%', left: '55%', transform: 'translate(0, -50%)' },
    SS: { top: '38%', left: '38%', transform: 'translate(-50%, -50%)' },
    '3B': { bottom: '35%', left: '23%', transform: 'translate(-100%, 0)' },
    LF: { top: '15%', left: '25%', transform: 'translate(-50%, -50%)' },
    CF: { top: '12%', left: '50%', transform: 'translate(-50%, -50%)' },
    RF: { top: '15%', right: '25%', transform: 'translate(50%, -50%)' }
  };
  
  const positionStyle = positionMap[positionKey];
  
  return (
    <div
      ref={!isMobile ? setNodeRef : undefined}
      style={positionStyle}
      onClick={handleClick}
      className={`absolute w-24 h-20 flex items-center justify-center rounded-lg transition-colors ${
        isOver 
          ? 'bg-blue-500 bg-opacity-70 border-2 border-white shadow-lg' 
          : isSelected
            ? 'bg-yellow-400 bg-opacity-70 border-2 border-yellow-600 shadow-lg'
            : currentPlayer 
              ? 'bg-blue-300 bg-opacity-70' 
              : 'border border-dashed border-white border-opacity-70 hover:bg-blue-900 hover:bg-opacity-20'
      }`}
    >
      {/* Show a hint text when hovering with a player */}
      {isOver && !currentPlayer && !isMobile && (
        <div className="absolute text-white text-xs font-bold bg-black bg-opacity-70 px-2 py-1 rounded animate-pulse">
          Drop here
        </div>
      )}
      
      {/* For mobile, show "Click to select" text when position is selected */}
      {isMobile && isSelected && !currentPlayer && (
        <div className="absolute text-white text-xs font-bold bg-black bg-opacity-70 px-2 py-1 rounded animate-pulse">
          Select player
        </div>
      )}
      
      {!currentPlayer && !isOver && !isSelected && (
        <div className="absolute text-white text-xs font-medium bg-black bg-opacity-40 px-2 py-1 rounded opacity-80">
          {positionLabels[positionKey]}
        </div>
      )}
      
      {currentPlayer && (
        <div className="absolute p-2 bg-white rounded-lg shadow-lg border-2 border-blue-500 max-w-full">
          <div className="flex items-center">
            <div>
              <div className="font-bold text-sm truncate max-w-[120px] text-gray-800">
                {currentPlayer.first_name} {currentPlayer.last_name}
              </div>
              <div className="text-xs text-gray-700">#{currentPlayer.jersey_number}</div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemovePlayer(positionKey, currentPlayer.id);
              }}
              className="ml-1 text-red-500 text-xs p-1 hover:bg-red-50 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// DH Drop Zone component
const DHDropZone = ({ player, onRemovePlayer, isMobile, onPositionClick, isSelected }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'DH',
    data: {
      position: 'DH',
    },
  });

  const handleClick = () => {
    if (isMobile) {
      onPositionClick('DH');
    }
  };

  return (
    <div 
      ref={!isMobile ? setNodeRef : undefined}
      onClick={handleClick}
      className={`h-full w-full rounded-lg ${
        isOver 
          ? 'bg-blue-500' 
          : isSelected
            ? 'bg-yellow-400' 
            : player 
              ? 'bg-blue-200' 
              : 'bg-gray-200 border-2 border-dashed border-gray-400'
      }`}
    >
      {player ? (
        <div className="p-2 flex justify-between items-center">
          <div>
            <div className="font-bold text-gray-800">{player.first_name} {player.last_name}</div>
            <div className="text-xs text-gray-600">#{player.jersey_number}</div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemovePlayer('DH', player.id);
            }}
            className="text-red-500 p-1 hover:bg-red-50 rounded-full"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-600 h-full flex items-center justify-center font-medium">
          {isSelected && isMobile ? "Select player below" : "Drop player here for DH"}
        </div>
      )}
    </div>
  );
};

const FieldLayout = () => {
  const [players, setPlayers] = useState([]);
  const [positions, setPositions] = useState({
    P: null,
    C: null,
    '1B': null,
    '2B': null,
    SS: null,
    '3B': null,
    LF: null,
    CF: null,
    RF: null,
    DH: null
  });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const { user, loading: authLoading } = useAuth();

  // Check window width on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Set mobile mode under 768px
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // Activate after moving 5px to prevent accidental drags
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // Small delay for touch devices to distinguish from scrolling
        tolerance: 5,
      },
    })
  );
  
  // Position names
  const positionLabels = {
    P: 'Pitcher',
    C: 'Catcher',
    '1B': 'First Base',
    '2B': 'Second Base',
    SS: 'Shortstop',
    '3B': 'Third Base',
    LF: 'Left Field',
    CF: 'Center Field',
    RF: 'Right Field',
    DH: 'Designated Hitter'
  };

  useEffect(() => {
    if (authLoading) return;
    
    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('last_name');
        
        if (error) {
          console.error('Error fetching players:', error);
          return;
        }
        
        setPlayers(data);
        
        // Set initial positions based on player.position field
        const initialPositions = { ...positions };
        
        data.forEach(player => {
          // Map position string to position key
          let posKey = null;
          
          if (!player.position) return;
          
          // Simple mapping from full position name to abbreviation
          const positionMapping = {
            'Pitcher': 'P',
            'Catcher': 'C',
            'First Base': '1B',
            'Second Base': '2B',
            'Shortstop': 'SS',
            'Third Base': '3B',
            'Left Field': 'LF',
            'Center Field': 'CF',
            'Right Field': 'RF',
            'Designated Hitter': 'DH'
          };
          
          posKey = positionMapping[player.position] || null;
          
          // If position is available and valid, assign player
          if (posKey && posKey in initialPositions && !initialPositions[posKey]) {
            initialPositions[posKey] = player;
          }
        });
        
        setPositions(initialPositions);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlayers();
  }, [authLoading]);
  
  // Handle drag and drop (for desktop)
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const playerId = active.id;
    const targetPosition = over.data.current?.position;
    
    if (targetPosition) {
      // Get the player object
      const playerToMove = players.find(p => p.id === playerId);
      
      if (playerToMove) {
        // Check if player is already assigned to a position
        Object.keys(positions).forEach(pos => {
          if (positions[pos] && positions[pos].id === playerId) {
            // Remove from current position
            setPositions(prev => ({
              ...prev,
              [pos]: null
            }));
          }
        });
        
        // Add to new position
        setPositions(prev => ({
          ...prev,
          [targetPosition]: playerToMove
        }));
      }
    }
  };
  
  // Handle click on position (for mobile)
  const handlePositionClick = (positionKey) => {
    if (isMobile) {
      setSelectedPosition(positionKey);
    }
  };
  
  // Handle click on player (for mobile)
  const handlePlayerClick = (player) => {
    if (isMobile && selectedPosition) {
      // Check if player is already assigned to a position
      Object.keys(positions).forEach(pos => {
        if (positions[pos] && positions[pos].id === player.id) {
          // Remove from current position
          setPositions(prev => ({
            ...prev,
            [pos]: null
          }));
        }
      });
      
      // Add to selected position
      setPositions(prev => ({
        ...prev,
        [selectedPosition]: player
      }));
      
      // Clear selection
      setSelectedPosition(null);
    }
  };
  
  const handleRemovePlayer = (position, playerId) => {
    setPositions(prev => ({
      ...prev,
      [position]: null
    }));
  };
  
  const savePositions = async () => {
    setLoading(true);
    
    try {
      // Check if user is authenticated first
      if (!user) {
        alert('You must be logged in to save positions');
        setLoading(false);
        return;
      }

      // Get IDs of players who are assigned to positions
      const assignedPlayerIds = new Set(
        Object.values(positions)
          .filter(player => player !== null)
          .map(player => player.id)
      );

      // Create updates for positioned players
      const positionedUpdates = Object.entries(positions)
        .filter(([_, player]) => player !== null)
        .map(([posKey, player]) => ({
          id: player.id,
          position: positionLabels[posKey] || posKey
        }));
      
      // Create updates for reserve players (not on the field)
      const reserveUpdates = players
        .filter(player => !assignedPlayerIds.has(player.id))
        .map(player => ({
          id: player.id,
          position: "Reserve" // Mark unassigned players as reserve
        }));
      
      // Combine both update arrays
      const allUpdates = [...positionedUpdates, ...reserveUpdates];
      
      if (allUpdates.length === 0) {
        alert('No positions to save');
        setLoading(false);
        return;
      }
      
      // Process updates one by one using the RPC function
      for (const playerUpdate of allUpdates) {
        const { data, error } = await supabase.rpc(
          'update_player_position', 
          { 
            player_id: playerUpdate.id, 
            new_position: playerUpdate.position 
          }
        );
        
        if (error) {
          console.error(`Error updating player ${playerUpdate.id}:`, error);
          throw error;
        }
      }
      
      alert('Positions saved successfully!');
      
      // Refresh player data to show updated positions
      const { data: refreshedData, error: refreshError } = await supabase
        .from('players')
        .select('*')
        .order('last_name');
        
      if (!refreshError) {
        setPlayers(refreshedData);
      }
    } catch (err) {
      console.error('Error saving positions:', err);
      alert(`Error saving positions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // Get unassigned players (not currently on the field)
  const assignedPlayerIds = Object.values(positions)
    .filter(player => player !== null)
    .map(player => player.id);
    
  const unassignedPlayers = players.filter(player => !assignedPlayerIds.includes(player.id));

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: "6.5rem" }} className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Field Position Editor</h1>
        
        <div className="mb-6">
          <button 
            onClick={savePositions} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Positions to Database'}
          </button>
          
          {/* Mobile instructions */}
          {isMobile && (
            <div className="mt-2 text-sm italic text-gray-600">
              {selectedPosition 
                ? `Select a player to assign to ${positionLabels[selectedPosition]}` 
                : 'Tap a position on the field, then tap a player to assign them'}
            </div>
          )}
        </div>
        
        {/* Either use DndContext for desktop or regular div for mobile */}
        {!isMobile ? (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <BaseballFieldContent 
              positions={positions}
              positionLabels={positionLabels}
              handleRemovePlayer={handleRemovePlayer}
              unassignedPlayers={unassignedPlayers}
              isMobile={isMobile}
              selectedPosition={selectedPosition}
              handlePositionClick={handlePositionClick}
              handlePlayerClick={handlePlayerClick}
              assignedPlayerIds={assignedPlayerIds}
            />
          </DndContext>
        ) : (
          <BaseballFieldContent 
            positions={positions}
            positionLabels={positionLabels}
            handleRemovePlayer={handleRemovePlayer}
            unassignedPlayers={unassignedPlayers}
            isMobile={isMobile}
            selectedPosition={selectedPosition}
            handlePositionClick={handlePositionClick}
            handlePlayerClick={handlePlayerClick}
            assignedPlayerIds={assignedPlayerIds}
          />
        )}
      </div>
    </div>
  );
};

// Separated component for the BaseballField and player list to avoid duplicating code
const BaseballFieldContent = ({ 
  positions, 
  positionLabels, 
  handleRemovePlayer, 
  unassignedPlayers,
  isMobile,
  selectedPosition,
  handlePositionClick,
  handlePlayerClick,
  assignedPlayerIds
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <BaseballField>
          {/* Create drop zones for each position */}
          {Object.entries(positions).map(([posKey, player]) => (
            posKey !== 'DH' && (
              <PositionDropZone 
                key={posKey}
                positionKey={posKey}
                position={positionLabels[posKey]}
                currentPlayer={player}
                onRemovePlayer={handleRemovePlayer}
                positionLabels={positionLabels}
                isMobile={isMobile}
                onPositionClick={handlePositionClick}
                isSelected={selectedPosition === posKey}
              />
            )
          ))}
        </BaseballField>
        
        {/* Designated Hitter (DH) area outside the field */}
        <div className="mt-4 p-4 border border-gray-300 rounded-lg">
          <h3 className="font-bold mb-2">Designated Hitter (DH)</h3>
          <div className="h-20 flex items-center">
            <DHDropZone 
              player={positions.DH} 
              onRemovePlayer={handleRemovePlayer}
              isMobile={isMobile}
              onPositionClick={handlePositionClick}
              isSelected={selectedPosition === 'DH'}
            />
          </div>
        </div>
        
        {/* Player list - mobile view */}
        {isMobile && selectedPosition && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg mb-2">Select Player for {positionLabels[selectedPosition]}</h2>
              <button 
                onClick={() => handlePositionClick(null)} 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {unassignedPlayers.map(player => (
                <DraggablePlayer 
                  key={player.id} 
                  player={player}
                  isAssigned={false}
                  isMobile={isMobile}
                  onPlayerClick={handlePlayerClick}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Player list for mobile when no position is selected */}
        {isMobile && !selectedPosition && (
          <div className="mt-6">
            <h2 className="font-bold text-lg mb-2">Available Players</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {unassignedPlayers.map(player => (
                <DraggablePlayer 
                  key={player.id} 
                  player={player}
                  isAssigned={false}
                  isMobile={isMobile}
                  onPlayerClick={handlePlayerClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Player list for larger screens - fixed on the side */}
      <div className="hidden lg:block">
        <h2 className="font-bold text-lg mb-2">Available Players</h2>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-[600px] overflow-y-auto">
          {unassignedPlayers.length > 0 ? (
            unassignedPlayers.map(player => (
              <DraggablePlayer 
                key={player.id} 
                player={player}
                isAssigned={false}
                isMobile={false}
              />
            ))
          ) : (
            <p className="text-gray-500 italic">All players have been assigned positions</p>
          )}
          
          <div className="mt-6">
            <h3 className="font-bold mb-2">Assigned Players</h3>
            {assignedPlayerIds.length > 0 ? (
              Object.entries(positions)
                .filter(([_, player]) => player !== null)
                .map(([posKey, player]) => (
                  <div key={player.id} className="flex items-center mb-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{player.first_name} {player.last_name}</div>
                      <div className="text-xs text-gray-600">#{player.jersey_number} - {positionLabels[posKey]}</div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 italic">No players assigned yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldLayout;