import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { db, collection, query, where, orderBy, limit, onSnapshot } from '../firebase';
import { useAuth } from '../App';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, Brain, Flame, Apple, Activity, Droplets } from 'lucide-react';

export default function CoachResponse({ onNext }: { onNext: () => void }) {
  const { user } = useAuth();
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchAdvice = async () => {
      try {
        const response = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: "Give me some productivity advice." }),
        });
        const data = await response.json();
        setAdvice(data.response);
      } catch (error) {
        console.error("Coach Error:", error);
        setAdvice("Failed to fetch advice.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvice();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Brain size={120} />
        </div>

        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3 text-green-400">
            <Brain size={24} />
            <h2 className="text-2xl font-bold tracking-tighter uppercase">COACH ANALYSIS</h2>
          </div>

          <div className="prose prose-invert max-w-none">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="markdown-body text-gray-300 leading-relaxed text-lg">
                <ReactMarkdown>{advice}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onNext}
          className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
        >
          VIEW DASHBOARD
          <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}
