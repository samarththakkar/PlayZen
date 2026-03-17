import { useState, useEffect } from "react";
import { getIsLiked, toggleVideoLike, toggleCommentLike, toggleTweetLike } from "../services/like.service.js";

// type = "video" | "comment" | "tweet"
const useLike = (id, type, initialCount = 0) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchLikeStatus = async () => {
      const params = {};
      if (type === "video") params.videoId = id;
      if (type === "comment") params.commentId = id;
      if (type === "tweet") params.tweetId = id;
      const { data } = await getIsLiked(params);
      if (data) setIsLiked(data.isLiked);
    };
    fetchLikeStatus();
  }, [id, type]);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    let result;
    if (type === "video") result = await toggleVideoLike(id);
    if (type === "comment") result = await toggleCommentLike(id);
    if (type === "tweet") result = await toggleTweetLike(id);
    if (result?.data) {
      setIsLiked(result.data.isLiked);
      setLikesCount(result.data.likesCount);
    }
    setLoading(false);
  };

  return { isLiked, likesCount, toggle, loading };
};

export default useLike;
