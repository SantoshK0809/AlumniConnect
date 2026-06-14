import { useEffect, useState } from "react";
import { getReceivedRequests } from "../api/mentorship.api";

const useReceivedRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const data = await getReceivedRequests();

      setRequests(data?.data || []);
    } catch (err) {
      console.error(err);

      setError(err?.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
  };
};

export default useReceivedRequests;
