import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert } from 'lucide-react';

export default function UsageLimitPopup({ onClose }: { onClose: () => void }) {
  const [canContinue, setCanContinue] = useState(false);
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanContinue(true);
    }
  }, [timer]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
    >
      <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2rem] max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold uppercase tracking-tighter">Usage Limit Exceeded</h3>
          <p className="text-gray-400 text-sm">You have reached your daily focus limit. Please take a break.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = 'about:blank'}
            className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
          >
            Exit
          </button>
          <button
            disabled={!canContinue}
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
              canContinue ? 'bg-green-500 text-black hover:bg-green-600' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canContinue ? 'Continue' : `Wait (${timer}s)`}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
