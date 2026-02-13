import { useState, useEffect } from 'react'
import PlayerSetup from './components/PlayerSetup'
import ScoreBoard from './components/ScoreBoard'

import RollModal from './components/RollModal'
import GameOverModal from './components/GameOverModal'
import { createGame, getGame, rollBall } from './api/gameService'

// Environment Toggle: 'MOCK' or 'LIVE' (Default to MOCK)
const isLive = import.meta.env.VITE_APP_MODE === 'LIVE';

function App() {
  const [game, setGame] = useState(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isRollModalOpen, setIsRollModalOpen] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(null); // { playerIndex, frameNumber }
  const [isGameOver, setIsGameOver] = useState(false);

  // Helper function to determine current player based on game state
  const determineCurrentPlayer = (gameData) => {
    if (!gameData || !gameData.players || gameData.players.length === 0) return 0;

    const players = gameData.players;
    
    // Find the player with the least progress or incomplete frame
    for (let round = 0; round < 10; round++) {
      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const frames = player.frames || [];
        
        // If player has fewer frames than current round + 1, it's their turn
        if (frames.length <= round) {
          return i;
        }
        
        // If player has a frame at this round, check if it's complete
        const frame = frames[round];
        if (frame) {
          const isFrameComplete = isFrameCompleted(frame, round + 1);
          if (!isFrameComplete) {
            return i;
          }
        }
      }
    }
    
    return 0; // Default to first player
  };

  // Helper to check if a frame is complete
  const isFrameCompleted = (frame, frameNumber) => {
    if (!frame || frame.roll1 === null || frame.roll1 === undefined) return false;
    
    if (frameNumber < 10) {
      // Strike completes the frame
      if (frame.roll1 === 10) return true;
      // Two rolls complete the frame
      return frame.roll2 !== null && frame.roll2 !== undefined;
    } else {
      // 10th frame
      if (frame.roll2 === null || frame.roll2 === undefined) return false;
      
      const isStrike = frame.roll1 === 10;
      const isSpare = (frame.roll1 + frame.roll2) === 10;
      
      // If strike or spare, need third roll
      if (isStrike || isSpare) {
        return frame.roll3 !== null && frame.roll3 !== undefined;
      }
      
      return true; // Open frame in 10th
    }
  };

  const handleStartGame = async (players) => {
    setLoading(true);
    setIsGameOver(false);
    setCurrentPlayerIndex(0); // Reset to first player
    try {
      if (isLive) {
        // --- LIVE MODE: Call API ---
        console.log("Starting game in LIVE mode...");
        const newGame = await createGame(players);
        setGame(newGame);
      } else {
        // --- MOCK MODE: Local State ---
        console.log("Starting game in MOCK mode...");
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        setGame({
          id: 999,
          players: players.map((p, i) => ({ id: i, name: p, frames: [] }))
        });
      }
    } catch (error) {
      console.error("Failed to start game", error);
      alert("Error starting game. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoll = async (pins) => {
    if (!game) return;

    // If coming from Modal, use selected player, otherwise current player
    const playerIndex = selectedFrame ? selectedFrame.playerIndex : currentPlayerIndex;
    const currentPlayer = game.players[playerIndex];

    try {
      if (isLive) {
        // =============================================================================================
        // LIVE MODE: INTEGRATE WITH BACKEND
        // =============================================================================================
        await rollBall(game.id, currentPlayer.id, pins);
        const updatedGame = await getGame(game.id);
        setGame(updatedGame);

        // Determine whose turn it is based on game state
        const nextPlayerIndex = determineCurrentPlayer(updatedGame);
        setCurrentPlayerIndex(nextPlayerIndex);

        if (updatedGame.isFinished) setIsGameOver(true);

      } else {
        // =============================================================================================
        // MOCK MODE: UI SIMULATION
        // =============================================================================================
        console.log(`[MOCK] Player ${currentPlayer.name} rolled ${pins} pins.`);

        const newPlayers = [...game.players];
        const player = newPlayers[playerIndex];

        // Determine if this is Roll 1 or Roll 2 of the current frame
        const currentFrame = player.frames[player.frames.length - 1];
        const isRoll2 = currentFrame && currentFrame.roll2 === null && currentFrame.roll1 !== 10;

        if (isRoll2) {
          // --- ROLL 2 ---
          // Validate: Cannot roll more than remaining pins
          const remaining = 10 - currentFrame.roll1;
          if (pins > remaining) {
            alert(`Invalid Roll! Only ${remaining} pins left.`);
            return;
          }

          currentFrame.roll2 = pins;
          // Update score (simplified accumulation)
          const prevScore = player.frames.length > 1 ? player.frames[player.frames.length - 2].score : 0;
          currentFrame.score = prevScore + currentFrame.roll1 + pins; // Note: This ignores spare bonuses for simplicity in Mock

          // Frame complete, move to next player
          setCurrentPlayerIndex((prev) => (prev + 1) % game.players.length);

        } else {
          // --- ROLL 1 ---
          // Create new frame
          const prevScore = player.frames.length > 0 ? player.frames[player.frames.length - 1].score || 0 : 0;
          const isStrike = pins === 10;

          player.frames.push({
            roll1: pins,
            roll2: null, // Waiting for second roll unless strike
            score: isStrike ? prevScore + 10 : null // Score pending if not strike (simplified)
          });

          // If Strike, frame is done (for non-10th frame), next player
          // If not Strike, stay on this player for Roll 2
          if (isStrike) {
            console.log(">>> STRIKE! <<<");
            setCurrentPlayerIndex((prev) => (prev + 1) % game.players.length);
          } else {
            // Stay on current player
            console.log(`Wait for Roll 2. Pins left: ${10 - pins}`);
          }
        }

        setGame({ ...game, players: newPlayers });

        // Mock Game Over Condition
        const allFinished = newPlayers.every(p => p.frames.length >= 10 && (p.frames[9].roll2 !== null || p.frames[9].roll1 === 10)); // Simplified 10th frame check
        if (allFinished) {
          setIsGameOver(true);
        }
      }

      // Close modal if open
      setIsRollModalOpen(false);
      setSelectedFrame(null);

    } catch (error) {
      console.error("Error submitting roll", error);
    }
  };

  const activePlayer = game?.players[currentPlayerIndex];

  // Handler for clicking a frame in the ScoreBoard
  const onFrameClick = (playerIndex, frameNumber) => {
    setSelectedFrame({ playerIndex, frameNumber });
    setIsRollModalOpen(true);
  };



  // Helper to get max pins allowed for the modal
  const getMaxPinsForModal = () => {
    if (!selectedFrame || !game) return 10;
    const player = game.players[selectedFrame.playerIndex];
    // Check if we are editing an existing frame (not supported in simple mock) or rolling for current
    // For this mock, we assume modal is for the *current* frame/roll sequence
    const currentFrame = player.frames[player.frames.length - 1];

    // If it's Roll 2 (incomplete frame and not strike), max is remainder
    if (currentFrame && currentFrame.roll2 === null && currentFrame.roll1 !== 10) {
      return 10 - currentFrame.roll1;
    }
    return 10;
  };

  // Helper to know which roll number it is
  const getRollNumberForModal = () => {
    if (!selectedFrame || !game) return 1;
    const player = game.players[selectedFrame.playerIndex];
    const currentFrame = player.frames[player.frames.length - 1];
    if (currentFrame && currentFrame.roll2 === null && currentFrame.roll1 !== 10) {
      return 2;
    }
    return 1;
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* API Status Bar */}
      {!isLive ? (
        <div className="bg-red-600 text-white text-center py-2 font-bold shadow-md">
          ⚠️ MOCK MODE: Not Connected to API (Check .env.local)
        </div>
      ) : (
        <div className="bg-green-600 text-white text-center py-2 font-bold shadow-md">
          ✅ LIVE MODE: Connected to API
        </div>
      )}

      <div className="px-4 py-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Bowling Score Keeper 🎳</h1>
          <p className="text-gray-600 mt-2">Midterm Exam Application</p>
        </header>

        <main className="max-w-6xl mx-auto">
          {!game ? (
            <PlayerSetup onStartGame={handleStartGame} />
          ) : (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-lg relative">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Game #{game.id}</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setGame(null)}
                      className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-red-600 transition"
                    >
                      New Game
                    </button>
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold flex items-center">
                      Current Turn: {activePlayer?.name}
                    </span>
                  </div>
                </div>

                <ScoreBoard
                  gameData={game}
                  activePlayerIndex={currentPlayerIndex}
                  onFrameClick={onFrameClick}
                />


              </div>
            </div>
          )}
        </main>

        {/* Modals */}
        {game && (
          <RollModal
            isOpen={isRollModalOpen}
            onClose={() => setIsRollModalOpen(false)}
            onRoll={handleRoll}
            playerName={selectedFrame ? game.players[selectedFrame.playerIndex].name : ''}
            frameNumber={selectedFrame?.frameNumber}
            rollNumber={getRollNumberForModal()}
            maxPins={getMaxPinsForModal()}
          />
        )}

        <GameOverModal
          isOpen={isGameOver}
          players={game?.players || []}
          onRestart={() => setGame(null)}
        />

      </div>
    </div>
  )
}

export default App
