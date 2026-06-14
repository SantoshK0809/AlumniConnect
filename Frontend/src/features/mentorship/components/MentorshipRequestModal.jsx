import React, { useEffect, useState } from "react";

import { X } from "lucide-react";
import useSendRequest from "../hooks/useSendRequests";

const MentorshipRequestModal = ({ open, setOpen, alumniId }) => {
  const [message, setMessage] = useState("");
  const { sendRequest, loading, error } = useSendRequest();

  // Reset message when modal closes
  useEffect(() => {
    if (!open) {
      setMessage("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    // Payload for backend
    const payload = {
      mentorId: alumniId,
      message: message.trim(),
    };

    const response = await sendRequest(payload);

    if (response.success) {
      // Close modal
      setOpen(false);

      // Reset form
      setMessage("");

      // TODO:
      // Add toast later
      console.log("Mentorship request sent");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Request Mentorship
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Introduce yourself and explain what guidance you need.
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Your Message
            </label>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain why you want mentorship and what guidance you are looking for..."
              rows={6}
              maxLength={500}
              className="
                w-full rounded-xl border border-gray-300
                px-4 py-3 text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />

            <div className="mt-2 flex justify-between items-center">
              {/* Error */}
              <div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              {/* Character Count */}
              <span className="text-xs text-gray-400">
                {message.length}/500
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                w-full sm:w-auto
                rounded-xl border border-gray-300
                px-5 py-2.5 text-gray-700
                transition-all hover:bg-gray-100
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="
                w-full sm:w-auto
                rounded-xl bg-blue-600
                px-5 py-2.5 font-medium text-white
                transition-all hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorshipRequestModal;
