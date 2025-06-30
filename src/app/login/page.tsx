"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import "../globals.css";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('https://api.trontools.ai/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();
      console.log('Login response:', data); // For debugging

      if (data.success) {
        // Make sure we're passing all the user data including points
        login(data.token, {
          _id: data.user._id,
          phone: data.user.phone,
          points: data.user.points || 0, // Default to 0 if points is undefined
        });
        router.push('/games');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <section>
        <div className="w-full fixed top-0 bottom-0 left-0 right-0 z-0 h-screen bg-gradient-to-r from-[#040404] to-transparent"></div>
        <img src="/static/img/coinflipbg.png" className="w-full h-full fixed top-0 left-0 right-0 bottom-0 object-cover -z-10" alt="" />
      </section>

      <main className="w-full min-h-screen flex items-center justify-center relative z-10">
        <div className="w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <h1 className="text-[2rem] text-white font-[lightFont]">
              Coin<span className="font-[mediumFont]">Craze</span>
            </h1>
          </div>

          <div className="bg-[#ffffff20] backdrop-blur-lg p-8 rounded-[20px] border border-[#ffffff40]">
            <h2 className="text-2xl text-white font-[mediumFont] mb-6 text-center">Login to Your Account</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-white font-[regularFont]">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="px-4 h-[45px] rounded-full outline-none border border-[#ffffff40] font-[regularFont] bg-[#ffffff20] text-white"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-white font-[regularFont]">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-4 h-[45px] rounded-full outline-none border border-[#ffffff40] font-[regularFont] bg-[#ffffff20] text-white"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`h-[45px] mt-4 gold-button text-white font-[mediumFont] rounded-full transition-all
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 