import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from './AuthProvider';
import { useTeam } from './TeamProvider';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { teams, currentTeam, switchTeam, isAdmin, isCoach } = useTeam();

  // Safe navigate with fallback for SSR/contexts without Router
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    navigate = (to) => {
      if (typeof window !== "undefined") {
        window.location.href = to;
      }
    };
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  // SafeLink component that falls back to <a> when Link context isn't available
  const SafeLink = ({ to, children, className, onClick }) => {
    try {
      return (
        <Link to={to} className={className} onClick={onClick}>
          {children}
        </Link>
      );
    } catch (e) {
      return (
        <a href={to} className={className} onClick={onClick}>
          {children}
        </a>
      );
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4 fixed top-0 left-0 w-full z-50 shadow-md h-16">
      <div className="container mx-auto flex justify-between items-center h-full">
        {/* Logo + Team Name */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Baseball Manager</h1>
          {currentTeam && (
            <div className="relative">
              <button
                onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                className="text-sm bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 flex items-center gap-1 max-w-[140px] truncate"
              >
                <span className="truncate">{currentTeam.name}</span>
                {teams.length > 1 && <span className="text-xs">▾</span>}
              </button>
              {/* Team dropdown */}
              {teamDropdownOpen && teams.length > 1 && (
                <div className="absolute top-full left-0 mt-1 bg-gray-700 rounded shadow-lg py-1 min-w-[160px] z-50">
                  {teams.map((t) => (
                    <button
                      key={t.team_id}
                      onClick={() => {
                        switchTeam(t.team_id);
                        setTeamDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-600 ${
                        t.team_id === currentTeam.id ? "bg-gray-600 font-medium" : ""
                      }`}
                    >
                      {t.team_name}
                      <span className="text-xs text-gray-400 ml-1 capitalize">({t.role})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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
          {/* Public Links - Always Visible */}
          <SafeLink
            to="/"
            className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
            onClick={() => setIsOpen(false)}
          >
            Home
          </SafeLink>
          <SafeLink
            to="/walkup"
            className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
            onClick={() => setIsOpen(false)}
          >
            Walk-Up Songs
          </SafeLink>
          <SafeLink
            to="/sound-effects"
            className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
            onClick={() => setIsOpen(false)}
          >
            Sound Effects
          </SafeLink>
          <SafeLink
            to="/documentation"
            className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
            onClick={() => setIsOpen(false)}
          >
            Documentation
          </SafeLink>
          <SafeLink
            to="/field-layout"
            className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
            onClick={() => setIsOpen(false)}
          >
            Field Layout
          </SafeLink>

          {/* Protected Links - Only Visible When Authenticated */}
          {user && (
            <>
              <SafeLink
                to="/player-manager"
                className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
                onClick={() => setIsOpen(false)}
              >
                Player Manager
              </SafeLink>

              {(isAdmin || isCoach) && (
                <SafeLink
                  to="/edit-sound-effects"
                  className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
                  onClick={() => setIsOpen(false)}
                >
                  Edit Sound Effects
                </SafeLink>
              )}

              {isAdmin && (
                <SafeLink
                  to="/team-management"
                  className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
                  onClick={() => setIsOpen(false)}
                >
                  Team Settings
                </SafeLink>
              )}
            </>
          )}

          {/* Authentication Links */}
          {user ? (
            <button
              onClick={handleSignOut}
              className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent text-left w-full md:w-auto"
            >
              Sign Out ({user.email})
            </button>
          ) : (
            <>
              <SafeLink
                to="/signin"
                className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
                onClick={() => setIsOpen(false)}
              >
                Sign In
              </SafeLink>

              <SafeLink
                to="/signup"
                className="block md:inline px-4 py-2 md:p-0 hover:bg-gray-700 md:hover:bg-transparent"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </SafeLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;