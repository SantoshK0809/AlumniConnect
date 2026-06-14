import React from "react";
import { MessageCircle } from "lucide-react";

import useSentRequests from "../hooks/useSentRequest";
import RequestStatusBadge from "../components/RequestStatusBadge";

const SentRequestsPage = () => {
  const { requests, loading, error } = useSentRequests();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Sent Mentorship Requests
          </h1>

          <p className="text-gray-500 mt-2">
            Track mentorship requests and continue communication.
          </p>
        </div>

        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request?._id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* LEFT */}
                  <div className="flex items-start gap-4">
                    <img
                      src={request?.user?.profileImage}
                      alt={request?.user?.fullName}
                      className="w-14 h-14 rounded-full object-cover"
                    />

                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {request?.user?.fullName}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {request?.message}
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <RequestStatusBadge status={request?.status} />

                        <span className="text-xs text-gray-400">
                          {new Date(request?.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div>
                    {request?.status === "accepted" && (
                      <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
                        <MessageCircle size={18} />
                        Message Mentor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              No requests sent yet
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Your mentorship requests will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentRequestsPage;
