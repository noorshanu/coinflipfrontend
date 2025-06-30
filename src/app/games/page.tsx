"use client"
import "../globals.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Define the Game type based on your model
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

export default function GamesPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<number>(0);

  useEffect(() => {

    fetchPoints(user?._id || "");

  }, [user]);

  const fetchPoints = async (centerId: string) => {
    if (!centerId) return;

    try {
      const response = await fetch(`http://localhost:4000/api/get-points/${centerId}`);

      console.log(response);
      if (!response.ok) {
        throw new Error('Failed to fetch points');
      }

      const result = await response.json();

      if (result.success) {
        setUserPoints(result.data);
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  // Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/get-all-games');
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const result = await response.json();

        const gamesData = Array.isArray(result) ? result : result.data;

        if (!Array.isArray(gamesData)) {
          throw new Error('Invalid data format received from API');
        }

        const futureGames = gamesData
          .filter((game: Game) => new Date(game.startTime) > new Date())
          .sort((a: Game, b: Game) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );

        setGames(futureGames);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch games');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timerInterval = setInterval(() => {
      const now = new Date();

      const newTimeLeft = games.reduce((acc, game) => {
        const startTime = new Date(game.startTime);
        const diff = startTime.getTime() - now.getTime();

        if (diff <= 0) {
          acc[game._id] = "Starting now";
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          acc[game._id] = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} Min`;
        }

        return acc;
      }, {} as { [key: string]: string });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [games]);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div>
        <section className="">
          <div className="w-full fixed top-0 bottom-0 left-0 right-0 z-0 h-screen bg-gradient-to-r from-[#040404] to-transparent "></div>
          <img src="/static/img/coinflipbg.png" className="w-full h-full fixed top-0 left-0 right-0 bottom-0 object-cover -z-10" alt="" />
        </section>

        <main className="w-full flex items-start h-full relative z-10">
          {/* Main Sidebar */}
          <section className="hidden xl:block w-[15%] pl-[50px]">

            <h1 className="text-[2rem] text-white pt-[20px] font-[lightFont]">Coin<span className="font-[mediumFont]">Craze</span></h1>

            <div className="w-full h-screen absolute top-0 flex flex-col items-center justify-center gap-[30px] sidebarIcon">
              <a href="/games" className="flex items-center w-full gap-[20px] text-white">
                <i className="fi fi-rr-house-blank relative top-[2px] text-[1.1rem]"></i>
                <p className="font-light text-[1.1rem] text-white"> Home</p>
              </a>

              <a href="#" className="flex items-center w-full gap-[20px] text-white" >
                <i className="fi fi-rr-wallet relative top-[2px] text-[1.2rem]"></i>
                <p className="font-light text-[1.1rem] text-white"> Wallet</p>
              </a>
              <a href="#" className="flex items-center w-full gap-[20px] text-white"  >
                <i className="fi fi-rr-time-past relative top-[2px] text-[1.2rem]"></i>
                <p className="font-light text-[1.1rem] text-white"> History</p>
              </a>
              {/* <a href="#" className="flex items-center w-full gap-[20px] text-white" >
              <i className="fi fi-rr-settings relative top-[2px] text-[1.2rem]"></i>
              <p className="font-light text-[1.1rem] text-white"> Settings</p>
            </a> */}
            </div>
          </section>
          <div className="hidden w-fit h-screen xl:flex items-center justify-center mx-[80px]">
            <div className="w-[1.5px] h-[500px] bg-gradient-to-t from-transparent via-[#ffffff50] to-transparent"></div>
          </div>
          <section className="w-full xl:w-[85%] xl:pr-[50px]">
            <div className="py-[20px] flex items-center gap-[20px] justify-between px-[20px]">
              <h1 className="xl:hidden text-[1.5rem] text-white  font-[lightFont]">Coin<span className="font-[mediumFont]">Craze</span></h1>
              {/* Menu Btn */}
              <div
                id="menu"
                className="h-[40px] cursor-pointer w-[40px] bg-[#ffffff69] backdrop-blur-lg flex items-center justify-center rounded-full md:hidden"
                onClick={() => setIsOpen(true)} // Open sidebar
              >
                <i className="fi fi-rr-menu-burger text-white relative top-[2px]"></i>
              </div>
              <div className="hidden w-full md:flex items-center gap-[20px] justify-end">
               
                <button className="gold-button text-[14px] h-[40px] font-[regularFont]">
                  <span className="w-[10px] h-[10px] bg-white rounded-full"></span>
                  {userPoints.toLocaleString()} Points
                </button>
                <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
                  <img src="/static/img/coinflipbg.png" className="w-full h-full object-cover" alt="" />
                </div>
                <div
                  id="menu"
                  className="h-[40px] cursor-pointer w-[40px] bg-[#ffffff69] backdrop-blur-lg flex items-center justify-center rounded-full xl:hidden"
                  onClick={() => setIsOpen(true)} // Open sidebar
                >
                  <i className="fi fi-rr-menu-burger text-white relative top-[2px]"></i>
                </div>
              </div>
            </div>
            <div className="w-full h-[1px] bg-[#6f6f6f] xl:hidden"></div>
            <div className="md:hidden w-full flex items-center justify-end gap-[20px] p-[20px]">
              <button className="gold-button text-[14px] h-[40px] font-[regularFont]">
                <span className="w-[10px] h-[10px] bg-white rounded-full"></span>
                {userPoints.toLocaleString()} Points
              </button>
              <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
                <img src="/static/img/coinflipbg.png" className="w-full h-full object-cover" alt="" />
              </div>
            </div>
            <div className="w-full flex flex-col gap-[20px] py-[20px] px-[20px]">
              <h1 className="text-[1.7rem] md:text-[2rem] font-[regularFont] text-white">Center Play Group Game</h1>

              {loading ? (
                <div className="text-white text-center py-10 font-[regularFont]">Loading games...</div>
              ) : error ? (
                <div className="text-red-500 text-center py-10 font-[regularFont]">{error}</div>
              ) : games.length === 0 ? (
                <div className="text-white text-center py-10 font-[regularFont]">No upcoming games found</div>
              ) : (
                <div className="w-full grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-[20px] grid-cols-1">
                  {games.map((game) => (
                    <div
                      key={game._id}
                      className="p-[20px] bg-[#ffffff70] backdrop-blur-lg rounded-[20px] border border-[#ffffff5d] flex flex-col gap-[15px]"
                    >
                      <div className="aspect-video bg-white flex items-center justify-center rounded-[10px]">
                        <h1 className="text-[1rem] text-center font-[regularFont]">
                          Game Start In <br />
                          <span className="text-[2rem] text-[#007bff]">
                            {timeLeft[game._id] || "Calculating..."}
                          </span>
                        </h1>
                      </div>
                      <button
                        onClick={() => router.push(`/games/${game._id}`)}
                        className={`w-full h-[40px] ${timeLeft[game._id] === "Starting now" ? 'gold-button' : 'green-button'} font-[regularFont] text-[15px]`}
                      >
                        {timeLeft[game._id] === "Starting now" ? 'Join Now' : 'Play Now'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <section
            className={`h-[100vh] fixed top-0 left-0 p-[20px] w-[100%] z-50 bg-gradient-to-r from-[#101010] to-[#101010cd] transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-[-100%]"
              }`}
          >
            <div className="w-full flex items-center relative justify-between z-40">
              <h1 className="text-[1.7rem] text-white font-[lightFont]">
                Coin<span className="font-[mediumFont]">Craze</span>
              </h1>
              {/* Close Button */}
              <div
                className="w-[40px] h-[40px] flex items-center bg-[#ffffff98] justify-center backdrop-blur-lg rounded-full cursor-pointer"
                onClick={() => setIsOpen(false)} // Close sidebar
              >
                <i className="fi fi-rr-cross text-white relative top-[2px]"></i>
              </div>
            </div>

            {/* Sidebar Links */}
            <div className="w-full h-screen absolute top-0 flex flex-col items-center justify-center gap-[30px] sidebarIcon">
              <a href="/games" className="flex items-center w-full gap-[20px] text-white">
                <i className="fi fi-rr-house-blank relative top-[2px] text-[1.1rem]"></i>
                <p className="font-light text-[1.1rem] text-white">Home</p>
              </a>
              <a href="#" className="flex items-center w-full gap-[20px] text-white">
                <i className="fi fi-rr-wallet relative top-[2px] text-[1.2rem]"></i>
                <p className="font-light text-[1.1rem] text-white">Wallet</p>
              </a>
              <a href="#" className="flex items-center w-full gap-[20px] text-white">
                <i className="fi fi-rr-time-past relative top-[2px] text-[1.2rem]"></i>
                <p className="font-light text-[1.1rem] text-white">History</p>
              </a>
            </div>
          </section>
        </main>

      </div>
    </ProtectedRoute>
  );
}
