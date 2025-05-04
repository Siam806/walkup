import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";

const SharedYouTubePlayer = ({
  videoId,
  start = 0,
  shouldPlay,
  onEnd,
  duration = 15,
  volume = 100,
}) => {
  const timeoutRef = useRef(null);
  const fadeOutRef = useRef(null);
  const playerRef = useRef(null);

  const onReady = (event) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume);
    if (shouldPlay) {
      playerRef.current.seekTo(start);
      playerRef.current.playVideo();
    }
  };

  const startFadeOut = () => {
    if (!playerRef.current) return;

    let currentVolume = playerRef.current.getVolume(); // Get the current volume (0-100)
    fadeOutRef.current = setInterval(() => {
      if (currentVolume > 0) {
        currentVolume -= 5; // Decrease volume by 5 units
        playerRef.current.setVolume(Math.max(currentVolume, 0)); // Ensure volume doesn't go below 0
      } else {
        clearInterval(fadeOutRef.current);
        playerRef.current.pauseVideo(); // Pause the video after fade-out
        if (onEnd) onEnd();
      }
    }, 200); // Reduce volume every 200ms
  };

  const onStateChange = (event) => {
    if (event.data === 1) {
      // Playing
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        startFadeOut(); // Start fade-out before stopping the video
      }, (duration - 2) * 1000); // Start fade-out 2 seconds before the end
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (fadeOutRef.current) clearInterval(fadeOutRef.current);
    };
  }, []);

  return (
    <YouTube
      videoId={videoId}
      opts={{
        height: "360",
        width: "100%",
        playerVars: {
          autoplay: shouldPlay ? 1 : 0,
          controls: 1,
          start,
        },
      }}
      onReady={onReady}
      onStateChange={onStateChange}
    />
  );
};

export default SharedYouTubePlayer;
