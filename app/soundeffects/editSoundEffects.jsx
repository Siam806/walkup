import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import { supabase } from "../supabaseClient";

const EditSoundEffects = () => {
  const [form, setForm] = useState({ id: null, label: "", src: "" });
  const [soundEffects, setSoundEffects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSoundEffects();
  }, []);

  const fetchSoundEffects = async () => {
    const { data, error } = await supabase.from("sound_effects").select("*");
    if (error) {
      console.error("Error fetching sound effects:", error);
    } else {
      setSoundEffects(data);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.label || !form.src) {
      alert("Please fill in both fields.");
      return;
    }

    if (isEditing) {
      const { error } = await supabase
        .from("sound_effects")
        .update({ label: form.label, src: form.src })
        .eq("id", form.id);

      if (error) {
        console.error("Error updating sound effect:", error);
      } else {
        alert("Sound effect updated!");
        setIsEditing(false);
        setForm({ id: null, label: "", src: "" });
        fetchSoundEffects();
      }
    } else {
      const { data, error } = await supabase.from("sound_effects").insert([{
        label: form.label,
        src: form.src,
      }]);

      if (error) {
        console.error("Error adding sound effect:", error);
        alert("Failed to add sound.");
      } else {
        setForm({ id: null, label: "", src: "" });
        fetchSoundEffects();
      }
    }
  };

  const handleEdit = (effect) => {
    setForm(effect);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setForm({ id: null, label: "", src: "" });
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("sound_effects").delete().eq("id", id);
    if (error) {
      console.error("Error deleting sound effect:", error);
    } else {
      fetchSoundEffects();
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: "6.5rem" }} className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Manage Sound Effects</h1>

        <form onSubmit={handleSubmit} className="mb-6">
          <input
            type="text"
            name="label"
            value={form.label}
            onChange={handleChange}
            placeholder="Label"
            className="p-2 border rounded mr-2"
          />
          <input
            type="text"
            name="src"
            value={form.src}
            onChange={handleChange}
            placeholder="MP3 URL"
            className="p-2 border rounded mr-2"
          />
          <button
            type="submit"
            className={`px-4 py-2 text-white rounded ${
              isEditing ? "bg-green-600" : "bg-blue-500"
            }`}
          >
            {isEditing ? "Update" : "Add"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="ml-2 px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
          )}
        </form>

        <ul className="space-y-4">
          {soundEffects.map((effect) => (
            <li key={effect.id} className="border p-4 rounded">
              <h2 className="font-bold">{effect.label}</h2>
              <p className="text-sm text-gray-600 truncate max-w-full overflow-hidden">
                {effect.src}
              </p>
              <audio controls className="my-2">
                <source src={effect.src} type="audio/mpeg" />
              </audio>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(effect)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(effect.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EditSoundEffects;
