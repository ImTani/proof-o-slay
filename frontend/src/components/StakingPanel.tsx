import React from 'react';
import { NeonButton } from './ui/NeonButton';

interface StakingPanelProps {
    onStakeConfirmed: (amount: number, duration: number) => void;
}

export const StakingPanel: React.FC<StakingPanelProps> = ({ onStakeConfirmed }) => {
    return (
        <div className="p-8 text-center font-neon text-white">
            <h2 className="text-2xl font-bold mb-4">Staking Panel</h2>
            <p className="mb-4 text-gray-400">Staking functionality coming soon.</p>
            <NeonButton
                onClick={() => onStakeConfirmed(100, 7)}
                variant="accent"
            >
                Test Stake
            </NeonButton>
        </div>
    );
};
