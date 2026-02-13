// =============================================================================================
// API Calls for Bowling App
// =============================================================================================

const API_BASE_URL = "http://localhost:5035/api/game";

export const createGame = async (playerNames) => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerNames)
    });
    
    if (!response.ok) {
        throw new Error('Failed to create game');
    }
    
    return await response.json();
};

export const getGame = async (gameId) => {
    const response = await fetch(`${API_BASE_URL}/${gameId}`);
    
    if (!response.ok) {
        throw new Error('Failed to get game');
    }
    
    return await response.json();
};

export const rollBall = async (gameId, playerId, pins) => {
    const response = await fetch(`${API_BASE_URL}/${gameId}/roll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, pins })
    });
    
    if (!response.ok) {
        throw new Error('Failed to submit roll');
    }
    
    return response;
};
