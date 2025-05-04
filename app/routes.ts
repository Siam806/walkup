import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/mainPage.tsx"),
    route("walkup", "./walkup/walkup.jsx"),
    route("player-manager", "./walkup/playerManager.jsx"),
    route("edit-player/:id", "./walkup/editPlayer.jsx"),
    route("sound-effects", "./soundeffects/soundEffects.jsx"), // Add the new route
] satisfies RouteConfig;