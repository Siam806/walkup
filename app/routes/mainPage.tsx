import React from "react";
import { Link } from "react-router-dom";

const MainPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Baseball Manager</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/walkup"
          className="block p-6 bg-blue-500 text-white text-center rounded shadow hover:bg-blue-600"
        >
          Walk-Up Songs
        </Link>
        <Link
          to="/player-manager"
          className="block p-6 bg-green-500 text-white text-center rounded shadow hover:bg-green-600"
        >
          Player Manager
        </Link>
        <Link
          to="/sound-effects"
          className="block p-6 bg-yellow-500 text-white text-center rounded shadow hover:bg-yellow-600"
        >
          Sound Effects
        </Link>
        <Link
        to="/edit-sound-effects"
        className="block p-6 bg-red-500 text-white text-center rounded shadow hover:bg-red-600"
        >
          Edit Sound Effects
        </Link>
      </div>
      <script src="https://code.responsivevoice.org/responsivevoice.js?key=LPheIFLY"></script>
    </div>
    
  );
};

export default MainPage;