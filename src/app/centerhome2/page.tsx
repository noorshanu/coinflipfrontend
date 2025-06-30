// @ts-nocheck
"use client"
import "../globals.css";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Define the type for bet entries
type BetEntry = {
  id: string;
  memberName: string;
  option: "Heads" | "Tails";
  amount: number;
  timestamp: Date;
};

// Add types for any
type GameData = {
  // Add your game data type properties here
  _id: string;
  startTime: string;
  // ... other properties
};

// Create a separate component for the game content
function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');
  const [gameState, setGameState] = useState("timer"); // "timer", "flipping", "result"
  const [timeLeft, setTimeLeft] = useState(5); // 5 seconds countdown
  const [coinSide, setCoinSide] = useState("heads"); // "heads" or "tails"
  const [flippingAnimation, setFlippingAnimation] = useState("heads"); // For the flipping animation
  const [showResults, setShowResults] = useState(false); // Control when to show results list
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const fetchGameData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:4000/api/get-game/${gameId}`);
      const data = await response.json();
      console.log("Game Data:", data);
      
      if (data.success && data.data) {
        setGameData(data.data);
        
        // Convert API members data to BetEntry format
        const convertedMembers: BetEntry[] = data.data.members.map((member: any, index: number) => ({
          id: member._id || `#${1001 + index}`,
          memberName: member.name,
          option: member.bet as "Heads" | "Tails",
          amount: parseInt(member.amount),
          timestamp: new Date()
        }));
        
        setMembers(convertedMembers);
      } else {
        setError(data.message || "Failed to fetch game data");
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
      setError("Error fetching game data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (gameId) {
      fetchGameData();
    }
  }, [gameId, fetchGameData]);

  // Simulated member data - in a real app this would come from a context or props
  const [members, setMembers] = useState<BetEntry[]>([
    { id: "#1001", memberName: "John Doe", option: "Heads", amount: 200, timestamp: new Date() },
    { id: "#1002", memberName: "Jane Smith", option: "Tails", amount: 150, timestamp: new Date() },
    { id: "#1003", memberName: "Mike Johnson", option: "Heads", amount: 300, timestamp: new Date() },
    { id: "#1004", memberName: "Sara Wilson", option: "Tails", amount: 180, timestamp: new Date() },
    { id: "#1005", memberName: "Robert Brown", option: "Heads", amount: 250, timestamp: new Date() },
  ]);
  
  // Flipping animation effect
  useEffect(() => {
    let animationInterval: NodeJS.Timeout;
    
    if (gameState === "flipping") {
      // Start rapid flipping animation
      animationInterval = setInterval(() => {
        setFlippingAnimation(prev => prev === "heads" ? "tails" : "heads");
      }, 150); // Switch every 150ms for a fast flipping effect
      
      // After 10 seconds, stop the animation and show result
      setTimeout(() => {
        clearInterval(animationInterval);
        
        // Randomly determine result (or use predetermined result in production)
        const side = Math.random() > 0.5 ? "heads" : "tails";
        setCoinSide(side);
        setFlippingAnimation(side); // Set the final animation frame to match result
        setGameState("result");
        
        // Show the winners/losers list after a small delay
        setTimeout(() => {
          setShowResults(true);
        }, 1500);
        
        // Here you could update the game result on the server
        if (gameData && gameId) {
          updateGameResult(side);
        }
      }, 10000); // 10 seconds
    }
    
    return () => {
      if (animationInterval) clearInterval(animationInterval);
    };
  }, [gameState, gameData, gameId]);

  // Update the timer effect to transition to flipping state
  useEffect(() => {
    if (gameState === "timer") {
      const timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerInterval);
            setGameState("flipping");
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [gameState]);

  // Add the updateGameResult function back
  const updateGameResult = async (result: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/update-game/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result }),
      });
      
      const data = await response.json();
      console.log("Game result updated:", data);
    } catch (error) {
      console.error("Error updating game result:", error);
    }
  };

  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} Sec`;
  };

  // Function to handle leaving the room
  const handleLeaveRoom = () => {
    router.push("/centerhomemain");
  };

  // Function to handle play again
  const handlePlayAgain = () => {
    setTimeLeft(5); // Reset to 5 seconds for testing
    setGameState("timer");
    setCoinSide("heads");
    setShowResults(false);
  };

  // Calculate results based on coin side
  const winners = members.filter(member => member.option.toLowerCase() === coinSide);
  const losers = members.filter(member => member.option.toLowerCase() !== coinSide);
  
  // Calculate the total pot from losers
  const losersTotalAmount = losers.reduce((total, member) => total + member.amount, 0);
  
  // Calculate center's cut (10% of losers' amount)
  const centerCut = Math.round(losersTotalAmount * 0.1);
  
  // Remaining amount for winners after center's cut
  const remainingPot = losersTotalAmount - centerCut;
  
  // Calculate total bet amount put in by winners
  const winnersTotalBet = winners.reduce((total, member) => total + member.amount, 0);
  
  // Calculate profit for each winner based on their participation percentage
  const winnersWithProfit = winners.map(winner => {
    // Calculate the proportion of this winner's bet to the total winning bets
    const participationRatio = winner.amount / (winnersTotalBet || 1); // Avoid division by zero
    
    // Calculate their share of the pot
    const profitShare = Math.round(participationRatio * remainingPot);
    
    // Return winner with their original bet + profit
    return {
      ...winner,
      profit: profitShare,
      totalReturn: winner.amount + profitShare
    };
  });
  
  // Calculate total bet amount by all members
  const totalBetAmount = members.reduce((total, member) => total + member.amount, 0);

  // Calculate the total winnings (including original bets)
  const totalWinAmount = winnersWithProfit.reduce((total, member) => total + member.totalReturn, 0);
  
  // Get the game's total pool from API data if available, otherwise calculate
  const totalPoolAmount = gameData ? parseInt(gameData.totalPool) : totalBetAmount;

  return (
    <div>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-[#ffffff20] backdrop-blur-lg p-8 rounded-lg text-white">
            <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mb-4"></div>
            <p className="text-xl">Loading game data...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-[#ffffff20] backdrop-blur-lg p-8 rounded-lg text-white">
            <p className="text-xl text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => router.push('/centerhomemain')}
              className="red-button h-[45px] w-[200px] text-[1rem] font-[regularFont]"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      <section className="">
        <div className="w-full fixed top-0 bottom-0 left-0 right-0 z-0 h-screen bg-gradient-to-r from-[#040404] to-transparent "></div>

        <img src="/static/img/coinflipbg.png" className="w-full h-full fixed top-0 left-0 right-0 bottom-0 object-cover -z-10" alt="" />
      </section>

      <main className="w-full flex items-start h-full relative z-10">
        <section className="w-[15%] pl-[50px]">

            <h1 className="text-[2rem] text-white pt-[20px] font-[lightFont]">Coin<span className="font-[mediumFont]">Craze</span></h1>

            <div className="w-full h-screen absolute top-0 flex flex-col items-center justify-center gap-[30px] sidebarIcon">
           
               <a href="#" className="flex items-center w-full gap-[20px] text-white">
               {/* <FontAwesomeIcon icon={faHouse} className="fi fi-rr-house-blank relative top-[2px] text-[15px] text-white" style={{ fontSize: "15px" }} /> */}
               <i className="fi fi-rr-house-blank relative top-[2px] text-[1.1rem]"></i>
                <p className="font-light text-[1.1rem] text-white"> Home</p>
               </a>
               <a href="#" className="flex items-center w-full gap-[20px] text-white" >
                <i className="fi fi-rr-console-controller relative top-[2px] text-[1.2rem]"></i>
                <p className="font-light text-[1.1rem] text-white"> Play Game</p>
               </a>
               <a href="#" className="flex items-center w-full gap-[20px] text-white" >
                <i className="fi fi-rr-wallet relative top-[2px] text-[1.2rem]"></i>
                <p className="font-light text-[1.1rem] text-white"> Wallet</p>
               </a>
               <a href="#" className="flex items-center w-full gap-[20px] text-white"  >
                <i className="fi fi-rr-time-past relative top-[2px] text-[1.2rem]"></i>
                <p className="font-light text-[1.1rem] text-white"> History</p>
               </a>
               <a href="#" className="flex items-center w-full gap-[20px] text-white" >
                <i className="fi fi-rr-settings relative top-[2px] text-[1.2rem]"></i>
                <p className="font-light text-[1.1rem] text-white"> Settings</p>
               </a>
            </div>
        </section>
        <div className="w-fit h-screen flex items-center justify-center mx-[80px]">
            <div className="w-[1.5px] h-[500px] bg-gradient-to-t from-transparent via-[#ffffff50] to-transparent"></div>
        </div>
        <section className="w-[85%] pr-[50px] h-screen overflow-y-scroll pb-[100px]">
            <div className="py-[20px] flex items-center gap-[20px] justify-end">
                <button className="gold-button text-[14px] h-[40px] font-[regularFont]">
                    <span className="w-[10px]  h-[10px] bg-white rounded-full"></span>
                    300 Craze Coins
                </button>
                <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
                    <img src="/static/img/coinflipbg.png" className="w-full h-full object-cover" alt=""/>
                </div>
            </div>

            <div>
                <h1 className="text-[2rem] font-[regularFont] text-white">
                  {gameData ? `Game #${gameData._id.slice(-6)}` : "Center Play Group Game"}
                </h1>

                <div className="min-h-[70vh] w-full flex items-center flex-col gap-[10px] justify-center mt-[40px] rounded-[20px] bg-[#ffffff20] bg-opacity-20 backdrop-blur-lg relative overflow-hidden p-[30px]">
                    
                    {/* Celebration confetti effect - only shown on win */}
                    {gameState === "result" && (
                        <div className="absolute inset-0 z-10 pointer-events-none">
                            <img 
                                src="/static/img/celebrate.gif" 
                                className="w-full h-full object-cover opacity-70" 
                                alt="celebration"
                            />
                        </div>
                    )}

                    {/* ----------- Timer  ---------- */}
                    <div className={`w-full flex items-center justify-center flex-col gap-[10px] ${gameState === "timer" ? "" : "hidden"}`}>
                        <div className="flex flex-col items-center justify-center text-white">
                            <h3 className="text-[1.2rem] font-extralight text-white">Game will Start in</h3>
                            <h1 className="text-[3.5rem] font-[mediumFont] text-white mt-2">{formatTime()}</h1> 
                        </div>
                        <p className="text-[1rem] font-extralight text-white text-center mt-4 px-4">place your bid after the time end<br />you will not able to place bid</p>
                        <button 
                            className="red-button h-[45px] w-[200px] text-[1rem] font-[regularFont] mt-[30px] text-white rounded-full"
                            onClick={handleLeaveRoom}
                        >
                            Leave the room
                        </button>
                    </div>
                    
                    {/* ---------- Flipping Animation --------- */}
                    <div className={`w-full flex items-center justify-center flex-col gap-[10px] ${gameState === "flipping" ? "" : "hidden"}`}>
                        <div className="relative flex justify-center items-center">
                            <div className="absolute w-[320px] h-[320px] bg-[#ffffff10] rounded-full animate-pulse"></div>
                            <img 
                                src={`/static/img/${flippingAnimation}.gif`} 
                                className={`w-[300px] h-auto z-10 ${gameState === "flipping" ? "animate-spin-slow" : ""}`}
                                alt="coin flipping"
                            />
                        </div>
                        <p className="text-[1.2rem] font-extralight text-white mt-4 animate-pulse">
                            {gameState === "flipping" ? "Coin is Flipping..." : ""}
                        </p>
                    </div>

                   {/* -------- Result ---------- */}
                    <div className={`w-full flex items-center justify-center flex-col gap-[10px] ${gameState === "result" ? "" : "hidden"} relative z-20`}>
                        <div className="relative flex items-center justify-center w-[300px] h-[300px]">
                            <div className={`absolute w-[320px] h-[320px] rounded-full ${coinSide === "heads" ? "bg-[#ffd70030]" : "bg-[#ff000020]"} animate-pulse`}></div>
                            <img 
                                src={`/static/img/${coinSide}.png`}
                                className="w-[300px] h-auto z-20 absolute" 
                                alt={`${coinSide} side of coin`}
                            />
                        </div>
                      
                        <div className="w-full flex flex-col items-center gap-[15px] justify-center">
                            <h2 className="text-[2.5rem] font-[mediumFont] text-white animate-bounce capitalize">
                                {coinSide} {coinSide === "heads" ? "Win!!!" : "Win!!!"}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
    </div>
  );
}

// Main component with Suspense boundary
export default function CenterHome() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
        <div className="bg-[#ffffff20] backdrop-blur-lg p-8 rounded-lg text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mb-4"></div>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
