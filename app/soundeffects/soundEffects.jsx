import React from "react";
import Navbar from "../components/navbar";

const soundEffects = [
  { id: "triple", label: "Triple", src: "/app/soundeffects/sounds/triple.mp3" },
  { id: "strikeout", label: "Strikeout", src: "/app/soundeffects/sounds/strikeout.mp3" },
  { id: "walk", label: "Walk", src: "/app/soundeffects/sounds/walk.mp3" },
  { id: "error", label: "Error", src: "/app/soundeffects/sounds/error.mp3" },
  { id: "hit_by_pitch", label: "Hit by Pitch", src: "/app/soundeffects/sounds/hit_by_pitch.mp3" },
  {id: "single", label: "Single", src: "/app/soundeffects/sounds/single.mp3"},
  {id: "double", label: "Double", src: "/app/soundeffects/sounds/double.mp3"},
  {id: "run_scored", label: "Run Scored", src: "/app/soundeffects/sounds/run_scored.mp3"},
  {id: "steal_base", label: "Steal Base", src: "/app/soundeffects/sounds/steal_base.mp3"},
  {id: "siren", label: "Siren", src: "/app/soundeffects/sounds/siren.mp3"},
  {id: "pitching_change", label: "Pitching Change", src: "/app/soundeffects/sounds/pitching_change.mp3"},
];

const SoundEffects = () => {
  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play();
  };

  return (
    <div>
        <Navbar />
    
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Sound Effects</h1>
      <div className="grid grid-cols-2 gap-4">
        {soundEffects.map((effect) => (
          <button
            key={effect.id}
            onClick={() => playSound(effect.src)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {effect.label}
          </button>
        ))}
      </div>
    </div>
    </div>
  );
};

export default SoundEffects;