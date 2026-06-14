import { useState } from "react";
import { sendMentorshipRequest } from "../api/mentorship.api";

const useSendRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendRequest = async (payload) => {
    try {
      setLoading(true);
      setError(null);

      const data = await sendMentorshipRequest(payload);

      return {
        success: true,
        data,
      };
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.message || "Failed to send mentorship request";

      setError(message);

      return {
        success: false,
        error: message,
      };
    } finally {
      setLoading(false);
    }
  };

  return { sendRequest, loading, error };
};

export default useSendRequest;
