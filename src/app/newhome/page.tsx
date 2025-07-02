/* eslint-disable @next/next/no-img-element */
"use client"
import "../globals.css";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { IoCloseCircleOutline } from "react-icons/io5";

// Define the Game type (copied from games/page.tsx)
type Game = {
    _id: string;
    startTime: string;
    totalPool: string;
    result: string;
    centers: string[];
    members: {
        id: string;
        centerId: string;
        amount: string;
        bet: string;
        result: string;
    }[];
};

// Entry type for local form
interface BetEntry {
    id: string;
    option: "Heads" | "Tails";
    amount: number;
    timestamp: Date;
}

// Add at the top, after your imports
type GameHistory = {
    _id: string;
    result: string;
    createdAt: string;
    entries: {
        id: string;
        centerId: string;
        amount: string;
        bet: string;
        result: string;
        _id: string;
    }[];
};

export default function CenterHome() {
    const { user } = useAuth();
    const [game, setGame] = useState<Game | null>(null);
    const [gameId, setGameId] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [selected, setSelected] = useState<"Heads" | "Tails" | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [entries, setEntries] = useState<BetEntry[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const entriesRef = useRef<BetEntry[]>([]);
    const hasSubmittedRef = useRef(false);
    const [gameState, setGameState] = useState<'timer' | 'flipping' | 'result'>('timer');
    const [flippingAnimation, setFlippingAnimation] = useState<'heads' | 'tails'>("heads");
    const [finalResult, setFinalResult] = useState<'heads' | 'tails' | null>(null);
    const [resultText, setResultText] = useState<string>("");
    const [userPoints, setUserPoints] = useState<number>(0);
    const [historyGames, setHistoryGames] = useState<GameHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [isBettingDisabled, setIsBettingDisabled] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Keep entriesRef in sync
    useEffect(() => {
        entriesRef.current = entries;
    }, [entries]);

    // Fetch the latest (soonest) upcoming game
    const fetchLatestGame = async () => {
        try {
            console.log('🔍 Fetching latest game...');
            const response = await fetch('https://api.trontools.ai/api/get-all-games', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('📥 Latest game response:', response.status);
            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }
            const result = await response.json();
            console.log('📦 Latest game data:', result);
            const gamesData = Array.isArray(result) ? result : result.data;
            if (!Array.isArray(gamesData)) {
                throw new Error('Invalid data format received from API');
            }
            // Filter for future games and sort by soonest
            const now = new Date();
            const futureGames = gamesData
                .filter((g: Game) => new Date(g.startTime) > now)
                .sort((a: Game, b: Game) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            if (futureGames.length > 0) {
                console.log('🎮 Setting next game:', futureGames[0]);
                console.log('🔎 Next game entries:', futureGames[0].entries);
                setGame(futureGames[0]);
                setGameId(futureGames[0]._id);
            } else {
                console.log('❌ No future games found');
                setGame(null);
                setGameId(null);
            }
        } catch (err) {
            console.error('❌ Error fetching latest game:', err);
            setGame(null);
            setGameId(null);
        }
    };

    useEffect(() => {
        fetchLatestGame();
    }, []);

    // Modify the interval to be longer
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('⏰ 10-second interval: Fetching latest game...');
            fetchLatestGame();
        }, 10000);  // Change to 10 seconds instead of 3
        return () => clearInterval(interval);
    }, []);

    // Main game loop: timer -> submit -> animation -> result -> next game
    useEffect(() => {
        if (!game) return;
        
        // Reset game state properly
        setGameState('timer');
        setIsBettingDisabled(false);
        setTimeLeft("");
        setFinalResult(null);
        setResultText("");
        hasSubmittedRef.current = false;
        let timerEndTimeout;
        let animationTimeout;
        let resultTimeout;
        
        // 1. Start timer
        const startTime = new Date(game.startTime).getTime();
        const updateTimer = () => {
            const now = Date.now();
            const diff = startTime - now;
            if (diff <= 0) {
                setTimeLeft("STARTING NOW!");
                setIsBettingDisabled(true);
                clearInterval(timerInterval);
                // 2. On timer end, submit entries and start animation
                handleFinalSubmit().then(() => {
                    setGameState('flipping');
                    setFlippingAnimation('heads');
                    // 3. Show animation for 7 seconds, then fetch result
                    animationTimeout = setTimeout(() => {
                        fetchResultAndShow();
                    }, 7000);
                });
            } else {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        };
        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
        return () => {
            clearInterval(timerInterval);
            clearTimeout(timerEndTimeout);
            clearTimeout(animationTimeout);
            clearTimeout(resultTimeout);
        };
    }, [game]);

    // Coinflip animation effect - Only run when flipping state is set
    useEffect(() => {
        if (gameState !== 'flipping') return;
        
        let flipCount = 0;
        const totalDuration = 7000; // 7 seconds total
        const numberOfFlips = 35; // 35 flips in 7 seconds
        const intervalTime = totalDuration / numberOfFlips;
        
        // Clear any existing interval
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current);
        }
        
        // Start new animation
        animationIntervalRef.current = setInterval(() => {
            setFlippingAnimation(prev => prev === 'heads' ? 'tails' : 'heads');
            flipCount++;
            
            if (flipCount >= numberOfFlips) {
                if (animationIntervalRef.current) {
                    clearInterval(animationIntervalRef.current);
                    animationIntervalRef.current = null;
                }
                // Animation is complete, but we don't call fetchResultAndShow here
                // It will be called by the main game loop timeout
            }
        }, intervalTime);

        return () => {
            if (animationIntervalRef.current) {
                clearInterval(animationIntervalRef.current);
                animationIntervalRef.current = null;
            }
        };
    }, [gameState]);

    // Improved fetchResultAndShow function with better error handling
    const fetchResultAndShow = async () => {
        if (!gameId) return;
        let retryCount = 0;
        const maxRetries = 20; // Increased retries
        const pollInterval = 1000;

        const tryFetchResult = async () => {
            try {
                console.log(`🔄 Attempting to fetch result (attempt ${retryCount + 1}/${maxRetries})`);
                const response = await fetch(`https://api.trontools.ai/api/get-game/${gameId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                console.log('📦 Fetch result response:', result);
                
                if (!result.success || !result.data) {
                    console.log('❌ No valid result data yet');
                    if (retryCount < maxRetries) {
                        retryCount++;
                        setTimeout(tryFetchResult, pollInterval);
                    } else {
                        console.log('❌ Max retries reached, fetching latest game');
                        fetchLatestGame();
                    }
                    return;
                }

                const gameData = result.data;
                console.log('📦 Game data after result:', gameData);
                console.log('📦 Game data entries:', gameData.entries);
                
                // If we have a result, show it
                if (gameData.result && gameData.result.toLowerCase() !== '') {
                    const res = gameData.result.toLowerCase() as 'heads' | 'tails';
                    console.log('🎉 Result found:', res);
                    
                    // Stop flipping animation
                    if (animationIntervalRef.current) {
                        clearInterval(animationIntervalRef.current);
                        animationIntervalRef.current = null;
                    }
                    
                    // Show result
                    setGameState('result');
                    setFinalResult(res);
                    setResultText(`${res.charAt(0).toUpperCase() + res.slice(1)} Win!!!`);
                    
                    // Update history and points
                    fetchGameHistory();
                    fetchPoints(user?._id || "");
                    
                    // Move to next game after 5 seconds
                    setTimeout(() => {
                        setGameState('timer');
                        setFinalResult(null);
                        setResultText("");
                        hasSubmittedRef.current = false;
                        fetchLatestGame();
                        // Update points again when new game starts
                        fetchPoints(user?._id || "");
                    }, 5000);
                    return;
                }

                // Keep polling if no result yet
                if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(tryFetchResult, pollInterval);
                } else {
                    console.log('❌ Max retries reached, fetching latest game');
                    fetchLatestGame();
                }
            } catch (e) {
                console.error('❌ Error fetching result:', e);
                if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(tryFetchResult, pollInterval);
                } else {
                    console.log('❌ Max retries reached due to errors, fetching latest game');
                    fetchLatestGame();
                }
            }
        };

        tryFetchResult();
    };

    // Entry form handlers
    const handleSelect = (option: "Heads" | "Tails") => {
        setSelected((prev) => (prev === option ? null : option));
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) {
            alert("Please select Heads or Tails");
            return;
        }
        if (!amount || parseInt(amount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        // Generate a new ID
        const newId = `#${1001 + entries.length}`;
        // Create new entry
        const newEntry: BetEntry = {
            id: newId,
            option: selected,
            amount: parseInt(amount),
            timestamp: new Date(),
        };
        setEntries([newEntry, ...entries]);
        setAmount("");
        setSelected(null);
    };
    const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

    // Improved Final submit logic with better error handling
    const handleFinalSubmit = async () => {
        if (!gameId || isSubmitting) return false;
        setIsSubmitting(true);
        try {
            if (entriesRef.current.length > 0) {
                console.log('📤 Submitting entries:', entriesRef.current);
                const formattedEntries = entriesRef.current.map(entry => ({
                    id: entry.id,
                    centerId: user?._id || "",
                    amount: entry.amount.toString(),
                    bet: entry.option.toLowerCase(),
                    result: ""
                }));
                console.log('📦 Formatted entries:', formattedEntries);
                
                const response = await fetch('https://api.trontools.ai/api/add-entries', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        gameId: gameId,
                        entries: formattedEntries
                    }),
                });
                
                console.log('📥 Submit entries response:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Submit entries error response:', errorText);
                    setIsSubmitting(false);
                    return false;
                }
                
                const result = await response.json();
                console.log('📦 Submit entries result:', result);
                
                if (!result.success) {
                    console.error('❌ Submit entries failed:', result.message);
                    setIsSubmitting(false);
                    return false;
                }
                
                console.log('✅ Entries submitted successfully');
                // Clear entries after successful submission
                setEntries([]);
                entriesRef.current = [];
                setIsSubmitting(false);
                // Update points immediately after successful submission
                fetchPoints(user?._id || "");
                return true;
            } else {
                console.log('⚠️ No entries to submit');
                setIsSubmitting(false);
                return false;
            }
        } catch (error) {
            console.error('❌ Error submitting entries:', error);
            setIsSubmitting(false);
            // Reset submission flag to allow retry
            hasSubmittedRef.current = false;
            return false;
        }
    };

    useEffect(() => {
        fetchPoints(user?._id || "");
    }, [user]);

    const fetchPoints = async (centerId: string) => {
        if (!centerId) return;
        try {
            console.log('🔍 Fetching points for centerId:', centerId);
            const response = await fetch(`https://api.trontools.ai/api/get-points/${centerId}`);
            console.log('📥 Points response:', response.status);
            if (!response.ok) {
                throw new Error('Failed to fetch points');
            }
            const result = await response.json();
            console.log('📦 Points data:', result);
            if (result.success) {
                console.log('💰 Setting user points:', result.data);
                setUserPoints(result.data);
            }
        } catch (error) {
            console.error('❌ Error fetching points:', error);
        }
    };

    // Fetch user's game history
    const fetchGameHistory = async () => {
        if (!user?._id) return;
        setHistoryLoading(true);
        try {
            console.log('🔍 Fetching game history for user:', user._id);
            const response = await fetch(
                `https://api.trontools.ai/api/get-all-games/${user._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            console.log('📥 History response:', response.status);
            if (!response.ok) throw new Error("Failed to fetch history");
            const data = await response.json();
            console.log('📦 History data:', data);
            if (data.success && data.data) {
                const sortedGames = data.data
                    .sort(
                        (a: GameHistory, b: GameHistory) =>
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                    .slice(0, 5);
                console.log('📚 Setting history games:', sortedGames);
                setHistoryGames(sortedGames);
            }
        } catch (e) {
            console.error('❌ Error fetching game history:', e);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Add this helper function near your other utility functions
    const getRecentResults = (games: GameHistory[]) => {
        // Get the last 10 games (or fewer if not available)
        const recentGames = games
            .filter(game => game.result && (game.result.toLowerCase() === 'heads' || game.result.toLowerCase() === 'tails')) // Only include games with valid results
            .slice(0, 10) // Get last 10 games
            .map(game => game.result.toLowerCase().charAt(0).toUpperCase()) // Convert to H/T
            .reverse(); // Reverse to show oldest to newest

     
        return recentGames;
    };

    // Add a helper function to update entriesRef
    const setEntriesRef = (newEntries: BetEntry[]) => {
        entriesRef.current = newEntries;
    };

    // Update the useEffect for entriesRef to use the new helper
    useEffect(() => {
        setEntriesRef(entries);
    }, [entries]);

    // Update useEffect to fetch history when user changes
    useEffect(() => {
        if (user?._id) {
            fetchGameHistory();
        }
    }, [user]);

    return (
        <ProtectedRoute>
            <div className=" min-h-screen w-full flex flex-col md:items-center md:justify-center bg-cover bg-center relative" style={{ backgroundImage: 'url(/static/img/coinflipbg.png)' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-[#040404] to-transparent z-0"></div>
                <div className="hidden w-full h-[100vh] overflow-hidden md:flex flex-row items-stretch justify-center gap-[20px] z-10 px-[20px] py-[20px]">
                    {/* Left Panel */}
                    <div className="w-[25%]  rounded-2xl bg-white/20 backdrop-blur-lg p-7 md:p-8 flex flex-col gap-7 shadow-xl border border-white/30 h-full justify-between no-scroll overflow-y-scroll">
                        <div>
                            <div className="rounded-xl bg-[#a78a40] p-5 text-white flex flex-col items-start">
                                <span className="font-light text-lg">Total Craze Points</span>
                                <span className="font-[regularFont] text-2xl mt-2">{userPoints.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col gap-4 mt-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-light">History</span>
                                    <a href="/history" className="text-white underline underline-offset-4 font-light">All History</a>
                                </div>
                                {historyLoading ? (
                                    <div className="rounded-xl bg-[#3e3e3efe] p-3 flex items-center justify-center text-white">
                                        Loading...
                                    </div>
                                ) : historyGames.length === 0 ? (
                                    <div className="rounded-xl bg-[#3e3e3efe] p-3 flex items-center justify-center text-white">
                                        No history yet
                                    </div>
                                ) : (
                                    historyGames.map((game) => {
                                        // Find user's entries for this game
                                        const userEntries = game.entries.filter(e => e.centerId === user?._id);
                                        const totalAmount = userEntries.reduce((sum, e) => sum + parseInt(e.amount), 0);
                                        return (
                                            <div key={game._id} className="rounded-xl bg-[#3e3e3efe] p-3 flex flex-col gap-2">
                                                <div className={`rounded-full px-5 py-2 text-white text-sm font-medium w-full text-center ${game.result === "heads" ? "bg-[#F049FF]" : "bg-[#17FF83]"} text-[#202020]`}>
                                                    Winner ({game.result ? game.result.charAt(0).toUpperCase() + game.result.slice(1) : "?"}) - ₹{totalAmount}
                                                </div>
                                                <div className="flex gap-2 w-full">
                                                    <div className="bg-[#ffffff50] border border-[#ffffff50] rounded-full px-5 py-2 text-white text-xs w-1/2 text-center">
                                                        {userEntries.length} {userEntries.length === 1 ? "Entry" : "Entries"}
                                                    </div>
                                                    <a href="/history" className="text-white underline underline-offset-4 font-light w-1/2 flex items-center justify-center text-xs">
                                                        View Details
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Center Panel */}
                    <div className=" w-[50%] flex flex-col gap-7 rounded-2xl bg-white/20 backdrop-blur-lg p-[20px] overflow-y-scroll shadow-xl border border-white/30 h-full justify-between no-scroll">
                        {/* Previous winner list */}
                        <div>
                            <div className="rounded-xl bg-white/10 p-4 flex flex-col gap-2 items-center overflow-hidden">
                                <span className="text-white font-light">Previous winner list :</span>
                                <div className="relative w-full overflow-hidden">
                                    {historyLoading ? (
                                        <div className="w-full text-center py-2">
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        </div>
                                    ) : getRecentResults(historyGames).length === 0 ? (
                                        <div className="text-white/70 text-sm">No previous games</div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            <div className="w-full text-center text-white/70 text-sm mb-2">Latest 10 Winners</div>
                                            {getRecentResults(historyGames).map((result, i) => (
                                                <span
                                                    key={i}
                                                    className={`min-w-[32px] min-h-[32px] flex items-center justify-center rounded-full font-bold text-lg ${
                                                        result === "H"
                                                            ? "bg-[#F049FF] text-[#7B1177]"
                                                            : "bg-[#17FF83] text-[#056048]"
                                                    }`}
                                                >
                                                    {result}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Timer, Animation, or Result */}
                        <div className="flex flex-col items-center justify-center flex-grow min-h-[340px] relative">
                            {gameState === 'timer' && (
                                <>
                                    <span className="text-white font-light text-lg">Game will start in</span>
                                    <span className="text-white font-[mediumFont] text-4xl md:text-5xl tracking-wider">{timeLeft}</span>
                                    <span className="text-white text-center font-light mt-2">place your bid after the time end<br />you will not able to place bid</span>
                                    {/* Button to leave the current game room */}
                                 
                                </>
                            )}
                            {gameState === 'flipping' && (
                                <div className="flex flex-col items-center justify-center w-full">
                                    <div className="relative flex justify-center items-center">
                                        <div className="absolute w-[320px] h-[320px] bg-[#ffffff10] rounded-full animate-pulse"></div>
                                        <img
                                            src={`/static/img/${flippingAnimation}.gif`}
                                            className="w-[300px] h-auto z-10 animate-spin-slow"
                                            alt="coin flipping"
                                        />
                                    </div>
                                    <p className="text-[1.2rem] font-extralight text-white mt-4 animate-pulse">
                                        Coin is Flipping...
                                    </p>
                                </div>
                            )}
                            {gameState === 'result' && (
                                <div className="flex flex-col items-center justify-center w-full relative">
                                    <div className="absolute inset-0 z-10 pointer-events-none">
                                        <img
                                            src="/static/img/celebrate.gif"
                                            className="w-full h-full object-cover opacity-70"
                                            alt="celebration"
                                        />
                                    </div>
                                    <div className="relative flex items-center justify-center w-[300px] h-[300px] z-20">
                                        <div className="absolute w-[320px] h-[320px] bg-[#ffffff10] rounded-full animate-pulse"></div>
                                        {finalResult ? (
                                            <img
                                                src={`/static/img/${finalResult}.png`}
                                                className="w-[300px] h-auto z-20 absolute"
                                                alt={finalResult ? `${finalResult} side of coin` : " "}
                                            />
                                        ) : (
                                            <div className="w-[300px] h-[300px] flex items-center justify-center text-white text-2xl">No Bet Placed</div>
                                        )}
                                    </div>
                                    <div className="w-full flex flex-col items-center gap-[15px] justify-center mt-8 z-20">
                                        <h2 className="text-[2.5rem] font-[mediumFont] text-white animate-bounce capitalize">
                                            {resultText}
                                        </h2>
                                        {/* <button
                                            onClick={() => window.location.reload()}
                                            className="gold-button h-[45px] w-[200px] text-[1rem] font-[regularFont] mt-4"
                                        >
                                            Play Again
                                        </button> */}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Options and Amount Form */}
                        <form onSubmit={handleSubmit} className="rounded-xl bg-white/30 p-6 flex flex-col gap-4 items-center">
                            <div className="flex w-full gap-4 mb-2">
                                <button 
                                    type="button" 
                                    onClick={() => handleSelect("Heads")} 
                                    disabled={isBettingDisabled}
                                    className={`flex-1 py-3 rounded-full font-[mediumFont] text-lg transition ${
                                        selected === "Heads" 
                                            ? "bg-gradient-to-r from-yellow-400 to-yellow-300 text-white shadow" 
                                            : "bg-white text-[#404040]"
                                    } ${isBettingDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Heads
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleSelect("Tails")} 
                                    disabled={isBettingDisabled}
                                    className={`flex-1 py-3 rounded-full font-[mediumFont] text-lg transition ${
                                        selected === "Tails" 
                                            ? "bg-gradient-to-r from-[#a78a40] to-[#F049FF] text-white shadow" 
                                            : "bg-white text-[#404040]"
                                    } ${isBettingDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Tails
                                </button>
                            </div>
                            <div className="flex w-full gap-3 mb-2">
                                {[100, 200, 500, 1000].map(val => (
                                    <button 
                                        type="button" 
                                        key={val} 
                                        onClick={() => setAmount(val.toString())} 
                                        disabled={isBettingDisabled}
                                        className={`flex-1 py-2 rounded-full bg-[#ffffff20] border border-[#ffffff50] text-white font-[regularFont] text-base hover:bg-yellow-100/20 transition ${
                                            isBettingDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {val} Rs
                                    </button>
                                ))}
                            </div>
                            <div className="flex w-full gap-3">
                                <input 
                                    type="number" 
                                    placeholder="Enter your amount" 
                                    className="flex-1 px-5 py-2 rounded-full border border-[#ffffff50] bg-[#ffffff20] text-white placeholder:text-white font-[regularFont] outline-none" 
                                    value={amount} 
                                    onChange={e => setAmount(e.target.value)}
                                    disabled={isBettingDisabled}
                                />
                                <button 
                                    type="submit" 
                                    disabled={isBettingDisabled}
                                    className={`px-6 py-2 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white font-[mediumFont] shadow hover:from-green-500 hover:to-green-600 transition ${
                                        isBettingDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    Add Bet
                                </button>
                            </div>
                        </form>
                    </div>
                    {/* Right Panel */}
                    <div className="w-[25%] flex-shrink-0 rounded-2xl bg-white/20 backdrop-blur-lg p-7 md:p-8 flex flex-col gap-7 shadow-xl border border-white/30 h-full justify-between">
                        <div>
                            <div className="rounded-xl bg-white/80 p-5 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[#202020] font-light">Total Bid</span>
                                    <span className="text-[#202020] font-[regularFont] text-lg">{totalAmount}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="flex items-center gap-2 text-[#202020] font-light"><span className="w-4 h-4 bg-[#f04aff] rounded-full inline-block"></span>Heads</span>
                                    <span className="text-[#202020] font-[regularFont]">{entries.filter(e => e.option === "Heads").reduce((sum, e) => sum + e.amount, 0)}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="flex items-center gap-2 text-[#202020] font-light"><span className="w-4 h-4 bg-[#17FF83] rounded-full inline-block"></span>Tails</span>
                                    <span className="text-[#202020] font-[regularFont]">{entries.filter(e => e.option === "Tails").reduce((sum, e) => sum + e.amount, 0)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-end">
                            <h3 className="text-white font-[regularFont] text-lg mb-4">Entries</h3>
                            <div className="flex flex-col gap-3">
                                {entries.length === 0 ? (
                                    <div className="w-full text-center py-4 text-white bg-[#ffffff20] rounded-lg backdrop-blur-sm">
                                        <p className="text-lg font-light">No entries yet</p>
                                    </div>
                                ) : (
                                    entries.map((entry, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-2 bg-[#ffffff50] rounded-xl">
                                            <span className="flex-1 h-10 flex items-center justify-center text-[#5d5d5d] bg-[#ffffff20] border border-[#ffffff50] rounded-full font-[regularFont]">{entry.id}</span>
                                            <span className={`flex-1 h-10 flex items-center justify-center px-5 rounded-full font-[mediumFont] text-base ${entry.option === "Heads" ? "bg-[#F049FF] text-[#7B1177]" : "bg-[#17FF83] text-[#056048]"}`}>{entry.option}</span>
                                            <span className="flex-1 h-10 flex items-center justify-center text-white bg-[#ffffff20] border border-[#ffffff50] rounded-full font-[regularFont] green-button2">{entry.amount}₹</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mobile View */}
                <div className="md:hidden w-full relative h-[100vh] z-40">
                    <header className="h-[10vh] border-b border-[#747474] flex items-center justify-between p-[20px]">
                        <h1 className="text-[20px]  text-white"> <span className="font-[lightFont]">Coin</span><span className="font-[mediumFont]">Craze</span></h1>
                        <div className="h-[40px] w-[40px] aspect-square flex items-center justify-center">

                        </div>
                    </header>

                    <div className="h-[90vh] flex flex-col gap-[20px] w-full px-[10px] py-[10px]" >
                        <div className="w-full flex items-center justify-end">
                            <div className="px-[10px] h-[40px] text-[14px] font-[regularFont] flex items-center justify-center gold-button">{userPoints.toLocaleString()} CrazeCoins</div>
                        </div>
                        <div className="w-full flex gap-[30px] overflow-x-scroll no-scroll items-center justify-between overflow-hidden p-[15px] bg-[#ffffff50] backdrop-blur-lg border border-[#767676] rounded-[10px] ">
                            <div className="w-fit ">
                                <h3 className="text-[14px] text-white text-nowrap font-[regularFont] tracking-wider">Total Bid</h3>
                                <h1 className="text-[20px] text-nowrap font-[regularFont] text-white">₹{totalAmount}</h1>
                            </div>
                            <div className="min-w-[1px] h-[50px] bg-gradient-to-t from-transparent via-white to-transparent "></div>
                            <div className="w-fit ">
                                <div className="flex items-center gap-[10px]">
                                    <div className="w-[10px] h-[10px] aspect-square bg-[#F049FF] rounded-full"></div>
                                    <h3 className="text-[14px] text-white text-nowrap font-[regularFont] tracking-wider">Heads</h3>
                                </div>
                                <h1 className="text-[20px] text-nowrap font-[regularFont] text-white">₹{entries.filter(e => e.option === "Heads").reduce((sum, e) => sum + e.amount, 0)}</h1>
                            </div>
                            <div className="min-w-[1px] h-[50px] bg-gradient-to-t from-transparent via-white to-transparent "></div>
                            <div className="w-fit ">
                                <div className="flex items-center gap-[10px]">
                                    <div className="w-[10px] h-[10px] aspect-square bg-[#17FF83] rounded-full"></div>
                                    <h3 className="text-[14px] text-white text-nowrap font-[regularFont] tracking-wider">Tails</h3>
                                </div>
                                <h1 className="text-[20px] text-nowrap font-[regularFont] text-white">₹{entries.filter(e => e.option === "Tails").reduce((sum, e) => sum + e.amount, 0)}</h1>
                            </div>


                        </div>
                        <div className="w-full flex items-center gap-[20px]">
                            <button 
                                onClick={() => setShowHistoryModal(true)}
                                className="px-[20px] h-[40px] w-full flex items-center justify-center font-[regularFont] text-[14px] bg-[#ffffff50] text-white tracking-wider backdrop-blur-md rounded-[8px] overflow-hidden border border-[#767676] cursor-pointer"
                            >
                                History
                            </button>
                            <button 
                                onClick={() => {
                                    const overlay = document.getElementById('overlay');
                                    const sidebar = document.getElementById('mobile-sidebar');
                                    if (overlay) {
                                        overlay.classList.remove('hidden');
                                    }
                                    if (sidebar) {
                                        sidebar.classList.remove('hidden');
                                    }
                                }}
                                className="green-button3  px-[20px] w-full h-[40px] flex items-center justify-center font-[regularFont] text-[14px] rounded-[8px] cursor-pointer"
                            >
                                Add Bet
                            </button>
                        </div>
                        <div className="w-full h-full rounded-[10px] bg-[#ffffff50] backdrop-blur-lg border border-[#767676] p-[20px] flex flex-col items-center justify-center">
                            {gameState === 'timer' && (
                                <>
                                    <span className="text-white font-light text-lg text-center">Game will start in</span>
                                    <span className="text-white font-[mediumFont] text-3xl md:text-4xl tracking-wider text-center">{timeLeft}</span>
                                    <span className="text-white text-center font-light mt-2 text-sm">place your bid after the time end<br />you will not able to place bid</span>
                                </>
                            )}
                            {gameState === 'flipping' && (
                                <div className="flex flex-col items-center justify-center w-full">
                                    <div className="relative flex justify-center items-center">
                                        <div className="absolute w-[200px] h-[200px] bg-[#ffffff10] rounded-full animate-pulse"></div>
                                        <img
                                            src={`/static/img/${flippingAnimation}.gif`}
                                            className="w-[180px] h-auto z-10 animate-spin-slow"
                                            alt="coin flipping"
                                        />
                                    </div>
                                    <p className="text-[1rem] font-extralight text-white mt-4 animate-pulse text-center">
                                        Coin is Flipping...
                                    </p>
                                </div>
                            )}
                            {gameState === 'result' && (
                                <div className="flex flex-col items-center justify-center w-full relative">
                                    <div className="absolute inset-0 z-10 pointer-events-none">
                                        <img
                                            src="/static/img/celebrate.gif"
                                            className="w-full h-full object-cover opacity-70"
                                            alt="celebration"
                                        />
                                    </div>
                                    <div className="relative flex items-center justify-center w-[200px] h-[200px] z-20">
                                        <div className="absolute w-[220px] h-[220px] bg-[#ffffff10] rounded-full animate-pulse"></div>
                                        {finalResult ? (
                                            <img
                                                src={`/static/img/${finalResult}.png`}
                                                className="w-[200px] h-auto z-20 absolute"
                                                alt={finalResult ? `${finalResult} side of coin` : " "}
                                            />
                                        ) : (
                                            <div className="w-[200px] h-[200px] flex items-center justify-center text-white text-xl">No Bet Placed</div>
                                        )}
                                    </div>
                                    <div className="w-full flex flex-col items-center gap-[15px] justify-center mt-6 z-20">
                                        <h2 className="text-[1.5rem] font-[mediumFont] text-white animate-bounce capitalize text-center">
                                            {resultText}
                                        </h2>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                </div>

                {/* Mobile View Sidebar */}
                <div 
                    id="overlay" 
                    className="w-full h-screen fixed top-0 bottom-0 left-0 right-0 bg-[#00000050] backdrop-blur-lg z-40 hidden cursor-pointer"
                    onClick={() => {
                        const overlay = document.getElementById('overlay');
                        const sidebar = document.getElementById('mobile-sidebar');
                        if (overlay) {
                            overlay.classList.add('hidden');
                        }
                        if (sidebar) {
                            sidebar.classList.add('hidden');
                        }
                    }}
                ></div>
            
                <div id="mobile-sidebar" className="hidden md:hidden w-full h-[90vh] bg-white fixed left-0 bottom-0 right-0 z-50 border-t-[2px] border-amber-300 rounded-t-[50px] overflow-y-scroll no-scroll">
                    <div className="w-full flex items-center gap-[10px] justify-center mt-[20px]">
                        {/* <p className="px-[20px] py-[6px] rounded-full bg-[#3E3E3E] text-[13px] text-white text-center w-fit">{entries.length} Members are playing now</p> */}
                        <button 
                            onClick={() => {
                                const overlay = document.getElementById('overlay');
                                const sidebar = document.getElementById('mobile-sidebar');
                                if (overlay) {
                                    overlay.classList.add('hidden');
                                }
                                if (sidebar) {
                                    sidebar.classList.add('hidden');
                                }
                            }}
                            className=" rounded-full bg-[#3E3E3E] text-[37px] text-white text-center w-fit cursor-pointer"
                        >
                      <IoCloseCircleOutline />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-[20px] flex flex-col gap-[20px]">
                        <div>
                            <label htmlFor="" className="font-[regularFont]"> Option</label>
                            <div className="w-full flex items-center gap-[20px]">
                                <button 
                                    type="button"
                                    onClick={() => handleSelect("Heads")} 
                                    disabled={isBettingDisabled}
                                    className={`w-full px-[20px] py-[10px] font-[regularFont] rounded-full overflow-hidden transition ${
                                        selected === "Heads" 
                                            ? "gold-button2" 
                                            : "bg-slate-100 border-[2px] border-slate-300"
                                    } ${isBettingDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Heads
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => handleSelect("Tails")} 
                                    disabled={isBettingDisabled}
                                    className={`w-full px-[20px] py-[10px] font-[regularFont] rounded-full overflow-hidden transition ${
                                        selected === "Tails" 
                                            ? "gold-button2" 
                                            : "bg-slate-100 border-[2px] border-slate-300"
                                    } ${isBettingDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Tails
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[10px]">
                            <label htmlFor="" className="font-[regularFont]">Amount</label>
                            <div className="w-full flex flex-wrap gap-x-[10px] gap-y-[5px]">
                                {[100, 200, 500, 1000].map(val => (
                                    <button 
                                        type="button" 
                                        key={val} 
                                        onClick={() => setAmount(val.toString())} 
                                        disabled={isBettingDisabled}
                                        className={`px-[20px] font-[regularFont] border border-slate-300 rounded-full py-[10px] transition ${
                                            isBettingDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                            <input 
                                type="number" 
                                className="px-[20px] w-full font-[regularFont] rounded-full py-[10px] border border-slate-300" 
                                placeholder="Enter your amount" 
                                value={amount} 
                                onChange={e => setAmount(e.target.value)}
                                disabled={isBettingDisabled}
                            />
                            <button 
                                type="submit"
                                disabled={isBettingDisabled}
                                className={`px-[20px] py-[10px] green-button4 font-[regularFont] rounded-full transition ${
                                    isBettingDisabled ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                Add Bet
                            </button>
                        </div>
                    </form>
                    <div className="p-[20px]">
                        <h3 className="font-[regularFont]">Entries</h3>
                        <div className="w-full flex flex-col gap-[10px]">
                            {entries.length === 0 ? (
                                <div className="p-[10px] bg-slate-100 rounded-[10px] text-center text-slate-500">
                                    No entries yet
                                </div>
                            ) : (
                                entries.map((entry, idx) => (
                                    <div key={idx} className="p-[10px] bg-slate-100 rounded-[10px]">
                                        <div className="flex items-center gap-[10px]">
                                            <div className="px-[10px] py-[6px] text-[12px] bg-slate-200 rounded-full font-[regularFont] w-full flex items-center justify-center">{entry.id}</div>
                                            <div className={`px-[10px] py-[6px] text-[12px] rounded-full font-[regularFont] w-full flex items-center justify-center ${
                                                entry.option === "Heads" ? "bg-[#F049FF] text-white" : "bg-[#17FF83] text-[#056048]"
                                            }`}>
                                                {entry.option}
                                            </div>
                                            <div className="px-[10px] py-[6px] text-[12px] bg-slate-200 rounded-full font-[regularFont] w-full flex items-center justify-center green-button4">{entry.amount}₹</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Game History</h2>
                                <button 
                                    onClick={() => setShowHistoryModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                            
                            {historyLoading ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Loading...</p>
                                </div>
                            ) : historyGames.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">No history yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {historyGames.map((game) => {
                                        const userEntries = game.entries.filter(e => e.centerId === user?._id);
                                        const totalAmount = userEntries.reduce((sum, e) => sum + parseInt(e.amount), 0);
                                        return (
                                            <div key={game._id} className="bg-gray-50 rounded-xl p-4">
                                                <div className={`rounded-full px-4 py-2 text-white text-sm font-medium w-full text-center mb-3 ${
                                                    game.result === "heads" ? "bg-[#F049FF]" : "bg-[#17FF83]"
                                                } text-[#202020]`}>
                                                    Winner ({game.result ? game.result.charAt(0).toUpperCase() + game.result.slice(1) : "?"}) - ₹{totalAmount}
                                                </div>
                                                <div className="flex gap-2 w-full">
                                                    <div className="bg-gray-200 border border-gray-300 rounded-full px-4 py-2 text-gray-700 text-xs w-1/2 text-center">
                                                        {userEntries.length} {userEntries.length === 1 ? "Entry" : "Entries"}
                                                    </div>
                                                    <a 
                                                        href="/history" 
                                                        className="bg-blue-500 text-white rounded-full px-4 py-2 text-xs w-1/2 text-center hover:bg-blue-600 transition"
                                                    >
                                                        View Details
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            
                            <div className="mt-6 text-center">
                                <a 
                                    href="/history" 
                                    className="bg-[#a78a40] text-white px-6 py-3 rounded-full font-medium hover:bg-[#8b7a35] transition"
                                >
                                    View All History
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}

