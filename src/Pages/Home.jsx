import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AddCircleOutline,
  AutoStories,
  CollectionsBookmark,
  ArrowForward,
  AutoAwesome,
  MenuBook,
  EmojiEvents,
  TrendingUp,
} from "@mui/icons-material"; // Keeping icons, but layout is pure Tailwind
import { jwtDecode } from "jwt-decode";
import BookFormModal from "../Components/BookFormModal";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();
  const [openBookModal, setOpenBookModal] = useState(false);

  const token = localStorage.getItem("token");
  let loggedInUser = { username: "Guest" };

  if (token) {
    try {
      const decoded = jwtDecode(token);
      loggedInUser = { username: decoded.username || "Reader" };
    } catch (e) {
      console.error("Token error");
    }
  }

  return (
    <div className="bg-[#FCF9F5] min-h-screen pb-20 overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative bg-[#2C1E12] text-white pt-24 pb-40 px-6 rounded-b-[60px] md:rounded-b-[100px] overflow-hidden">
        {/* Subtle Decorative Background Element */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#5B4636] rounded-full blur-[120px] opacity-40"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#D6C2A3] uppercase tracking-[0.4em] text-xs font-bold">
              Greetings, {loggedInUser.username}
            </span>
            <h1 className="font-serif text-5xl md:text-8xl mt-4 mb-8 leading-tight">
              The Sanctuary <br /> of <span className="italic text-[#D6C2A3]">Thought.</span>
            </h1>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <button 
                onClick={() => setOpenBookModal(true)}
                className="bg-[#D6C2A3] text-[#2C1E12] px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white transition-all shadow-xl hover:scale-105"
              >
                <AddCircleOutline className="scale-90" />
                Log New Manuscript
              </button>
              <button 
                onClick={() => navigate("/MyBooks")}
                className="border border-white/20 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
              >
                Browse Collection
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- DASHBOARD BENTO GRID --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main Action: My Archives (Large Card) */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => navigate("/MyBooks")}
            className="md:col-span-8 bg-white border border-[#E3D5C3] rounded-[40px] p-10 cursor-pointer shadow-sm flex flex-col justify-between group h-[350px] z-100"
          >
            <div className="flex justify-between items-start">
              <div className="p-4 bg-[#F5EFE6] rounded-2xl text-[#5B4636]">
                <CollectionsBookmark fontSize="large" />
              </div>
              <div className="w-12 h-12 rounded-full border border-[#E3D5C3] flex items-center justify-center group-hover:bg-[#2C1E12] group-hover:text-white transition-all">
                <ArrowForward />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-serif font-bold text-[#2C1E12]">The Archives</h2>
              <p className="text-gray-500 mt-2 max-w-md">Your complete curated history of literature, sorted and preserved for your convenience.</p>
            </div>
          </motion.div>

          {/* Secondary: Analytics (Tall Card) */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => navigate("/analytics")}
            className="md:col-span-4 bg-[#5B4636] rounded-[40px] p-10 cursor-pointer shadow-lg flex flex-col justify-between text-white h-[350px] z-100"
          >
            <div className="flex justify-between items-start">
              <div className="p-4 bg-white/10 rounded-2xl text-[#D6C2A3]">
                <TrendingUp fontSize="large" />
              </div>
              <ArrowForward />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold">Insights</h2>
              <p className="text-white/70 mt-2">Visualize your reading velocity and genre preferences.</p>
            </div>
          </motion.div>

          {/* Bottom Card: Discover (Wide) */}
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => navigate("/explore")}
            className="md:col-span-4 bg-white border border-[#E3D5C3] rounded-[40px] p-8 cursor-pointer flex flex-col justify-between h-[300px]"
          >
            <div className="flex justify-between items-start">
              <div className="p-4 bg-[#F5EFE6] rounded-2xl text-[#5B4636]">
                <AutoAwesome fontSize="large" />
              </div>
              <ArrowForward className="text-gray-300" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#2C1E12]">Discover</h3>
              <p className="text-sm text-gray-400 mt-1">Recommendations tailored to your library.</p>
            </div>
          </motion.div>

          {/* NEW CONTENT: Reading Goal Widget (Full Row Height) */}
          <div className="md:col-span-8 bg-white border border-[#E3D5C3] rounded-[40px] p-8 flex flex-col md:flex-row items-center gap-10 h-[300px]">
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Custom SVG Circular Progress */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#F5EFE6" strokeWidth="12" fill="transparent" />
                <circle cx="80" cy="80" r="70" stroke="#5B4636" strokeWidth="12" fill="transparent" 
                        strokeDasharray="440" strokeDashoffset="120" strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold">12/20</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Books</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <EmojiEvents className="text-[#D6C2A3]" />
                <h3 className="text-xl font-bold uppercase tracking-wider text-[#2C1E12]">2025 Reading Goal</h3>
              </div>
              <p className="text-gray-500 mb-6">You are 60% through your goal. At this rate, you will finish by September!</p>
              <button className="bg-[#2C1E12] text-white px-6 py-2 rounded-full text-sm font-bold hover:opacity-90">
                Adjust Goal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- RECENT ACTIVITY SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="flex items-center gap-3 mb-8">
           <MenuBook className="text-[#5B4636]" />
           <h2 className="text-2xl font-serif font-bold text-[#2C1E12]">Currently Engaging</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[1, 2, 3].map((item) => (
             <div key={item} className="flex gap-4 p-4 hover:bg-white rounded-3xl transition-all cursor-pointer border border-transparent hover:border-[#E3D5C3]">
                <div className="w-20 h-28 bg-[#D6C2A3] rounded-lg shadow-md flex-shrink-0"></div>
                <div className="flex flex-col justify-center">
                   <h4 className="font-bold text-[#2C1E12]">The Great Gatsby</h4>
                   <p className="text-xs text-gray-400 mb-2">F. Scott Fitzgerald</p>
                   <div className="w-full bg-[#F5EFE6] h-1 rounded-full overflow-hidden">
                      <div className="bg-[#5B4636] h-full w-[45%]"></div>
                   </div>
                   <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">45% Read</span>
                </div>
             </div>
           ))}
        </div>
      </div>

      <BookFormModal
        open={openBookModal}
        onClose={() => setOpenBookModal(false)}
        mode="add"
      />
    </div>
  );
};

export default Home;
