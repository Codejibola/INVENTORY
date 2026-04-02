import { useState, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, FastForward, Gauge } from "lucide-react";

export default function Demo() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const skipForward = () => {
    if (videoRef.current) videoRef.current.currentTime += 10;
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackRate(nextSpeed);
  };

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        className="w-full max-h-[70vh]"
        playsInline
        preload="metadata"
      >
        {/* This looks specifically in the 'public' folder */}
        <source src="/guide.mp4" type="video/mp4" />
      </video>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 left-4 flex gap-4 bg-black/50 p-2 rounded-lg">
        <button onClick={togglePlay} className="text-white">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button onClick={skipForward} className="text-white flex items-center gap-1">
          <FastForward size={18} /> 10s
        </button>
        <button onClick={cycleSpeed} className="text-white font-bold">
          {playbackRate}x
        </button>
      </div>
    </div>
  );
}