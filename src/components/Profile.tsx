import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../App';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, Mail, Settings, Clock, Flame, Save } from 'lucide-react';

export default function Profile() {
  const { user, profile } = useAuth();
  const [focusLimit, setFocusLimit] = useState(profile?.dailyFocusLimitMinutes || 60);
  const [calorieGoal, setCalorieGoal] = useState(profile?.dailyCalorieGoal || 2000);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        dailyFocusLimitMinutes: focusLimit,
        dailyCalorieGoal: calorieGoal,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!user || !profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <h2 className="text-4xl font-bold tracking-tighter uppercase italic">Profile & Settings</h2>

      {/* Google Account Info */}
      <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-6">
        <div className="flex items-center gap-4">
          <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-16 h-16 rounded-full" />
          <div>
            <h3 className="text-xl font-bold">{user.displayName}</h3>
            <div className="flex items-center gap-2 text-gray-500">
              <Mail size={16} />
              <span className="text-sm">{user.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-6">
        <div className="flex items-center gap-3 text-orange-500">
          <Settings size={24} />
          <h3 className="text-xl font-bold uppercase tracking-tighter">Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="text-gray-500" />
              <span className="font-bold">Daily Focus Limit (mins)</span>
            </div>
            <input
              type="number"
              value={focusLimit}
              onChange={(e) => setFocusLimit(parseInt(e.target.value))}
              className="w-20 bg-white/10 rounded-lg p-2 text-center font-bold"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="text-gray-500" />
              <span className="font-bold">Daily Calorie Goal</span>
            </div>
            <input
              type="number"
              value={calorieGoal}
              onChange={(e) => setCalorieGoal(parseInt(e.target.value))}
              className="w-20 bg-white/10 rounded-lg p-2 text-center font-bold"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-orange-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
          >
            {saving ? 'Saving...' : <><Save size={20} /> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}
