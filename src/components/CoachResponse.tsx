import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { useAuth } from '../App';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, Brain, Flame, Apple, Activity, Droplets } from 'lucide-react';

export default function CoachResponse({ onNext }: { onNext: () => void }) {
  const { user } = useAuth();
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState('');
  const [lastIntervention, setLastIntervention] = useState<string | null>(null);

  const fetchAdvice = async () => {
    if (!user || !mood) return;
    setLoading(true);
    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, usage: { tiktok: 120, instagram: 60 } }), // Mock usage data
      });
      const data = await response.json();
      setAdvice(data.response);
      // Extract intervention suggestion (simple heuristic)
      const suggestion = data.response.split('\n').find((line: string) => line.toLowerCase().includes('suggest'));
      setLastIntervention(suggestion || 'General advice');
    } catch (error) {
      console.error("Coach Error:", error);
      setAdvice("Failed to fetch advice.");
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (wasHelpful: boolean) => {
    if (!user || !lastIntervention) return;
    try {
      await addDoc(collection(db, 'interventionHistory'), {
        userId: user.uid,
        intervention: lastIntervention,
        mood,
        timeOfDay: new Date().getHours().toString(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        wasHelpful,
        createdAt: serverTimestamp(),
      });
      setLastIntervention(null);
      alert(wasHelpful ? "Glad it helped!" : "Noted, I'll try better next time.");
    } catch (error) {
      console.error("Feedback error:", error);
    }
  };

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
            <h2 className="text-2xl font-bold tracking-tighter uppercase">Aria's Coaching</h2>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="How are you feeling right now?"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-green-400 transition-colors"
            />
            <button
              onClick={fetchAdvice}
              disabled={loading || !mood}
              className="w-full py-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Thinking...' : 'Get Advice'}
            </button>
          </div>

          <div className="prose prose-invert max-w-none">
            {advice && (
              <div className="markdown-body text-gray-300 leading-relaxed text-lg">
                <ReactMarkdown>{advice}</ReactMarkdown>
                <div className="mt-4 flex gap-4">
                  <button onClick={() => submitFeedback(true)} className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold">Helpful</button>
                  <button onClick={() => submitFeedback(false)} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold">Not Helpful</button>
                </div>
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
