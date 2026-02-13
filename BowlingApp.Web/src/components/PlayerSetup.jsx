import React, { useState } from 'react';

const PlayerSetup = ({ onStartGame }) => {
    const [players, setPlayers] = useState(['Player 1']);

    const addPlayer = () => {
        if (players.length < 4) {
            setPlayers([...players, `Player ${players.length + 1}`]);
        }
    };

    const updateName = (index, name) => {
        const newPlayers = [...players];
        newPlayers[index] = name;
        setPlayers(newPlayers);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onStartGame(players);
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">New Game Setup</h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {players.map((player, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <label className="w-20 font-medium text-gray-700">Player {index + 1}</label>
                            <input
                                type="text"
                                value={player}
                                onChange={(e) => updateName(index, e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex space-x-4">
                    {players.length < 4 && (
                        <button
                            type="button"
                            onClick={addPlayer}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        >
                            + Add Player
                        </button>
                    )}
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ml-auto"
                    >
                        Start Game
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PlayerSetup;
