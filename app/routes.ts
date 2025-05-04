import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("./routes/mainPage.tsx"), // Correct path to the main page
    route("walkup", "./walkup/walkup.jsx"), // Correct path to the walkup page
    route("player-manager", "./walkup/playerManager.jsx"), // Correct path to the player manager page
    route("edit-player/:id", "./walkup/editPlayer.jsx"), // Correct path to the edit player page
    route("sound-effects", "./soundeffects/soundEffects.jsx"), // Correct path to the sound effects page
] satisfies RouteConfig;