
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ProfileForm from './components/ProfileForm';
import ResumeBuilder from './components/ResumeBuilder';
import CoverLetter from './components/CoverLetter';
import InterviewPrep from './components/InterviewPrep';
import DoubtChat from './components/DoubtChat';
import Premium from './components/Premium';
import JobMarketInsights from './components/JobMarketInsights';
import Auth from './components/Auth';
import AdBanner from './components/AdBanner'; 
import { UserProfile, Region, AppSection } from './types';
import { Bars3Icon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

// --- TOAST COMPONENT ---
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-5 right-5 z-[100] toast-enter flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border text-sm font-bold backdrop-blur-md
            ${type === 'success' ? 'bg-green-50/90 text-green-700 border-green-200' : 'bg-red-50/90 text-red-700 border-red-200'}
        `}>
            {type === 'success' ? <CheckCircleIcon className="w-5 h-5"/> : <XCircleIcon className="w-5 h-5"/>}
            {message}
        </div>
    );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.PROFILE);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    phone: '',
    experience: '',
    skills: '',
    education: '',
    targetRole: '',
    targetRegion: Region.GLOBAL
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
  };

  // Check for existing session and premium status on load
  useEffect(() => {
    const savedUser = localStorage.getItem('app_current_user');
    if (savedUser) {
      setCurrentUserEmail(savedUser);
      setIsAuthenticated(true);
      
      const premiumStatus = localStorage.getItem(`app_premium_${savedUser}`);
      if (premiumStatus === 'true') setIsPremium(true);
    }
  }, []);

  // PERSISTENCE LOGIC: Load User Profile on Login
  useEffect(() => {
    if (isAuthenticated && currentUserEmail) {
       const key = `app_profile_${currentUserEmail}`;
       const savedData = localStorage.getItem(key);
       
       if (savedData) {
         try {
           const parsedData = JSON.parse(savedData);
           setUserProfile(prev => ({ ...prev, ...parsedData }));
         } catch (e) {
           console.error("Failed to load profile", e);
         }
       } else {
         setUserProfile(prev => {
             const newProfile = { ...prev, email: currentUserEmail };
             localStorage.setItem(key, JSON.stringify(newProfile));
             return newProfile;
         });
       }
    }
  }, [isAuthenticated, currentUserEmail]);

  // PERSISTENCE LOGIC: Auto-Save User Profile on Change
  useEffect(() => {
    if (isAuthenticated && currentUserEmail) {
      const key = `app_profile_${currentUserEmail}`;
      localStorage.setItem(key, JSON.stringify(userProfile));
    }
  }, [userProfile, isAuthenticated, currentUserEmail]);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setCurrentUserEmail(email);
    localStorage.setItem('app_current_user', email);
    
    const premiumStatus = localStorage.getItem(`app_premium_${email}`);
    setIsPremium(premiumStatus === 'true');

    setShowAuthModal(false); 
    showToast("Successfully Logged In!");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUserEmail('');
    setIsPremium(false);
    localStorage.removeItem('app_current_user');
    
    setUserProfile({
      fullName: '',
      email: '',
      phone: '',
      experience: '',
      skills: '',
      education: '',
      targetRole: '',
      targetRegion: Region.GLOBAL
    });
    
    setCurrentSection(AppSection.PROFILE); 
    showToast("Logged out successfully.");
  };

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const handleUpgrade = () => {
    setIsPremium(true);
    if (currentUserEmail) {
      localStorage.setItem(`app_premium_${currentUserEmail}`, 'true');
    }
    showToast("Welcome to JobNexa Premium! 🚀");
  };

  const navigateToPremium = () => {
    setCurrentSection(AppSection.PREMIUM);
  };

  const renderContent = () => {
    switch (currentSection) {
      case AppSection.PROFILE:
        return (
          <ProfileForm 
            profile={userProfile} 
            setProfile={setUserProfile} 
            onNext={() => {
                setCurrentSection(AppSection.RESUME);
                if(isAuthenticated) showToast("Profile Saved!");
            }}
            isAuthenticated={isAuthenticated}
            onTriggerAuth={handleAuthRequired}
          />
        );
      case AppSection.RESUME:
        return (
          <ResumeBuilder 
            profile={userProfile} 
            isPremium={isPremium} 
            onGoPremium={navigateToPremium}
          />
        );
      case AppSection.COVER_LETTER:
        return (
          <CoverLetter 
            profile={userProfile} 
            isPremium={isPremium}
            onGoPremium={navigateToPremium}
          />
        );
      case AppSection.INTERVIEW:
        return (
          <InterviewPrep 
            profile={userProfile} 
            isPremium={isPremium}
            onGoPremium={navigateToPremium}
          />
        );
      case AppSection.MARKET_ANALYSIS:
        return (
          <JobMarketInsights
            profile={userProfile}
            isPremium={isPremium}
            onGoPremium={navigateToPremium}
          />
        );
      case AppSection.CHAT:
        return (
          <DoubtChat 
            profile={userProfile} 
            isPremium={isPremium}
            onGoPremium={navigateToPremium}
          />
        );
      case AppSection.PREMIUM:
        return <Premium onUpgrade={handleUpgrade} isPremium={isPremium} />;
      default:
        return (
            <ProfileForm 
                profile={userProfile} 
                setProfile={setUserProfile} 
                onNext={() => setCurrentSection(AppSection.RESUME)}
                isAuthenticated={isAuthenticated}
                onTriggerAuth={handleAuthRequired}
            />
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      
      {/* GLOBAL ANIMATED BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 -z-10"></div>
      
      {/* Toast Notification */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Auth Modal Overlay */}
      {showAuthModal && !isAuthenticated && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-200">
            <Auth onLogin={handleLogin} onClose={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}

      <Sidebar 
        currentSection={currentSection} 
        onNavigate={setCurrentSection} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isAuthenticated={isAuthenticated}
        onTriggerAuth={handleAuthRequired}
        isPremium={isPremium}
      />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative w-full">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4 md:px-8 py-4 flex justify-between items-center flex-shrink-0 z-10 shadow-sm sticky top-0">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
             >
               <Bars3Icon className="w-6 h-6" />
             </button>

             <div>
               <h1 className="text-lg md:text-xl font-bold text-slate-800 capitalize truncate max-w-[150px] md:max-w-none flex items-center gap-2">
                 {currentSection === AppSection.PROFILE ? 'Dashboard' : currentSection.replace(/_/g, ' ')}
               </h1>
               <p className="text-xs md:text-sm text-slate-500 hidden md:block">
                 {userProfile.fullName ? `Drafting for: ${userProfile.fullName}` : 'AI Career Assistant'}
               </p>
             </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
             {isAuthenticated ? (
               <>
                 <div className="flex flex-col items-end mr-2">
                    <span className="text-xs font-bold text-slate-700 hidden md:block">{currentUserEmail}</span>
                    <button 
                      onClick={handleLogout}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Logout
                    </button>
                 </div>
                 <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shadow-md text-white border-2 border-white
                    ${isPremium ? 'bg-gradient-to-br from-yellow-400 to-orange-500 ring-2 ring-yellow-200' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}
                 `}>
                   {currentUserEmail.charAt(0).toUpperCase()}
                 </div>
               </>
             ) : (
               <button 
                 onClick={handleAuthRequired}
                 className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-5 py-2 rounded-full transition-colors"
               >
                 Sign In
               </button>
             )}
          </div>
        </header>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth relative">
           {renderContent()}
           
           {/* Professional Footer */}
           <div className="mt-12 py-6 border-t border-slate-200/50 text-center text-slate-400 text-xs">
              <p>&copy; {new Date().getFullYear()} JobNexa AI. All rights reserved.</p>
           </div>
        </div>

        {/* Ad Banner for Free Users */}
        {!isPremium && (
          <AdBanner variant="banner" />
        )}
      </main>
    </div>
  );
};

export default App;
