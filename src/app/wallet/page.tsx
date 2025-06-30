import "../globals.css";

export default function CenterHome() {
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
                            <p className="font-light text-[1.1rem] "> Home</p>
                        </a>
                        <a href="#" className="flex items-center w-full gap-[20px] text-white" >
                            <i className="fi fi-rr-console-controller relative top-[2px] text-[1.2rem]"></i>
                            <p className="font-light text-[1.1rem] "> Play Game</p>
                        </a>
                        <a href="#" className="flex items-center w-full gap-[20px] text-white" >
                            <i className="fi fi-rr-wallet relative top-[2px] text-[1.2rem]"></i>
                            <p className="font-light text-[1.1rem] "> Wallet</p>
                        </a>
                        <a href="#" className="flex items-center w-full gap-[20px] text-white" >
                            <i className="fi fi-rr-time-past relative top-[2px] text-[1.2rem] "></i>
                            <p className="font-light text-[1.1rem] "> History</p>
                        </a>
                        <a href="#" className="flex items-center w-full gap-[20px] text-white" >
                            <i className="fi fi-rr-settings relative top-[2px] text-[1.2rem]"></i>
                            <p className="font-light text-[1.1rem] "> Settings</p>
                        </a>
                    </div>
                </section>
                <div className="w-fit h-screen flex items-center justify-center mx-[80px]">
                    <div className="w-[1.5px] h-[500px] bg-gradient-to-t from-transparent via-[#ffffff50] to-transparent"></div>
                </div>
                <section className="w-[85%] pr-[50px]">
                    <div className="py-[20px] flex items-center gap-[20px] justify-end">
                        <button className="gold-button text-[14px] font-[regularFont] h-[40px]">
                            <span className="w-[10px] h-[10px] bg-white rounded-full"></span>
                            300 Craze Coins
                        </button>
                        <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
                            <img src="/static/img/coinflipbg.png" className="w-full h-full object-cover" alt="" />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-[2rem] font-[regularFont] text-white">Wallet</h1>
                        <div className="w-full h-fit bg-[#ffffff20] backdrop-blur-lg pb-[50px] rounded-[20px] p-[20px] flex flex-col  gap-[30px]">
                            <div className=" w-full flex items-center justify-between">
                                <div className="w-[40px] rounded-[10px] border-[2px] border-[#ccc] h-[40px] flex items-center justify-center bg-white">
                                    <i className="fi fi-rr-arrow-left text-[#202020] relative top-[2px]"></i>
                                </div>
                                <a href="" className="underline underline-offset-4 text-white font-extralight">
                                    All Transaction
                                </a>
                            </div>
                            <div className="flex items-center justify-center flex-col gap-[20px]">
                                <div className="text-white flex flex-col items-center justify-center">
                                    <p className="text-[15px] font-extralight ">Balance</p>
                                    <h1 className="text-[3rem] text-white font-[mediumFont] leading-[3rem]">₹ 150.<span className="text-[1.5rem]">00</span></h1>
                                </div>
                                <div className="flex items-center gap-[20px]">
                                    <button className="h-[40px] px-[30px] border-[2px] rounded-full text-[14px] text-white font-[regularFont] border-[#fff]">Withdraw</button>
                                    <button className="green-button h-[40px] px-[30px] border-[2px] text-[14px] rounded-full text-white font-[regularFont] border-[#fff]">Add Money</button>
                                </div> 
                            </div>
                        </div>

                    </div>
                </section>
            </main>
        </div>
    );
}
