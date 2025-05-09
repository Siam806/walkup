import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../app/walkup/walkup";

// Mock data
const MOCK_PLAYER = {
  id: 1,
  first_name: "John",
  last_name: "Doe",
  nickname: "JD",
  jersey_number: 42,
  batting_number: 1,
  position: "Catcher",
  walk_up_song: "https://youtube.com/abc",
  walk_up_song_start: 10,
  home_run_song: "https://youtube.com/def",
  home_run_song_start: 20,
  pitching_walk_up_song: "https://youtube.com/ghi",
  pitching_walk_up_song_start: 30,
  nationality: "US",
};

// Mock supabase client - make sure the implementation matches your component
jest.mock("../app/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() =>
          Promise.resolve({
            data: [MOCK_PLAYER],
            error: null,
          })
        ),
      })),
    })),
  },
}));

// More robust YouTube player mock
jest.mock("../app/components/SharedYouTubePlayer", () => {
  const MockYouTubePlayer = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      pauseVideo: jest.fn(),
      playVideo: jest.fn(),
      seekTo: jest.fn(),
      getVolume: jest.fn(() => 100),
      setVolume: jest.fn(),
    }));
    return <div data-testid="yt-player">{props.videoId || "no-video"}</div>;
  });
  return MockYouTubePlayer;
});

// Mock Navbar
jest.mock("../app/components/navbar", () => () => <nav>Navbar</nav>);

// Mock extractVideoId utility
jest.mock("../app/utils", () => ({
  extractVideoId: jest.fn(url => url ? url.split("/").pop() : ""),
}));

describe("Walkup", () => {
  // More robust localStorage mock
  beforeEach(() => {
    // Clear any previous mocks
    jest.clearAllMocks();
    
    // Set player 1 as active in localStorage
    const mockLocalStorage = {
      'walkup-inGamePlayers': JSON.stringify([1]),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(key => mockLocalStorage[key] || null),
        setItem: jest.fn((key, value) => { mockLocalStorage[key] = value.toString(); }),
        removeItem: jest.fn(key => { delete mockLocalStorage[key]; }),
        clear: jest.fn(() => { mockLocalStorage = {}; }),
      },
      configurable: true,
      writable: true
    });
    
    // Mock responsiveVoice
    window.responsiveVoice = {
      speak: jest.fn((text, voice, opts) => {
        if (opts && typeof opts.onend === 'function') {
          setTimeout(opts.onend, 10);
        }
        return true;
      }),
    };
  });

  // Basic rendering test
  it("renders Navbar and team title", async () => {
    render(<App />);
    expect(screen.getByText(/Navbar/i)).toBeInTheDocument();
    
    // Give it time to render the title
    await waitFor(() => {
      expect(screen.getByText(/Team Walk-Up Songs/i)).toBeInTheDocument();
    });
  });

  it("shows active player and action buttons when data loads", async () => {
    render(<App />);
    
    // Wait longer for the player to appear
    await waitFor(() => {
      expect(screen.getByText(/John/i)).toBeInTheDocument();
      expect(screen.getByText(/Doe/i)).toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Use more flexible text matching for buttons
    await waitFor(() => {
      expect(screen.getByText(/Play Walk-Up Song/i)).toBeInTheDocument();
      expect(screen.getByText(/Play Home Run Song/i)).toBeInTheDocument();
      expect(screen.getByText(/Play Pitching Walk-Up Song/i)).toBeInTheDocument();
      expect(screen.getByText(/Announce Player/i)).toBeInTheDocument();
      expect(screen.getByText(/Intro: Announce/i)).toBeInTheDocument();
      expect(screen.getByText(/Move to End/i)).toBeInTheDocument();
    });
  });

  it("calls handlePlay when Play Walk-Up Song is clicked", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Play Walk-Up Song/i)).toBeInTheDocument();
    }, { timeout: 2000 });
    
    fireEvent.click(screen.getByText(/Play Walk-Up Song/i));
    
    // The YouTube player should appear when handlePlay is called
    await waitFor(() => {
      // Look for the player in a less strict way
      const ytPlayer = screen.getByTestId("yt-player");
      expect(ytPlayer).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("calls responsiveVoice.speak when Announce Player is clicked", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Announce Player/i)).toBeInTheDocument();
    }, { timeout: 2000 });
    
    fireEvent.click(screen.getByText(/Announce Player/i));
    
    expect(window.responsiveVoice.speak).toHaveBeenCalled();
  });
});