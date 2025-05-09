import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditSoundEffects from "../app/soundeffects/editSoundEffects";
import Navbar from "../app/components/navbar";

// Mock supabase client
const mockSelect = jest.fn(() =>
  Promise.resolve({ data: [], error: null })
);
const mockInsert = jest.fn(() =>
  Promise.resolve({ data: [{ id: 1, label: "Test", src: "test.mp3" }], error: null })
);
const mockUpdate = jest.fn(() => ({
  eq: mockEqUpdate
}));
const mockDelete = jest.fn(() => ({
  eq: mockEqDelete
}));
const mockEqUpdate = jest.fn(() => Promise.resolve({ data: [{ id: 1, label: "Updated", src: "test.mp3" }], error: null }));
const mockEqDelete = jest.fn(() => Promise.resolve({ data: null, error: null }));

jest.mock("../app/supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })),
  },
}));

// Mock Navbar to avoid unrelated errors
jest.mock("../app/components/navbar", () => () => <nav>Navbar</nav>);

describe("EditSoundEffects", () => {
  beforeEach(() => {
    mockSelect.mockClear();
    mockInsert.mockClear();
    mockUpdate.mockClear();
    mockDelete.mockClear();
    mockEqUpdate.mockClear();
    mockEqDelete.mockClear();
  });

  it("renders the Manage Sound Effects heading and form", async () => {
    render(<EditSoundEffects />);
    expect(screen.getByText(/Manage Sound Effects/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Label/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/MP3 URL/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add/i })).toBeInTheDocument();
  });

  it("shows validation alert if form is submitted empty", () => {
    window.alert = jest.fn();
    render(<EditSoundEffects />);
    fireEvent.click(screen.getByRole("button", { name: /Add/i }));
    expect(window.alert).toHaveBeenCalledWith("Please fill in both fields.");
  });

  it("submits the form and adds a sound effect", async () => {
    render(<EditSoundEffects />);
    fireEvent.change(screen.getByPlaceholderText(/Label/i), { target: { value: "Clap" } });
    fireEvent.change(screen.getByPlaceholderText(/MP3 URL/i), { target: { value: "clap.mp3" } });
    fireEvent.click(screen.getByRole("button", { name: /Add/i }));

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith([
        { label: "Clap", src: "clap.mp3" }
      ]);
    });
  });

  it("enters edit mode and updates a sound effect", async () => {
    // Mock initial fetch to return one effect
    mockSelect.mockImplementationOnce(() =>
      Promise.resolve({
        data: [{ id: 1, label: "Test", src: "test.mp3" }],
        error: null,
      })
    );

    render(<EditSoundEffects />);
    await waitFor(() => {
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));
    fireEvent.change(screen.getByPlaceholderText(/Label/i), { target: { value: "Updated" } });
    fireEvent.click(screen.getByRole("button", { name: /Update/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockEqUpdate).toHaveBeenCalledWith("id", 1);
    });
  });

  it("deletes a sound effect", async () => {
    mockSelect.mockImplementationOnce(() =>
      Promise.resolve({
        data: [{ id: 2, label: "DeleteMe", src: "delete.mp3" }],
        error: null,
      })
    );

    render(<EditSoundEffects />);
    await waitFor(() => {
      expect(screen.getByText("DeleteMe")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Delete"));
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEqDelete).toHaveBeenCalledWith("id", 2);
    });
  });
});