import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import { supabase } from "../supabaseClient";

const SoundEffects = () => {
  const [soundEffects, setSoundEffects] = useState([]);

  useEffect(() => {
    const fetchSoundEffects = async () => {
      const { data, error } = await supabase.from("sound_effects").select("*");
      if (error) {
        console.error("Error fetching sound effects:", error);
      } else {
        setSoundEffects(data);
      }
    };

    fetchSoundEffects();
  }, []);

  const playSound = (src) => {
    const audio = new Audio(src);
    audio.play();
  };

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: "6.5rem" }} className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Sound Effects</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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