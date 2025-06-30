"use client"
import "../globals.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { formatDistanceToNow } from "date-fns";

// Define the Game type based on your Mongoose model
type GameMember = {
  name: string;
  center: string;
  amount: string;
  bet: string;
  result: string;
  _id: string;
};

type Game = {
  _id: string;
  totalPool: string;
  result: string;
  centers: string[];
  members: GameMember[];
  createdAt: string;
  updatedAt: string;
};

export default function CenterHome() {
    const router = useRouter();
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGames() {
            try {
                setIsLoading(true);
                const response = await fetch('https://api.trontools.ai/api/get-all-games');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch games');
                }
                
                const data = await response.json();
                
                if (data.success && data.data) {
                    // Sort games by createdAt date in descending order (newest first)
                    const sortedGames = data.data.sort((a: Game, b: Game) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    setGames(sortedGames);
                } else {
                    throw new Error(data.message || 'Failed to load games');
                }
                
            } catch (err) {
                console.error('Error fetching games:', err);
                setError(err instanceof Error ? err.message : 'An error occurred while fetching games');
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchGames();
    }, []);

    // Function to format date
    const formatGameDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            const hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            
            return `${day} ${month} ${year} • ${displayHours}:${minutes} ${ampm}`;
        } catch (error) {
            return 'Invalid date';
        }
    };

    // Calculate totals for each bet type
    const calculateBetTotals = (game: Game) => {
        const headsBets = game.members.filter(member => member.bet === "Heads");
        const tailsBets = game.members.filter(member => member.bet === "Tails");
        
        const headsBetTotal = headsBets.reduce((total, member) => total + parseInt(member.amount), 0);
        const tailsBetTotal = tailsBets.reduce((total, member) => total + parseInt(member.amount), 0);
        
        return { headsBetTotal, tailsBetTotal };
    };

    // Function to handle Play Group Game button
    const handlePlayGame = () => {
        router.push('/centerform');
    };

    // Function to handle View game details
    const handleViewGame = (gameId: string) => {
        router.push(`/centerhome2?gameId=${gameId}`);
    };

    return (
        <div>
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
                            <img src="/static/img/coinflipbg.png" className="w-full h-full object-cover" alt="" />
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-[50px]">
                        <div className="w-full">
                            <h1 className="text-[2rem] font-[regularFont] text-white">Center Play Group Game</h1>

                            <div className="h-[100px] w-full flex items-center justify-between mt-[20px] rounded-[20px] bg-[#ffffff20]  bg-opacity-20 backdrop-blur-lg overflow-hidden">
                                <div className="w-[50%] h-[100px] relative flex items-center  bg-white" style={{ clipPath: 'polygon(0 0, 100% 0%, 76% 100%, 0 100%, 0% 50%)' }}>
                                    <img src="/static/img/celebrate.gif" className="w-[200px] h-auto  absolute top-[-100px] left-[-50px] " alt="" />
                                    <div>
                                        <h1 className="text-[1.2rem] font-[regularFont] leading-[2.3rem] pl-[100px]">Play Group Game and <br /> <span className="text-[2.5rem] font-[mediumFont]">Winnn a lot!!</span></h1>
                                    </div>
                                    <img src="/static/img/celebrate.gif" className="w-[250px] h-auto  absolute top-[-100px] right-[-50px] " alt="" />
                                </div>
                                <div className="w-[50%] flex items-center justify-end pr-[100px]">
                                    <button 
                                        className="h-[40px] font-[regularFont] green-button"
                                        onClick={handlePlayGame}
                                    >
                                        Play Group game
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="w-full">
                            <h1 className="text-[2rem] font-[regularFont] text-white">History</h1>
                            
                            {isLoading && (
                                <div className="py-[50px] w-full flex items-center justify-center mt-[20px] rounded-[20px] bg-[#ffffff20] bg-opacity-20 backdrop-blur-lg">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-white text-lg">Loading games...</p>
                                    </div>
                                </div>
                            )}
                            
                            {error && !isLoading && (
                                <div className="py-[30px] w-full flex items-center justify-center mt-[20px] rounded-[20px] bg-[#ffffff20] bg-opacity-20 backdrop-blur-lg">
                                    <div className="flex flex-col items-center">
                                        <p className="text-red-500 text-lg mb-2">{error}</p>
                                        <button 
                                            onClick={() => window.location.reload()}
                                            className="gold-button h-[40px] px-6 font-[regularFont]"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {!isLoading && !error && games.length === 0 && (
                                <div className="py-[30px] w-full flex items-center justify-center mt-[20px] rounded-[20px] bg-[#ffffff20] bg-opacity-20 backdrop-blur-lg">
                                    <div className="flex flex-col items-center">
                                        <p className="text-white text-lg mb-2">No games found</p>
                                        <button 
                                            onClick={handlePlayGame}
                                            className="green-button h-[40px] px-6 font-[regularFont]"
                                        >
                                            Create Your First Game
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Game History Items */}
                            {!isLoading && !error && games.map((game) => {
                                const { headsBetTotal, tailsBetTotal } = calculateBetTotals(game);
                                const isCompleted = !!game.result;
                                
                                return (
                                    <div 
                                        key={game._id}
                                        className="py-[15px] px-[30px] w-full flex items-center justify-between mt-[20px] rounded-[20px] bg-[#ffffff20] bg-opacity-20 backdrop-blur-lg overflow-hidden"
                                    >
                                        <div className="text-white">
                                            <h1 className="text-[1.5rem] font-[regularFont]">
                                                Game #{game._id.slice(-6)}
                                                {game.members.length > 0 && (
                                                    <span className="text-[0.9rem] ml-2 bg-[#ffffff20] px-2 py-1 rounded-full">
                                                        {game.members.length} {game.members.length === 1 ? 'Player' : 'Players'}
                                                    </span>
                                                )}
                                            </h1>
                                            <p className="text-[15px] font-extralight">
                                                {formatGameDate(game.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between gap-[20px]">
                                            <div className="h-[40px] border-[1px] border-[#fff] font-[regularFont] text-white rounded-full flex items-center justify-center text-[15px] px-[20px]">
                                                Heads - ₹{headsBetTotal}
                                            </div>
                                            <div className="h-[40px] border-[1px] border-[#fff] font-[regularFont] text-white rounded-full flex items-center justify-center text-[15px] px-[20px]">
                                                Tails - ₹{tailsBetTotal}
                                            </div>
                                            
                                            {isCompleted ? (
                                                <div className="h-[40px] font-[regularFont] gold-button flex items-center justify-center px-4">
                                                    Win {game.result} - ₹{game.totalPool}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleViewGame(game._id)}
                                                    className="h-[40px] font-[regularFont] green-button flex items-center justify-center px-4"
                                                >
                                                    View Game
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
