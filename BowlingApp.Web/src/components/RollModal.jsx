import React from 'react';

const RollModal = ({ isOpen, onClose, onRoll, playerName, frameNumber, rollNumber, maxPins = 10 }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {playerName}'s Turn
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                        Frame {frameNumber}, Roll {rollNumber}
                    </p>

                    <div className="mt-6 grid grid-cols-3 gap-3">
                        {/* Special Buttons */}
                        <button
                            onClick={() => onRoll(0)}
                            className="col-span-1 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-bold"
                        >
                            Gutter (-)
                        </button>
                        <button
                            onClick={() => onRoll(10)}
                            disabled={maxPins < 10}
                            className={`col-span-2 px-4 py-2 rounded font-bold ${maxPins < 10 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                        >
                            STRIKE! (X)
                        </button>

                        {/* Standard Pins */}
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((pins) => (
                            <button
                                key={pins}
                                onClick={() => onRoll(pins)}
                                disabled={pins > maxPins}
                                className={`px-4 py-3 rounded font-semibold border ${pins > maxPins ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'}`}
                            >
                                {pins}
                            </button>
                        ))}

                        {/* 0 and 10 are handled above for style, but could be here too if simple layout preferred */}
                        <button
                            onClick={() => onRoll(0)}
                            className="col-span-1 px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                        >
                            0
                        </button>
                        <button
                            onClick={() => onRoll(10)}
                            disabled={maxPins < 10}
                            className={`col-span-2 px-4 py-2 rounded font-bold ${maxPins < 10 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >
                            SPARES / 10
                        </button>
                    </div>

                    <div className="items-center px-4 py-3">
                        <button
                            id="ok-btn"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RollModal;
