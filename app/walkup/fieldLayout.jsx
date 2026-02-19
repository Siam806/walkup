import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/navbar';
import BaseballField from '../components/BaseballField';
import { useAuth } from '../components/AuthProvider';
import { useTeam } from '../components/TeamProvider';
import { Navigate } from 'react-router-dom';

// === SHARED COMPONENTS ===

// Circular position marker for field view (works on all screen sizes)
const PositionMarker = ({ positionKey, currentPlayer, onPositionClick, isSelected }) => {
  const positionMap = {
    P: { top: '71%', left: '50%', transform: 'translate(-50%, -50%)' },
    C: { top: '88%', left: '50%', transform: 'translate(-50%, -50%)' },
    '1B': { top: '68%', left: '65%', transform: 'translate(-50%, -50%)' },
    '2B': { top: '47%', left: '56%', transform: 'translate(-50%, -50%)' },
    SS: { top: '55%', left: '38%', transform: 'translate(-50%, -50%)' },
    '3B': { top: '68%', left: '35%', transform: 'translate(-50%, -50%)' },
    LF: { top: '22%', left: '22%', transform: 'translate(-50%, -50%)' },
    CF: { top: '14%', left: '50%', transform: 'translate(-50%, -50%)' },
    RF: { top: '22%', left: '78%', transform: 'translate(-50%, -50%)' }
  };

  return (
    <button
      onClick={() => onPositionClick(positionKey)}
      style={positionMap[positionKey]}
      className={`absolute rounded-full flex items-center justify-center font-bold shadow-lg cursor-pointer
        w-11 h-11 text-xs md:w-14 md:h-14 md:text-sm
        transition-all duration-150 active:scale-95 hover:scale-110
        ${isSelected
          ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-200 scale-110 z-20'
          : currentPlayer
            ? 'bg-blue-500 text-white ring-2 ring-white ring-opacity-60 z-10 hover:bg-blue-600'
            : 'bg-black bg-opacity-50 text-white border-2 border-dashed border-white border-opacity-50 z-10 hover:bg-opacity-70'
        }`}
    >
      {currentPlayer ? `#${currentPlayer.jersey_number}` : positionKey}
    </button>
  );
};

// Player selection panel — bottom sheet on mobile, centered modal on desktop
const PlayerSelectPanel = ({ isOpen, positionKey, positionLabel, currentPlayer, unassignedPlayers, onSelectPlayer, onRemovePlayer, onClose }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !positionKey) return null;

  return (
    <>
      <style>{`
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" onClick={onClose}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          style={{ animation: 'backdropIn 0.2s ease-out' }}
        />

        {/* Panel: bottom sheet on mobile, centered modal on desktop */}
        <div
          className="relative bg-white shadow-2xl flex flex-col w-full
            rounded-t-2xl md:rounded-2xl md:max-w-lg md:mx-4"
          style={{
            maxHeight: '70vh',
            animation: (typeof window !== 'undefined' && window.innerWidth >= 768) ? 'modalIn 0.2s ease-out' : 'sheetUp 0.25s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle (mobile only) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="px-5 pb-3 pt-1 md:pt-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{positionLabel}</h3>
              <p className="text-sm text-gray-500">
                {currentPlayer
                  ? `${currentPlayer.first_name} ${currentPlayer.last_name} #${currentPlayer.jersey_number}`
                  : 'No player assigned'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 active:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Remove current player button */}
          {currentPlayer && (
            <button
              onClick={() => { onRemovePlayer(positionKey, currentPlayer.id); onClose(); }}
              className="mx-4 mt-3 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-red-100 active:bg-red-100 transition-colors"
            >
              <span className="text-base">✕</span>
              <span>Remove {currentPlayer.first_name} from {positionLabel}</span>
            </button>
          )}

          {/* Section label */}
          <div className="px-4 pt-3 pb-1.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Available Players ({unassignedPlayers.length})
            </p>
          </div>

          {/* Scrollable player list */}
          <div className="overflow-y-auto px-4 pb-6 flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            {unassignedPlayers.length > 0 ? (
              <div className="space-y-1.5">
                {unassignedPlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => onSelectPlayer(player)}
                    className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl flex items-center gap-3 hover:bg-blue-50 active:bg-blue-50 active:ring-2 active:ring-blue-300 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      #{player.jersey_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{player.first_name} {player.last_name}</div>
                      <div className="text-xs text-gray-500">{player.position || 'No position set'}</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8 text-sm">All players have been assigned</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Lineup card — shows all positions with assigned players
const LineupSummary = ({ positions, positionLabels, onPositionClick, onRemovePlayer }) => {
  const positionOrder = ['P', 'C', '1B', '2B', 'SS', '3B', 'LF', 'CF', 'RF', 'DH'];

  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Current Lineup</h3>
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden shadow-sm">
        {positionOrder.map(posKey => {
          const player = positions[posKey];
          return (
            <div
              key={posKey}
              role="button"
              tabIndex={0}
              onClick={() => onPositionClick(posKey)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPositionClick(posKey); } }}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                player ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {posKey}
              </div>
              <div className="flex-1 text-left min-w-0">
                {player ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-medium text-gray-900 text-sm truncate">{player.first_name} {player.last_name}</span>
                    <span className="text-xs text-gray-400">#{player.jersey_number}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Click to assign</span>
                )}
              </div>
              {player && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); onRemovePlayer(posKey, player.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); onRemovePlayer(posKey, player.id); } }}
                  className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 active:text-red-500 rounded-full cursor-pointer"
                >
                  ✕
                </span>
              )}
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          );
        })}
      </div>
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
  const [loading, setLoading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const { currentTeam, isAdmin, isCoach, loading: teamLoading } = useTeam();
  
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
    if (authLoading || teamLoading || !currentTeam) return;
    
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('team_id', currentTeam.id)
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
  }, [authLoading, teamLoading, currentTeam]);
  
  // Handle click on position — opens the player selection panel
  const handlePositionClick = (positionKey) => {
    setSelectedPosition(positionKey);
  };
  
  // Handle selecting a player for the currently selected position
  const handlePlayerClick = (player) => {
    if (selectedPosition) {
      // Remove player from any current position first
      Object.keys(positions).forEach(pos => {
        if (positions[pos] && positions[pos].id === player.id) {
          setPositions(prev => ({
            ...prev,
            [pos]: null
          }));
        }
      });
      
      // Assign to selected position
      setPositions(prev => ({
        ...prev,
        [selectedPosition]: player
      }));
      
      // Close the panel
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
  
  if (authLoading || teamLoading || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  if (!currentTeam) {
    return (
      <div>
        <Navbar />
        <div style={{ paddingTop: "6.5rem" }} className="p-4 max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold mb-4">No Team Selected</h2>
          <p className="text-gray-600">Join or create a team to manage field positions.</p>
        </div>
      </div>
    );
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
          {(isAdmin || isCoach) ? (
            <button 
              onClick={savePositions} 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Positions to Database'}
            </button>
          ) : (
            <p className="text-sm text-gray-500 italic">Only coaches and admins can save position changes.</p>
          )}
        </div>

        <BaseballFieldContent 
          positions={positions}
          positionLabels={positionLabels}
          handleRemovePlayer={handleRemovePlayer}
          unassignedPlayers={unassignedPlayers}
          selectedPosition={selectedPosition}
          handlePositionClick={handlePositionClick}
          handlePlayerClick={handlePlayerClick}
        />
      </div>
    </div>
  );
};

// Unified layout for all screen sizes
const BaseballFieldContent = ({
  positions,
  positionLabels,
  handleRemovePlayer,
  unassignedPlayers,
  selectedPosition,
  handlePositionClick,
  handlePlayerClick,
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Field with clickable position markers */}
      <BaseballField>
        {Object.entries(positions).map(([posKey, player]) => (
          posKey !== 'DH' && (
            <PositionMarker
              key={posKey}
              positionKey={posKey}
              currentPlayer={player}
              onPositionClick={handlePositionClick}
              isSelected={selectedPosition === posKey}
            />
          )
        ))}
      </BaseballField>

      {/* Lineup summary card — click any row to open panel */}
      <LineupSummary
        positions={positions}
        positionLabels={positionLabels}
        onPositionClick={handlePositionClick}
        onRemovePlayer={handleRemovePlayer}
      />

      {/* Player selection panel (bottom sheet on mobile, modal on desktop) */}
      <PlayerSelectPanel
        isOpen={selectedPosition !== null}
        positionKey={selectedPosition}
        positionLabel={selectedPosition ? positionLabels[selectedPosition] : ''}
        currentPlayer={selectedPosition ? positions[selectedPosition] : null}
        unassignedPlayers={unassignedPlayers}
        onSelectPlayer={handlePlayerClick}
        onRemovePlayer={handleRemovePlayer}
        onClose={() => handlePositionClick(null)}
      />
    </div>
  );
};

export default FieldLayout;