import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../App';
import { ArrowRight, Clock, Brain, Zap } from 'lucide-react';

export default function Home({ onStart }: { onStart: () => void }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter leading-none">
          MASTER YOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600">
            FOCUS.
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto font-medium">
          The AI-powered productivity coach to help you stay deep in the zone. Track sessions, manage time, and thrive.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl"
      >
        <FeatureCard 
          icon={<Clock className="text-green-400" />} 
          title="Focus Timer" 
          desc="Deep work and meditation sessions to keep you on track."
        />
        <FeatureCard 
          icon={<Brain className="text-blue-400" />} 
          title="AI Coach" 
          desc="Personalized, witty, and slightly strict productivity advice."
        />
        <FeatureCard 
          icon={<Zap className="text-yellow-400" />} 
          title="Gamified" 
          desc="Build streaks and earn points for consistent focus."
        />
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="group relative px-8 py-4 bg-white text-black font-bold rounded-full flex items-center gap-2 overflow-hidden"
      >
        <span className="relative z-10">{user ? "START FOCUSING" : "GET STARTED"}</span>
        <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
      </motion.button>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-left space-y-2 hover:bg-white/10 transition-colors">
      <div className="p-2 bg-white/5 w-fit rounded-xl">{icon}</div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
