import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import Navbar from "../components/navbar";

const MainPage = () => {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />
      <div className="pt-20 p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to the Baseball Manager</h1>
        
        {!user && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-center mb-4">Sign in or create an account to access all features</p>
            <div className="flex justify-center gap-4">
              <Link
                to="/signin"
                className="px-6 py-3 bg-blue-500 text-white text-center rounded shadow hover:bg-blue-600 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 bg-green-500 text-white text-center rounded shadow hover:bg-green-600 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/walkup"
            className="block p-6 bg-blue-500 text-white text-center rounded shadow hover:bg-blue-600 transition"
          >
            Walk-Up Songs
          </Link>
          <Link
            to="/sound-effects"
            className="block p-6 bg-yellow-500 text-white text-center rounded shadow hover:bg-yellow-600 transition"
          >
            Sound Effects
          </Link>
          <Link
            to="/documentation"
            className="block p-6 bg-purple-600 text-white text-center rounded shadow hover:bg-purple-700 transition"
          >
            Documentation
          </Link>
          
          {/* Protected routes - only shown when logged in */}
          {user && (
            <>
              <Link
                to="/player-manager"
                className="block p-6 bg-green-500 text-white text-center rounded shadow hover:bg-green-600 transition"
              >
                Player Manager
              </Link>
              <Link
                to="/edit-sound-effects"
                className="block p-6 bg-red-500 text-white text-center rounded shadow hover:bg-red-600 transition"
              >
                Edit Sound Effects
              </Link>
            </>
          )}
        </div>
        
        {user && (
          <div className="mt-8 text-center text-gray-600">
            <p>Logged in as: {user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
