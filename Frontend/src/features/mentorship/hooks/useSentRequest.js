import { useEffect, useState } from "react";
import { getSentRequests } from "../api/mentorship.api";

const useSentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSentRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getSentRequests();

      setRequests(data?.data || []);
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.message ||
        "Failed to fetch sent requests";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentRequests();
  }, []);

  return { requests, loading, error, refetch: fetchSentRequests };
};

export default useSentRequests;