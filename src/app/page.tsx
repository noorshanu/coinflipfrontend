
export default function Home() {
    return (
        <main className="w-full px-[100px] h-screen bg-[#040404]">
            <header className="w-full flex items-center justify-between py-[20px]">
                <h1 className="text-[2rem] text-white font-[lightFont]">
                    Coin<span className="font-[mediumFont]">Craze</span>
                </h1>
                <button className="gold-button font-[mediumFont]">Play now</button>
            </header>

            {/* Home Section */}
            <section className="w-full flex items-start justify-between">

                {/* Left Box */}
                <div className="w-full flex flex-col gap-[20px] mt-[100px]">
                    <h1 className="text-[3.5rem] leading-tight text-white font-[mediumFont]">
                        A Single Flip Can <br /> Change Everything!
                    </h1>
                    <p className="text-[16px] font-extralight text-white">
                        Experience the thrill of a skill-based coin flip game. <br />
                        Place your bets, choose your side, and let fate decide! <br />
                        Play, win, and withdraw your rewards instantly.
                    </p>

                    {/* Login Section */}
                    <div className="w-[80%] h-fit flex flex-col gap-[25px] mt-[40px] p-[40px] bg-[#ffffff50] backdrop-blur-3xl">
                        <h3 className="text-[1.5rem] font-[regularFont] text-white">Login / Signup</h3>

                        <div className="flex flex-col w-full gap-[15px]">
                            <div className="w-full flex items-center gap-[20px]">
                                <input
                                    type="tel"
                                    placeholder="Enter your number"
                                    maxLength={10}
                                    className="px-[20px] py-[8px] rounded-full border-[2px] border-white bg-white bg-opacity-50 text-white outline-none font-[regularFont] placeholder:font-[lightFont] placeholder:text-white w-full"
                                />
                                <button className="gold-button font-[mediumFont]">Login</button>
                            </div>

                            <div className="flex items-center gap-[10px]">
                                <input
                                    type="checkbox"
                                    className="h-[18px] w-[18px] accent-amber-300"
                                    id="terms"
                                />
                                <p className="text-[15px] font-light text-white">
                                    Agree Terms & Conditions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Box */}
                <div className='w-1/2 h-[500px] bg-white'>

                </div>

                {/* Link to centerhome2 */}
                {/* <Link href="/centerhome">
                    <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md">
                        Go to CenterHome2
                    </button>
                </Link> */}
            </section>
        </main>
    );
}
