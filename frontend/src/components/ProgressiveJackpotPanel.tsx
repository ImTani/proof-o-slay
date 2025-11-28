import React from 'react';
import { NeonButton } from './ui/NeonButton';

interface ProgressiveJackpotPanelProps {
    tickets: number;
    onStartJackpot: () => void;
}

export const ProgressiveJackpotPanel: React.FC<ProgressiveJackpotPanelProps> = ({ tickets, onStartJackpot }) => {
    return (
        <div className="p-8 text-center font-neon text-white">
            <h2 className="text-2xl font-bold mb-4">Jackpot Run</h2>
            <p className="mb-4 text-gray-400">Tickets: {tickets}</p>
            <NeonButton
                onClick={onStartJackpot}
                variant="secondary"
            >
                Start Jackpot Run
            </NeonButton>
        </div>
    );
};
