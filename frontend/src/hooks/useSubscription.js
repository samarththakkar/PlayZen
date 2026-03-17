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
    if (loading) return;
    setLoading(true);
    const { data } = await toggleSubscription(channelId);
    if (data) {
      setIsSubscribed(data.isSubscribed);
      setSubscribersCount(data.subscribersCount);
    }
    setLoading(false);
  };

  return { isSubscribed, subscribersCount, toggle, loading };
};

export default useSubscription;
