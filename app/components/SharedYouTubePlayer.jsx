import React, { forwardRef, useRef, useImperativeHandle, useEffect } from "react";

const SharedYouTubePlayer = forwardRef(({ videoId, start, duration, volume = 100, onEnd }, ref) => {
  // Add this log to verify the props
  console.log(`SharedYouTubePlayer mounted with videoId: ${videoId}, start: ${start}, duration: ${duration}, volume: ${volume}`);
  
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const timeoutRef = useRef(null);

  // Clear any timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    setVolume: (vol) => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.setVolume(vol);
        } catch (error) {
          console.error("Error setting volume:", error);
        }
      }
    },
    getVolume: () => {
      if (playerInstanceRef.current) {
        try {
          return playerInstanceRef.current.getVolume();
        } catch (error) {
          console.error("Error getting volume:", error);
          return 100;
        }
      }
      return 100;
    },
    stopVideo: () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.stopVideo();
        } catch (error) {
          console.error("Error stopping video:", error);
        }
      }
    }
  }));

  // Set up YouTube player when videoId changes
  useEffect(() => {
    if (!videoId) return;

    // Create container if it doesn't exist
    if (!playerRef.current) {
      console.error("Player reference is missing");
      return;
    }

    // Load YouTube API if needed
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      // Wait for API to load
      window.onYouTubeIframeAPIReady = initializePlayer;
      return;
    }

    // Initialize player immediately if API is loaded
    initializePlayer();

    function initializePlayer() {
      console.log(`Initializing YouTube player with videoId: ${videoId}, start: ${start}`);
      
      // Clear any previous player
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (e) {
          console.error("Error destroying previous player:", e);
        }
      }

      // Create new player
      try {
        playerInstanceRef.current = new window.YT.Player(playerRef.current, {
          height: "180",
          width: "320",
          videoId: videoId,
          playerVars: {
            start: parseInt(start) || 0,
            autoplay: 1,
            controls: 1,
            mute: 0, // Start unmuted (may still require user interaction)
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              console.log("YouTube player ready");
              // Try to start playing and set volume
              try {
                event.target.setVolume(volume);
                
                // Force playback with multiple attempts
                const playAttempt = () => {
                  try {
                    event.target.playVideo();
                    console.log("Play attempt made");
                    
                    // Check if actually playing after a short delay
                    setTimeout(() => {
                      if (event.target.getPlayerState() !== 1) { // 1 = playing
                        console.log("Play attempt failed, trying again...");
                        event.target.playVideo();
                      } else {
                        console.log("Player is now playing!");
                      }
                    }, 500);
                  } catch (e) {
                    console.error("Play attempt error:", e);
                  }
                };
                
                // Try immediately
                playAttempt();
                
                // And try again in 1 second as backup
                setTimeout(playAttempt, 1000);
              } catch (e) {
                console.error("Error during player initialization:", e);
              }
            },
            onStateChange: (event) => {
              // Handle video end or user stopping it
              if (event.data === window.YT.PlayerState.ENDED || event.data === window.YT.PlayerState.PAUSED) {
                console.log("Video ended or was paused");
                
                if (event.data === window.YT.PlayerState.ENDED) {
                  if (onEnd) onEnd();
                }
              } 
              // Handle duration limit when playing
              else if (event.data === window.YT.PlayerState.PLAYING) {
                // If duration was set, use that to determine when video should end
                if (duration && duration > 0) {  // Make sure duration is valid
                  console.log(`Setting timeout to stop video after ${duration} seconds`);
                  
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                  }
                  
                  // Force the timeout to be accurate by checking current time
                  const startTime = event.target.getCurrentTime();
                  const endTime = (parseInt(start) || 0) + duration;
                  const remainingTime = Math.max(0, (endTime - startTime) * 1000);
                  
                  console.log(`Video started at ${startTime}s, will end at ${endTime}s (${remainingTime}ms from now)`);
                  
                  timeoutRef.current = setTimeout(() => {
                    console.log(`Duration limit of ${duration}s reached, stopping video`);
                    if (playerInstanceRef.current) {
                      playerInstanceRef.current.stopVideo();
                    }
                    if (onEnd) onEnd();
                  }, remainingTime);
                }
              }
            },
            onError: (event) => {
              console.error("YouTube player error:", event.data);
              // Try to handle errors gracefully
              if (onEnd) onEnd();
            }
          }
        });
      } catch (e) {
        console.error("Error creating YouTube player:", e);
        if (onEnd) onEnd();
      }
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [videoId, start, duration, volume, onEnd]);

  return (
    <div className="youtube-player-container">
      <div className="bg-black p-2 rounded-t">
        <div className="flex justify-between items-center">
          <span className="text-white text-xs">Now Playing</span>
          <button 
            className="bg-red-600 text-white px-2 py-1 rounded text-xs"
            onClick={onEnd}
          >
            Close
          </button>
        </div>
      </div>
      <div ref={playerRef} id="youtube-player"></div>
    </div>
  );
});

SharedYouTubePlayer.displayName = "SharedYouTubePlayer";

export default SharedYouTubePlayer;
