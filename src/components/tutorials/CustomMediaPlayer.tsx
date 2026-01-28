import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, FastForward, Rewind
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface CustomMediaPlayerProps {
  src: string;
  poster?: string;
  type: 'video' | 'audio';
  className?: string;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' + secs : secs}`;
};

const CustomMediaPlayer = ({ src, poster, type, className }: CustomMediaPlayerProps) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);

  let controlsTimeout: NodeJS.Timeout;

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const updateProgress = () => {
      setCurrentTime(media.currentTime);
      setProgress((media.currentTime / media.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(media.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    media.addEventListener('timeupdate', updateProgress);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', updateProgress);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (mediaRef.current) {
      const newTime = (value[0] / 100) * duration;
      mediaRef.current.currentTime = newTime;
      setProgress(value[0]);
    }
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (mediaRef.current) {
      const newVolume = value[0];
      mediaRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (mediaRef.current) {
      mediaRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout);
    if (isPlaying) {
      controlsTimeout = setTimeout(() => setShowControls(false), 2000);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group bg-black overflow-hidden flex flex-col justify-center",
        type === 'audio' ? "h-32 bg-[#2D1B4E]" : "aspect-video",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Media Element */}
      {type === 'video' ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={src}
          poster={poster}
          className="w-full h-full object-contain"
          onClick={togglePlay}
        />
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={src}
        />
      )}

      {/* Audio Visualizer Placeholder (if audio) */}
      {type === 'audio' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
           <div className="flex items-end gap-1 h-16">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={cn("w-2 bg-white rounded-t-sm transition-all duration-100", isPlaying ? "animate-pulse" : "")}
                  style={{
                    height: isPlaying ? `${Math.random() * 100}%` : '20%',
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
           </div>
        </div>
      )}

      {/* Play Overlay (Big Button) */}
      {!isPlaying && type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-[#6E5494] transition-all hover:scale-110 group/btn"
          >
            <Play size={40} className="text-white ml-2 fill-current" />
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 z-20",
        showControls || !isPlaying ? "opacity-100" : "opacity-0"
      )}>
        {/* Progress Slider */}
        <div className="mb-4 relative group/slider">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-purple-400 transition-colors">
              {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
            </button>

            <div className="group/vol relative flex items-center gap-2">
              <button onClick={toggleMute} className="hover:text-purple-400 transition-colors">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300">
                 <Slider
                   value={[isMuted ? 0 : volume]}
                   max={1}
                   step={0.01}
                   onValueChange={handleVolumeChange}
                   className="w-24"
                 />
              </div>
            </div>

            <span className="text-xs font-mono opacity-80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover:text-purple-400 transition-colors flex items-center gap-1 text-xs font-bold">
                  {playbackRate}x
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-white/20 text-white">
                {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                  <DropdownMenuItem
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className="focus:bg-purple-600 focus:text-white cursor-pointer"
                  >
                    {rate}x
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {type === 'video' && (
              <button onClick={toggleFullscreen} className="hover:text-purple-400 transition-colors">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomMediaPlayer;
