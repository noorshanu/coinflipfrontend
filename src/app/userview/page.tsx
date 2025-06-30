import "../globals.css";

export default function CenterHome() {
    return (
        <div>

            <section className="">
                <div className="w-full fixed top-0 bottom-0 left-0 right-0 z-0 h-screen bg-gradient-to-r from-[#040404] to-transparent "></div>

                <img src="/static/img/coinflipbg.png" className="w-full h-full fixed top-0 left-0 right-0 bottom-0 object-cover -z-10" alt="" />
            </section>
            <main className="w-full flex items-start flex-col h-[100vh] overflow-hidden relative z-10 p-[20px]">
                <header className="w-full h-[10vh] py-[20px]">
                    <div className="w-full flex items-center gap-[20px]">
                        <h1 className="text-[2rem] text-white  font-[lightFont] leading-0">Coin<span className="font-[mediumFont] ">Craze</span></h1>
                        <div className="w-[1px] h-[30px] bg-white">

                        </div>
                        <h3 className="poppins text-[20px] pt-[2px] leading-0 text-white font-extralight ">User View</h3>
                    </div>
                </header>
                <div className="w-full h-[90vh] rounded-[20px] backdrop-blur-xl bg-[#ffffff50] border border-[#919191]">
                    <div className="w-full p-[20px]">
                        <div className="rounded-xl bg-white/10 p-4 flex flex-col gap-2 items-center overflow-hidden">
                            <span className="text-white font-light font-[regularFont] w-full text-left tracking-wider">Previous winner list :</span>
                            <div className="relative w-full overflow-hidden flex gap-[15px]">
                                <div className="w-[40px] h-[40px] bg-[#F049FF] flex items-center justify-center  text-[#7B1177] aspect-square rounded-full font-[regularFont] text-[20px]" >
                                    H
                                </div>
                                <div className="w-[40px] h-[40px] bg-[#3DFF97] flex items-center justify-center  text-[#056048] aspect-square rounded-full font-[regularFont] text-[20px]" >
                                    T
                                </div>
                                <div className="w-[40px] h-[40px] bg-[#3DFF97] flex items-center justify-center  text-[#056048] aspect-square rounded-full font-[regularFont] text-[20px]" >
                                    T
                                </div>
                                <div className="w-[40px] h-[40px] bg-[#F049FF] flex items-center justify-center  text-[#7B1177] aspect-square rounded-full font-[regularFont] text-[20px]" >
                                    H
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Center Panel */}
                    <div className="flex flex-col items-center justify-center flex-grow h-[70%] relative">

                        {/* Timer State */}
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-white font-light text-lg">Game will start in</span>
                            <span className="text-white font-[mediumFont] text-4xl md:text-5xl tracking-wider">00:10</span>
                            <span className="text-white text-center font-light mt-2">
                                Place your bid after the time ends<br />
                                You will not be able to place bid
                            </span>
                            <button className="mt-4 px-8 py-2 rounded-full bg-[#a94444] text-white font-medium shadow hover:bg-[#c44] transition">
                                Leave the room
                            </button>
                        </div>

                        {/* Flipping State */}
                        <div className="hidden flex flex-col items-center justify-center w-full mt-12">
                            <div className="relative flex justify-center items-center">
                                <div className="absolute w-[250px] h-[250px] bg-[#ffffff10] rounded-full animate-pulse"></div>
                                <img
                                    src="/static/img/heads.gif"
                                    className="w-[200px] h-auto z-10 animate-spin-slow"
                                    alt="coin flipping"
                                />
                            </div>
                            <p className="text-[1.2rem] font-[regularFont] text-white mt-4 animate-pulse">
                                Coin is Flipping...
                            </p>
                        </div>

                        {/* Result State */}
                        <div className="hidden flex  flex-col items-center justify-center w-full relative mt-12">
                            <div className="absolute inset-0 z-10 pointer-events-none">
                                <img
                                    src="/static/img/celebrate.gif"
                                    className="w-full h-full object-cover opacity-70"
                                    alt="celebration"
                                />
                            </div>
                            <div className="relative flex items-center justify-center w-[300px] h-[300px] z-20">
                                <div className="absolute w-[320px] h-[320px] bg-[#ffffff10] rounded-full animate-pulse"></div>
                                <img
                                    src="/static/img/heads.png"
                                    className="w-[300px] h-auto z-20 absolute"
                                    alt="heads side of coin"
                                />
                            </div>
                            <div className="w-full flex flex-col items-center gap-[15px] justify-center mt-8 z-20">
                                <h2 className="text-[2.5rem] font-[mediumFont] text-white animate-bounce capitalize">
                                    You Won!
                                </h2>
                                <button
                                    className="gold-button h-[45px] w-[200px] text-[1rem] font-[regularFont] mt-4"
                                >
                                    Play Again
                                </button>
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
