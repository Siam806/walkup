import React from "react";
import Navbar from "../components/navbar";

const Documentation = () => (
  <div>
    <Navbar />
    <div style={{ paddingTop: "6.5rem" }} className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Baseball Manager – Documentation / Dokumentation</h1>

      {/* ENGLISH SECTION */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How to Use the Baseball Manager (English)</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>
          <li>
      <span class="font-medium"><strong>Manage batting order:</strong></span> View the current lineup and update it in real time.
    </li>
    <li>
      <span class="font-medium"><strong>Control player status:</strong></span> Use checkboxes to mark players as "in the game," activating their options.
    </li>
    <li>
      <span class="font-medium"><strong>Play music:</strong></span> Trigger walk-up, home run, or pitcher entrance songs for each active player.
    </li>
    <li>
      <span class="font-medium"><strong>Announce players:</strong></span> Use voice announcements or combine announcements with music intros.
    </li>
    <li>
      <span class="font-medium"><strong>Reorder lineup:</strong></span> Move players to the end of the order or reset to the original lineup.
    </li>
            <div className="my-4">
              <img
                src="/images/walkup-songs-example.png"
                alt="Walk-Up Songs Page Example"
                className="border rounded shadow w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Screenshot: Walk-Up Songs page</p>
            </div>
          </li>
          <li>
            <strong>Player Manager:</strong> Add new players, edit existing players, and view all player details. Each player can have a nickname, jersey number, batting number, position, nationality, and song assignments.
            <div className="my-4">
              <img
                src="/images/player-manager-example.png"
                alt="Player Manager Page Example"
                className="border rounded shadow w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Screenshot: Player Manager page</p>
            </div>
          </li>
          <li>
            <strong>Edit Player:</strong> Click "Edit" in the Player Manager to update a player's information, including their songs and positions.
          </li>
          <li>
            <strong>Sound Effects:</strong> Play sound effects during the game. All available effects are listed with play controls.
            <div className="my-4">
              <img
                src="/images/sound-effects-example.png"
                alt="Sound Effects Page Example"
                className="border rounded shadow w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Screenshot: Sound Effects page</p>
            </div>
          </li>
          <li>
            <strong>Edit Sound Effects:</strong> Add, edit, or delete sound effects. You can preview each effect and manage the list easily.
            <div className="my-4">
              <img
                src="/images/edit-sound-effects-example.png"
                alt="Edit Sound Effects Page Example"
                className="border rounded shadow w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Screenshot: Edit Sound Effects page</p>
            </div>
          </li>
        </ul>
        <h3 className="text-xl font-bold mt-6 mb-2">Navigation</h3>
        <p className="mb-4">
          Use the navigation bar at the top to switch between pages. On mobile, use the burger menu. The main sections are:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Home</li>
          <li>Walk-Up Songs</li>
          <li>Player Manager</li>
          <li>Sound Effects</li>
          <li>Edit Sound Effects</li>
          <li>Documentation</li>
        </ul>
        <h3 className="text-xl font-bold mt-6 mb-2">Tips</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>
            <strong>Marking Players:</strong> Use the checkbox next to a player to mark them as "in the game." This hides their action buttons and keeps the lineup organized.
          </li>
          <li>
            <strong>Resetting the Order:</strong> Use the "Reset Batting Order" button to restore the original lineup and clear all in-game selections.
          </li>
          <li>
            <strong>Editing Songs:</strong> You can assign YouTube URLs and start times for each song type (walk-up, home run, pitching).
          </li>
        </ul>
      </section>

      {/* GERMAN SECTION */}
      <section>
        <h2 className="text-2xl font-bold mb-4">So nutzt du den Baseball Manager (Deutsch)</h2>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>
          <li>
  <span class="font-medium"><strong>Schlagreihenfolge verwalten:</strong></span> Zeige die aktuelle Aufstellung an und aktualisiere sie in Echtzeit.
</li>
<li>
  <span class="font-medium"><strong>Spielerstatus steuern:</strong></span> Verwende Checkboxen, um Spieler als „im Spiel“ zu markieren und ihre Optionen zu aktivieren.
</li>
<li>
  <span class="font-medium"><strong>Musik abspielen:</strong></span> Starte Walk-up-Songs, Home-Run-Musik oder Pitcher-Entrance-Songs für jeden aktiven Spieler.
</li>
<li>
  <span class="font-medium"><strong>Spieler ansagen:</strong></span> Nutze Sprachausgabe oder kombiniere Ansagen mit Musik-Intros.
</li>
<li>
  <span class="font-medium"><strong>Aufstellung neu sortieren:</strong></span> Verschiebe Spieler ans Ende der Reihenfolge oder setze die ursprüngliche Aufstellung zurück.
</li>

            <div className="my-4">
              <img
                src="/images/walkup-songs-example.png"
                alt="Walk-Up Songs Seite Beispiel"
                className="border rounded shadow w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Screenshot: Walk-Up Songs Seite</p>
            </div>
          </li>
          <li>
            <strong>Spieler-Manager:</strong> Füge neue Spieler hinzu, bearbeite bestehende Spieler und sieh dir alle Details an. Jeder Spieler kann einen Spitznamen, eine Rückennummer, eine Schlagnummer, eine Position, Nationalität und Song-Zuweisungen haben.
            <div className="my-4">
              <img
                src="/images/player-manager-example.png"
                alt="Spieler-Manager Seite Beispiel"
                className="border rounded shadow w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Screenshot: Spieler-Manager Seite</p>
            </div>
          </li>
          <li>
            <strong>Spieler bearbeiten:</strong> Klicke im Spieler-Manager auf „Edit“, um die Informationen eines Spielers zu aktualisieren, einschließlich Songs und Positionen.
          </li>
          <li>
            <strong>Soundeffekte:</strong> Spiele Soundeffekte während des Spiels ab. Alle verfügbaren Effekte werden mit Abspielsteuerung angezeigt.
            <div className="my-4">
              <img
                src="/images/sound-effects-example.png"
                alt="Soundeffekte Seite Beispiel"
                className="border rounded shadow w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Screenshot: Soundeffekte Seite</p>
            </div>
          </li>
          <li>
            <strong>Soundeffekte bearbeiten:</strong> Füge neue Effekte hinzu, bearbeite oder lösche sie. Du kannst jeden Effekt vorhören und die Liste einfach verwalten.
            <div className="my-4">
              <img
                src="/images/edit-sound-effects-example.png"
                alt="Soundeffekte Bearbeiten Seite Beispiel"
                className="border rounded shadow w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Screenshot: Soundeffekte Bearbeiten Seite</p>
            </div>
          </li>
        </ul>
        <h3 className="text-xl font-bold mt-6 mb-2">Navigation</h3>
        <p className="mb-4">
          Nutze die Navigationsleiste oben, um zwischen den Seiten zu wechseln. Auf dem Handy öffnest du das Menü mit dem Burger-Icon. Die Hauptbereiche sind:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Home</li>
          <li>Walk-Up Songs</li>
          <li>Spieler-Manager</li>
          <li>Soundeffekte</li>
          <li>Soundeffekte bearbeiten</li>
          <li>Dokumentation</li>
        </ul>
        <h3 className="text-xl font-bold mt-6 mb-2">Tipps</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>
            <strong>Spieler markieren:</strong> Mit der Checkbox neben einem Spieler markierst du ihn als „im Spiel“. Dadurch werden die Aktionsbuttons ausgeblendet und die Reihenfolge bleibt übersichtlich.
          </li>
          <li>
            <strong>Reihenfolge zurücksetzen:</strong> Mit dem Button „Reset Batting Order“ stellst du die ursprüngliche Reihenfolge wieder her und entfernst alle Markierungen.
          </li>
          <li>
            <strong>Songs bearbeiten:</strong> Du kannst YouTube-Links und Startzeiten für jeden Songtyp (Walk-Up, Home Run, Pitching) zuweisen.
          </li>
        </ul>
      </section>
    </div>
  </div>
);

export default Documentation;