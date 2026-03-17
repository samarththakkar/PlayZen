import { useEffect, useRef } from "react";
import { saveWatchProgress, getVideoProgress } from "../services/watchProgress.service.js";

const useWatchProgress = (videoId, videoRef) => {
  const intervalRef = useRef(null);

  // Load saved progress and seek video to that position
  useEffect(() => {
    if (!videoId || !videoRef?.current) return;
    const loadProgress = async () => {
      const { data } = await getVideoProgress(videoId);
      if (data?.watchedDuration > 0 && videoRef.current) {
        videoRef.current.currentTime = data.watchedDuration;
      }
    };
    loadProgress();
  }, [videoId, videoRef]);

  // Save progress every 10 seconds while video is playing
  useEffect(() => {
    if (!videoId || !videoRef?.current) return;

    const save = async () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended) return;
      await saveWatchProgress(
        videoId,
        Math.floor(video.currentTime),
        Math.floor(video.duration)
      );
    };

    intervalRef.current = setInterval(save, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoId, videoRef]);
};

export default useWatchProgress;
