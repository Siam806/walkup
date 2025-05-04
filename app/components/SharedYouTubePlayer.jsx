import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import YouTube from "react-youtube";

const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

const SharedYouTubePlayer = forwardRef(
  ({ videoId, start = 0, shouldPlay, onEnd, duration, volume = 100 }, ref) => {
    const timeoutRef = useRef(null);
    const fadeOutRef = useRef(null);
    const playerRef = useRef(null);
    const [showIOSButton, setShowIOSButton] = useState(isIOS());

    const onReady = (event) => {
      playerRef.current = event.target;
      playerRef.current.setVolume(volume);

      if (shouldPlay && !isIOS()) {
        playerRef.current.seekTo(start);
        playerRef.current.playVideo();
      }
    };

    const handleIOSPlay = () => {
      if (playerRef.current) {
        playerRef.current.seekTo(start);
        playerRef.current.playVideo();
        setShowIOSButton(false); // Hide the overlay after starting the video
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
      <div className="relative">
        {showIOSButton && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
            <button
              onClick={handleIOSPlay}
              className="bg-blue-500 text-white text-lg px-6 py-3 rounded shadow-lg"
            >
              Start Song
            </button>
          </div>
        )}
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
      </div>
    );
  }
);

export default SharedYouTubePlayer;
