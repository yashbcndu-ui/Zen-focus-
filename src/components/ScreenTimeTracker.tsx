import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Clock, Shield, Lock, Unlock, TrendingUp, AlertCircle, X, Sparkles, Timer, PlusCircle } from 'lucide-react';
import { AppUsage } from '../types';
import { db, doc, updateDoc } from '../firebase';
import { useAuth } from '../App';

const MOCK_USAGE: AppUsage[] = [
  { name: 'TikTok', minutes: 142, category: 'Social', icon: '📱' },
  { name: 'Instagram', minutes: 85, category: 'Social', icon: '📸' },
  { name: 'YouTube', minutes: 64, category: 'Entertainment', icon: '📺' },
  { name: 'X (Twitter)', minutes: 45, category: 'Social', icon: '🐦' },
  { name: 'Games', minutes: 30, category: 'Games', icon: '🎮' },
];

export default function ScreenTimeTracker() {
  const { user, profile } = useAuth();
  const [interveningApp, setInterveningApp] = useState<AppUsage | null>(null);
  const [editingLimitApp, setEditingLimitApp] = useState<AppUsage | null>(null);
  const [tempLimit, setTempLimit] = useState<string>('');

  const totalMinutes = MOCK_USAGE.reduce((acc, curr) => acc + curr.minutes, 0);
  const blockedApps = profile?.blockedApps || [];
  const appLimits = profile?.appLimits || {};

  const toggleBlock = async (appName: string) => {
    if (!user) return;
    const newBlocked = blockedApps.includes(appName)
      ? blockedApps.filter(a => a !== appName)
      : [...blockedApps, appName];
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        blockedApps: newBlocked
      });
    } catch (error) {
      console.error("Error updating blocked apps:", error);
    }
  };

  const updateAppLimit = async (appName: string, limit: number) => {
    if (!user) return;
    const newLimits = { ...appLimits, [appName]: limit };
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        appLimits: newLimits
      });
      setEditingLimitApp(null);
    } catch (error) {
      console.error("Error updating app limit:", error);
    }
  };

  const requestExtension = async (appName: string, minutes: number) => {
    if (!user) return;
    const currentLimit = appLimits[appName] || 0;
    const newLimit = currentLimit + minutes;
    await updateAppLimit(appName, newLimit);
    setInterveningApp(null);
  };

  const handleAppClick = (app: AppUsage) => {
    const limit = appLimits[app.name];
    if (limit && app.minutes >= limit) {
      setInterveningApp(app);
    } else {
      // In a real app, this would open the app. Here we just show a toast or nothing.
      console.log(`Opening ${app.name}...`);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {/* Aria Intervention Popup */}
        {interveningApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-orange-500/30 p-8 rounded-[2.5rem] max-w-md w-full space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Aria Intervenes</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500/70">Limit Reached: {interveningApp.name}</p>
                  </div>
                </div>
                <button onClick={() => setInterveningApp(null)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed italic text-sm">
                  "Hey! You've already spent <span className="text-white font-bold">{interveningApp.minutes} minutes</span> on {interveningApp.name} today. 
                  Your limit was set to <span className="text-orange-500 font-bold">{appLimits[interveningApp.name]} minutes</span>."
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  I strongly advise you to step away. Your brain needs a break from the dopamine loop. 
                  What if we try a 5-minute meditation instead?
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Need more time? (Use sparingly)</div>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 15, 30].map(mins => (
                    <button
                      key={mins}
                      onClick={() => requestExtension(interveningApp.name, mins)}
                      className="py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-xs hover:bg-white/10 transition-all"
                    >
                      +{mins}m
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setInterveningApp(null)}
                  className="w-full py-4 bg-orange-500 text-black rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                >
                  I'll stop now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Limit Modal */}
        {editingLimitApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-[2rem] max-w-sm w-full space-y-6"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{editingLimitApp.icon}</span>
                <h3 className="text-xl font-bold uppercase tracking-tighter">Set Daily Limit</h3>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Minutes per day</label>
                <input 
                  type="number" 
                  autoFocus
                  placeholder="e.g. 60"
                  value={tempLimit}
                  onChange={(e) => setTempLimit(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-orange-500 transition-colors text-xl font-bold"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingLimitApp(null)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-bold uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateAppLimit(editingLimitApp.name, parseInt(tempLimit) || 0)}
                  className="flex-1 py-3 bg-orange-500 text-black rounded-xl font-bold uppercase tracking-widest text-xs"
                >
                  Set Limit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="text-orange-500" size={20} />
          <h3 className="text-xl font-bold tracking-tighter uppercase italic">Screen Time Tracking</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">Live Sync</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="text-4xl font-black tracking-tighter text-white">
                {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Screen Time Today</div>
            </div>
            <div className="text-right">
              <div className="text-orange-500 font-bold flex items-center gap-1 justify-end">
                <TrendingUp size={14} />
                <span>+12%</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">vs yesterday</div>
            </div>
          </div>

          <div className="space-y-6">
            {MOCK_USAGE.map((app, i) => {
              const limit = appLimits[app.name];
              const isOverLimit = limit && app.minutes >= limit;
              
              return (
                <div key={app.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <button 
                      onClick={() => handleAppClick(app)}
                      className="flex items-center gap-3 text-left group"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">{app.icon}</span>
                      <div>
                        <div className="text-sm font-bold uppercase tracking-tight text-white flex items-center gap-2">
                          {app.name}
                          {isOverLimit && <AlertCircle size={12} className="text-orange-500" />}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{app.category}</div>
                      </div>
                    </button>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-300">{app.minutes}m</div>
                        <button 
                          onClick={() => {
                            setEditingLimitApp(app);
                            setTempLimit(limit?.toString() || '');
                          }}
                          className="text-[10px] font-bold uppercase tracking-widest text-orange-500/50 hover:text-orange-500 transition-colors"
                        >
                          {limit ? `Limit: ${limit}m` : 'Set Limit'}
                        </button>
                      </div>
                      <button
                        onClick={() => toggleBlock(app.name)}
                        className={`p-2 rounded-xl transition-all ${
                          blockedApps.includes(app.name) || isOverLimit
                            ? 'bg-orange-500 text-black'
                            : 'bg-white/5 border border-white/10 text-gray-500 hover:bg-white/10'
                        }`}
                      >
                        {blockedApps.includes(app.name) || isOverLimit ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(app.minutes / (limit || totalMinutes)) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${
                        isOverLimit ? 'bg-orange-500' : 'bg-white/20'
                      }`}
                    />
                    {limit && (
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-orange-500/50"
                        style={{ left: `${Math.min((limit / totalMinutes) * 100, 100)}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-orange-500">
              <Shield size={20} />
              <h4 className="text-xs font-bold uppercase tracking-widest">Active Blocks</h4>
            </div>
            <div className="space-y-2">
              {blockedApps.length > 0 || Object.keys(appLimits).some(name => MOCK_USAGE.find(a => a.name === name && a.minutes >= appLimits[name])) ? (
                <div className="space-y-2">
                  {[...new Set(blockedApps)].map(app => (
                    <div key={app} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                      <span className="text-xs font-bold text-gray-300">{app}</span>
                      <Lock size={12} className="text-orange-500" />
                    </div>
                  ))}
                  {MOCK_USAGE.filter(a => appLimits[a.name] && a.minutes >= appLimits[a.name] && !blockedApps.includes(a.name)).map(app => (
                    <div key={app.name} className="flex items-center justify-between p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
                      <span className="text-xs font-bold text-orange-500">{app.name} (Limit)</span>
                      <Timer size={12} className="text-orange-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-gray-500 italic">No apps currently blocked. Select apps from the list to start your detox.</p>
              )}
            </div>
          </div>

          <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-blue-500">
              <AlertCircle size={18} />
              <h4 className="text-xs font-bold uppercase tracking-widest">AI Insight</h4>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed italic">
              "Your social media usage peaks between 9 PM and 11 PM. This is likely affecting your sleep quality. Consider setting a focus goal for this window."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
