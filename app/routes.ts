import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Public routes
  index("./routes/mainPage.tsx"), 
  route("walkup", "./walkup/walkup.jsx"),
  route("sound-effects", "./soundeffects/soundEffects.jsx"),
  route("documentation", "./routes/documentation.jsx"),
  
  // Auth routes
  route("signin", "./auth/signin.jsx"),
  route("signup", "./auth/signup.jsx"),
  
  // Protected routes (auth check will be inside each component)
  route("player-manager", "./walkup/playerManager.jsx"),
  route("edit-player/:id", "./walkup/editPlayer.jsx"),
  route("edit-sound-effects", "./soundeffects/editSoundEffects.jsx"),
  route("field-layout", "./walkup/fieldLayout.jsx"),
  
  // Catch-all route
  route("*", "./routes/notFoundPage.tsx"),
] satisfies RouteConfig;