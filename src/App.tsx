import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User, doc, setDoc, getDoc, onSnapshot, collection, query, where, orderBy, Timestamp, addDoc } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Layout, Home, Dashboard, CoachResponse, FocusMode, Auth, UsageLimitPopup, Profile } from './components';
import { UserProfile } from './types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'focus' | 'stats' | 'profile'>('home');
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());

  useEffect(() => {
    if (!user || !profile) return;
    
    const interval = setInterval(() => {
      const elapsedMinutes = (Date.now() - sessionStartTime) / 60000;
      if (elapsedMinutes >= profile.dailyFocusLimitMinutes) {
        setShowLimitPopup(true);
        clearInterval(interval);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [user, profile, sessionStartTime]);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      
      // Clean up previous profile listener if it exists
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (u) {
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const newProfile: UserProfile = {
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName || '',
            photoURL: u.photoURL || '',
            createdAt: Timestamp.now(),
            streak: 0,
            totalPoints: 0,
            dailyCalorieGoal: 2000,
            dailyFocusLimitMinutes: 60,
            lastLoggedAt: null,
            badges: []
          };
          await setDoc(userRef, newProfile);
        }
        
        // Listen for profile changes
        unsubProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
        }, (error) => {
          console.error("Profile Snapshot Error:", error);
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        console.warn("Sign-in popup was cancelled by the user.");
      } else {
        console.error("Sign in error:", error);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentPage('home');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-white text-2xl font-bold font-sans tracking-tighter"
        >
          ARISE AI
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => setCurrentPage('focus')} />;
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout }}>
      {showLimitPopup && <UsageLimitPopup onClose={() => setShowLimitPopup(false)} />}
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <Home key="home" onStart={() => setCurrentPage('focus')} />
          )}
          {currentPage === 'focus' && (
            <FocusMode key="focus" />
          )}
          {currentPage === 'stats' && (
            <Dashboard key="stats" />
          )}
          {currentPage === 'profile' && (
            <Profile key="profile" />
          )}
        </AnimatePresence>
      </Layout>
    </AuthContext.Provider>
  );
}
