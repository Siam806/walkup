/**
 * Player Status Manager - Reliable state persistence for player status
 */

// Constants
const LOCAL_STORAGE_KEY = "walkup-inGamePlayers";
const BATTING_ORDER_KEY = "walkup-batting-order";

// Global variables to track state
let activePlayers = [];
let battingOrderIds = [];
let isInitialized = false;
let callbacks = {
  onActivePlayersChange: null,
  onBattingOrderChange: null,
};

/**
 * Initialize the manager from localStorage
 */
export function initializeManager(allPlayers, onActivePlayersChange, onBattingOrderChange) {
  console.log("[PlayerManager] Initializing with", allPlayers.length, "players");
  
  // Set callbacks
  callbacks = {
    onActivePlayersChange,
    onBattingOrderChange
  };
  
  // Load batting order first
  try {
    const storedOrder = localStorage.getItem(BATTING_ORDER_KEY);
    if (storedOrder) {
      battingOrderIds = JSON.parse(storedOrder);
      console.log("[PlayerManager] Loaded batting order:", battingOrderIds);
      
      // Validate the IDs
      battingOrderIds = battingOrderIds.filter(id => 
        allPlayers.some(p => p.id === id)
      );
    }
  } catch (e) {
    console.error("[PlayerManager] Error loading batting order:", e);
    battingOrderIds = [];
  }
  
  // If no valid batting order, create from players
  if (battingOrderIds.length === 0) {
    // Use player IDs in their current order or sort by name:
    battingOrderIds = allPlayers
      .sort((a, b) => a.last_name.localeCompare(b.last_name))
      .map(p => p.id);
    console.log("[PlayerManager] Created new batting order sorted by name");
  }
  
  // Add any missing players to the batting order
  const missingIds = allPlayers
    .map(p => p.id)
    .filter(id => !battingOrderIds.includes(id));
  
  if (missingIds.length > 0) {
    battingOrderIds = [...battingOrderIds, ...missingIds];
    console.log("[PlayerManager] Added missing players to batting order:", missingIds);
  }
  
  // Load active players
  try {
    const storedActive = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedActive) {
      activePlayers = JSON.parse(storedActive);
      console.log("[PlayerManager] Loaded active players:", activePlayers);
      
      // Validate the IDs
      activePlayers = activePlayers.filter(id => 
        allPlayers.some(p => p.id === id)
      );
    }
  } catch (e) {
    console.error("[PlayerManager] Error loading active players:", e);
    activePlayers = [];
  }
  
  // Ensure we have at least one active player
  if (activePlayers.length === 0 && battingOrderIds.length > 0) {
    activePlayers = [battingOrderIds[0]];
    console.log("[PlayerManager] No active players, setting first player as active:", battingOrderIds[0]);
  }
  
  // Save any changes we made for consistency
  saveBattingOrder();
  saveActiveStatus();
  
  isInitialized = true;
  console.log("[PlayerManager] Initialization complete");
  
  // Create the full batting order objects
  const playerMap = new Map(allPlayers.map(p => [p.id, p]));
  const orderedPlayers = battingOrderIds
    .map(id => playerMap.get(id))
    .filter(Boolean);
  
  // Trigger callbacks with initial data
  if (callbacks.onActivePlayersChange) {
    callbacks.onActivePlayersChange([...activePlayers]);
  }
  
  if (callbacks.onBattingOrderChange) {
    callbacks.onBattingOrderChange(orderedPlayers);
  }
}

/**
 * Toggle a player's active status
 */
export function togglePlayerStatus(playerId) {
  if (!isInitialized) return;
  
  console.log("[PlayerManager] Toggling player:", playerId);
  
  // Check current status
  const isActive = activePlayers.includes(playerId);
  
  if (isActive) {
    // Remove from active
    activePlayers = activePlayers.filter(id => id !== playerId);
  } else {
    // Add to active
    activePlayers = [...activePlayers, playerId];
  }
  
  // Save changes
  saveActiveStatus();
  
  // Notify React
  if (callbacks.onActivePlayersChange) {
    callbacks.onActivePlayersChange([...activePlayers]);
  }
}

/**
 * Update the batting order
 */
export function updateBattingOrder(newOrderedPlayers) {
  if (!isInitialized) return;
  
  // Extract IDs from player objects
  battingOrderIds = newOrderedPlayers.map(p => p.id);
  
  // Save to localStorage
  saveBattingOrder();
  
  // No need to notify React as the state is already updated
}

/**
 * Save active player status to localStorage
 */
function saveActiveStatus() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activePlayers));
    console.log("[PlayerManager] Saved active players:", activePlayers);
  } catch (e) {
    console.error("[PlayerManager] Error saving active players:", e);
  }
}

/**
 * Save batting order to localStorage
 */
function saveBattingOrder() {
  try {
    localStorage.setItem(BATTING_ORDER_KEY, JSON.stringify(battingOrderIds));
    console.log("[PlayerManager] Saved batting order:", battingOrderIds);
  } catch (e) {
    console.error("[PlayerManager] Error saving batting order:", e);
  }
}

/**
 * Get current active players
 */
export function getActivePlayerIds() {
  return [...activePlayers];
}

/**
 * Get current batting order IDs
 */
export function getBattingOrderIds() {
  return [...battingOrderIds];
}

/**
 * Manual save (for redundant safety)
 */
export function forceSave(currentPlayers, currentOrder) {
  // Backup the current state values as a safety measure
  if (currentPlayers && currentPlayers.length > 0) {
    activePlayers = [...currentPlayers];
  }
  
  if (currentOrder && currentOrder.length > 0) {
    battingOrderIds = currentOrder.map(p => p.id);
  }
  
  saveActiveStatus();
  saveBattingOrder();
}