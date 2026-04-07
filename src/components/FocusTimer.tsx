import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { db, addDoc, collection, Timestamp } from '../firebase';
import { useAuth } from '../App';

export default function FocusTimer() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Log session
      if (user) {
        addDoc(collection(db, 'focusSessions'), {
          userId: user.uid,
          type: 'deep_work',
          duration: 25,
          startTime: Timestamp.now(),
          completed: true,
          createdAt: Timestamp.now()
        });
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, user]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-8">
      <div className="text-8xl font-bold tracking-tighter">{formatTime(timeLeft)}</div>
      <div className="flex gap-4">
        <button onClick={() => setIsActive(!isActive)} className="p-4 bg-white text-black rounded-full">
          {isActive ? <Pause /> : <Play />}
        </button>
        <button onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }} className="p-4 bg-white/10 rounded-full">
          <RotateCcw />
        </button>
      </div>
    </div>
  );
}
