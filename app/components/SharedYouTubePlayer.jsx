import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";

const SharedYouTubePlayer = ({ videoId, start = 0, shouldPlay, onEnd, duration = 15 }) => {
  const timeoutRef = useRef(null);
  const fadeOutRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (fadeOutRef.current) clearInterval(fadeOutRef.current);

    if (shouldPlay && playerRef.current) {
      playerRef.current.seekTo(start);
      playerRef.current.playVideo();

      // Schedule fade-out before the song ends
      const fadeOutStartTime = duration - 3; // Start fading out 3 seconds before the end
      timeoutRef.current = setTimeout(() => {
        startFadeOut();
      }, fadeOutStartTime * 1000);

      // Pause the video after the duration
      timeoutRef.current = setTimeout(() => {
        playerRef.current.pauseVideo();
        if (onEnd) onEnd();
      }, duration * 1000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (fadeOutRef.current) clearInterval(fadeOutRef.current);
    };
  }, [videoId, shouldPlay, start, onEnd, duration]);

  const startFadeOut = () => {
    if (!playerRef.current) return;

    let volume = playerRef.current.getVolume(); // Get the current volume (0-100)
    fadeOutRef.current = setInterval(() => {
      if (volume > 0) {
        volume -= 5; // Decrease volume by 5 units
        playerRef.current.setVolume(volume);
      } else {
        clearInterval(fadeOutRef.current);
      }
    }, 200); // Reduce volume every 200ms
  };

  const onReady = (event) => {
    playerRef.current = event.target;

    if (shouldPlay) {
      event.target.seekTo(start);
      event.target.playVideo();

      // Schedule fade-out before the song ends
      const fadeOutStartTime = duration - 3; // Start fading out 3 seconds before the end
      timeoutRef.current = setTimeout(() => {
        startFadeOut();
      }, fadeOutStartTime * 1000);

      // Pause the video after the duration
      timeoutRef.current = setTimeout(() => {
        event.target.pauseVideo();
        if (onEnd) onEnd();
      }, duration * 1000);
    }
  };

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
    />
  );
};

export default SharedYouTubePlayer;
