import React, { useState, useEffect } from 'react';
import { useContract, useContractWrite, useContractRead } from 'wagmi';
import { ethers } from 'ethers';

const TOURNAMENT_CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
const TOURNAMENT_ABI = [
    // Add your tournament contract ABI here
];

const TournamentManager = () => {
    const [tournamentCode, setTournamentCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [tournamentInfo, setTournamentInfo] = useState(null);
    const [error, setError] = useState('');

    const { data: contract } = useContract({
        address: TOURNAMENT_CONTRACT_ADDRESS,
        abi: TOURNAMENT_ABI,
    });

    const { write: createTournament } = useContractWrite({
        ...contract,
        functionName: 'createTournament',
    });

    const { write: joinTournament } = useContractWrite({
        ...contract,
        functionName: 'joinTournament',
    });

    const { data: tournamentData } = useContractRead({
        ...contract,
        functionName: 'getTournamentInfo',
        args: [tournamentCode],
        enabled: !!tournamentCode,
    });

    useEffect(() => {
        if (tournamentData) {
            setTournamentInfo({
                creator: tournamentData[0],
                startTime: new Date(tournamentData[1].toNumber() * 1000),
                endTime: new Date(tournamentData[2].toNumber() * 1000),
                currentPlayers: tournamentData[3].toNumber(),
                isActive: tournamentData[4],
            });
        }
    }, [tournamentData]);

    const handleCreateTournament = async () => {
        try {
            setIsCreating(true);
            setError('');
            
            // Generate a random 6-character code
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            // Create tournament with 10 minutes duration (600 seconds)
            await createTournament({
                args: [code, 600],
            });
            
            setTournamentCode(code);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinTournament = async () => {
        try {
            setIsJoining(true);
            setError('');
            
            await joinTournament({
                args: [tournamentCode],
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="tournament-manager">
            <h2>Tournament Manager</h2>
            
            {!tournamentCode ? (
                <div className="tournament-actions">
                    <button 
                        onClick={handleCreateTournament}
                        disabled={isCreating}
                    >
                        {isCreating ? 'Creating...' : 'Create Tournament'}
                    </button>
                    
                    <div className="join-tournament">
                        <input
                            type="text"
                            placeholder="Enter tournament code"
                            value={tournamentCode}
                            onChange={(e) => setTournamentCode(e.target.value.toUpperCase())}
                        />
                        <button 
                            onClick={handleJoinTournament}
                            disabled={isJoining || !tournamentCode}
                        >
                            {isJoining ? 'Joining...' : 'Join Tournament'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="tournament-info">
                    <h3>Tournament Code: {tournamentCode}</h3>
                    {tournamentInfo && (
                        <>
                            <p>Status: {tournamentInfo.isActive ? 'Active' : 'Ended'}</p>
                            <p>Players Joined: {tournamentInfo.currentPlayers}</p>
                            <p>Ends: {tournamentInfo.endTime.toLocaleString()}</p>
                        </>
                    )}
                </div>
            )}
            
            {error && <div className="error">{error}</div>}
        </div>
    );
};

export default TournamentManager; 