import React from 'react';
import { Play, Sparkles, Compass, MapPin, Eye } from 'lucide-react';

interface VideoPlaceholderSectionProps {
  onStartQuest: () => void;
}

export const VideoPlaceholderSection: React.FC<VideoPlaceholderSectionProps> = ({
  onStartQuest,
}) => {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-900/90 shadow-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Real-World Cinematic Trailer</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
            Your Next Adventure Starts Here
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            From the 19th-century coral Roshan courtyards of Al-Balad to specialty roasters on the Red Sea Corniche.
          </p>
        </div>

        <button
          onClick={onStartQuest}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer self-start sm:self-auto"
        >
          Begin Quest
        </button>
      </div>

      {/* Video Frame Placeholder */}
      <div className="relative w-full aspect-video sm:aspect-[21/9] rounded-2xl overflow-hidden border border-slate-700/60 bg-gradient-to-br from-slate-900 via-[#132238] to-[#0c1322] flex items-center justify-center group shadow-inner">
        {/* Subtle decorative grid/vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]" />

        {/* Ambient Overlay Content */}
        <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-4 max-w-md">
          {/* Glowing Play Circle */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-xl shadow-amber-500/25 group-hover:scale-105 transition duration-300">
            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-amber-400 text-amber-400 ml-1" />
          </div>

          <div>
            <div className="text-sm sm:text-base font-extrabold text-white">
              Watch The Jeddah Side Quest Teaser
            </div>
            <div className="text-xs text-slate-400 mt-1 font-tajawal">
              شاهد المقطع التشويقي لمغامرات جدة الحقيقية
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 bg-slate-950/60 px-3.5 py-1.5 rounded-full border border-slate-800">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              Real Locations
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              AI Photo Proof
            </span>
            <span>•</span>
            <span className="text-amber-300 font-bold">1:45 4K UHD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
