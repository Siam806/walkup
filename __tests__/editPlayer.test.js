import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditPlayer from "../app/walkup/editPlayer";
import { MemoryRouter } from "react-router-dom";

// --- Supabase Mocks ---
const mockSingle = jest.fn(() =>
  Promise.resolve({
    data: {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      nickname: "JD",
      jersey_number: 42,
      batting_number: 7,
      position: "Catcher",
      walk_up_song: "https://youtube.com/abc",
      walk_up_song_start: 10,
      home_run_song: "https://youtube.com/def",
      home_run_song_start: 20,
      pitching_walk_up_song: "https://youtube.com/ghi",
      pitching_walk_up_song_start: 30,
    },
    error: null,
  })
);

const mockEq = jest.fn(() => ({
  single: mockSingle,
}));

const mockSelect = jest.fn(() => ({
  eq: mockEq,
}));
const mockUpdate = jest.fn(() => ({
  eq: jest.fn(() =>
    Promise.resolve({ data: [{ id: 1 }], error: null })
  ),
}));

jest.mock("../app/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
    })),
  },
}));

// Mock Navbar to avoid unrelated errors
jest.mock("../app/components/navbar", () => () => <nav>Navbar</nav>);

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 1 }),
  };
});

describe("EditPlayer", () => {
  beforeEach(() => {
    mockSelect.mockClear();
    mockUpdate.mockClear();
    mockEq.mockClear();
    mockNavigate.mockClear();
  });

  it("renders loading, then player form with fetched data", async () => {
    render(
      <MemoryRouter>
        <EditPlayer />
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading player data/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("JD")).toBeInTheDocument();
    });
  });

  it("shows error if fetch fails", async () => {
    mockEq.mockImplementationOnce(() => ({
      single: () => Promise.resolve({ data: null, error: { message: "Not found" } })
    }));
    render(
      <MemoryRouter>
        <EditPlayer />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Error fetching player/i)).toBeInTheDocument();
    });
  });

  it("shows not found if no player data", async () => {
    mockEq.mockImplementationOnce(() => ({
      single: () => Promise.resolve({ data: null, error: null })
    }));
    render(
      <MemoryRouter>
        <EditPlayer />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Player not found/i)).toBeInTheDocument();
    });
  });

  it("updates player and navigates on submit", async () => {
    window.alert = jest.fn();
    render(
      <MemoryRouter>
        <EditPlayer />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), {
      target: { value: "Jane" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update Player/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Player updated successfully!");
      expect(mockNavigate).toHaveBeenCalledWith("/player-manager");
    });
  });
});