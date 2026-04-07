import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db, collection, query, where, orderBy, onSnapshot } from '../firebase';
import { useAuth } from '../App';
import { FocusSession } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Zap, Brain, Wind, Trophy, Activity, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'focusSessions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newSessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FocusSession[];
      setSessions(newSessions);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      console.error("Dashboard Snapshot Error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Activity className="animate-spin text-orange-500" /></div>;

  const totalDurationToday = sessions
    .filter(s => s.startTime.toDate().toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.duration, 0);

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const daySessions = sessions.filter(s => s.startTime.toDate().toDateString() === dateStr);
    return {
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      duration: daySessions.reduce((sum, s) => sum + s.duration, 0),
    };
  }).reverse();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tighter uppercase italic">Your Progress</h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
          <Trophy className="text-orange-500" size={16} />
          <span className="text-xs font-bold uppercase tracking-widest text-orange-500">{profile?.streak || 0} Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Minutes Today" value={totalDurationToday} />
        <StatCard label="Total Sessions" value={sessions.length} />
      </div>

      <div className="p-8 bg-[#1A1A1A] border border-white/5 rounded-[2.5rem] space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Weekly Focus Trend</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F0F0F', border: '1px solid #333', borderRadius: '16px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="duration" fill="#F97316" radius={[8, 8, 8, 8]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="p-6 bg-[#1A1A1A] border border-white/5 rounded-[2rem] space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</div>
      <div className="text-3xl font-black tracking-tighter">{value}</div>
    </div>
  );
}
