import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white p-4 fixed top-0 left-0 w-full z-50 shadow-md h-16">
      <div className="container mx-auto flex justify-between items-center h-full">
        {/* Logo */}
        <h1 className="text-xl font-bold">Baseball Manager</h1>

        {/* Hamburger Menu for Mobile */}
        <button
          className="block md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-2xl">☰</span>
        </button>

        {/* Links */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } md:flex md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-gray-800 md:bg-transparent md:shadow-none shadow-lg`}
        >
          <Link
            to="/"
            className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/walkup"
            className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
            onClick={() => setIsOpen(false)}
          >
            Walk-Up Songs
          </Link>
          <Link
            to="/player-manager"
            className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
            onClick={() => setIsOpen(false)}
          >
            Player Manager
          </Link>
          <Link
            to="/sound-effects"
            className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
            onClick={() => setIsOpen(false)}
          >
            Sound Effects
          </Link>
          <Link
            to="/edit-sound-effects"
            className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
            onClick={() => setIsOpen(false)}
          >
            Edit Sound Effects
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;