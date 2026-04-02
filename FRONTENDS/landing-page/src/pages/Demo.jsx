/* eslint-disable no-unused-vars */
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; 
import { Play, Pause, RotateCcw, Volume2, VolumeX, FastForward, Gauge } from "lucide-react";
import Quantora_guide from "../assets/Quantora video guide.mp4";

export default function Demo() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
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

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const restartVideo = () => {
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const skipForward = () => {
    videoRef.current.currentTime += 10;
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackRate(nextSpeed);
  };

  return (
    <section id="demo" className="py-12 bg-zinc-950 text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <header className="text-center mb-10">
          <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.3em] mb-2">Platform Tour</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight">
            See Quantora <br /> 
            <span className="italic text-blue-400">in action.</span>
          </h3>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            Watch how easy it is to register, manage your products, and track your shop's growth in real-time.
          </p>
        </header>

        {/* Video Player Container */}
        <div className="relative group max-w-4xl mx-auto">
          <div className="absolute -inset-1 bg-blue-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative bg-zinc-900/50 rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full max-h-[70vh] object-contain mx-auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              playsInline
            >
              <source src={Quantora_guide} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Big Play Button Overlay */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-10"
                >
                  <button
                    onClick={togglePlay}
                    className="p-6 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/40 hover:scale-110 transition-transform"
                  >
                    <Play size={32} className="ml-1" fill="currentColor" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Minimalist Bottom Controls */}
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="flex items-center gap-5">
                <button onClick={togglePlay} className="text-white/80 hover:text-white transition-colors">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <button onClick={restartVideo} className="text-white/80 hover:text-white transition-colors" title="Restart">
                  <RotateCcw size={18} />
                </button>

                <button onClick={skipForward} className="text-white/80 hover:text-white transition-colors flex items-center gap-1" title="Forward 10s">
                  <FastForward size={18} />
                  <span className="text-[10px] font-black">10s</span>
                </button>

                <button onClick={cycleSpeed} className="text-white/80 hover:text-blue-400 transition-colors flex items-center gap-1.5" title="Playback Speed">
                  <Gauge size={18} />
                  <span className="text-[10px] font-black w-8 text-left">{playbackRate}x</span>
                </button>

                <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors">
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
              
              <div className="hidden sm:block text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                Quantora Guide
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Below Video */}
        <div className="mt-12 text-center">
          <a 
            href="https://quantora.online" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-zinc-100 text-zinc-950 px-8 py-3 rounded-full font-bold hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            Start Your Own Shop Now
          </a>
        </div>
      </div>
    </section>
  );
}