import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { CONTRACT_CONFIG } from '../lib/suiClient';

/**
 * BalanceDisplay Component
 * 
 * Displays the user's SLAY token balance by querying all coin objects.
 * Auto-refreshes when wallet connects/disconnects or after transactions.
 */

interface BalanceDisplayProps {
    pendingShards?: number;
}

export function BalanceDisplay({ pendingShards = 0 }: BalanceDisplayProps) {
    const currentAccount = useCurrentAccount();

    // Query all SLAY coin objects owned by the current account
    const { data: coins, isLoading, error } = useSuiClientQuery(
        'getCoins',
        {
            owner: currentAccount?.address || '',
            coinType: CONTRACT_CONFIG.SLAY_TYPE,
        },
        {
            enabled: !!currentAccount && !!CONTRACT_CONFIG.PACKAGE_ID,
            refetchInterval: 5000, // Auto-refresh every 5 seconds
        }
    );

    // Debug logging
    console.log('💰 BalanceDisplay:', {
        address: currentAccount?.address,
        slayType: CONTRACT_CONFIG.SLAY_TYPE,
        coins: coins?.data,
        isLoading,
        error,
    });

    // Calculate total balance from SLAY coins
    // Balance is already in raw units (smallest denomination)
    const totalBalance = coins?.data.reduce((acc, coin) => {
        console.log('Coin balance:', coin.balance, 'Type:', coin.coinType);
        return acc + BigInt(coin.balance);
    }, BigInt(0)) || BigInt(0);

    // Format as decimal (divide by 10^9)
    const formattedBalance = Number(totalBalance) / 1_000_000_000;
    console.log('Total balance (raw):', totalBalance.toString(), 'Formatted:', formattedBalance.toFixed(2));

    if (!currentAccount) {
        return (
            <div className="absolute top-20 right-5 bg-black/80 border-2 border-gray-600 rounded-lg px-5 py-4 text-gray-400 text-sm font-retro">
                Connect wallet to see balance
            </div>
        );
    }

    if (!CONTRACT_CONFIG.PACKAGE_ID) {
        return (
            <div className="absolute top-20 right-5 bg-black/80 border-2 border-yellow-600 rounded-lg px-5 py-4 text-yellow-500 text-sm font-retro">
                ⚠️ Contract not deployed
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="absolute top-20 right-5 bg-black/80 border-2 border-blue-400 rounded-lg px-5 py-4 text-white text-sm font-retro">
                Loading balance...
            </div>
        );
    }

    if (error) {
        return (
            <div className="absolute top-20 right-5 bg-black/80 border-2 border-red-500 rounded-lg px-5 py-4 text-red-500 text-sm font-retro">
                Error loading balance
            </div>
        );
    }

    return (
        <div className="absolute top-20 right-5 bg-black/80 border-2 border-yellow-400 rounded-lg px-5 py-4 min-w-[200px] font-retro shadow-lg">
            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                SLAY Balance
            </div>
            <div className="text-2xl font-bold text-yellow-400 font-mono mb-2">
                {formattedBalance.toFixed(2)}
            </div>

            {pendingShards > 0 && (
                <>
                    <div className="h-px bg-gray-700 my-3" />
                    <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
                        Pending Shards
                    </div>
                    <div className="text-lg font-bold text-blue-400 font-mono">
                        ✨ {pendingShards}
                    </div>
                </>
            )}
        </div>
    );
}
