import React, { useEffect, useRef } from "react";
import YouTube from "react-youtube";

const SharedYouTubePlayer = ({ videoId, start = 0, shouldPlay, onEnd }) => {
  const timeoutRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (shouldPlay && playerRef.current) {
      playerRef.current.seekTo(start);
      playerRef.current.playVideo();

      timeoutRef.current = setTimeout(() => {
        playerRef.current.pauseVideo();
        if (onEnd) onEnd();
      }, 15000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [videoId, shouldPlay, start, onEnd]);

  const onReady = (event) => {
    playerRef.current = event.target;

    if (shouldPlay) {
      event.target.seekTo(start);
      event.target.playVideo();

      timeoutRef.current = setTimeout(() => {
        event.target.pauseVideo();
        if (onEnd) onEnd();
      }, 15000);
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
