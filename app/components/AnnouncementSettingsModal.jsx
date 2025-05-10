import React from "react";

const AnnouncementSettingsModal = ({
  announcementPrefs,
  setAnnouncementPrefs,
  onClose,
}) => (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Announcement Settings</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
          ✕
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center p-3 hover:bg-gray-50 rounded border border-gray-100">
          <input
            type="checkbox"
            id="includeVoiceIntro"
            checked={announcementPrefs.includeVoiceIntro}
            onChange={(e) =>
              setAnnouncementPrefs((prev) => ({
                ...prev,
                includeVoiceIntro: e.target.checked,
              }))
            }
            className="mr-3 h-5 w-5 accent-blue-500"
          />
          <div>
            <label htmlFor="includeVoiceIntro" className="font-medium text-gray-500">
              Include Voice Introduction
            </label>
            <p className="text-sm text-gray-500">Announces "Now batting" before the player's name</p>
          </div>
        </div>
        <div
          className={`flex items-center p-3 rounded border ${
            !announcementPrefs.includeVoiceIntro ? "bg-gray-100 border-gray-200" : "hover:bg-gray-50 border-gray-100"
          }`}
        >
          <input
            type="checkbox"
            id="includeJerseyNumber"
            checked={announcementPrefs.includeJerseyNumber}
            onChange={(e) =>
              setAnnouncementPrefs((prev) => ({
                ...prev,
                includeJerseyNumber: e.target.checked,
              }))
            }
            disabled={!announcementPrefs.includeVoiceIntro}
            className="mr-3 h-5 w-5 accent-blue-500"
          />
          <div>
            <label
              htmlFor="includeJerseyNumber"
              className={
                !announcementPrefs.includeVoiceIntro ? "font-medium text-gray-500" : "font-medium text-gray-700"
              }
            >
              Announce Jersey Number
            </label>
            <p
              className={`text-sm ${
                !announcementPrefs.includeVoiceIntro ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Includes "Number [X]" in the announcement
            </p>
          </div>
        </div>
        <div
          className={`flex items-center p-3 rounded border ${
            !announcementPrefs.includeVoiceIntro ? "bg-gray-100 border-gray-200" : "hover:bg-gray-50 border-gray-100"
          }`}
        >
          <input
            type="checkbox"
            id="includePosition"
            checked={announcementPrefs.includePosition}
            onChange={(e) =>
              setAnnouncementPrefs((prev) => ({
                ...prev,
                includePosition: e.target.checked,
              }))
            }
            disabled={!announcementPrefs.includeVoiceIntro}
            className="mr-3 h-5 w-5 accent-blue-500"
          />
          <div>
            <label
              htmlFor="includePosition"
              className={
                !announcementPrefs.includeVoiceIntro ? "font-medium text-gray-500" : "font-medium text-gray-700"
              }
            >
              Announce Position
            </label>
            <p
              className={`text-sm ${
                !announcementPrefs.includeVoiceIntro ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Includes "playing as [position]" in the announcement
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  </div>
);

export default AnnouncementSettingsModal;