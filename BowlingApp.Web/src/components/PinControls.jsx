import React from 'react';

const PinControls = ({ onRoll, disabled, remainingPins = 10 }) => {
    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-center text-gray-700">Enter Pins Knocked Down</h3>
            <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: 11 }).map((_, pins) => (
                    <button
                        key={pins}
                        onClick={() => onRoll(pins)}
                        disabled={disabled || pins > remainingPins}
                        className={`w-12 h-12 rounded-full font-bold shadow-sm transition
               ${pins > remainingPins
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
                    >
                        {pins}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PinControls;
