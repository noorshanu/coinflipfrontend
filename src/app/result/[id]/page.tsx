"use client"
import "../../globals.css";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

type Game = {
  _id: string;
  totalPool: string;
  result: string;
  centers: string[];
  entries: {
    id: string;
    centerId: string;
    amount: string;
    bet: string;
    result: string;
  }[];
  members: string[];
  startTime: string;
};

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as string;
  
  const [gameData, setGameData] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState("flipping"); // "flipping" or "result"
  const [flippingAnimation, setFlippingAnimation] = useState("heads"); // For the flipping animation

  // Fetch game data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(`https://api.trontools.ai/api/get-game/${gameId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game');
        }
        const result = await response.json();
        
        if (result.success && result.data) {
          setGameData(result.data);
          // Start the flipping animation immediately after data is loaded
          startFlippingAnimation(result.data.result?.toLowerCase() || "heads");
        } else {
          throw new Error(result.message || 'Invalid game data');
        }
      } catch (err) {
        console.error('Error fetching game:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch game');
      } finally {
        setIsLoading(false);
      }
    };

    if (gameId) {
      fetchGameData();
    }
  }, [gameId]);

  // Function to handle the flipping animation
  const startFlippingAnimation = (finalResult: string) => {
    // Start rapid flipping animation
    const animationInterval = setInterval(() => {
      setFlippingAnimation(prev => prev === "heads" ? "tails" : "heads");
    }, 150); // Switch every 150ms for a fast flipping effect

    // After 10 seconds, show the final result
    setTimeout(() => {
      clearInterval(animationInterval);
      setFlippingAnimation(finalResult);
      setGameState("result");
    }, 10000); // 10 seconds
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
        <div className="bg-[#ffffff20] backdrop-blur-lg p-8 rounded-lg text-white">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mb-4"></div>
          <p className="text-xl">Loading game data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
        <div className="bg-[#ffffff20] backdrop-blur-lg p-8 rounded-lg text-white">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/games')}
            className="red-button h-[45px] w-[200px] text-[1rem] font-[regularFont]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section>
        <div className="w-full fixed top-0 bottom-0 left-0 right-0 z-0 h-screen bg-gradient-to-r from-[#040404] to-transparent"></div>
        <img src="/static/img/coinflipbg.png" className="w-full h-full fixed top-0 left-0 right-0 bottom-0 object-cover -z-10" alt="" />
      </section>

      <main className="w-full min-h-screen flex items-center justify-center relative z-10">
        <div className="min-h-[70vh] w-full max-w-[800px] mx-4 flex items-center flex-col gap-[10px] justify-center rounded-[20px] bg-[#ffffff20] backdrop-blur-lg relative overflow-hidden p-[30px]">
          {/* Game ID Display */}
          <h1 className="text-[2rem] font-[regularFont] text-white mb-8">
            Game #{gameData?._id.slice(-6)}
          </h1>

          {/* Celebration effect - only shown on result */}
          {gameState === "result" && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <img 
                src="/static/img/celebrate.gif" 
                className="w-full h-full object-cover opacity-70" 
                alt="celebration"
              />
            </div>
          )}

          {/* Flipping Animation or Result */}
          <div className="relative flex justify-center items-center">
            <div className="absolute w-[320px] h-[320px] bg-[#ffffff10] rounded-full animate-pulse"></div>
            <img 
              src={`/static/img/${gameState === "result" ? flippingAnimation + ".png" : flippingAnimation + ".gif"}`}
              className={`w-[300px] h-auto z-10 ${gameState === "flipping" ? "animate-spin-slow" : ""}`}
              alt="coin"
            />
          </div>

          {/* Result Text */}
          {gameState === "result" && (
            <div className="w-full flex flex-col items-center gap-[15px] justify-center mt-8">
              <h2 className="text-[2.5rem] font-[mediumFont] text-white animate-bounce capitalize">
                {flippingAnimation} Win!!!
              </h2>
             
              <button 
                onClick={() => router.push('/games')}
                className="gold-button h-[45px] w-[200px] text-[1rem] font-[regularFont] mt-4"
              >
               play again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
