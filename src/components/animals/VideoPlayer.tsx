import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { PlayCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  posterImage?: string;
  title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, posterImage, title }) => {
  const { theme } = useTheme();
  const isDark = theme === 'design7';

  return (
    <div className="pt-1">
      <div className="flex items-center gap-2 mb-2.5">
        <PlayCircle className={`w-4 h-4 ${isDark ? 'text-[#C58A3A]' : 'text-[#B8792F]'}`} />
        <h3 className={`font-serif font-bold text-sm sm:text-base ${isDark ? 'text-[#F4E8D0]' : 'text-[#2A1A0D]'}`}>
          Live Animal Video Preview
        </h3>
      </div>

      <div className="relative aspect-video max-h-[300px] rounded-2xl overflow-hidden bg-black border border-stone-800 shadow-inner">
        <video
          controls
          preload="metadata"
          poster={posterImage}
          className="w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <p className={`mt-2 text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-[#D8C5A8]/70' : 'text-[#746556]/80'}`}>
        Real unedited video footage of {title} showing movement, stature, and natural behavior.
      </p>
    </div>
  );
};
