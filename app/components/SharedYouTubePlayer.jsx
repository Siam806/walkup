import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import YouTube from "react-youtube";

const SharedYouTubePlayer = forwardRef(
  ({ videoId, start = 0, shouldPlay, onEnd, duration, volume = 100 }, ref) => {
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
      let currentVolume = playerRef.current.getVolume();
      fadeOutRef.current = setInterval(() => {
        if (currentVolume > 0) {
          currentVolume -= 5;
          playerRef.current.setVolume(Math.max(currentVolume, 0));
        } else {
          clearInterval(fadeOutRef.current);
          playerRef.current.pauseVideo();
          if (onEnd) onEnd();
        }
      }, 200);
    };

    const onStateChange = (event) => {
      if (event.data === 1 && duration) {
        // Only set a timeout if a duration is provided
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          startFadeOut();
        }, (duration - 2) * 1000);
      }
    };

    // Expose volume control methods to parent
    useImperativeHandle(ref, () => ({
      setVolume: (val) => {
        if (playerRef.current) playerRef.current.setVolume(val);
      },
      getVolume: () => {
        return playerRef.current ? playerRef.current.getVolume() : 100;
      },
    }));

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
  }
);

export default SharedYouTubePlayer;
