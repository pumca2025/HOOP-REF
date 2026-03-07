import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import SplashScreen from './components/SplashScreen';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import HistoryCalendar from './components/HistoryCalendar';
import RuleBook from './components/RuleBook';
import AnalysisResult from './components/AnalysisResult';
import ExplanationResult from './components/ExplanationResult';
import VerifyOtp from './components/VerifyOtp';
import {
  Play,
  Send,
  Loader2,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { authWithGoogle, analyzePlay, getHistory, deleteHistory } from './services/apiService';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<AppView>(AppView.ANALYZE);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [currentExplanation, setCurrentExplanation] = useState<any>(null);
  const [clarification, setClarification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  useEffect(() => {
    // Splash screen timer
    const timer = setTimeout(() => setShowSplash(false), 2500);

    // Check for existing user in storage
    const savedUser = localStorage.getItem('hoopref_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    try {
      const response = await getHistory();
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleAuthSuccess = async (tokenOrGoogleToken: string, manualUser?: any, email?: string) => {
    // If an email is provided, it means we need to verify OTP
    if (email) {
      setPendingVerificationEmail(email);
      setView(AppView.VERIFY_OTP);
      return;
    }

    setIsLoading(true);
    try {
      if (manualUser) {
        // Manual Email/Password auth (already verified)
        localStorage.setItem('hoopref_token', tokenOrGoogleToken);
        localStorage.setItem('hoopref_user', JSON.stringify(manualUser));
        setUser(manualUser);
        setIsAuthenticated(true);
        setView(AppView.ANALYZE);
      } else {
        // Google OAuth
        const response = await authWithGoogle(tokenOrGoogleToken);
        const { token, user } = response.data;
        localStorage.setItem('hoopref_token', token);
        localStorage.setItem('hoopref_user', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(true);
        setView(AppView.ANALYZE);
      }
    } catch (err: any) {
      console.error("Auth error", err);
      const errorMsg = err.response?.data?.error || "Authentication failed";

      // If error is "unverified", send to OTP screen
      if (errorMsg.includes("verify your email") && manualUser?.email) {
        setPendingVerificationEmail(manualUser.email);
        setView(AppView.VERIFY_OTP);
      } else {
        alert(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hoopref_token');
    localStorage.removeItem('hoopref_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleAnalyze = async () => {
    if (!inputQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    setClarification(null);
    setCurrentAnalysis(null);
    setCurrentExplanation(null);

    try {
      const response = await analyzePlay(inputQuery);
      const data = response.data;

      if (data.type === 'clarification') {
        setClarification(data.message);
      } else if (data.type === 'explanation') {
        setCurrentExplanation(data);
      } else {
        setCurrentAnalysis(data);
        fetchHistory(); // Refresh history
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteHistory(id);
      fetchHistory();
    } catch (err) {
      alert("Failed to delete entry");
    }
  };

  if (showSplash) return <SplashScreen />;

  if (!isAuthenticated) {
    if (view === AppView.VERIFY_OTP && pendingVerificationEmail) {
      return (
        <VerifyOtp
          email={pendingVerificationEmail}
          onSuccess={(token, user) => {
            localStorage.setItem('hoopref_token', token);
            localStorage.setItem('hoopref_user', JSON.stringify(user));
            setUser(user);
            setIsAuthenticated(true);
            setView(AppView.ANALYZE);
            setPendingVerificationEmail(null);
          }}
          onBack={() => {
            setView(AppView.ANALYZE); // Goes back to Auth
            setPendingVerificationEmail(null);
          }}
        />
      );
    }
    return <Auth onSuccess={handleAuthSuccess} isLoading={isLoading} />;
  }

  const renderContent = () => {
    switch (view) {
      case AppView.PROFILE:
        return (
          <div className="max-w-2xl mx-auto bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 text-center animate-in zoom-in-95 duration-500">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-orange-600 shadow-xl">
                <img src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ea580c&color=fff&bold=true&size=128`} alt="Profile" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=ea580c&color=fff&bold=true&size=128`; }} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-orange-600 rounded-2xl text-white shadow-lg overflow-hidden">
                <img src="/Hoopref.png" alt="HoopRef Logo" className="w-7 h-7 object-cover" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-1">{user?.name}</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-8">{user?.email}</p>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Analysis</p>
                <p className="text-2xl font-black text-orange-600">{history.length}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rank</p>
                <p className="text-2xl font-black text-gray-900">Official</p>
              </div>
            </div>
          </div>
        );
      case AppView.ABOUT:
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="bg-black text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">

              </div>
              <div className="relative z-10">
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">About HoopRef</h2>
                <p className="text-gray-400 font-medium text-lg leading-relaxed">
                  HoopRef is an industrial-standard basketball referee assistant designed to provide instant, rule-based decisions using high-performance AI.
                </p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 uppercase mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-orange-600 rounded-full" />
                Technical Standard
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-orange-100 rounded-2xl h-fit text-orange-600 overflow-hidden">
                    <img src="/Hoopref.png" alt="HoopRef Logo" className="w-8 h-8 object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Official Rules 2024</h4>
                    <p className="text-gray-500 text-sm">Powered by complete FIBA/NBA rulebook integration.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-black rounded-2xl h-fit text-white overflow-hidden">
                    <img src="/Hoopref.png" alt="HoopRef Logo" className="w-8 h-8 object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Designed & Developed By</h4>
                    <p className="text-gray-500 text-sm">Deepak V - Certified TNBA B Panel Referee, Salem</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-black rounded-2xl h-fit text-white overflow-hidden">
                    <img src="/Hoopref.png" alt="HoopRef Logo" className="w-8 h-8 object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Hoopref - Version 1.0</h4>
                    <p className="text-gray-500 text-sm">Copyright © 2026. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case AppView.RULEBOOK:
        return <RuleBook />;
      case AppView.HISTORY:
        return <HistoryCalendar history={history} onDelete={handleDeleteHistory} />;
      case AppView.ANALYZE:
      default:
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Input Section */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-600 rounded-xl text-white overflow-hidden">
                  <img src="/Hoopref.png" alt="HoopRef Logo" className="w-7 h-7 object-cover" />
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Analyze Play</h2>
              </div>

              <textarea
                className="w-full h-40 p-6 border-2 border-gray-50 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-600 outline-none resize-none text-lg font-medium text-gray-700 placeholder-gray-300 transition-all bg-gray-50/50"
                placeholder="Describe a play situation... or ask about a rule! (e.g. 'Player drove to basket and defender slid in front' or 'What is a charging foul?')"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
              />

              <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <p className="text-xs font-bold text-gray-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Strict Basketball Domain Only
                </p>
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || !inputQuery.trim()}
                  className={`
                    w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-full font-black uppercase tracking-widest text-white shadow-xl transition-all
                    ${isLoading || !inputQuery.trim()
                      ? 'bg-gray-200 cursor-not-allowed text-gray-400 shadow-none'
                      : 'bg-orange-600 hover:bg-black hover:scale-105 active:scale-95'
                    }
                  `}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      Get Decision
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Clarification Needed */}
            {clarification && (
              <div className="bg-black text-white p-8 rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-300 border-4 border-orange-600">
                <div className="flex items-center gap-4 mb-4">
                  <MessageSquare className="w-8 h-8 text-orange-600" />
                  <h3 className="text-xl font-bold uppercase">Ref Clarification</h3>
                </div>
                <p className="text-lg font-medium leading-relaxed mb-6 opacity-90">{clarification}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setClarification(null);
                      document.querySelector('textarea')?.focus();
                    }}
                    className="px-6 py-2 bg-orange-600 text-white rounded-full font-bold hover:bg-white hover:text-black transition-all"
                  >
                    I'll provide more details
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-4">
                <AlertCircle className="w-6 h-6" />
                <p className="font-bold">{error}</p>
              </div>
            )}

            {/* Explanation Result */}
            {currentExplanation && (
              <div className="animate-in slide-in-from-top-4 duration-500">
                <ExplanationResult result={currentExplanation} />
              </div>
            )}

            {/* Result Section */}
            {currentAnalysis && (
              <div className="animate-in slide-in-from-top-4 duration-500">
                <AnalysisResult result={currentAnalysis} />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar
        view={view}
        setView={setView}
        user={user}
        onLogout={handleLogout}
        onSwitchAccount={() => {
          handleLogout();
          // will trigger Auth screen automatically
        }}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
        {renderContent()}
      </main>

      {/* Footer Branding */}
      <footer className="py-8 text-center opacity-20">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-900">HoopRef Industrial Standard</p>
      </footer>
    </div>
  );
};

export default App;