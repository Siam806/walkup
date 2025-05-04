import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("./routes/mainPage.tsx"), // Main page
    route("walkup", "./walkup/walkup.jsx"), // Walk-Up Songs page
    route("player-manager", "./walkup/playerManager.jsx"), // Player Manager page
    route("edit-player/:id", "./walkup/editPlayer.jsx"), // Edit Player page
    route("sound-effects", "./soundeffects/soundEffects.jsx"), // Sound Effects page
    route("edit-sound-effects", "./soundeffects/editSoundEffects.jsx"), // Edit Sound Effects page
] satisfies RouteConfig;