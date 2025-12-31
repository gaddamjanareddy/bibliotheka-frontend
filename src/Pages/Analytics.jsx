import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import {
  AutoStories,
  EmojiEvents,
  HistoryEdu,
  Stars,
  TrendingUp,
} from "@mui/icons-material";
import axiosInstance from "../api/axios"

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#5B4636", "#8B735B", "#D6C2A3", "#CBBBA0", "#A69076"];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/books/stats/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#FCF9F5]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5B4636]"></div>
    </div>
  );

  return (
    <div className="bg-[#FCF9F5] min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto">
        
        {/* --- 1. HEADER --- */}
        <div className="mb-10">
          <span className="text-[#8B735B] font-extrabold text-xs tracking-[0.2em] uppercase">
            Curated Collection
          </span>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#2C1E12] mt-2">
            Library Intelligence
          </h1>
        </div>

        {/* --- 2. TOP KPI ROW (4 EQUAL BOXES) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Completion Rate", val: `${data?.completionRate || 0}%`, icon: <Stars />, sub: "Reading Progress", color: "#5B4636", prog: data?.completionRate },
            { label: "Total Volume", val: data?.totalBooks || 0, icon: <AutoStories />, sub: "Manuscripts", color: "#8B735B" },
            { label: "Dominant Genre", val: data?.topGenre || "N/A", icon: <EmojiEvents />, sub: "Top Category", color: "#D6C2A3" },
            { label: "Growth Momentum", val: "+12.4%", icon: <TrendingUp />, sub: "This Quarter", color: "#A69076" }
          ].map((card, i) => (
            <div key={i} className="bg-white border border-[#E3D5C3] rounded-[24px] p-6 flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${card.color}15`, color: card.color }}
                  >
                    {card.icon}
                  </div>
                  <span className="text-[#8B735B] font-bold text-[10px] tracking-wider uppercase">
                    {card.label}
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold text-[#2C1E12]">{card.val}</h3>
                <p className="text-gray-400 text-xs mt-1">{card.sub}</p>
              </div>
              {card.prog !== undefined && (
                <div className="mt-4 w-full bg-[#F5EFE6] rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000" 
                    style={{ width: `${card.prog}%`, backgroundColor: card.color }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- 3. THE 50/50 SPLIT SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* BOX 1: GENRE DISTRIBUTION (HORIZONTAL) */}
          <div className="bg-white border border-[#E3D5C3] rounded-[32px] p-10 flex flex-col h-[520px] shadow-sm">
  {/* Header */}
  <div className="mb-8">
    <h2 className="text-xl font-black text-[#2C1E12] tracking-tight">
      Genre Distribution
    </h2>
    <p className="text-[11px] text-[#8B735B] font-medium uppercase tracking-widest mt-1">
      Collection Breakdown
    </p>
  </div>

  <div className="flex flex-grow items-center justify-between gap-12 min-h-0">
    {/* Left side: The Chart (Slightly larger for presence) */}
    <div className="w-[55%] h-full flex items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data?.genreStats}
            innerRadius="72%" /* Thinner donut for a more modern look */
            outerRadius="95%"
            paddingAngle={4}
            dataKey="count"
          >
            {data?.genreStats?.map((entry, index) => (
              <Cell 
                key={index} 
                fill={COLORS[index % COLORS.length]} 
                stroke="none" 
                className="hover:opacity-80 transition-opacity duration-300 outline-none"
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Statistic (Optional but adds a high-end feel) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-black text-[#2C1E12]">{data?.totalBooks || 0}</span>
        <span className="text-[9px] font-bold text-[#8B735B] uppercase tracking-[0.2em]">Volumes</span>
      </div>
    </div>

    {/* Right side: Legend (Clean, small, and perfectly aligned) */}
    <div className="w-[45%] flex flex-col justify-center h-full max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
      <div className="space-y-5">
        {data?.genreStats?.map((entry, index) => (
          <div key={index} className="group">
            <div className="flex justify-between items-end mb-1.5">
              <div className="flex items-center gap-2.5">
                {/* Visual Dot */}
                <div 
                  className="w-1.5 h-1.5 rounded-full ring-4 ring-opacity-10" 
                  style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 0 4px ${COLORS[index % COLORS.length]}1A` }}
                ></div>
                {/* Genre Name - Smaller and cleaner */}
                <span className="text-[11px] font-bold text-[#2C1E12] leading-none uppercase tracking-wider">
                  {entry.genre}
                </span>
              </div>
              {/* Count - Bold and small */}
              <span className="text-[10px] font-black text-[#8B735B] leading-none">
                {entry.count} VOLS
              </span>
            </div>
            
            {/* Progress Bar - Thinner for precision */}
            <div className="w-full bg-[#F5EFE6] rounded-full h-[3px] overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${(entry.count / (data?.totalBooks || 1)) * 100}%`,
                  backgroundColor: COLORS[index % COLORS.length] 
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

          {/* BOX 2: ACQUISITION FLOW */}
          <div className="bg-white border border-[#E3D5C3] rounded-[32px] p-8 flex flex-col h-[520px]">
            <div className="mb-8">
              <h2 className="text-xl font-extrabold text-[#2C1E12]">Acquisition Flow</h2>
              <p className="text-xs text-gray-400 mt-1">Historical velocity of manuscripts added</p>
            </div>
            
            <div className="flex-grow w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5B4636" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#5B4636" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EAE2" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#8B735B', fontSize: 12, fontWeight: 600}} 
                    dy={10} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#8B735B', fontSize: 12}} />
                  <Tooltip 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="booksAdded" 
                    stroke="#5B4636" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- 4. SCHOLARLY MILESTONES (FULL WIDTH) --- */}
        <div className="mt-8 bg-white border border-[#E3D5C3] rounded-[32px] p-8">
          <div className="flex items-center gap-2 mb-8">
            <HistoryEdu className="text-[#5B4636]" />
            <h2 className="text-xl font-extrabold text-[#2C1E12]">Scholarly Milestones</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#FCF9F5] border border-[#E3D5C3] rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-[#E3D5C3] rounded-full flex items-center justify-center">
                  <Stars className="text-[#D6C2A3] scale-90" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2C1E12]">Curator Milestone</p>
                  <p className="text-[10px] text-gray-400">Achieved Dec 2025</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;



