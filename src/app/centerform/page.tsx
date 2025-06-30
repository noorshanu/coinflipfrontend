"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "../globals.css";

// Define a type for bet entries
type BetEntry = {
  id: string;
  option: "Heads" | "Tails";
  amount: number;
  timestamp: Date;
};

export default function CenterHome() {
  const router = useRouter();
  
  // State for form inputs and selection
  const [selected, setSelected] = useState<"Heads" | "Tails" | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [entries, setEntries] = useState<BetEntry[]>([]);
  const [gameTimer] = useState(300);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [lastAddedId, setLastAddedId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle selection of Heads or Tails
  const handleSelect = (option: "Heads" | "Tails") => {
    setSelected((prev) => (prev === option ? null : option));
  };

  // Handle form submission for adding a new bet
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
    
    // Create new entry with just ID
    const newEntry: BetEntry = {
      id: newId,
      option: selected,
      amount: parseInt(amount),
      timestamp: new Date(),
    };
    
    setEntries([newEntry, ...entries]);
    setLastAddedId(newId);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    setAmount("");
    setSelected(null);
  };

  // Handle final submission of all entries
  const handleFinalSubmit = async () => {
    if (entries.length === 0) {
      alert("Please add at least one entry before submitting");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const centerId = "67deac00352e0c457f750737"; 
      
      // Format the data according to the updated API requirements
      const apiMembers = entries.map(entry => ({
        id: entry.id,
        centerId: centerId,
        amount: entry.amount.toString(),
        bet: entry.option,
        result: ""
      }));
      
      const gameData = {
        members: apiMembers,
        totalPool: totalAmount.toString(),
        centers: [centerId],
        result: ""
      };
      
      console.log("Sending data to API:", gameData);
      
      const response = await fetch('http://localhost:4000/api/generate-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log("Game created successfully:", result.data);
        router.push(`/centerhome2?gameId=${result.data._id}`);
      } else {
        setError(result.message || 'Failed to create game');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating game:", error);
      setError('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Calculate total amount
  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

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
              <span className="w-[10px] h-[10px] bg-white rounded-full"></span>
              300 Craze Coins
            </button>
            <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
              <img src="/static/img/coinflipbg.png" className="w-full h-full object-cover" alt="" />
            </div>
          </div>

          <div className="w-full flex flex-col gap-[50px]">
            <h1 className="text-[2rem] font-[regularFont] text-white">Center Play Group Game</h1>
            <div className="w-full h-fit flex items-start gap-[50px] relative p-[40px] bg-[#ffffff20] backdrop-blur-lg rounded-[20px]">

              <div className="w-1/2 flex flex-col gap-[20px]">
                <div className="flex justify-between items-center">
                  <h1 className="text-white text-[1.5rem] font-[regularFont]">Entries</h1>
                  {entries.length > 0 && (
                    <span className="text-white text-[1.1rem] font-[regularFont] bg-[#ffffff30] px-4 py-1 rounded-full">
                      Total: ₹{totalAmount}
                    </span>
                  )}
                </div>
                
                <div className="w-full flex flex-col gap-[15px] max-h-[500px] overflow-y-auto pr-2">
                  {entries.length === 0 ? (
                    <div className="w-full text-center py-8 text-white bg-[#ffffff20] rounded-lg backdrop-blur-sm">
                      <i className="fi fi-rr-ticket-alt text-[3rem] mb-2 block opacity-50"></i>
                      <p className="text-lg font-light">No entries yet</p>
                      <p className="text-sm opacity-70 mt-2">Add an entry to get started</p>
                    </div>
                  ) : (
                    entries.map((entry, index) => (
                      <div 
                        key={index} 
                        className="w-full flex-col md:flex-row flex items-center gap-[10px] bg-[#ffffff70] backdrop-blur-lg p-[10px] rounded-[12px] transition-all hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="px-[20px] bg-white w-full text-center py-[5px] rounded-full text-[#404040] font-[regularFont]" >
                            {entry.id}
                          </div>
                        </div>
                        <div className="flex items-center w-full gap-2">
                          <div className={`px-[20px] w-full text-center py-[5px] rounded-full text-white font-[regularFont] ${entry.option === "Heads" ? "bg-[#FFD700]" : "bg-[#1E90FF]"}`}>
                            {entry.option}
                          </div>
                          <div className="green-button px-[20px] w-full text-center py-[5px] rounded-[8px] text-[#404040] font-[regularFont]">
                            ₹{entry.amount}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Final Submit Button - Only show when there are entries */}
                {entries.length > 0 && (
                  <div className="mt-6">
                    <button 
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className={`w-full h-[50px] font-[mediumFont] text-[1.1rem] text-white rounded-full ${isSubmitting ? 'bg-gray-500' : 'gold-button'} transition-all`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Start Game with These Entries"
                      )}
                    </button>
                    <p className="text-white text-sm text-center mt-2 opacity-70">
                      Once submitted, you'll be redirected to the game screen
                    </p>
                  </div>
                )}
              </div>
              
              {/* Form */}
              <div className="w-1/2 sticky top-[20px] flex flex-col gap-[20px]">
                <div className="w-full flex items-center justify-between gap-[30px]">
                  <div className="px-[20px] h-[40px] w-full text-white font-[regularFont] flex items-center justify-center border-[1px] border-[#fff] rounded-full text-[15px]">
                    {entries.length > 0 ? `Total - ₹${totalAmount}` : "No Entries"}
                  </div>
                  <div className="px-[20px] h-[40px] w-full text-white font-[regularFont] flex items-center justify-center border-[1px] border-[#fff] rounded-full text-[15px]">
                    Game Start in - {gameTimer}
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="w-full p-[20px] bg-[#ffffff80] border border-[#ffffffcd] rounded-[20px] flex flex-col gap-[10px]">
                  <div className="w-full flex flex-col gap-[5px]">
                    <label htmlFor="amount" className="font-[regularFont]">Amount</label>
                    <input 
                      type="number" 
                      id="amount"
                      placeholder="Enter bet amount" 
                      className="px-[20px] h-[40px] rounded-full outline-none border border-[#fff] font-[regularFont] bg-white" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="w-full flex flex-col gap-[5px]">
                    <label htmlFor="" className="font-[regularFont]">Options</label>
                    <div className="flex gap-[20px]">
                      <button
                        type="button"
                        className={`w-[50%] font-[mediumFont] h-[40px] rounded-full border border-[#fff] text-[15px] ${selected === "Heads" ? "gold-button text-white" : "bg-white text-[#404040]"}`}
                        onClick={() => handleSelect("Heads")}
                      >
                        Heads
                      </button>

                      <button
                        type="button"
                        className={`w-[50%] font-[mediumFont] h-[40px] rounded-full border border-[#fff] text-[15px] ${selected === "Tails" ? "gold-button text-white" : "bg-white text-[#404040]"}`}
                        onClick={() => handleSelect("Tails")}
                      >
                        Tails
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="h-[40px] mt-[10px] green-button text-[15px] font-[regularFont]"
                    disabled={!selected || !amount || isSubmitting}
                  >
                    Add Entry
                  </button>
                  
                  <p className="text-[13px] mt-[20px]">
                    Note: You cannot edit the options after adding the entry. A unique ID will be assigned automatically.
                  </p>
                </form>
                
                {/* Success notification that appears when an entry is added */}
                {showSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4 animate-fadeIn" role="alert">
                    <strong className="font-bold">Success! </strong>
                    <span className="block sm:inline">Entry {lastAddedId} has been added.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
