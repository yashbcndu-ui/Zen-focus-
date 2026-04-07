import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, addDoc, serverTimestamp, auth, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from '../firebase';
import { useAuth } from '../App';
import { Timer, Brain, Wind, Play, Square, Volume2, VolumeX, ShieldAlert, Trophy, Clock, CheckCircle2, Smartphone, Lock, Unlock, Sparkles, Zap } from 'lucide-react';

type SessionType = 'deep_work' | 'meditation' | 'digital_detox';

const APPS_TO_BLOCK = [
  { name: 'TikTok', icon: '📱', category: 'Social' },
  { name: 'Instagram', icon: '📸', category: 'Social' },
  { name: 'X (Twitter)', icon: '🐦', category: 'Social' },
  { name: 'YouTube', icon: '📺', category: 'Entertainment' },
  { name: 'Netflix', icon: '🎬', category: 'Entertainment' },
  { name: 'Discord', icon: '💬', category: 'Social' },
  { name: 'Reddit', icon: '🤖', category: 'Social' },
  { name: 'Games', icon: '🎮', category: 'Games' },
];

export default function FocusMode() {
  const { user, profile } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [type, setType] = useState<SessionType>('deep_work');
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isMuted, setIsMuted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showAppPicker, setShowAppPicker] = useState(false);
  const [selectedApps, setSelectedApps] = useState<string[]>(profile?.blockedApps || []);
  const [history, setHistory] = useState<any[]>([]);
  const [breathState, setBreathState] = useState<'inhale' | 'exhale' | 'hold'>('inhale');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'focusSessions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration * 60);
    }
  }, [duration, isActive]);

  // Meditation Breathing Cycle
  useEffect(() => {
    if (isActive && type === 'meditation') {
      const cycle = async () => {
        while (isActive) {
          setBreathState('inhale');
          await new Promise(r => setTimeout(r, 4000));
          if (!isActive) break;
          setBreathState('hold');
          await new Promise(r => setTimeout(r, 2000));
          if (!isActive) break;
          setBreathState('exhale');
          await new Promise(r => setTimeout(r, 4000));
          if (!isActive) break;
          setBreathState('hold');
          await new Promise(r => setTimeout(r, 2000));
        }
      };
      cycle();
    }
  }, [isActive, type]);

  const handleStart = () => {
    if (type === 'deep_work' || type === 'digital_detox') {
      setShowAppPicker(true);
    } else {
      startSession();
    }
  };

  const [showExtension, setShowExtension] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);

  const startSession = async () => {
    if (user && selectedApps.length > 0) {
      await updateDoc(doc(db, 'users', user.uid), {
        blockedApps: selectedApps
      });
    }
    setShowAppPicker(false);
    setShowStartConfirm(false);
    setIsActive(true);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 5000);
  };

  const handleExtend = (minutes: number) => {
    setTimeLeft(prev => prev + minutes * 60);
    setDuration(prev => prev + minutes);
    setShowExtension(false);
  };

  const handleStop = () => {
    setShowConfirm(true);
  };

  const confirmStop = () => {
    setIsActive(false);
    setShowConfirm(false);
  };

  const handleComplete = async () => {
    setIsActive(false);
    setShowComplete(true);
    if (user) {
      try {
        await addDoc(collection(db, 'focusSessions'), {
          userId: user.uid,
          type,
          duration,
          startTime: serverTimestamp(),
          completed: true,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving focus session:', error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleApp = (appName: string) => {
    setSelectedApps(prev => 
      prev.includes(appName) 
        ? prev.filter(a => a !== appName) 
        : [...prev, appName]
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-12">
      <AnimatePresence>
        {/* ... (keep existing modals) ... */}
      </AnimatePresence>

      <div className="text-center space-y-2">
        <h2 className="text-5xl font-black tracking-tighter uppercase italic text-white">Focus Mode</h2>
        <p className="text-gray-500 max-w-sm mx-auto font-medium">
          Enter a state of deep flow. We'll help you stay focused by creating a dedicated environment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 bg-[#1A1A1A] border border-white/5 rounded-[3rem] flex flex-col items-center justify-center space-y-10 relative overflow-hidden">
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#0F0F0F] z-50 flex flex-col items-center justify-center p-8 text-center space-y-12 backdrop-blur-2xl"
              >
                {/* ... (keep existing active session UI) ... */}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-[10rem] font-mono font-black tracking-tighter text-white/5">
            {formatTime(timeLeft)}
          </div>

          <div className="flex gap-4">
            {[25, 45, 60, 90].map((m) => (
              <button
                key={m}
                onClick={() => setDuration(m)}
                className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                  duration === m ? 'bg-white text-black' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>

          <button
            onClick={handleStart}
            className={`group relative px-16 py-7 font-black text-2xl rounded-[2rem] flex items-center gap-4 hover:scale-105 transition-all shadow-2xl ${
              type === 'deep_work' 
                ? 'bg-orange-500 text-black shadow-orange-500/20' 
                : type === 'digital_detox'
                ? 'bg-green-500 text-black shadow-green-500/20'
                : 'bg-purple-500 text-white shadow-purple-500/20'
            }`}
          >
            <Play fill={type === 'meditation' ? 'white' : 'black'} />
            START SESSION
          </button>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-[#1A1A1A] border border-white/5 rounded-[2.5rem] space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Session Type</h3>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setType('deep_work')}
                className={`p-6 rounded-2xl border transition-all flex items-center gap-4 ${
                  type === 'deep_work'
                    ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                    : 'bg-white/5 border-white/5 text-gray-500'
                }`}
              >
                <Brain size={28} />
                <span className="text-sm font-bold uppercase tracking-tighter">Deep Work</span>
              </button>
              {/* ... (other buttons) ... */}
            </div>
          </div>
          {/* ... (ambient sound, limitation warning) ... */}
        </div>
      </div>
      {/* ... (session history) ... */}
    </div>
  );
}
