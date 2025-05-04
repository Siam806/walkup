import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";

const SharedYouTubePlayer = ({ videoId, start = 0, shouldPlay, onEnd, duration = 15, volume = 100 }) => {
  const timeoutRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (shouldPlay && playerRef.current) {
      playerRef.current.seekTo(start);
      playerRef.current.playVideo();
      playerRef.current.setVolume(volume); // Set initial volume

      // Stop the video after the specified duration
      timeoutRef.current = setTimeout(() => {
        playerRef.current.pauseVideo();
        if (onEnd) onEnd();
      }, duration * 1000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [videoId, shouldPlay, start, onEnd, duration, volume]); // Add volume and duration to dependencies

  const onReady = (event) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume); // Set volume when ready
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
