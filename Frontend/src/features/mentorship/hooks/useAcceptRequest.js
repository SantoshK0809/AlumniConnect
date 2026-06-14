import { useState } from "react";

import { acceptMentorshipRequest } from "../api/mentorship.api";

const useAcceptRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const acceptRequest = async (requestId) => {
    try {
      setLoading(true);
      setError(null);

      const data = await acceptMentorshipRequest(requestId);

      return {
        success: true,
        data,
      };
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.message || "Failed to accept request";

      setError(message);

      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  };

  return { acceptRequest, loading, error };
};

export default useAcceptRequest;
