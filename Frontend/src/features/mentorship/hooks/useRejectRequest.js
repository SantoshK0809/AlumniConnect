import { useState } from "react";
import { rejectMentorshipRequest } from "../api/mentorship.api";

const useRejectRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const rejectRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);

      const data = await rejectMentorshipRequest(requestId);

      return {
        success: true,
        data,
      };
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.message || "Failed to reject request";

      setError(message);

      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    rejectRequest,
    loading,
    error,
  };
};

export default useRejectRequest;
