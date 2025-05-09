import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PlayerManager from "../app/walkup/playerManager";
import { MemoryRouter } from "react-router-dom";

// Mock supabase client
const mockSelect = jest.fn(() =>
  Promise.resolve({
    data: [
      {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        nickname: "JD",
        jersey_number: 42,
        batting_number: 7,
        position: "Catcher",
        walk_up_song: "",
        walk_up_song_start: "",
        home_run_song: "",
        home_run_song_start: "",
        pitching_walk_up_song: "",
        pitching_walk_up_song_start: "",
        nationality: "US",
      },
    ],
    error: null,
  })
);
const mockInsert = jest.fn(() =>
  Promise.resolve({ data: [{ id: 2 }], error: null })
);

jest.mock("../app/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
    })),
  },
}));

// Mock Navbar to avoid unrelated errors
jest.mock("../app/components/navbar", () => () => <nav>Navbar</nav>);

describe("PlayerManager", () => {
  beforeEach(() => {
    mockSelect.mockClear();
    mockInsert.mockClear();
  });

  it("renders player list from supabase", async () => {
    render(
      <MemoryRouter>
        <PlayerManager />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/John "JD" Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Jersey Number: 42/i)).toBeInTheDocument();
      expect(screen.getByText(/Position: Catcher/i)).toBeInTheDocument();
      expect(screen.getByText(/Nationality: US/i)).toBeInTheDocument();
      expect(screen.getByText(/Edit/i)).toBeInTheDocument();
    });
  });

  it("submits the form and adds a player", async () => {
    render(
      <MemoryRouter>
        <PlayerManager />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: "Jane" } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: "Smith" } });
    fireEvent.change(screen.getByPlaceholderText(/Nickname/i), { target: { value: "Smitty" } });
    fireEvent.change(screen.getByPlaceholderText(/Jersey Number/i), { target: { value: "99" } });
    fireEvent.change(screen.getByPlaceholderText(/Batting Number/i), { target: { value: "5" } });

    // Use getAllByPlaceholderText to select the correct input
    fireEvent.change(screen.getAllByPlaceholderText(/Walk-Up Song \(YouTube URL\)/i)[0], { target: { value: "" } });
    fireEvent.change(screen.getAllByPlaceholderText(/Walk-Up Song Start Time \(seconds\)/i)[0], { target: { value: "" } });
    fireEvent.change(screen.getAllByPlaceholderText(/Walk-Up Song Start Time \(seconds\)/i)[1], { target: { value: "" } });
    fireEvent.change(screen.getByPlaceholderText(/Home Run Song \(YouTube URL\)/i), { target: { value: "" } });
    fireEvent.change(screen.getByPlaceholderText(/Home Run Song Start Time \(seconds\)/i), { target: { value: "" } });
    fireEvent.change(screen.getAllByPlaceholderText(/Pitching Walk-Up Song \(YouTube URL\)/i)[0], { target: { value: "" } });
    fireEvent.change(screen.getByPlaceholderText(/Pitching Walk-Up Song Start Time \(seconds\)/i), { target: { value: "" } });

    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "Catcher" } });
    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: "US" } });

    fireEvent.click(screen.getByRole("button", { name: /Add Player/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
    });
  });
});