import React from 'react';
import { motion } from 'motion/react';
import { Brain, Book, Moon, Clock, ShieldAlert, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../App';

interface RealityCheckProps {
  focusMinutes: number;
}

export default function RealityCheck({ focusMinutes }: RealityCheckProps) {
  const { profile } = useAuth();
  // Constants for Gen Z averages (mocked for impact)
  const AVG_SOCIAL_MEDIA_MINS = 180; // 3 hours
  const PAGES_PER_HOUR = 30;
  const SLEEP_IMPACT_MULTIPLIER = 0.5; // 1 hour of scrolling = 0.5 hours of quality sleep lost

  const booksEquivalent = Math.floor((focusMinutes / 60) * PAGES_PER_HOUR);
  const sleepSaved = (focusMinutes * SLEEP_IMPACT_MULTIPLIER).toFixed(1);
  const socialMediaAvoidedPercent = Math.min(Math.round((focusMinutes / AVG_SOCIAL_MEDIA_MINS) * 100), 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tighter uppercase italic flex items-center gap-2">
          <ShieldAlert className="text-orange-500" size={20} />
          Reality Check
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Impact Analysis</span>
      </div>

      {profile?.biggestStruggle && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-3"
        >
          <div className="p-2 bg-orange-500/20 rounded-xl text-orange-500">
            <Sparkles size={16} />
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Aria's Note</div>
            <p className="text-xs text-gray-300 leading-relaxed italic">
              "You mentioned struggling with <span className="text-white font-bold">{profile.biggestStruggle}</span>. 
              Every minute you focus here is a direct win against that habit. Keep going!"
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Screen Time Trap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-orange-500/20 text-orange-500 rounded-2xl">
              <Clock size={20} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black tracking-tighter text-white">{focusMinutes}m</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Time Won Back</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-gray-500">Digital Detox</span>
              <span className="text-orange-500">{socialMediaAvoidedPercent}% of daily avg</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${socialMediaAvoidedPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 italic leading-relaxed">
            You've reclaimed {focusMinutes} minutes from the infinite scroll. That's time you actually own.
          </p>
        </motion.div>

        {/* Opportunity Cost: Books */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-500/20 text-blue-500 rounded-2xl">
              <Book size={20} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black tracking-tighter text-white">{booksEquivalent}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Pages Unread</div>
            </div>
          </div>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(booksEquivalent, 20) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: '12px' }}
                transition={{ delay: i * 0.05 }}
                className="w-1 bg-blue-500/40 rounded-full"
              />
            ))}
            {booksEquivalent > 20 && <span className="text-[10px] text-blue-500 font-bold self-end">+{booksEquivalent - 20}</span>}
          </div>

          <p className="text-[11px] text-gray-400 italic leading-relaxed">
            In the time you focused, you could have read {booksEquivalent} pages of a masterpiece. Knowledge {'>'} Content.
          </p>
        </motion.div>

        {/* Sleep Debt */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4 relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-purple-500/20 text-purple-500 rounded-2xl">
              <Moon size={20} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black tracking-tighter text-white">+{sleepSaved}h</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Sleep Quality</div>
            </div>
          </div>

          <div className="relative h-12 flex items-center justify-center">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute w-12 h-12 bg-purple-500/20 rounded-full blur-xl"
            />
            <TrendingUp className="text-purple-500 relative z-10" size={32} />
          </div>

          <p className="text-[11px] text-gray-400 italic leading-relaxed">
            By choosing focus over late-night dopamine, you've potentially saved {sleepSaved} hours of deep REM sleep.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
