import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, doc, updateDoc } from '../firebase';
import { useAuth } from '../App';
import { Send, Sparkles, Brain } from 'lucide-react';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    biggestStruggle: '',
    motivation: '',
    dailySchedule: '',
    distractingApps: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    { key: 'biggestStruggle', text: "What is your biggest struggle with your phone right now?" },
    { key: 'motivation', text: "What is your primary motivation for using Aria?" },
    { key: 'dailySchedule', text: "What does your typical daily schedule look like?" },
    { key: 'distractingApps', text: "Which apps do you find most distracting?" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < questions.length - 1) {
      setStep(s => s + 1);
      return;
    }

    if (!user) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...answers
      });
      onComplete();
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center gap-4 mb-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-tr from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/20"
          >
            <Brain className="text-white" size={40} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Aria</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1 justify-center">
              <Sparkles size={10} className="text-orange-500" />
              Focus Coach
            </p>
          </motion.div>
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none max-w-[85%]"
          >
            <p className="text-sm font-medium leading-relaxed text-gray-200">{questions[step].text}</p>
          </motion.div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit}
          className="mt-8 relative"
        >
          <textarea
            autoFocus
            value={answers[questions[step].key as keyof typeof answers]}
            onChange={(e) => setAnswers(prev => ({ ...prev, [questions[step].key]: e.target.value }))}
            placeholder="Type your answer here..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 outline-none focus:border-orange-500 transition-all text-sm min-h-[100px] resize-none"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!answers[questions[step].key as keyof typeof answers].trim() || isSubmitting}
            className="absolute bottom-4 right-4 p-2 bg-orange-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            {step < questions.length - 1 ? <Send size={18} /> : <Sparkles size={18} />}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
