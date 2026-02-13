import React from 'react';

const ScoreBoard = ({ gameData, activePlayerIndex, onFrameClick }) => {
    // gameData expected structure: { players: [{ name: '...', frames: [{ roll1: 5, roll2: 4, score: 9 }, ...] }] }

    // Default structure if no gameData is passed (or for initial empty state)
    const players = gameData?.players || [];

    return (
        <div className="mt-8 overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 shadow-sm">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="p-3 text-left w-48">Player</th>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <th key={i} className="p-3 border-l border-gray-600 w-16 text-center">{i + 1}</th>
                        ))}
                        <th className="p-3 border-l border-gray-600 w-20 text-center">Total</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {players.length > 0 ? (
                        players.map((player, index) => {
                            const isActivePlayer = index === activePlayerIndex;
                            return (
                                <tr
                                    key={player.id}
                                    className={`border-b border-gray-200 transition-colors duration-200
                                        ${isActivePlayer ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    <td className="p-3 font-semibold text-gray-800 border-r border-gray-200 flex items-center gap-2">
                                        {player.name}
                                        {isActivePlayer && <span className="text-blue-600 animate-pulse text-xs">● Active</span>}
                                    </td>
                                    {Array.from({ length: 10 }).map((_, i) => {
                                        const frame = player.frames ? player.frames[i] : {};
                                        // Determine if this is the next empty frame for the active player
                                        let currentFrameIndex = player.frames ? player.frames.length : 0;
                                        if (currentFrameIndex > 0) {
                                            const lastFrame = player.frames[currentFrameIndex - 1];
                                            // If last frame exists but is incomplete (no roll2 and not a strike), stay on it
                                            if (lastFrame && lastFrame.roll2 === null && lastFrame.roll1 !== 10) {
                                                currentFrameIndex = currentFrameIndex - 1;
                                            }
                                        }
                                        const isCurrentFrame = isActivePlayer && i === currentFrameIndex;

                                        // Allow clicking any frame, but highlight the current one
                                        const isClickable = isActivePlayer;

                                        return (
                                            <td
                                                key={i}
                                                className={`p-0 border-r border-gray-200 align-top 
                                                    ${isClickable ? 'cursor-pointer hover:bg-blue-100' : ''}
                                                    ${isCurrentFrame ? 'bg-yellow-50 ring-2 ring-yellow-400 ring-inset z-10' : ''}
                                                `}
                                                onClick={() => isClickable && onFrameClick && onFrameClick(index, i + 1)}
                                            >
                                                <div className="flex flex-col h-full">
                                                    <div className="flex h-8 border-b border-gray-100">
                                                        <span className="w-1/2 flex items-center justify-center border-r border-gray-100 text-sm h-full">
                                                            {frame?.roll1 === 10 ? 'X' : (frame?.roll1 ?? '')}
                                                        </span>
                                                        <span className="w-1/2 flex items-center justify-center text-sm bg-gray-50 h-full">
                                                            {frame?.roll2 === 10 ? 'X' :
                                                                (frame?.roll1 + frame?.roll2 === 10) ? '/' : (frame?.roll2 ?? '')}
                                                            {i === 9 && frame?.roll3 !== null && frame?.roll3 !== undefined && <span className="ml-1 text-xs">({frame.roll3})</span>}
                                                        </span>
                                                    </div>
                                                    <div className="h-8 flex items-center justify-center font-bold text-gray-900">
                                                        {frame?.score ?? ''}
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                    <td className="p-3 text-center font-bold text-xl text-blue-600">
                                        {player.frames && player.frames.length > 0 ? player.frames[player.frames.length - 1]?.score : 0}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        /* Default empty rows for visual structure if no players yet - optional but good for "empty" state */
                        <tr>
                            <td colSpan="12" className="p-4 text-center text-gray-400 italic">
                                No players added yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ScoreBoard;
