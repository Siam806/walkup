import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SoundEffects from "../app/soundeffects/soundEffects";

// Mock supabase client
const mockSelect = jest.fn(() =>
  Promise.resolve({
    data: [
      { id: 1, label: "Clap", src: "clap.mp3" },
      { id: 2, label: "Boo", src: "boo.mp3" },
    ],
    error: null,
  })
);

jest.mock("../app/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
    })),
  },
}));

// Mock Navbar to avoid unrelated errors
jest.mock("../app/components/navbar", () => () => <nav>Navbar</nav>);

describe("SoundEffects", () => {
  beforeEach(() => {
    mockSelect.mockClear();
  });

  it("renders sound effect buttons from supabase", async () => {
    render(<SoundEffects />);
    await waitFor(() => {
      expect(screen.getByText("Clap")).toBeInTheDocument();
      expect(screen.getByText("Boo")).toBeInTheDocument();
    });
  });

  it("plays sound when a button is clicked", async () => {
    // Mock Audio
    const playMock = jest.fn();
    window.Audio = jest.fn(() => ({
      play: playMock,
    }));

    render(<SoundEffects />);
    await waitFor(() => {
      expect(screen.getByText("Clap")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Clap"));
    expect(playMock).toHaveBeenCalled();
  });
});