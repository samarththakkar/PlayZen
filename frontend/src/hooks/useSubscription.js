import { useState, useEffect } from "react";
import { getSubscriptionStatus, toggleSubscription } from "../services/subscription.service.js";

const useSubscription = (channelId) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!channelId) return;
    const fetchStatus = async () => {
      const { data } = await getSubscriptionStatus(channelId);
      if (data) {
        setIsSubscribed(data.isSubscribed);
        setSubscribersCount(data.subscribersCount);
      }
    };
    fetchStatus();
  }, [channelId]);

  const toggle = async () => {
    const previousIsSubscribed = isSubscribed;
    const previousSubscribersCount = subscribersCount;

    const nextIsSubscribed = !isSubscribed;
    const nextSubscribersCount = nextIsSubscribed ? subscribersCount + 1 : Math.max(0, subscribersCount - 1);

    setIsSubscribed(nextIsSubscribed);
    setSubscribersCount(nextSubscribersCount);

    try {
      const { data } = await toggleSubscription(channelId);
      if (data) {
        setIsSubscribed(data.isSubscribed);
        setSubscribersCount(data.subscribersCount);
      }
    } catch (error) {
      console.error("Failed to toggle subscription:", error);
      setIsSubscribed(previousIsSubscribed);
      setSubscribersCount(previousSubscribersCount);
    }
  };

  return { isSubscribed, subscribersCount, toggle, loading };
};

export default useSubscription;
